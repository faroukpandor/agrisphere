'use strict';

/**
 * Channel adapter — funnels every platform into one brain and routes replies
 * back to each platform's sender.
 *
 * Web            -> /api/chat (JSON)
 * WhatsApp       -> /webhooks/whatsapp (Meta Cloud API; echo outbound when
 *                   WHATSAPP_TOKEN + WHATSAPP_PHONE_ID are set)
 * Messenger      -> /webhooks/messenger (echo outbound when
 *                   FACEBOOK_PAGE_TOKEN is set)
 * Telegram       -> /webhooks/telegram/:secret (official bot API; echo
 *                   outbound when TELEGRAM_TOKEN is set)
 *
 * Without platform tokens the bots run in "dev echo" mode: webhooks verify
 * and log incoming messages so you can develop end-to-end before activating
 * a Meta/Telegram app.
 */

const store = require('./store');
const brain = require('./brain');
const config = require('./config');

// ---------------------------------------------------------------------------
// One shared reply pipeline
// ---------------------------------------------------------------------------
async function handleIncoming({ channel, userId, userName, text, sender }) {
  const session = store.getSession(userId);

  const { text: reply, buttons, meta } = await brain.processMessage(text, brain.buildContext(channel, userId, userName), session);

  // remember the exchange (self-learning context)
  session.history = session.history || [];
  session.history.push({ role: 'user', text: String(text).slice(0, 500), at: Date.now() });
  session.history.push({ role: 'bot', text: reply.slice(0, 1500), entry: meta.entryId, at: Date.now() });
  if (session.history.length > config.MAX_HISTORY * 2) {
    session.history = session.history.slice(-config.MAX_HISTORY * 2);
  }
  if (userName && !session.name) session.name = userName;
  store.saveSession(userId, session);

  const recordId = `${channel}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  // Route back out per channel
  const delivery = await sendToChannel(channel, sender, { text: reply, buttons }, recordId);

  return { reply, buttons, meta, recordId, delivery };
}

async function sendToChannel(channel, sender, payload, recordId) {
  try {
    switch (channel) {
      case 'web':
        return { ok: true, via: 'response' };
      case 'whatsapp':
        return await sendWhatsApp(sender, payload);
      case 'messenger':
        return await sendMessenger(sender, payload);
      case 'telegram':
        return await sendTelegram(sender, payload);
      default:
        return { ok: false, via: 'unknown' };
    }
  } catch (err) {
    store.bump(`send.errors.${channel}`);
    console.error(`[${channel}] send error:`, err.message);
    return { ok: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// WhatsApp Cloud API
// ---------------------------------------------------------------------------
function waTextMessage(to, body, buttons) {
  let text = body;
  // WhatsApp interactive buttons require Meta-approved templates; the safe
  // free-tier pattern is a plain-text tap hint instead. Inbound interactive
  // callbacks (button_reply / list_reply) are parsed regardless.
  if (buttons && buttons.length && buttons.length <= 4) {
    text += '\n\nTap one to send it:\n' + buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
  }
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  };
  return payload;
}

async function sendWhatsApp(phone, { text, buttons }) {
  if (!config.WHATSAPP_TOKEN || !config.WHATSAPP_PHONE_ID) {
    console.log(`[whatsapp:dev] -> ${phone}: ${text.slice(0, 120).replace(/\n/g, ' ')}...`);
    return { ok: true, via: 'dev-log' };
  }
  const resp = await fetch(
    `https://graph.facebook.com/v21.0/${config.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(waTextMessage(phone, text, buttons)),
    }
  );
  if (!resp.ok) {
    const errText = await resp.text();
    // WhatsApp rate-limits / test-number restrictions; surface clearly
    if (errText.includes('131030') || errText.includes('131026')) {
      console.error('[whatsapp] recipient not reachable (test number rules) — message logged locally.');
      return { ok: false, via: 'meta-restricted', note: '131026/131030 recipient restriction' };
    }
    throw new Error(`WhatsApp API ${resp.status}: ${errText.slice(0, 200)}`);
  }
  return { ok: true, via: 'whatsapp' };
}

// ---------------------------------------------------------------------------
// Messenger
// ---------------------------------------------------------------------------
function buildMessengerButtons(text, buttons) {
  const msg = { text };
  if (buttons && buttons.length > 0 && buttons.length <= 3) {
    msg.quick_replies = buttons.map((b) => ({
      content_type: 'text',
      title: b.label,
      payload: b.label,
    }));
  }
  return msg;
}

async function sendMessenger(psid, { text, buttons }) {
  if (!config.FACEBOOK_PAGE_TOKEN) {
    console.log(`[messenger:dev] -> ${psid}: ${text.slice(0, 120).replace(/\n/g, ' ')}...`);
    return { ok: true, via: 'dev-log' };
  }
  const resp = await fetch(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${config.FACEBOOK_PAGE_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: String(psid) },
        messaging_type: 'RESPONSE',
        message: buildMessengerButtons(text, buttons),
      }),
    }
  );
  if (!resp.ok) throw new Error(`Messenger API ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return { ok: true, via: 'messenger' };
}

// ---------------------------------------------------------------------------
// Telegram
// ---------------------------------------------------------------------------
async function sendTelegram(chatId, { text }) {
  if (!config.TELEGRAM_TOKEN) {
    console.log(`[telegram:dev] -> ${chatId}: ${text.slice(0, 120).replace(/\n/g, ' ')}...`);
    return { ok: true, via: 'dev-log' };
  }
  const resp = await fetch(`https://api.telegram.org/bot${config.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!resp.ok) throw new Error(`Telegram API ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return { ok: true, via: 'telegram' };
}

// ---------------------------------------------------------------------------
// Inbound parsers
// ---------------------------------------------------------------------------
function parseWhatsApp(body) {
  const msgs = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        // Interactive replies (button/list taps) carry the tapped label as
        // text — check BEFORE the text-only guard.
        if (msg.interactive) {
          const it = msg.interactive;
          const title = it.button_reply?.title || it.list_reply?.title || it.nfm_reply?.response_json || '';
          const id = it.button_reply?.id || it.list_reply?.id || '';
          msgs.push({ userId: msg.from, text: title || id || 'menu', raw: msg });
          continue;
        }
        if (msg.type !== 'text') continue; // reactions/media/statuses ignored
        const text = msg.text?.body ?? '';
        if (!text) continue;
        msgs.push({ userId: msg.from, text, raw: msg });
      }
    }
  }
  return msgs;
}

function parseMessenger(body) {
  const msgs = [];
  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      if (event.message && event.message.text) {
        const text = event.message.quick_reply?.payload || event.message.text;
        msgs.push({ userId: event.sender.id, text, raw: event });
      }
      if (event.postback && event.postback.payload) {
        msgs.push({ userId: event.sender.id, text: event.postback.payload, raw: event });
      }
    }
  }
  return msgs;
}

function parseTelegram(body) {
  const msg = body.message || body.edited_message || body.channel_post;
  if (!msg) return [];
  const text = msg.text ?? '';
  const firstName = msg.from?.first_name || msg.chat?.first_name || '';
  return [{
    userId: String(msg.chat?.id ?? msg.from?.id),
    userName: firstName,
    text,
    raw: msg,
  }];
}

// ---------------------------------------------------------------------------
// Opt-in / opt-out (data dignity) — per channel, stored on the session.
// WhatsApp-style STOP/START commands are honoured; web chat is consent-first
// by nature (user typed first).
// ---------------------------------------------------------------------------
function isOptedOut(session, channel) {
  return !!(session && session.channelOptOut && session.channelOptOut[channel]);
}

function setOptOut(id, session, channel, value) {
  session.channelOptOut = session.channelOptOut || {};
  session.channelOptOut[channel] = !!value;
  store.saveSession(id, session);
}

/** Returns true if the text was an opt-out command and was handled. */
function handleOptCommand(id, channel, text, session) {
  const t = String(text || '').trim().replace(/[.!]+$/, '').toLowerCase();
  // Command must be the whole message so a real question like "stop armyworm
  // eating my maize" is never swallowed.
  const OUT = new Set(['stop', 'stop all', 'unsubscribe', 'aowa', 'tsamaya sentle', 'tsamaya']);
  const IN = new Set(['start', 'subscribe', 'resume']);
  if (OUT.has(t)) {
    setOptOut(id, session, channel, true);
    store.bump(`optouts.${channel}`);
    return true;
  }
  if (IN.has(t)) {
    setOptOut(id, session, channel, false);
    store.bump(`optins.${channel}`);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public entry used by server.js
// ---------------------------------------------------------------------------
async function ingest(channel, parsed) {
  const results = [];
  for (const m of parsed) {
    if (!m.text || !m.text.trim()) continue;
    const uid = String(m.userId || 'anon');
    const session = store.getSession(uid);

    // data dignity: honour opt-out commands and skip processing when opted out
    if (handleOptCommand(uid, channel, m.text, session)) {
      results.push({ ok: true, pref: 'handled', text: m.text });
      continue;
    }
    if (isOptedOut(session, channel)) {
      results.push({ ok: true, pref: 'opted-out', text: m.text });
      continue;
    }

    store.bump(`channels.in.${channel}`);
    const r = await handleIncoming({
      channel,
      userId: m.userId,
      userName: m.userName,
      text: m.text,
      sender: m.userId,
    });
    results.push(r);
  }
  return results;
}

module.exports = {
  handleIncoming,
  parseWhatsApp,
  parseMessenger,
  parseTelegram,
  ingest,
  buildMessengerButtons,
  handleOptCommand,
  isOptedOut,
};

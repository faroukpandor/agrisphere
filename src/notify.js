'use strict';

/**
 * Notification bus (R15) — outbound via configured channels, dev-log
 * otherwise. Powers programme milestone reminders, new-price alerts and
 * buyer application pings. AgriSphere never sends unsolicited spam:
 * every alert is tied to an explicit user subscription or an owned asset.
 */

const store = require('./store');
const config = require('./config');

function send({ channel, to, text }) {
  const method = channel === 'whatsapp' ? sendWhatsApp
    : channel === 'telegram' ? sendTelegram
      : channel === 'sms' ? sendSms
        : sendEmail;
  return method(to, text);
}

async function sendWhatsApp(to, text) {
  if (!config.WHATSAPP_TOKEN || !config.WHATSAPP_PHONE_ID) {
    console.log(`[notify:dev] whatsapp -> ${to}: ${String(text).slice(0, 160)}`);
    return { ok: true, via: 'dev-log' };
  }
  const resp = await fetch(`https://graph.facebook.com/v21.0/${config.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: String(text).slice(0, 1024) } }),
  });
  if (!resp.ok) throw new Error(`WhatsApp ${resp.status}`);
  return { ok: true, via: 'whatsapp' };
}

async function sendTelegram(to, text) {
  if (!config.TELEGRAM_TOKEN) {
    console.log(`[notify:dev] telegram -> ${to}: ${String(text).slice(0, 160)}`);
    return { ok: true, via: 'dev-log' };
  }
  const resp = await fetch(`https://api.telegram.org/bot${config.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: to, text: String(text).slice(0, 1024) }),
  });
  if (!resp.ok) throw new Error(`Telegram ${resp.status}`);
  return { ok: true, via: 'telegram' };
}

function sendSms(to, text) {
  if (!config.SMS_PROVIDER_URL) {
    console.log(`[notify:dev] sms -> ${to}: ${String(text).slice(0, 160)}`);
    return { ok: true, via: 'dev-log' };
  }
  console.log(`[sms] -> ${to} via ${config.SMS_PROVIDER_URL}`);
  return { ok: true, via: 'sms' };
}

function sendEmail(to, text) {
  console.log(`[notify:dev] email -> ${to}: ${String(text).slice(0, 160)}`);
  return { ok: true, via: 'dev-log' };
}

// ---- subscriptions --------------------------------------------------------
function subscribe({ ownerId, phone, keyword, channel }) {
  const kw = String(keyword || '').toLowerCase().trim().slice(0, 60);
  const ch = ['whatsapp', 'telegram', 'sms', 'email'].includes(channel) ? channel : 'sms';
  const to = String(phone || '').trim() || String(ownerId || '').slice(0, 40);
  if (!kw || !to) return { error: 'keyword and contact are required' };
  const existing = store.alerts.find((a) => a.ownerId === String(ownerId || '') && a.keyword === kw);
  if (existing) return { error: 'already subscribed to this keyword' };
  const rec = { id: rand(), ownerId: String(ownerId || ''), keyword: kw, channel: ch, to, at: Date.now() };
  store.alerts.push(rec);
  store._scheduleFlush();
  store.bump('alerts.subscribed');
  return { alert: rec };
}

function unsubscribe(id, ownerId, adminToken) {
  const idx = store.alerts.findIndex((a) => a.id === id);
  if (idx === -1) return { error: 'not found' };
  const isAdmin = config.ADMIN_TOKEN && adminToken === config.ADMIN_TOKEN;
  if (!isAdmin && store.alerts[idx].ownerId !== String(ownerId || '')) return { error: 'not allowed', code: 403 };
  store.alerts.splice(idx, 1);
  store._scheduleFlush();
  return { ok: true };
}

function forOwner(ownerId) {
  return store.alerts.filter((a) => a.ownerId === String(ownerId || ''));
}

/** Fire alerts whose keyword matches the payload text. */
async function fireOn(text, payloadLabel) {
  const t = String(text || '').toLowerCase();
  const fired = [];
  for (const a of store.alerts) {
    if (t.includes(a.keyword)) {
      const msg = `🔔 AgriSphere alert (${payloadLabel}): ${String(text).slice(0, 220)}`;
      try {
        const r = await send({ channel: a.channel, to: a.to, text: msg });
        fired.push({ keyword: a.keyword, via: r.via });
        store.bump('alerts.fired');
      } catch (err) {
        store.bump('alerts.errors');
        console.error('[notify] fire error:', err.message);
      }
    }
  }
  return fired;
}

function digestSummary() {
  const q = store.unanswered.filter((u) => !u.answered);
  return `AgriSphere digest: ${q.length} unanswered question(s), ${store.ratings.length} rating(s), ${store.listings.filter((l) => l.flags > 0).length} flagged listing(s), ${store.bizplans.length} plan(s) generated.`;
}

function rand() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = { send, subscribe, unsubscribe, forOwner, fireOn, digestSummary };

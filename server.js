'use strict';

/**
 * AgriSphere HTTP server.
 *
 * Routes:
 *   GET  /                     -> chat UI (public/)
 *   GET  /healthz              -> Render health check
 *   POST /api/chat             -> web chat          {message, sessionId?, name?}
 *   POST /api/feedback         -> 👍/👎 training signal
 *   GET  /api/history/:session -> conversation history
 *   POST /api/teach            -> teach the bot programmatically
 *   GET  /api/admin/learned    -> learned Q&A (requires ADMIN_TOKEN if set)
 *   GET  /api/admin/unanswered -> learning queue   (requires ADMIN_TOKEN if set)
 *   GET  /webhooks/whatsapp    -> WhatsApp verification
 *   POST /webhooks/whatsapp    -> WhatsApp inbound
 *   GET  /webhooks/messenger   -> Messenger verification
 *   POST /webhooks/messenger   -> Messenger inbound
 *   POST /webhooks/telegram/:secret -> Telegram inbound
 */

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const config = require('./src/config');
const store = require('./src/store');
const channels = require('./src/channels');
const brain = require('./src/brain');
const KB = require('./src/knowledge');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ok = (res, data, code = 200) => res.status(code).json(data);
const fail = (res, msg, code = 400) => res.status(code).json({ error: msg });

// ---------------------------------------------------------------------------
// Health & info
// ---------------------------------------------------------------------------
app.get('/healthz', (req, res) => {
  res.set('Cache-Control', 'no-store');
  ok(res, {
    status: 'ok',
    uptime: Math.round(process.uptime()),
    bot: config.BOT_NAME,
    engine: config.ENABLE_LLM ? 'local+llm' : 'local',
    channels: {
      whatsapp: Boolean(config.WHATSAPP_TOKEN),
      messenger: Boolean(config.FACEBOOK_PAGE_TOKEN),
      telegram: Boolean(config.TELEGRAM_TOKEN),
    },
    learned: store.listLearned().length,
    unanswered: store.unanswered.length,
    ts: Date.now(),
  });
});

// ---------------------------------------------------------------------------
// Web chat API
// ---------------------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, name } = req.body || {};
    const sid = String(sessionId || req.headers['x-session-id'] || 'anon')
      .replace(/[^\w\-.]/g, '')
      .slice(0, 80) || crypto.randomUUID();

    const r = await channels.handleIncoming({
      channel: 'web',
      userId: sid,
      userName: name ? String(name).slice(0, 60) : '',
      text: String(message || ''),
      sender: sid,
    });
    const history = store.getSession(sid).history || [];
    ok(res, {
      reply: r.reply,
      buttons: r.buttons || [],
      engine: r.meta.engine,
      entryId: r.meta.entryId,
      recordId: r.recordId,
      sessionId: sid,
      historyLength: history.length,
      suggested: suggestOnEntry(r.meta.entryId),
    });
  } catch (err) {
    console.error('[api/chat]', err);
    fail(res, 'Something went wrong on my side — please try again.', 500);
  }
});

function suggestOnEntry(entryId) {
  const map = {
    'crop-maize': ['🐛 Fall armyworm', '🩺 Maize streak', '💰 Maize price'],
    'crop-sorghum': ['🐦 Quelea birds', '💰 Prices'],
    'crop-cowpea': ['🧪 Fertiliser basics', '🛒 Selling'],
    'crop-groundnut': ['💰 Prices', '🛒 Selling'],
    'crop-tomato': ['🐛 Tuta absoluta', '🩺 Tomato blight'],
    'crop-leafyveg': ['🛒 Selling', '💧 Water tips'],
    'pest-fall-armyworm': ['🌽 Maize guide'],
    'pest-tuta': ['🍅 Tomato guide'],
    'pest-stalk-borer': ['🌽 Maize guide'],
    'pest-quelea': ['🌾 Sorghum guide'],
    'disease-maize-streak': ['🌽 Maize guide', '🐛 Fall armyworm'],
    'disease-tomato-blight': ['🍅 Tomato guide', '💧 Water tips'],
    'soil-fertiliser': ['🌽 Maize guide', '💧 Water tips'],
    'market-bamb': ['🌽 Maize guide', '🥜 Groundnuts'],
    'market-veg': ['🍅 Tomato guide', '💧 Water tips'],
    'livestock-basics': ['🐄 Vet contacts'],
  };
  return map[entryId] || [];
}

app.post('/api/feedback', (req, res) => {
  const { recordId, good, comment, sessionId } = req.body || {};
  if (!recordId) return fail(res, 'recordId is required');
  store.addFeedback({
    recordId: String(recordId).slice(0, 120),
    good: good === true || good === 'true' || good === 1,
    comment: String(comment || '').slice(0, 500),
    sessionId: String(sessionId || '').slice(0, 80),
    at: Date.now(),
  });
  store.bump('feedback.total');
  ok(res, { ok: true });
});

app.get('/api/history/:session', (req, res) => {
  const s = store.getSession(req.params.session.slice(0, 80));
  ok(res, { history: s.history || [], name: s.name || '' });
});

app.post('/api/teach', (req, res) => {
  const { question, answer, token } = req.body || {};
  if (config.TEACH_TOKEN && token !== config.TEACH_TOKEN) return fail(res, 'invalid token', 403);
  if (!question || !answer) return fail(res, 'question and answer are required');
  store.addLearned(String(question).slice(0, 500), String(answer).slice(0, 2000), 'api');
  store.bump('learned.total');
  ok(res, { ok: true, learned: store.listLearned().length });
});

function adminGuard(req, res, next) {
  if (!config.ADMIN_TOKEN) return next();
  const t = req.headers['x-admin-token'] || req.query.token;
  if (t !== config.ADMIN_TOKEN) return fail(res, 'unauthorized', 403);
  return next();
}

app.get('/api/admin/learned', adminGuard, (req, res) => {
  ok(res, { learned: store.listLearned() });
});

app.get('/api/admin/unanswered', adminGuard, (req, res) => {
  ok(res, { unanswered: store.unanswered });
});

// ---------------------------------------------------------------------------
// WhatsApp webhook (Meta Cloud API)
// ---------------------------------------------------------------------------
app.get('/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === config.VERIFY_TOKEN && challenge) {
    store.bump('webhooks.whatsapp.verified');
    return res.type('text/plain').send(challenge);
  }
  fail(res, 'verification failed', 403);
});

app.post('/webhooks/whatsapp', async (req, res) => {
  res.status(200).end(); // ack instantly; process asynchronously
  try {
    const parsed = channels.parseWhatsApp(req.body || {});
    await channels.ingest('whatsapp', parsed);
  } catch (err) {
    console.error('[whatsapp] ingest error:', err.message);
  }
});

// ---------------------------------------------------------------------------
// Messenger webhook
// ---------------------------------------------------------------------------
app.get('/webhooks/messenger', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === config.VERIFY_TOKEN && challenge) {
    store.bump('webhooks.messenger.verified');
    return res.type('text/plain').send(challenge);
  }
  fail(res, 'verification failed', 403);
});

app.post('/webhooks/messenger', async (req, res) => {
  res.status(200).end();
  try {
    const parsed = channels.parseMessenger(req.body || {});
    await channels.ingest('messenger', parsed);
  } catch (err) {
    console.error('[messenger] ingest error:', err.message);
  }
});

// ---------------------------------------------------------------------------
// Telegram webhook  POST /webhooks/telegram/<TELEGRAM_TOKEN>
// ---------------------------------------------------------------------------
app.post('/webhooks/telegram/:secret', async (req, res) => {
  if (config.TELEGRAM_TOKEN && req.params.secret !== config.TELEGRAM_TOKEN) {
    return fail(res, 'unauthorized', 403);
  }
  res.status(200).end();
  try {
    const parsed = channels.parseTelegram(req.body || {});
    await channels.ingest('telegram', parsed);
  } catch (err) {
    console.error('[telegram] ingest error:', err.message);
  }
});

// ---------------------------------------------------------------------------
// 404 / error handling
// ---------------------------------------------------------------------------
app.use((req, res) => fail(res, 'Not found — this AgriSphere instance has no such route.', 404));

app.use((err, req, res, next) => {
  console.error('[server]', err);
  if (res.headersSent) return next(err);
  fail(res, 'Server error', 500);
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
const server = app.listen(config.PORT, config.HOST, () => {
  store.bump('boots.total');
  console.log(`\n🌍🌱 ${config.BOT_NAME} is running`);
  console.log(`   Web UI     : http://localhost:${config.PORT}/`);
  console.log(`   Health     : http://localhost:${config.PORT}/healthz`);
  console.log(`   Engine     : ${config.ENABLE_LLM ? 'local KB + LLM (' + config.LLM_MODEL + ')' : 'local KB (self-learning)'}`);
  console.log(`   Channels   : whatsapp=${Boolean(config.WHATSAPP_TOKEN)} messenger=${Boolean(config.FACEBOOK_PAGE_TOKEN)} telegram=${Boolean(config.TELEGRAM_TOKEN)}`);
  console.log(`   Knowledge  : ${KB.entries.length} topics | learned: ${store.listLearned().length} | unanswered queue: ${store.unanswered.length}\n`);
});

module.exports = server;

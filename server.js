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
const marketplace = require('./src/marketplace');
const programs = require('./src/programs');
const experiences = require('./src/experiences');
const bizplan = require('./src/bizplan');
const identity = require('./src/identity');
const prices = require('./src/prices');
const ratings = require('./src/ratings');
const orgs = require('./src/orgs');
const notify = require('./src/notify');
const compliance = require('./src/compliance');
const ussd = require('./src/ussd');
const topicsD = require('./src/topics-d');

const TOPIC_COUNT = KB.entries.length + topicsD.entries.length;

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
    topics: TOPIC_COUNT,
    marketplace: marketplace.stats().total,
    programs: store.programs.length,
    experiences: store.experiences.length,
    bizplans: store.bizplans.length,
    orgs: store.orgs.length,
    alerts: store.alerts.length,
    ratings: store.ratings.length,
    priceRefs: store.priceRefs.length,
    sessions: Object.keys(store.sessions).length,
    msgs: store.stats['msgs.total'] || 0,
    tnMsgs: store.stats['tn.msgs'] || 0,
    otpsPending: Object.keys(store.otps || {}).length,
    backend: store.backendName,
    dataDir: store.dir,
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
// Community marketplace (stakeholder value engine — free listings board)
// ---------------------------------------------------------------------------
app.get('/api/marketplace/listings', (req, res) => {
  const { category, q } = req.query;
  ok(res, {
    listings: marketplace.list({ category, q }),
    categories: marketplace.CATEGORIES,
    stats: marketplace.stats(),
  });
});

app.post('/api/marketplace/listings', (req, res) => {
  const b = req.body || {};
  const r = marketplace.create({
    category: b.category,
    title: b.title,
    description: b.description,
    price: b.price,
    location: b.location,
    contact: b.contact,
    ownerId: b.ownerId || req.headers['x-owner-id'],
  });
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('marketplace.api.posts');
  ok(res, r, 201);
});

app.delete('/api/marketplace/listings/:id', (req, res) => {
  const r = marketplace.remove(
    String(req.params.id),
    req.headers['x-owner-id'] || '',
    req.headers['x-admin-token'] || ''
  );
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.post('/api/marketplace/listings/:id/report', (req, res) => {
  const r = marketplace.report(String(req.params.id));
  if (r.error) return fail(res, r.error);
  ok(res, r);
});

// ---------------------------------------------------------------------------
// Buyer-led production programmes
// ---------------------------------------------------------------------------
app.get('/api/programs', (req, res) => {
  ok(res, { programs: programs.listPrograms({ q: req.query.q }), fairTerms: programs.FAIR_TERMS });
});

app.get('/api/programs/:id', (req, res) => {
  const raw = store.programs.find((x) => x.id === String(req.params.id));
  if (!raw) return fail(res, 'programme not found', 404);
  const p = programs.listPrograms({}).find((x) => x.id === String(req.params.id));
  const caller = String(req.headers['x-owner-id'] || '');
  const isAdmin = config.ADMIN_TOKEN && req.headers['x-admin-token'] === config.ADMIN_TOKEN;
  if (raw.ownerId === caller || isAdmin) {
    // owner/admin see the full lifecycle trail (milestones, deliveries, disputes)
    p.milestones = raw.milestones || [];
    p.deliveries = raw.deliveries || [];
    p.disputes = raw.disputes || [];
  }
  ok(res, { program: p, playbook: programs.playbookFor(p.product) });
});

app.post('/api/programs', (req, res) => {
  const r = programs.createProgram({ ...(req.body || {}), ownerId: (req.body || {}).ownerId || req.headers['x-owner-id'] });
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('programs.api.posts');
  ok(res, r, 201);
});

app.post('/api/programs/:id/applications', (req, res) => {
  const r = programs.applyToProgram(String(req.params.id), { ...(req.body || {}), ownerId: req.headers['x-owner-id'] });
  if (r.error) return fail(res, r.error);
  ok(res, r, 201);
});

app.get('/api/programs/:id/applications', (req, res) => {
  const r = programs.programApplications(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.delete('/api/programs/:id', (req, res) => {
  const r = programs.removeProgram(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

// ---------------------------------------------------------------------------
// Agri-tourism experiences
// ---------------------------------------------------------------------------
app.get('/api/experiences', (req, res) => {
  ok(res, {
    experiences: experiences.listExperiences({ type: req.query.type, location: req.query.location, q: req.query.q }),
    types: experiences.TYPES,
  });
});

app.post('/api/experiences', (req, res) => {
  const r = experiences.createExperience({ ...(req.body || {}), ownerId: (req.body || {}).ownerId || req.headers['x-owner-id'] });
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('experiences.api.posts');
  ok(res, r, 201);
});

app.delete('/api/experiences/:id', (req, res) => {
  const r = experiences.removeExperience(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.post('/api/experiences/:id/report', (req, res) => {
  const r = experiences.reportExperience(String(req.params.id));
  if (r.error) return fail(res, r.error);
  ok(res, r);
});

// ---------------------------------------------------------------------------
// Starter agri-business plan toolkit
// ---------------------------------------------------------------------------
app.get('/api/bizplan/enterprises', (req, res) => {
  ok(res, { enterprises: bizplan.ENTERPRISE_OPTIONS.map((e) => ({ key: e.key, label: e.label })) });
});

app.post('/api/bizplan/generate', (req, res) => {
  const b = req.body || {};
  const plan = bizplan.buildPlan(b);
  bizplan.savePlan(req.headers['x-session-id'] || b.sessionId, b, plan);
  ok(res, {
    name: plan.name,
    enterprise: plan.enterprise,
    disclaimer: 'Decision-support draft, not financial or legal advice. Verify every figure locally before investing.',
    sections: plan.sections,
  });
});

// ---------------------------------------------------------------------------
// Identity & phone verification (OTP)
// ---------------------------------------------------------------------------
app.post('/api/identity/otp', (req, res) => {
  const phone = String((req.body || {}).phone || '').replace(/[^\d+]/g, '').slice(0, 20);
  if (!/^\+?\d{7,15}$/.test(phone)) return fail(res, 'a valid phone number is required (e.g. +267 71 234 567)');
  const r = identity.issueOtp(phone);
  ok(res, {
    ok: true,
    note: r.note === 'sms' ? 'code sent by SMS' : 'preview mode — code printed in server log',
    devOtp: r.devOtp || undefined,
    ttlSeconds: config.OTP_TTL_SECONDS,
  });
});

app.post('/api/identity/verify', (req, res) => {
  const { phone, code } = req.body || {};
  const sid = String(req.headers['x-owner-id'] || '').slice(0, 80);
  const r = identity.verifyOtp(String(phone || ''), String(code || ''));
  if (!r.ok) return fail(res, r.error, r.code || 400);
  if (sid) identity.markVerified(sid, String(phone || ''));
  ok(res, { ok: true, verified: true });
});

app.get('/api/identity/status', (req, res) => {
  ok(res, identity.profileOf(String(req.headers['x-owner-id'] || '')));
});

// ---------------------------------------------------------------------------
// Price transparency references (admin-loaded official bulletins only)
// ---------------------------------------------------------------------------
app.get('/api/prices/references', (req, res) => {
  ok(res, {
    references: prices.listReferences({ item: req.query.item, limit: Math.min(Number(req.query.limit) || 100, 300) }),
    latest: prices.latestByItem(),
  });
});

app.post('/api/prices/references', adminGuard, async (req, res) => {
  const b = req.body || {};
  const r = prices.addReference({
    item: b.item, unit: b.unit, price: b.price, source: b.source,
    area: b.area, date: b.date, url: b.url,
  });
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('prices.api.adds');
  try { await notify.fireOn(`${r.ref.item} ${r.ref.price} per ${r.ref.unit || 'unit'} (${r.ref.source}, ${r.ref.date})`, 'price reference'); } catch (_) {}
  ok(res, r, 201);
});

app.delete('/api/prices/references/:id', adminGuard, (req, res) => {
  const r = prices.removeReference(String(req.params.id), req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

// ---------------------------------------------------------------------------
// Ratings & reputation (one rating per target+rater; admins remove abuse)
// ---------------------------------------------------------------------------
app.post('/api/ratings', (req, res) => {
  const b = req.body || {};
  const r = ratings.addRating({
    targetType: b.targetType,
    targetId: b.targetId ? String(b.targetId) : null,
    byOwnerId: b.byOwnerId || req.headers['x-owner-id'],
    score: b.score,
    comment: b.comment,
    role: b.role,
  });
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r, 201);
});

app.get('/api/ratings/:targetType/:targetId', (req, res) => {
  const { targetType, targetId } = req.params;
  if (!ratings.TARGET_TYPES.includes(targetType)) return fail(res, 'unknown targetType');
  ok(res, { aggregate: ratings.aggregateFor(targetType, targetId), ratings: ratings.listFor(targetType, targetId) });
});

app.delete('/api/ratings/:id', adminGuard, (req, res) => {
  const r = ratings.removeRating(String(req.params.id), req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

// ---------------------------------------------------------------------------
// Organisations (buyers, co-ops, NGOs, extension, insurers, input, media)
// ---------------------------------------------------------------------------
app.post('/api/orgs/register', (req, res) => {
  const b = req.body || {};
  const r = orgs.register({
    name: b.name, type: b.type, contact: b.contact, phone: b.phone,
    area: b.area, description: b.description,
    ownerId: b.ownerId || req.headers['x-owner-id'],
  });
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('orgs.api.registers');
  ok(res, r, 201); // apiKey is shown ONCE — caller must store it
});

app.get('/api/orgs/mine', (req, res) => {
  const ownerId = String(req.headers['x-owner-id'] || '');
  const org = orgs.findByOwner(ownerId);
  if (!org) return fail(res, 'no organisation for this owner', 404);
  ok(res, { org, assets: orgs.assetsOf(ownerId) });
});

app.post('/api/orgs/:id/verify', adminGuard, (req, res) => {
  const r = orgs.verifyOrg(String(req.params.id), req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('orgs.verified');
  ok(res, r);
});

app.get('/api/orgs', adminGuard, (req, res) => {
  ok(res, { types: orgs.ORG_TYPES, orgs: orgs.listAll(req.headers['x-admin-token'] || '') });
});

app.get('/api/orgs/assets', (req, res) => {
  ok(res, { assets: orgs.assetsOf(String(req.headers['x-owner-id'] || '')) });
});

// ---------------------------------------------------------------------------
// Alerts & notification digest
// ---------------------------------------------------------------------------
app.get('/api/alerts', (req, res) => {
  ok(res, { alerts: notify.forOwner(String(req.headers['x-owner-id'] || '')) });
});

app.post('/api/alerts/subscribe', (req, res) => {
  const b = req.body || {};
  const r = notify.subscribe({
    ownerId: b.ownerId || req.headers['x-owner-id'],
    phone: b.phone,
    keyword: b.keyword,
    channel: b.channel,
  });
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r, 201);
});

app.delete('/api/alerts/:id', (req, res) => {
  const r = notify.unsubscribe(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.get('/api/notify/digest', (req, res) => {
  ok(res, { digest: notify.digestSummary() });
});

// ---------------------------------------------------------------------------
// Programme lifecycle operations + compliance pack
// ---------------------------------------------------------------------------
app.post('/api/programs/:id/status', async (req, res) => {
  const b = req.body || {};
  const r = programs.updateStatus(String(req.params.id), b.status, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  const p = store.programs.find((x) => x.id === String(req.params.id));
  try { await notify.fireOn(`${p ? p.title : 'programme'} status now ${r.status}`, 'programme update'); } catch (_) {}
  ok(res, r);
});

app.post('/api/programs/:id/milestones/:idx', async (req, res) => {
  const done = (req.body || {}).done === true || (req.body || {}).done === 'true';
  const r = programs.setMilestone(String(req.params.id), Number(req.params.idx), done, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  const p = store.programs.find((x) => x.id === String(req.params.id));
  try { await notify.fireOn(`${p ? p.title : 'programme'} milestone ${Number(req.params.idx) + 1} ${done ? 'completed' : 'reopened'}`, 'programme update'); } catch (_) {}
  ok(res, r);
});

app.post('/api/programs/:id/deliveries', async (req, res) => {
  const b = req.body || {};
  const r = programs.addDelivery(String(req.params.id), { ...b, qty: b.qty, date: b.date, unit: b.unit, quality: b.quality, batchCode: b.batchCode, notes: b.notes }, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  const p = store.programs.find((x) => x.id === String(req.params.id));
  try { await notify.fireOn(`${p ? p.title : 'programme'} delivery recorded (${r.delivery.qty}${r.delivery.unit ? ' ' + r.delivery.unit : ''})`, 'delivery'); } catch (_) {}
  ok(res, r, 201);
});

app.post('/api/programs/:id/disputes', (req, res) => {
  const r = programs.addDispute(String(req.params.id), req.body || {}, req.headers['x-owner-id'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('programs.api.disputes');
  ok(res, r, 201);
});

app.post('/api/programs/:id/disputes/:disputeId/resolve', (req, res) => {
  const r = programs.resolveDispute(String(req.params.id), String(req.params.disputeId), (req.body || {}).resolution, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.post('/api/programs/:id/settle', (req, res) => {
  const b = req.body || {};
  const r = programs.settleProgram(String(req.params.id), { amount: b.amount, method: b.method, date: b.date, reference: b.reference }, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('programs.settled');
  ok(res, r);
});

app.get('/api/programs/:id/compliance-pack', (req, res) => {
  const raw = store.programs.find((x) => x.id === String(req.params.id));
  if (!raw) return fail(res, 'programme not found', 404);
  const caller = String(req.headers['x-owner-id'] || '');
  const isAdmin = config.ADMIN_TOKEN && req.headers['x-admin-token'] === config.ADMIN_TOKEN;
  const isOwner = raw.ownerId === caller;
  const appRow = (raw.applications || []).find((a) => a.farmerId === caller);
  if (!isOwner && !appRow && !isAdmin) return fail(res, 'not allowed — own the programme, lead a delivery batch, or ask an admin', 403);
  const producer = isOwner
    ? { name: store.getSession(raw.ownerId).name || raw.orgName || 'Programme owner', contact: store.getSession(raw.ownerId).phone || raw.contact || '' }
    : appRow
      ? { name: appRow.name || 'Producer', contact: appRow.contact || store.getSession(caller).phone || '' }
      : { name: 'Producer', contact: '' };
  const notes = String((req.query.notes || '')).slice(0, 600);
  const pack = compliance.buildPack({ program: raw, producer, deliveries: raw.deliveries || [], notes });
  if (req.query.format === 'html') {
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.send(compliance.renderHtml(pack));
  }
  ok(res, { pack: { generatedAt: pack.generatedAt, programme: pack.programme, producer: pack.producer, deliveries: pack.deliveries, checklist: pack.checklist, knowledgeHints: pack.knowledgeHints, disclaimer: pack.disclaimer }, html: compliance.renderHtml(pack) });
});

// ---------------------------------------------------------------------------
// USSD gateway (standard aggregator request: sessionId, phoneNumber, text)
// ---------------------------------------------------------------------------
app.post('/api/ussd', async (req, res) => {
  const b = req.body || {};
  const sid = String(b.sessionId || b.session_id || req.headers['x-session-id'] || 'default').slice(0, 80);
  const phone = String(b.phoneNumber || b.phone_number || b.msisdn || b.phone || 'anon').replace(/[^\d+]/g, '').slice(0, 20);
  const text = String(b.text !== undefined ? b.text : (b.input || '')).slice(0, 182);
  try {
    const r = await ussd.handle({ sessionId: sid, phoneNumber: phone || 'anon', text });
    const payload = `${r.end ? 'END' : 'CON'} ${String(r.reply).slice(0, 155)}`;
    res.set('Content-Type', 'text/plain');
    return res.send(payload);
  } catch (err) {
    console.error('[ussd]', err);
    res.set('Content-Type', 'text/plain');
    return res.send('END Service unavailable. Please try again later.');
  }
});

app.get('/api/ussd/simulate', (req, res) => {
  ok(res, {
    note: 'USSD menu engine is live at POST /api/ussd. A gateway (for example Africa Talking) or the web simulator /ussd.html sends {sessionId, phoneNumber, text} and receives CON/END text.',
    menu: '1 Ask a question · 2 Latest prices · 3 Buyer programmes · 4 Marketplace · 5 Teach me · 6 Help',
  });
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
  console.log(`   Knowledge  : ${TOPIC_COUNT} topics | learned: ${store.listLearned().length} | unanswered queue: ${store.unanswered.length} | backend: ${store.backendName}\n`);
});

module.exports = server;

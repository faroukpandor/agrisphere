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
const insights = require('./src/insights');
const uploads = require('./src/uploads');
const dignity = require('./src/dignity');
const geotrace = require('./src/geotrace');
const backup = require('./src/backup');

const TOPIC_COUNT = KB.entries.length + topicsD.entries.length;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '4mb' }));

// Security headers (audit E4 close-out). CSP deliberately omitted: the static
// UI still ships inline scripts/styles — revisit once assets are bundled.
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'X-XSS-Protection': '0',
  });
  const fwdProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  if (fwdProto === 'https' || req.secure) {
    res.set('Strict-Transport-Security', 'max-age=2592000');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
// same-origin photo evidence (R18): DATA_DIR/uploads
app.use('/uploads', express.static(path.join(config.DATA_DIR, 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

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
    holdings: (store.holdings || []).length,
    consignments: (store.consignments || []).length,
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
// Public trust page (STRATEGY §8.4 item 3) — computed facts only, no hype.
// ---------------------------------------------------------------------------
app.get('/trust', (req, res) => {
  const facts = {
    engine: config.ENABLE_LLM ? 'local knowledge engine + grounded optional LLM' : 'local knowledge engine — zero external AI by default',
    aiDiagnosisClaims: 'none — the assistant does not claim to diagnose crops from photos; photos go to a human review queue',
    topics: TOPIC_COUNT,
    learned: store.listLearned().length,
    unansweredInQueue: store.unanswered.length,
    feedbackGiven: store.stats['feedback.total'] || 0,
    photosInReviewQueue: (store.photoQuestions || []).filter((p) => !p.answered).length,
    verifiedOrganisations: store.orgs.filter((o) => o.verified).length,
    optOutsHonoured: store.stats['alerts.optout-skipped'] || 0,
    marketplaceListings: marketplace.stats().total,
    geoHoldings: (store.holdings || []).length,
    geoConsignments: (store.consignments || []).length,
    channels: {
      whatsapp: Boolean(config.WHATSAPP_TOKEN),
      messenger: Boolean(config.FACEBOOK_PAGE_TOKEN),
      telegram: Boolean(config.TELEGRAM_TOKEN),
    },
    language: config.DEFAULT_LANG,
    contentStandards: [
      'Answers come from a curated, reviewed knowledge base; nothing is fabricated at runtime.',
      'Learned content (from users) is visible in the admin queue and moderated before it can mislead.',
      'Prices shown are references loaded from official bulletins only (BAMB), never user-invented.',
      'Finance guidance is advisory; AgriSphere does not lend, hold money, or underwrite.',
      'Certification claims are never made — packs are self-declared readiness documents; audits happen at accredited bodies.',
    ],
    privacy: [
      'Phone verification is consent-first (OTP). Every alert subscription can opt out and stays opted out.',
      'Insights published from this platform are aggregate-only — no raw messages, no personal data.',
      'Any account can export its data (GET /api/me/export) and delete itself (DELETE /api/me).',
    ],
    exportReadiness: geotrace.info().purpose,
  };
  if (req.query.format === 'json') {
    res.set('Cache-Control', 'no-store');
    return ok(res, facts);
  }
  const rows = (arr) => arr.map((x) => `<li>${x}</li>`).join('');
  const chans = Object.entries(facts.channels)
    .map(([k, v]) => `<li>${k}: ${v ? 'configured' : 'not yet configured on this instance'}</li>`).join('');
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<title>Trust &amp; honesty page — AgriSphere</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>body{font-family:system-ui,sans-serif;max-width:780px;margin:2rem auto;padding:0 1.2rem;color:#1c2b21;line-height:1.55}
h1{color:#14532d} h2{margin-top:2rem;color:#14532d} .card{background:#f4faf5;border:1px solid #d7e6d9;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}
.muted{color:#4b5563;font-size:.95rem} a{color:#14532d}</style></head>
<body><p><a href="/">← Back to AgriSphere</a></p>
<h1>🌍🌱 Trust &amp; honesty page</h1>
<p class="muted">Computed live from this running instance. No marketing numbers: these are the actual counters, or nothing.</p>
<div class="card"><strong>Engine:</strong> ${facts.engine}<br/>
<strong>AI photo-diagnosis claims:</strong> ${facts.aiDiagnosisClaims}<br/>
<strong>Knowledge topics:</strong> ${facts.topics} · <strong>Learned Q&amp;A:</strong> ${facts.learned} ·
<strong>Questions awaiting moderation:</strong> ${facts.unansweredInQueue} · <strong>Photos in human review:</strong> ${facts.photosInReviewQueue}</div>
<h2>Content standards</h2><ul>${rows(facts.contentStandards)}</ul>
<h2>Privacy &amp; data</h2><ul>${rows(facts.privacy)}</ul>
<h2>Channels</h2><ul>${chans}</ul>
<h2>Export compliance</h2><p>${facts.exportReadiness} See <code>/api/geotrace/info</code> for the self-declared limits.</p>
<p class="muted">Format: <a href="/trust?format=json">/trust?format=json</a> · Source: repository docs (AUDIT.md, COMPLIANCE.md, STRATEGY.md) — all public.</p>
</body></html>`;
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', 'no-store');
  return res.send(html);
});

// ---------------------------------------------------------------------------
// Data dignity (audit E-gap close-out): account export & erasure
// ---------------------------------------------------------------------------
app.get('/api/me/export', (req, res) => {
  const r = dignity.collectFor(String(req.headers['x-owner-id'] || ''));
  if (r.error) return fail(res, r.error + ' — the web app sends this header automatically from your session.', r.code || 400);
  res.setHeader('Content-Disposition', `attachment; filename="agrisphere-export-${Date.now()}.json"`);
  return ok(res, r);
});

app.delete('/api/me',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 6, name: 'me-erase', keyFn: (req) => String(req.headers['x-owner-id'] || '') }),
  (req, res) => {
  const ownerId = String(req.headers['x-owner-id'] || '');
  if (!ownerId) return fail(res, 'an account identity is required (x-owner-id header)', 400);
  const r = dignity.eraseFor(ownerId);
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('dignity.erase.api');
  return ok(res, r);
});

// ---------------------------------------------------------------------------
// Geo-trace & EUDR readiness (W1) — consent-first holdings + consignments
// ---------------------------------------------------------------------------
app.get('/api/geotrace/info', (req, res) => ok(res, geotrace.info()));

app.post('/api/geotrace/holdings', (req, res) => {
  const b = req.body || {};
  const r = geotrace.createHolding({
    name: b.name, district: b.district, kind: b.kind, lat: b.lat, lng: b.lng,
    notes: b.notes, consent: b.consent, sharedWith: b.sharedWith,
    ownerId: b.ownerId || req.headers['x-owner-id'],
  });
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('geotrace.api.holdings.created');
  ok(res, r, 201);
});

app.get('/api/geotrace/holdings', (req, res) => {
  const r = geotrace.listHoldings(req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  ok(res, r);
});

app.delete('/api/geotrace/holdings/:id', (req, res) => {
  const r = geotrace.deleteHolding(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.post('/api/geotrace/holdings/:id/share', (req, res) => {
  const r = geotrace.shareHolding(String(req.params.id), (req.body || {}).with, req.headers['x-owner-id'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.post('/api/geotrace/consignments', (req, res) => {
  const b = req.body || {};
  const r = geotrace.createConsignment({
    title: b.title, buyer: b.buyer, destination: b.destination, species: b.species,
    programmeId: b.programmeId, ownerId: b.ownerId || req.headers['x-owner-id'],
  });
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('geotrace.api.consignments.created');
  ok(res, r, 201);
});

app.get('/api/geotrace/consignments', (req, res) => {
  const r = geotrace.listConsignments(req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  ok(res, r);
});

app.get('/api/geotrace/consignments/:id', (req, res) => {
  const r = geotrace.getConsignment(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.delete('/api/geotrace/consignments/:id', (req, res) => {
  const r = geotrace.deleteConsignment(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.post('/api/geotrace/consignments/:id/lots',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 60, name: 'geo-lots' }),
  (req, res) => {
  const b = req.body || {};
  const r = geotrace.addLot(String(req.params.id), {
    headCount: b.headCount, label: b.label, chain: b.chain,
  }, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  store.bump('geotrace.api.lots.added');
  ok(res, r, 201);
});

app.get('/api/geotrace/consignments/:id/export', (req, res) => {
  const id = String(req.params.id);
  const format = String(req.query.format || 'json').toLowerCase();
  if (format === 'csv') {
    const r = geotrace.exportCsv(id, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
    if (r.error) return fail(res, r.error, r.code || 400);
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="agrisphere-eudr-ready-${id.slice(0, 8)}.csv"`);
    return res.send(r.csv);
  }
  const r = geotrace.exportJson(id, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r.json);
});

// ---------------------------------------------------------------------------
// Admin backup (download full snapshot) — off-site copy step in the runbook
// ---------------------------------------------------------------------------
app.get('/api/admin/backup', adminGuard, (req, res) => {
  const snap = backup.snapshot();
  res.setHeader('Content-Disposition', `attachment; filename="agrisphere-backup-${Date.now()}.json"`);
  store.bump('backups.api.downloads');
  return ok(res, snap);
});

// ---------------------------------------------------------------------------
// Web chat API
// ---------------------------------------------------------------------------
app.post('/api/chat',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 150, name: 'chat' }),
  async (req, res) => {
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

function timingSafeEq(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Admin token via header only — a token in the query string would leak into
// access logs and browser history. In production an unconfigured token is a
// hard fail (no open admin surface); in dev it stays open for convenience.
function adminGuard(req, res, next) {
  if (!config.ADMIN_TOKEN) {
    if (config.NODE_ENV === 'production') return fail(res, 'admin token not configured — set ADMIN_TOKEN before deploying', 503);
    return next();
  }
  const t = req.headers['x-admin-token'];
  if (!t || !timingSafeEq(t, config.ADMIN_TOKEN)) return fail(res, 'unauthorized', 403);
  return next();
}

// ---------------------------------------------------------------------------
// Minimal dependency-free rate limiting (audit hardening).
// In-memory sliding-window counters keyed per IP (+ optional body key such as
// phone). Sufficient for a single-instance deployment; swap for a shared
// store (Redis) when scaling horizontally.
// ---------------------------------------------------------------------------
const limitBuckets = new Map();
function rateLimit({ windowMs, max, name, keyFn }) {
  return (req, res, next) => {
    const bucket = String(name || 'rl');
    let k = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'ip';
    if (keyFn) { try { k += '|' + keyFn(req); } catch (_) {} }
    const now = Date.now();
    const win = Math.floor(now / windowMs);
    const rec = limitBuckets.get(bucket) || { win, n: new Map() };
    if (rec.win !== win) { rec.win = win; rec.n = new Map(); }
    const n = (rec.n.get(k) || 0) + 1;
    rec.n.set(k, n);
    limitBuckets.set(bucket, rec);
    if (limitBuckets.size > 64) {
      // prune stale buckets opportunistically
      for (const [b, r] of limitBuckets) {
        if (Date.now() - r.win * windowMs > windowMs * 2) limitBuckets.delete(b);
      }
    }
    if (n > max) return fail(res, 'too many requests — slow down and try again shortly', 429);
    return next();
  };
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

app.post('/api/marketplace/listings/:id/report',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10, name: 'rep-listing' }),
  (req, res) => {
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

app.post('/api/programs/:id/applications', async (req, res) => {
  const r = programs.applyToProgram(String(req.params.id), { ...(req.body || {}), ownerId: req.headers['x-owner-id'] });
  if (r.error) return fail(res, r.error);
  const p = store.programs.find((x) => x.id === String(req.params.id));
  try {
    await notify.fireOn(`${p ? p.title : 'programme'} — new application from ${String((req.body || {}).name || 'a farmer').slice(0, 40)}`, 'new application');
  } catch (_) {}
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

app.post('/api/experiences/:id/report',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10, name: 'rep-exp' }),
  (req, res) => {
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
app.post('/api/identity/otp',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 6, name: 'otp-issue', keyFn: (req) => String((req.body || {}).phone || '') }),
  (req, res) => {
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

app.post('/api/identity/verify',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, name: 'otp-verify' }),
  (req, res) => {
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
  const ws = orgs.workspace(ownerId);
  if (ws.error) return fail(res, ws.error, ws.code || 404);
  ok(res, ws);
});

app.post('/api/orgs/:id/verify', adminGuard, (req, res) => {
  const r = orgs.verifyOrg(String(req.params.id), req.headers['x-admin-token'] || '');
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
});

app.get('/api/orgs', adminGuard, (req, res) => {
  ok(res, { types: orgs.ORG_TYPES, orgs: orgs.listAll(req.headers['x-admin-token'] || '') });
});

app.post('/api/orgs/:id/members', (req, res) => {
  const b = req.body || {};
  const r = orgs.addMember(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '', b.memberId, b.role);
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r, 201);
});

app.delete('/api/orgs/:id/members/:memberId', (req, res) => {
  const r = orgs.removeMember(String(req.params.id), req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '', String(req.params.memberId));
  if (r.error) return fail(res, r.error, r.code || 400);
  ok(res, r);
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

app.post('/api/alerts/subscribe',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 12, name: 'alert-sub' }),
  (req, res) => {
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
  let imageUrl = b.image || '';
  if (b.imageBase64) {
    const saved = uploads.saveImage(b.imageBase64);
    if (saved.error) return fail(res, saved.error);
    imageUrl = saved.url;
  }
  const r = programs.addDelivery(String(req.params.id), { ...b, qty: b.qty, date: b.date, unit: b.unit, quality: b.quality, batchCode: b.batchCode, notes: b.notes, image: imageUrl }, req.headers['x-owner-id'] || '', req.headers['x-admin-token'] || '');
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
// Anonymised insights (R13) — aggregates only, no PII, no raw text
// ---------------------------------------------------------------------------
app.get('/api/insights', (req, res) => {
  ok(res, insights.publicInsights());
});

// ---------------------------------------------------------------------------
// Photo capture (R18) — honest path: stored for the human review queue and
// delivery evidence. No AI-vision claims; diagnosis needs a person.
// ---------------------------------------------------------------------------
app.post('/api/photos',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 15, name: 'photos' }),
  (req, res) => {
  const b = req.body || {};
  const saved = uploads.saveImage(b.image);
  if (saved.error) return fail(res, saved.error);
  const rec = {
    id: crypto.randomUUID(),
    at: Date.now(),
    sessionId: String(b.sessionId || req.headers['x-session-id'] || '').slice(0, 80),
    channel: String(b.channel || 'web').slice(0, 20),
    text: String(b.question || '').slice(0, 300),
    image: saved.url,
    answered: false,
  };
  store.photoQuestions = store.photoQuestions || [];
  store.photoQuestions.push(rec);
  store._scheduleFlush();
  store.bump('photos.total');
  const reply =
    '📷 Photo received' + (rec.text ? ' with your note: "' + rec.text.slice(0, 80) + '"' : '') +
    ' — it is in the human review queue for an agronomist/extension check. ' +
    'Honest note: the assistant does not claim to read photos yet; for a fast field diagnosis, take this photo to your extension officer or vet.';
  ok(res, { ok: true, record: { id: rec.id, image: rec.image }, reply }, 201);
});

// ---------------------------------------------------------------------------
// Moderation & human-in-loop bundle (R14) — ADMIN_TOKEN protected
// ---------------------------------------------------------------------------
app.get('/api/admin/moderation', adminGuard, (req, res) => {
  ok(res, insights.moderationBundle());
});

app.post('/api/programs/:id/report',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10, name: 'rep-prog' }),
  (req, res) => {
  const p = store.programs.find((x) => x.id === String(req.params.id));
  if (!p) return fail(res, 'programme not found', 404);
  p.flags = (p.flags || 0) + 1;
  store._scheduleFlush();
  store.bump('programs.reports');
  ok(res, { ok: true, flags: p.flags });
});

app.get('/api/programs/:id/settlement-statement', (req, res) => {
  const raw = store.programs.find((x) => x.id === String(req.params.id));
  if (!raw) return fail(res, 'programme not found', 404);
  const caller = String(req.headers['x-owner-id'] || '');
  const isAdmin = config.ADMIN_TOKEN && req.headers['x-admin-token'] === config.ADMIN_TOKEN;
  const isOwner = raw.ownerId === caller;
  const appRow = (raw.applications || []).find((a) => a.farmerId === caller);
  if (!isOwner && !appRow && !isAdmin) return fail(res, 'not allowed — programme owner, participating producer or admin only', 403);
  const st = compliance.buildSettlementStatement({
    program: raw,
    deliveries: raw.deliveries || [],
    settlement: raw.settlement || null,
    disputes: raw.disputes || [],
  });
  res.set('Content-Type', 'text/html; charset=utf-8');
  return res.send(compliance.renderStatementHtml(st));
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
  if (!config.VERIFY_TOKEN) return fail(res, 'webhook verification not configured on this instance', 503);
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
  if (!config.VERIFY_TOKEN) return fail(res, 'webhook verification not configured on this instance', 503);
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
const AUTO_BACKUP_MS = 6 * 60 * 60 * 1000; // every 6 hours while the process lives

const server = app.listen(config.PORT, config.HOST, () => {
  store.bump('boots.total');
  console.log(`\n🌍🌱 ${config.BOT_NAME} is running`);
  console.log(`   Web UI     : http://localhost:${config.PORT}/`);
  console.log(`   Health     : http://localhost:${config.PORT}/healthz`);
  console.log(`   Trust      : http://localhost:${config.PORT}/trust`);
  console.log(`   Engine     : ${config.ENABLE_LLM ? 'local KB + LLM (' + config.LLM_MODEL + ')' : 'local KB (self-learning)'}`);
  console.log(`   Channels   : whatsapp=${Boolean(config.WHATSAPP_TOKEN)} messenger=${Boolean(config.FACEBOOK_PAGE_TOKEN)} telegram=${Boolean(config.TELEGRAM_TOKEN)}`);
  console.log(`   Knowledge  : ${TOPIC_COUNT} topics | learned: ${store.listLearned().length} | unanswered queue: ${store.unanswered.length} | backend: ${store.backendName}`);
  console.log(`   Production : data dir ${config.DATA_DIR} | backups every ${AUTO_BACKUP_MS / 3600000}h | geotrace holdings=${store.holdings.length} consignments=${store.consignments.length}\n`);

  // Automatic on-disk snapshots (keeps newest BACKUP_KEEP). The disk makes
  // restarts durable; download /api/admin/backup off-site per the runbook.
  try {
    backup.writeAuto();
    setInterval(() => { backup.writeAuto(); }, AUTO_BACKUP_MS);
  } catch (err) {
    console.error('[backup] auto-backup unavailable:', err.message);
  }
});

module.exports = server;

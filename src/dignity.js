'use strict';

/**
 * Data dignity (audit E-gap close-out): per-account export & erasure.
 *
 * Honest design notes:
 *  - The x-owner-id header is the account capability in AgriSphere v2 (the
 *    same capability model the rest of the API uses). Erasure requires the
 *    owner's own header — or an ADMIN_TOKEN (for lawful removal requests).
 *  - Exports cover every record type the account can own; learned Q&A
 *    contributed by the account is removed too (it may live on in other
 *    users' conversations only as aggregated stats — no raw text is kept in
 *    the stats).
 *  - Photo files are deleted from disk where they exist.
 *  - Organisations owned by the account are deleted with it (their API keys
 *    die at the same moment). Memberships in other organisations are removed.
 *  - Deletion is immediate and not reversible — the endpoint says so.
 */

const fs = require('fs');
const path = require('path');
const store = require('./store');
const config = require('./config');

function adminOk(adminToken) {
  if (!config.ADMIN_TOKEN) return false;
  const a = Buffer.from(String(adminToken || ''));
  const b = Buffer.from(config.ADMIN_TOKEN);
  if (a.length !== b.length) return false;
  try { return require('crypto').timingSafeEqual(a, b); } catch (_) { return false; }
}

function ownerSession(ownerId) {
  return store.sessions[String(ownerId || '')] || null;
}

function programView(p) {
  return {
    id: p.id, title: p.title, orgName: p.orgName, product: p.product,
    volume: p.volume, status: p.status || 'draft', createdAt: p.createdAt,
  };
}

/** Everything an account owns / contributed. */
function collectFor(ownerId) {
  const owner = String(ownerId || '');
  if (!owner) return { error: 'an account identity is required (x-owner-id header)', code: 400 };
  const session = ownerSession(owner);
  const ownedPrograms = store.programs.filter((p) => p.ownerId === owner);
  const applications = [];
  for (const p of store.programs) {
    for (const a of (p.applications || [])) {
      if (a.farmerId === owner) {
        applications.push({ programme: programView(p), application: a });
      }
    }
  }
  const memberships = [];
  for (const o of store.orgs) {
    for (const m of (o.members || [])) {
      if (m.id === owner) memberships.push({ orgId: o.id, orgName: o.name, role: m.role, at: m.at });
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    format: 'agrisphere-account-export/v1',
    account: session
      ? {
          id: owner, name: session.name || '', lang: session.lang || '',
          verified: !!session.verified, phone: session.phone || '',
          createdAt: session.createdAt || null,
          history: (session.history || []).map((h) => ({
            at: h.at || null, user: h.user || '', reply: h.reply || '', entryId: h.entryId || null,
          })),
        }
      : { id: owner, note: 'no profile/session found for this identity on this instance' },
    data: {
      listings: store.listings.filter((l) => l.ownerId === owner),
      programmesOwned: ownedPrograms.map(programView),
      programmesAppliedTo: applications,
      experiences: store.experiences.filter((e) => e.ownerId === owner),
      bizplans: store.bizplans.filter((b) => b.sessionId === owner),
      ratingsGiven: store.ratings.filter((r) => r.byOwnerId === owner),
      alertSubscriptions: store.alerts.filter((a) => a.ownerId === owner),
      photosSubmitted: store.photoQuestions.filter((p) => p.sessionId === owner).map((p) => ({
        at: p.at, channel: p.channel, image: p.image, answered: !!p.answered,
      })),
      learnedContributions: store.learned.filter((l) => l.by === owner),
      unansweredQuestions: store.unanswered.filter((u) => u.sessionId === owner),
      organisationsOwned: store.orgs.filter((o) => o.ownerId === owner).map((o) => ({
        id: o.id, name: o.name, type: o.type, verified: !!o.verified, createdAt: o.createdAt,
      })),
      organisationMemberships: memberships,
      holdings: store.holdings.filter((h) => h.ownerId === owner),
      consignments: store.consignments.filter((c) => c.ownerId === owner),
    },
    note: 'Feedback given (thumbs up/down) is kept only as anonymous counts and is not part of the export.',
  };
}

function erasePhotoFile(p) {
  try {
    const rel = String(p.image || '').replace(/^\/uploads\//, '');
    if (rel && !rel.includes('/') && !rel.includes('..')) {
      const file = path.join(config.DATA_DIR, 'uploads', path.basename(rel));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  } catch (_) { /* best effort */ }
}

/** Erase an account and everything it owns. Immediate; not reversible. */
function eraseFor(ownerId) {
  const owner = String(ownerId || '');
  if (!owner) return { error: 'an account identity is required (x-owner-id header)', code: 400 };
  const session = ownerSession(owner);
  const counts = { sessions: 0, listings: 0, programs: 0, applications: 0, experiences: 0, bizplans: 0, ratings: 0, alerts: 0, photos: 0, learned: 0, unanswered: 0, orgs: 0, memberships: 0, otps: 0, feedback: 0, holdings: 0, consignments: 0 };

  if (session) {
    delete store.sessions[owner];
    counts.sessions = 1;
    const phone = session.phone;
    if (phone && store.otps && typeof store.otps === 'object' && store.otps[phone]) {
      delete store.otps[phone];
      counts.otps = 1;
    }
  }

  const ownedProgramIds = new Set(store.programs.filter((p) => p.ownerId === owner).map((p) => p.id));
  store.programs = store.programs.filter((p) => p.ownerId !== owner);
  counts.programs = ownedProgramIds.size;
  // remove this account's applications from programmes it does not own
  for (const p of store.programs) {
    if (!p.applications) continue;
    const before = p.applications.length;
    p.applications = p.applications.filter((a) => a.farmerId !== owner);
    counts.applications = (counts.applications || 0) + (before - p.applications.length);
  }

  const beforeListings = store.listings.length;
  store.listings = store.listings.filter((l) => l.ownerId !== owner);
  counts.listings = beforeListings - store.listings.length;

  const beforeExp = store.experiences.length;
  store.experiences = store.experiences.filter((e) => e.ownerId !== owner);
  counts.experiences = beforeExp - store.experiences.length;

  const beforeBiz = store.bizplans.length;
  store.bizplans = store.bizplans.filter((b) => b.sessionId !== owner);
  counts.bizplans = beforeBiz - store.bizplans.length;

  const beforeRat = store.ratings.length;
  store.ratings = store.ratings.filter((r) => r.byOwnerId !== owner);
  counts.ratings = beforeRat - store.ratings.length;

  const beforeAl = store.alerts.length;
  store.alerts = store.alerts.filter((a) => a.ownerId !== owner);
  counts.alerts = beforeAl - store.alerts.length;

  const beforePh = store.photoQuestions.length;
  const removedPhotos = store.photoQuestions.filter((p) => p.sessionId === owner);
  store.photoQuestions = store.photoQuestions.filter((p) => p.sessionId !== owner);
  counts.photos = beforePh - store.photoQuestions.length;
  for (const p of removedPhotos) erasePhotoFile(p);

  const beforeL = store.learned.length;
  store.learned = store.learned.filter((l) => l.by !== owner);
  counts.learned = beforeL - store.learned.length;

  const beforeU = store.unanswered.length;
  store.unanswered = store.unanswered.filter((u) => u.sessionId !== owner);
  counts.unanswered = beforeU - store.unanswered.length;

  const beforeFb = store.feedback.length;
  store.feedback = store.feedback.filter((f) => f.sessionId !== owner);
  counts.feedback = beforeFb - store.feedback.length;

  const beforeOrg = store.orgs.length;
  store.orgs = store.orgs.filter((o) => o.ownerId !== owner);
  counts.orgs = beforeOrg - store.orgs.length;
  for (const o of store.orgs) {
    const beforeM = (o.members || []).length;
    o.members = (o.members || []).filter((m) => m.id !== owner);
    counts.memberships += beforeM - (o.members || []).length;
  }

  const beforeH = store.holdings.length;
  store.holdings = store.holdings.filter((h) => h.ownerId !== owner);
  counts.holdings = beforeH - store.holdings.length;
  const beforeC = store.consignments.length;
  store.consignments = store.consignments.filter((c) => c.ownerId !== owner);
  counts.consignments = beforeC - store.consignments.length;
  // also drop share grants this account held on others' holdings
  for (const h of store.holdings) {
    if (h.sharedWith && h.sharedWith.includes(owner)) {
      h.sharedWith = h.sharedWith.filter((x) => x !== owner);
    }
  }

  store.stats['dignity.erased'] = (store.stats['dignity.erased'] || 0) + 1;
  store._scheduleFlush();
  return {
    erased: counts,
    note: 'The account and all listed records were deleted immediately. This is not reversible. Anonymous aggregate statistics were kept (no raw text or personal data).',
  };
}

module.exports = { collectFor, eraseFor };

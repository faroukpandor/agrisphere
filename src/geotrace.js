'use strict';

/**
 * Geo-trace & export-readiness layer (EUDR wedge W1 — STRATEGY §8.4).
 *
 * Purpose: record holdings/ranches with coordinates (consent-first), link
 * consignment lots to the chain of holdings an animal group passed through,
 * and export a SELF-DECLARED readiness file (CSV/JSON) that buyers/exporters
 * can attach to their due-diligence work for EU-regulated chains.
 *
 * Why now: Regulation (EU) 2023/1115 (as amended by (EU) 2025/2650) applies
 * to cattle/beef placed on the EU market from 30 Dec 2026 (large/medium
 * operators) and 30 Jun 2027 (micro/small). Geolocation of every holding
 * where animals were kept (birth to slaughter) is core to due-diligence
 * statements.
 *
 * Honest framing (never overclaim):
 *  - AgriSphere stores farmer/organisation-declared data and formats it.
 *  - Legality, deforestation-risk and compliance assessment remain the
 *    operator's duty under the Regulation and its implementing acts.
 *  - Nothing here is a certificate or a TRACES due-diligence statement.
 *  - Consent-first: a holding record is only created with explicit consent,
 *    and a holding may be shared ONLY with named owner accounts (e.g. the
 *    co-op aggregating member output). Shared-with lists are replaceable
 *    and deletable by the holding owner at any time.
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');

const SPECIES = ['cattle', 'smallstock', 'other'];
const KINDS = ['ranch', 'farm', 'feedlot', 'pasture', 'auction', 'other'];
const MAX_SHARED_WITH = 5;

function uid() { return crypto.randomUUID(); }

function clean(v, max) {
  return String(v || '').replace(/[^\p{L}\p{N}\s.,;:!?@#+&()/'"’'’.-]/gu, '')
    .replace(/\s+/g, ' ').trim().slice(0, max);
}

function ref(prefix) {
  return prefix + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function adminOk(adminToken) {
  if (!config.ADMIN_TOKEN) return false;
  const a = Buffer.from(String(adminToken || ''));
  const b = Buffer.from(config.ADMIN_TOKEN);
  if (a.length !== b.length) return false;
  try { return crypto.timingSafeEqual(a, b); } catch (_) { return false; }
}

function dateOk(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !Number.isNaN(Date.parse(s));
}

function coord(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 1e6) / 1e6 : NaN;
}

function latLngOk(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function visibleHolding(h) {
  return {
    id: h.id, ref: h.ref, name: h.name, district: h.district, kind: h.kind,
    lat: h.lat, lng: h.lng, status: h.status || 'active',
    consentAt: h.consentAt, sharedWith: h.sharedWith || [],
    notes: h.notes || '', createdAt: h.createdAt,
  };
}

function visibleConsignment(c) {
  return {
    id: c.id, ref: c.ref, title: c.title, buyer: c.buyer,
    destination: c.destination || 'EU', species: c.species,
    programmeId: c.programmeId || '', status: c.status || 'draft',
    lotCount: (c.lots || []).length,
    headTotal: (c.lots || []).reduce((a, l) => a + (l.headCount || 0), 0),
    createdAt: c.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Holdings
// ---------------------------------------------------------------------------
function createHolding({ name, district, kind, lat, lng, notes, consent, sharedWith, ownerId }) {
  const owner = String(ownerId || '').slice(0, 80);
  const nm = clean(name, 90);
  if (!owner) return { error: 'ownerId is required — pass your x-owner-id header', code: 400 };
  if (!nm) return { error: 'a holding name is required', code: 400 };
  if (consent !== true && consent !== 'true') {
    return { error: 'explicit consent is required before storing holding geolocation (consent: true)', code: 400 };
  }
  const lt = coord(lat);
  const ln = coord(lng);
  if (!latLngOk(lt, ln)) {
    return { error: 'valid coordinates are required (latitude -90..90, longitude -180..180)', code: 400 };
  }
  const sw = Array.isArray(sharedWith)
    ? [...new Set(sharedWith.map((x) => String(x).slice(0, 80)).filter(Boolean))].slice(0, MAX_SHARED_WITH)
    : [];
  const holding = {
    id: uid(),
    ref: ref('H'),
    name: nm,
    district: clean(district, 60),
    kind: KINDS.includes(kind) ? kind : 'other',
    lat: lt, lng: ln,
    status: 'active',
    consentAt: Date.now(),
    consent: true,
    ownerId: owner,
    sharedWith: sw,
    notes: clean(notes, 300),
    createdAt: Date.now(),
  };
  store.holdings.push(holding);
  store._scheduleFlush();
  store.bump('geotrace.holdings.created');
  return { holding: visibleHolding(holding) };
}

function listHoldings(ownerId, adminToken) {
  const owner = String(ownerId || '');
  const admin = adminOk(adminToken);
  if (admin) return { holdings: store.holdings.map(visibleHolding) };
  if (!owner) return { holdings: [] };
  const mine = store.holdings.filter((h) => h.ownerId === owner);
  return { holdings: mine.map(visibleHolding) };
}

function getHolding(id, ownerId, adminToken) {
  const h = store.holdings.find((x) => x.id === String(id || ''));
  if (!h) return { error: 'holding not found', code: 404 };
  const admin = adminOk(adminToken);
  if (!admin && h.ownerId !== String(ownerId || '')) return { error: 'not allowed', code: 403 };
  return { holding: visibleHolding(h) };
}

function deleteHolding(id, ownerId, adminToken) {
  const idx = store.holdings.findIndex((x) => x.id === String(id || ''));
  if (idx === -1) return { error: 'holding not found', code: 404 };
  const h = store.holdings[idx];
  const admin = adminOk(adminToken);
  if (!admin && h.ownerId !== String(ownerId || '')) return { error: 'not allowed', code: 403 };
  const usedBy = store.consignments
    .filter((c) => (c.lots || []).some((l) => (l.chain || []).some((s) => s.holdingId === h.id)))
    .map((c) => c.ref);
  if (usedBy.length) {
    return { error: `holding is referenced by consignment(s) ${usedBy.join(', ')} — delete or re-chain those lots first`, code: 400 };
  }
  store.holdings.splice(idx, 1);
  store._scheduleFlush();
  store.bump('geotrace.holdings.deleted');
  return { ok: true };
}

/** Owner-controlled sharing: `with` REPLACES the list (add/remove via it). */
function shareHolding(id, withIds, ownerId) {
  const h = store.holdings.find((x) => x.id === String(id || ''));
  if (!h) return { error: 'holding not found', code: 404 };
  if (h.ownerId !== String(ownerId || '')) return { error: 'only the holding owner can change sharing', code: 403 };
  const next = Array.isArray(withIds)
    ? [...new Set(withIds.map((x) => String(x).slice(0, 80)).filter(Boolean))].slice(0, MAX_SHARED_WITH)
    : [];
  if (next.includes(h.ownerId)) {
    return { error: 'a holding cannot be shared with its own owner account', code: 400 };
  }
  h.sharedWith = next;
  store._scheduleFlush();
  store.bump('geotrace.holdings.shared');
  return { ok: true, sharedWith: h.sharedWith };
}

// ---------------------------------------------------------------------------
// Consignments & lots
// ---------------------------------------------------------------------------
function createConsignment({ title, buyer, destination, species, programmeId, ownerId }) {
  const owner = String(ownerId || '').slice(0, 80);
  const t = clean(title, 120);
  if (!owner) return { error: 'ownerId is required — pass your x-owner-id header', code: 400 };
  if (!t) return { error: 'a consignment title is required', code: 400 };
  const c = {
    id: uid(),
    ref: ref('C'),
    title: t,
    buyer: clean(buyer, 90),
    destination: clean(destination, 60) || 'EU',
    species: SPECIES.includes(species) ? species : 'cattle',
    programmeId: clean(programmeId, 80),
    status: 'draft',
    lots: [],
    ownerId: owner,
    createdAt: Date.now(),
  };
  store.consignments.push(c);
  store._scheduleFlush();
  store.bump('geotrace.consignments.created');
  return { consignment: visibleConsignment(c) };
}

function listConsignments(ownerId, adminToken) {
  const owner = String(ownerId || '');
  if (adminOk(adminToken)) return { consignments: store.consignments.map(visibleConsignment) };
  if (!owner) return { consignments: [] };
  return { consignments: store.consignments.filter((c) => c.ownerId === owner).map(visibleConsignment) };
}

function canAccessConsignment(c, ownerId, adminToken) {
  return adminOk(adminToken) || c.ownerId === String(ownerId || '');
}

function getConsignment(id, ownerId, adminToken) {
  const c = store.consignments.find((x) => x.id === String(id || ''));
  if (!c) return { error: 'consignment not found', code: 404 };
  if (!canAccessConsignment(c, ownerId, adminToken)) return { error: 'not allowed', code: 403 };
  return { consignment: deepConsignment(c) };
}

function deepConsignment(c) {
  const holdingsById = {};
  for (const h of store.holdings) holdingsById[h.id] = h;
  return {
    ...visibleConsignment(c),
    lots: (c.lots || []).map((l) => ({
      id: l.id, label: l.label, headCount: l.headCount,
      chain: (l.chain || []).map((s) => {
        const h = holdingsById[s.holdingId] || null;
        return {
          holdingId: s.holdingId,
          holdingRef: h ? h.ref : 'UNKNOWN',
          holdingName: h ? h.name : '(holding deleted)',
          district: h ? h.district || '' : '',
          kind: h ? h.kind || '' : '',
          lat: h ? h.lat : null,
          lng: h ? h.lng : null,
          from: s.from,
          to: s.to || null,
          note: s.note || '',
        };
      }),
    })),
  };
}

function addLot(consignmentId, { headCount, label, chain }, requesterId, adminToken) {
  const c = store.consignments.find((x) => x.id === String(consignmentId || ''));
  if (!c) return { error: 'consignment not found', code: 404 };
  if (!canAccessConsignment(c, requesterId, adminToken)) return { error: 'not allowed', code: 403 };
  const hc = Number(headCount);
  if (!Number.isInteger(hc) || hc < 1 || hc > 100000) {
    return { error: 'headCount must be a whole number between 1 and 100,000', code: 400 };
  }
  const segs = Array.isArray(chain) ? chain : [];
  if (!segs.length) return { error: 'a lot needs at least one holding-period segment (chain)', code: 400 };
  const parsed = [];
  for (const s of segs) {
    const hid = String((s && s.holdingId) || '').slice(0, 80);
    const h = store.holdings.find((x) => x.id === hid);
    if (!h) return { error: 'chain references a holding that does not exist', code: 400 };
    const access = adminOk(adminToken) || h.ownerId === String(requesterId || '') || (h.sharedWith || []).includes(String(requesterId || ''));
    if (!access) {
      return { error: `holding ${h.ref} is not yours and not shared with this account — ask its owner to share it`, code: 403 };
    }
    const from = String((s && s.from) || '');
    const to = s && s.to ? String(s.to) : '';
    if (!dateOk(from)) return { error: 'each chain segment needs a period_from date (YYYY-MM-DD)', code: 400 };
    if (to && !dateOk(to)) return { error: 'period_to must be a date YYYY-MM-DD or empty (still current)', code: 400 };
    if (to && from > to) return { error: 'period_from must not be after period_to', code: 400 };
    parsed.push({ holdingId: hid, from, to, note: clean(s.note, 200) });
  }
  parsed.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  // An open-ended segment followed by later segments means "kept there until
  // moved" — close it at the next segment's start for a gapless lifetime chain.
  for (let i = 1; i < parsed.length; i++) {
    if (!parsed[i - 1].to) parsed[i - 1].to = parsed[i].from;
  }
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i - 1].to && parsed[i - 1].to > parsed[i].from) {
      return { error: 'chain periods overlap — list the holdings in date order with no overlap', code: 400 };
    }
  }
  const lot = {
    id: uid(),
    label: clean(label, 80) || `Lot ${(c.lots || []).length + 1}`,
    headCount: hc,
    chain: parsed,
    addedAt: Date.now(),
  };
  c.lots = c.lots || [];
  c.lots.push(lot);
  store._scheduleFlush();
  store.bump('geotrace.lots.added');
  return { ok: true, lot: lot, lots: c.lots.length, headTotal: c.lots.reduce((a, l) => a + l.headCount, 0) };
}

function deleteConsignment(id, ownerId, adminToken) {
  const idx = store.consignments.findIndex((x) => x.id === String(id || ''));
  if (idx === -1) return { error: 'consignment not found', code: 404 };
  const c = store.consignments[idx];
  if (!canAccessConsignment(c, ownerId, adminToken)) return { error: 'not allowed', code: 403 };
  store.consignments.splice(idx, 1);
  store._scheduleFlush();
  store.bump('geotrace.consignments.deleted');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Self-declared readiness export (CSV / JSON)
// ---------------------------------------------------------------------------
const DISCLAIMER_LINES = [
  'Disclaimer: this file is a SELF-DECLARED readiness export generated by AgriSphere',
  'from farmer/organisation-recorded data. It is documentation support for buyer',
  'due-diligence work — it is NOT a certificate and NOT a TRACES due-diligence',
  'statement. Deforestation-risk and legality assessment remain the operator\'s',
  'duty under Regulation (EU) 2023/1115 (as amended by (EU) 2025/2650); verify',
  'against the latest implementing acts and your buyer\'s requirements.',
];

function csvEscape(v) {
  const s = String(v === null || v === undefined ? '' : v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportCsv(consignmentId, ownerId, adminToken) {
  const c = store.consignments.find((x) => x.id === String(consignmentId || ''));
  if (!c) return { error: 'consignment not found', code: 404 };
  if (!canAccessConsignment(c, ownerId, adminToken)) return { error: 'not allowed', code: 403 };
  const deep = deepConsignment(c);
  const lines = [];
  lines.push('# AgriSphere geo-trace readiness export (self-declared)');
  lines.push(`# Exported at: ${new Date().toISOString()}`);
  lines.push(`# Consignment: ${csvEscape(c.ref)} — ${csvEscape(c.title)}`);
  lines.push(`# Buyer: ${csvEscape(c.buyer)} | Destination market: ${csvEscape(c.destination)} | Species: ${csvEscape(c.species)}`);
  lines.push('# Holding details are as recorded on the export date.');
  lines.push('consignment_ref,title,buyer,destination,species,lot,label,head_count,segment,holding_ref,holding_name,district,kind,latitude,longitude,period_from,period_to,note');
  for (const lot of deep.lots) {
    lot.chain.forEach((seg, i) => {
      lines.push([
        c.ref, c.title, c.buyer, c.destination, c.species,
        lot.id, lot.label, lot.headCount, i + 1,
        seg.holdingRef, seg.holdingName, seg.district, seg.kind,
        seg.lat === null ? '' : seg.lat, seg.lng === null ? '' : seg.lng,
        seg.from, seg.to || '(current)', seg.note,
      ].map(csvEscape).join(','));
    });
  }
  lines.push('#');
  for (const d of DISCLAIMER_LINES) lines.push('# ' + d);
  return { csv: lines.join('\n') + '\n' };
}

function exportJson(consignmentId, ownerId, adminToken) {
  const r = getConsignment(consignmentId, ownerId, adminToken);
  if (r.error) return r;
  return {
    json: {
      schema: 'agrisphere.geotrace.readiness-export/v1',
      selfDeclared: true,
      exportedAt: new Date().toISOString(),
      consignment: r.consignment,
      disclaimer: DISCLAIMER_LINES.join(' '),
    },
  };
}

function info() {
  return {
    purpose: 'Geo-trace & EUDR readiness records for cattle/beef and other export chains.',
    deadline: {
      label: 'Regulation (EU) 2023/1115 (amended by (EU) 2025/2650)',
      largeMediumOperators: '2026-12-30',
      microSmallOperators: '2027-06-30',
      note: 'Dates apply to placing on the EU market; verify scope with the buyer and the latest implementing acts.',
    },
    minimumData: [
      'holding/ranch geolocation (coordinates) recorded with the owner\'s consent',
      'per-lot chain of holdings with period_from/period_to covering where the animals were kept',
      'buyer, destination market and species per consignment',
    ],
    limits: [
      'Self-declared documentation only — not a certificate and not a TRACES due-diligence statement.',
      'Legality & deforestation-risk assessment remain the operator\'s duty.',
      'Botswana\'s position (SADC EPA / country benchmarking) may change the practical burden — monitor EC implementing acts.',
    ],
  };
}

module.exports = {
  SPECIES, KINDS,
  createHolding, listHoldings, getHolding, deleteHolding, shareHolding,
  createConsignment, listConsignments, getConsignment, addLot, deleteConsignment,
  exportCsv, exportJson, info,
};

'use strict';

/**
 * Buyer-led production programmes — the platform layer that lets a serious
 * buyer (processor, exporter, supermarket, school feeding, feedlot, hotel
 * chain) post a structured demand programme and farmers/co-ops apply, with
 * AgriSphere supporting every stage from planning to delivery.
 *
 * DESIGN RULES (see docs/COMPLIANCE.md §9):
 *   - AgriSphere is facilitator & document layer — NEVER a contracting party
 *     and never handles money.
 *   - Programmes must pass the fair-terms checklist to be listed.
 *   - Every programme carries a stage-gated production playbook that links
 *     back to the knowledge base (chat can teach each stage).
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');
const KB = require('./knowledge');

const FAIR_TERMS = [
  'price formula is written and transparent (e.g. BAMB-linked or agreed floor)',
  'no unfair deductions or hidden penalties',
  'advance / input-credit terms are written',
  'payment timeline is written (e.g. within X days of delivery)',
  'written contract offered to the farmer',
];

const MAX_PROGRAMS_PER_ORG = 20;
const TTL_MS = 120 * 24 * 60 * 60 * 1000; // 120 days open

function clean(v, max) {
  return String(v || '')
    .replace(/[^\p{L}\p{N}\s.,;:!?@#+%&()\/'’%≥≤-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function prune() {
  const now = Date.now();
  const before = store.programs.length;
  store.programs = store.programs.filter((p) => p.expiresAt > now);
  if (store.programs.length !== before) store._scheduleFlush();
}

function visible(p, includeApplications = false) {
  const v = {
    id: p.id,
    orgName: p.orgName,
    title: p.title,
    product: p.product,
    volume: p.volume,
    qualitySpecs: p.qualitySpecs,
    priceFormula: p.priceFormula,
    advancePct: p.advancePct,
    inputCredit: p.inputCredit,
    deliveryWindow: p.deliveryWindow,
    locations: p.locations,
    requirements: p.requirements,
    contact: p.contact,
    fairTerms: p.fairTerms,
    createdAt: p.createdAt,
    expiresAt: p.expiresAt,
    applicationsCount: (p.applications || []).length,
  };
  if (includeApplications) v.applications = p.applications || [];
  return v;
}

function listPrograms({ q } = {}) {
  prune();
  let out = store.programs.slice();
  if (q) {
    const n = String(q).toLowerCase();
    out = out.filter((p) =>
      (p.title + ' ' + p.product + ' ' + p.orgName + ' ' + p.locations).toLowerCase().includes(n)
    );
  }
  return out.sort((a, b) => b.createdAt - a.createdAt).map((p) => visible(p));
}

function createProgram(body) {
  prune();
  const owner = String(body.ownerId || '').slice(0, 80) || crypto.randomUUID();
  const owned = store.programs.filter((p) => p.ownerId === owner).length;
  if (owned >= MAX_PROGRAMS_PER_ORG) return { error: `maximum ${MAX_PROGRAMS_PER_ORG} open programmes per organisation` };

  const org = clean(body.orgName, 90);
  const title = clean(body.title, 90);
  const product = clean(body.product, 60);
  const contact = clean(body.contact, 120);
  if (!org || !title || !product || !contact) return { error: 'orgName, title, product and contact are required' };

  const confirmed = Array.isArray(body.fairTerms) && body.fairTerms.length >= 1 &&
    (body.fairTerms[0] === 'confirmed' || body.fairTerms.length === FAIR_TERMS.length);
  if (!confirmed) {
    return { error: 'fair-terms checklist must be confirmed in full: ' + FAIR_TERMS.join('; ') };
  }

  const program = {
    id: crypto.randomUUID(),
    ownerId: owner,
    orgName: org,
    title: title,
    product: product,
    volume: clean(body.volume, 120),
    qualitySpecs: clean(body.qualitySpecs, 400),
    priceFormula: clean(body.priceFormula, 300),
    advancePct: clean(body.advancePct, 120),
    inputCredit: clean(body.inputCredit, 200),
    deliveryWindow: clean(body.deliveryWindow, 120),
    locations: clean(body.locations, 200),
    requirements: clean(body.requirements, 400),
    contact: contact,
    fairTerms: FAIR_TERMS,
    applications: [],
    createdAt: Date.now(),
    expiresAt: Date.now() + TTL_MS,
  };
  store.programs.push(program);
  store._scheduleFlush();
  store.bump('programs.created');
  return { program: visible(program) };
}

function applyToProgram(id, body) {
  prune();
  const p = store.programs.find((x) => x.id === id);
  if (!p) return { error: 'programme not found' };
  const name = clean(body.name, 80);
  const contact = clean(body.contact, 120);
  const capacity = clean(body.capacity, 200);
  if (!name || !contact) return { error: 'name and contact are required' };
  const farmerId = String(body.ownerId || '').slice(0, 80) || crypto.randomUUID();
  if ((p.applications || []).length > 0) {
    const already = p.applications.some((a) => a.contact === contact);
    if (already) return { error: 'you have already applied to this programme' };
  }
  p.applications = p.applications || [];
  p.applications.push({
    id: crypto.randomUUID(),
    farmerId,
    name: name,
    location: clean(body.location, 120),
    capacity,
    product: clean(body.product, 120),
    message: clean(body.message, 400),
    contact,
    at: Date.now(),
  });
  store._scheduleFlush();
  store.bump('programs.applications');
  return { ok: true, applicationsCount: p.applications.length };
}

function programApplications(id, requesterId, adminToken) {
  prune();
  const p = store.programs.find((x) => x.id === id);
  if (!p) return { error: 'programme not found' };
  const isAdmin = config.ADMIN_TOKEN && adminToken === config.ADMIN_TOKEN;
  if (!isAdmin && p.ownerId !== String(requesterId || '')) return { error: 'not allowed', code: 403 };
  return { applications: (p.applications || []).slice().sort((a, b) => b.at - a.at) };
}

function removeProgram(id, ownerId, adminToken) {
  prune();
  const idx = store.programs.findIndex((p) => p.id === id);
  if (idx === -1) return { error: 'programme not found' };
  const isAdmin = config.ADMIN_TOKEN && adminToken === config.ADMIN_TOKEN;
  if (!isAdmin && store.programs[idx].ownerId !== String(ownerId || '')) return { error: 'not allowed', code: 403 };
  store.programs.splice(idx, 1);
  store._scheduleFlush();
  store.bump('programs.removed');
  return { ok: true };
}

/**
 * Stage-gated production playbook: returns the checklist stages for the
 * programme's product, each linked to relevant knowledge-base topics so the
 * assistant can teach the stage on demand.
 */
const PRODUCT_PLAYBOOK = {
  maize: { stages: [['0 · Confirm contract & advance', 'price formula, volumes, quality specs, delivery calendar'], ['1 · Land & inputs', 'land prep (rip/plough), certified seed, basal fertiliser'], ['2 · Planting', 'with the rains; spacing 90×25–30 cm; record field & batch'], ['3 · Crop care', 'weed-free first 8 weeks; top-dress at knee-high; scout FAW & stalk borer weekly'], ['4 · Harvest & dry', 'harvest at 15–18% moisture; dry & shell clean; grade out damaged grain'], ['5 · Quality & delivery', 'moisture ≤12.5%, clean grain, correct bags; deliver on schedule with batch record']], kb: ['crop-maize', 'pest-fall-armyworm', 'disease-maize-streak', 'quality-food-safety'] },
  sorghum: { stages: [['0 · Confirm contract & advance', 'price formula, volumes, specs'], ['1 · Land & inputs', 'rip/plant along contour; seed ~8–12 kg/ha'], ['2 · Planting', 'with the rains Nov–Jan'], ['3 · Crop care', 'weed early; scout stalk borer & shoot fly; protect grain from birds at fill'], ['4 · Harvest & dry', 'hard grain; dry, thresh, clean'], ['5 · Quality & delivery', '≤12.5% moisture; clean bags; batch record']], kb: ['crop-sorghum', 'pest-quelea'] },
  cowpea: { stages: [['0 · Confirm contract & advance', ''], ['1 · Land & inputs', 'well-drained land; inoculant/rhizobia where available'], ['2 · Planting', 'Nov–Jan; 75×20 cm'], ['3 · Crop care', 'aphids early; pod borers at flowering; harvest leaves sparingly if for grain'], ['4 · Harvest', 'pick dry pods repeatedly; thresh; sun-dry'], ['5 · Quality & delivery', '<12% moisture; treat storage against bruchids']], kb: ['crop-cowpea'] },
  groundnut: { stages: [['0 · Confirm contract & advance', 'aflatoxin specs matter — read them'], ['1 · Land & inputs', 'loose sandy soil; no previous groundnuts 2+ yrs'], ['2 · Planting', 'Dec–Jan; 75×15–20 cm'], ['3 · Crop care', 'earth-up at flowering; weed early'], ['4 · Harvest & dry', 'maturity test; sun-dry 3–5 days; shell later'], ['5 · Quality & delivery', 'dry to safe moisture; grade & sort mouldy nuts — aflatoxin is a contract killer']], kb: ['crop-groundnut', 'quality-food-safety'] },
  tomato: { stages: [['0 · Confirm contract & advance', 'grade specs, packaging, delivery rhythm'], ['1 · Nursery', 'certified seed; 4–6 week seedlings'], ['2 · Land prep & transplant', 'fertile beds; 60–90×40–50 cm; stake/trellis'], ['3 · Crop care', 'regular irrigation; scout Tuta & blight twice weekly; foliar calcium'], ['4 · Harvest', 'grade at harvest; ventilated crates; shade immediately'], ['5 · Quality & delivery', 'clean, uniform, damage-free; morning delivery']], kb: ['crop-tomato', 'pest-tuta', 'disease-tomato-blight', 'quality-postharvest'] },
  leafy: { stages: [['0 · Confirm contract & advance', ''], ['1 · Nursery', 'kale/cabbage/rape 4–6 weeks'], ['2 · Transplant', '30–60 cm spacing; compost/manure base'], ['3 · Crop care', 'consistent water; nitrogen top-dress; watch aphids & diamondback moth'], ['4 · Harvest', 'cut-and-come-again or head harvest; wash & grade'], ['5 · Quality & delivery', 'clean bunches/crates; early delivery; batch label']], kb: ['crop-leafyveg', 'quality-food-safety'] },
  poultry: { stages: [['0 · Confirm contract & advance', 'bird specs, weight window, slaughter/processing expectations'], ['1 · Housing & biosecurity', 'shed ready; footbath; one-way movement'], ['2 · Chicks & brooding', 'day-old chicks; brooder heat 4 weeks; quality starter feed'], ['3 · Grow-out', 'feed programme; clean water; vaccinate per vet schedule; weigh weekly'], ['4 · Finish', 'reach target weight; stop feed per buyer specs before collection'], ['5 · Delivery', 'humane catching; clean crates; batch records & health certificate']], kb: ['prod-poultry', 'welfare-animals'] },
  pig: { stages: [['0 · Confirm contract & advance', 'ASF biosecurity zone rules — know them before committing'], ['1 · Housing & biosecurity', 'pens, wallows/shade, boot dips'], ['2 · Stock & feeding', 'weaners from tested herds; quarantine 30 days; quality ration'], ['3 · Grow-out', 'weigh monthly; adjust feed; watch health daily'], ['4 · Finish', 'target weight window per contract'], ['5 · Delivery', 'movement permit if crossing zones; clean transport']], kb: ['prod-pigs', 'welfare-animals'] },
  fish: { stages: [['0 · Confirm contract & advance', 'size/weight specs & harvest schedule'], ['1 · Water & pond', 'water source & quality test; pond/lined tanks ready'], ['2 · Stocking', 'certified fingerlings; 1–3 fish/m²'], ['3 · Feeding & water', 'floating pellets 2–4% body weight; oxygen & pH monitoring'], ['4 · Grow & grade', 'grade sizes monthly; keep records'], ['5 · Harvest & delivery', 'purge (no feed) before harvest; chilled transport; traceability']], kb: ['prod-aquaculture'] },
  goat: { stages: [['0 · Confirm contract & advance', 'weight/condition specs & slaughter dates'], ['1 · Flock & health', 'vaccinate CCPP/pasteurella; deworm after rains'], ['2 · Nutrition', 'match stocking to veld; supplement pregnant/lactating does'], ['3 · Grow', 'weigh monthly; cull poor doers'], ['4 · Finish', 'condition score for market'], ['5 · Delivery', 'movement permit; humane transport; vet certificate']], kb: ['prod-smallstock', 'welfare-animals', 'livestock-basics'] },
};

function playbookFor(product) {
  const p = String(product || '').toLowerCase();
  const key = Object.keys(PRODUCT_PLAYBOOK).find((k) => p.includes(k)) ||
    (p.includes('vegetable') ? 'leafy' : null) ||
    (p.includes('chicken') ? 'poultry' : null) ||
    (p.includes('peanut') ? 'groundnut' : null);
  const pb = PRODUCT_PLAYBOOK[key || 'maize'];
  if (!key) {
    return {
      note: 'No specialised playbook yet for this product — the buyer and farmer should agree a stage plan (land → inputs → production → harvest → quality → delivery). The assistant can teach each topic on request.',
      stages: PRODUCT_PLAYBOOK.maize.stages.map((s, i) => [s[0].replace('maize-specific', ''), s[1]]),
      kb: [],
    };
  }
  return { stages: pb.stages, kb: pb.kb, note: 'Stage-gated checklist — ask the assistant to teach any stage (e.g. "maize harvest and storage").' };
}

module.exports = { FAIR_TERMS, listPrograms, createProgram, applyToProgram, programApplications, removeProgram, playbookFor };

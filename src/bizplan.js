'use strict';

/**
 * Starter agri-business toolkit — guided business planning that beats the
 * "sell you a static PDF" competitors: plans are generated from the starter's
 * own answers, honest ranges (never fake precision), plus a stepwise action
 * plan and funding pointers. Real records (see record-keeping topics) turn
 * the draft into a living, bankable plan.
 */

const crypto = require('crypto');
const store = require('./store');

const ENTERPRISE_OPTIONS = [
  { key: 'maize', label: 'Maize (dryland)', kb: ['crop-maize'] },
  { key: 'sorghum', label: 'Sorghum', kb: ['crop-sorghum'] },
  { key: 'groundnuts', label: 'Groundnuts', kb: ['crop-groundnut'] },
  { key: 'tomatoes', label: 'Tomatoes (irrigated)', kb: ['crop-tomato'] },
  { key: 'leafy', label: 'Leafy vegetables (morogo/kale)', kb: ['crop-leafyveg'] },
  { key: 'poultry', label: 'Poultry (broilers/layers)', kb: ['prod-poultry'] },
  { key: 'pigs', label: 'Pigs', kb: ['prod-pigs'] },
  { key: 'goats', label: 'Goats / sheep', kb: ['prod-smallstock'] },
  { key: 'fish', label: 'Fish farming (tilapia/catfish)', kb: ['prod-aquaculture'] },
  { key: 'bees', label: 'Beekeeping', kb: ['prod-beekeeping'] },
  { key: 'mixed', label: 'Mixed crops + livestock', kb: ['prod-integrated'] },
];

const FUNDING_ROUTES = [
  'CEDA (Citizen Entrepreneurial Development Agency) — citizen SME/youth windows',
  'National Development Bank (NDB)',
  'Young Farmers Fund (Ministry of Agriculture / youth windows)',
  'Commercial banks & licensed micro-financiers (verify licences)',
  'Village savings & loan groups / co-operative finance',
  'District extension office — grant & programme announcements (often cheapest first step)',
];

function clean(v, max) {
  return String(v || '').replace(/[^\p{L}\p{N}\s.,;:!?@#+%&()\/'’-]/gu, '')
    .replace(/\s+/g, ' ').trim().slice(0, max);
}

function num(v) {
  const n = Number(String(v || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function buildPlan(input) {
  const name = clean(input.name, 60) || 'the starter';
  const enterpriseKey = ENTERPRISE_OPTIONS.some((o) => o.key === input.enterprise)
    ? input.enterprise : 'mixed';
  const ent = ENTERPRISE_OPTIONS.find((o) => o.key === enterpriseKey);
  const landHa = num(input.landHa) || (enterpriseKey === 'poultry' || enterpriseKey === 'pigs' || enterpriseKey === 'bees' || enterpriseKey === 'fish' ? null : 1);
  const budget = num(input.budget);
  const labour = clean(input.labour, 80) || 'family labour (to be confirmed)';
  const water = clean(input.water, 120) || 'to be confirmed';
  const market = clean(input.market, 300) || 'to be researched (see marketing steps)';
  const location = clean(input.location, 80) || 'your area';
  const months = clean(input.startWindow, 80) || 'next suitable season';

  const sections = [];
  sections.push({
    h: '1 · Executive summary',
    lines: [
      `${name} intends to start ${ent.label} at ${location}, beginning ${months}.`,
      landHa ? `Planned area/scale: ${landHa} ha (or equivalent units).` : 'Scale: to be confirmed with the buyer & space available.',
      budget ? `Estimated starting budget (starter's figure): P${budget.toLocaleString()}. This draft uses ranges — verify every number locally.` : 'Starting budget: to be completed with real quotes.',
      'The full plan must be built from records, not guesses — see the action plan (section 7) for the record-keeping start.',
    ],
  });
  sections.push({
    h: '2 · Enterprise & production',
    lines: [
      `Enterprise: ${ent.label}.`,
      landHa ? `Land: ~${landHa} ha available (confirm tenure/lease documents — see land tenure guidance).` : 'Land: small-scale/backyard or intensive system (confirm space & tenure).',
      `Water: ${water}.`,
      `Labour: ${labour}.`,
      'Production practice: follow the stage-gated guidance in the assistant (ask it for this crop/livestock) and local extension advice.',
      'Knowledge topics to master: ' + ent.kb.join(', ') + '.',
    ],
  });
  sections.push({
    h: '3 · Market & buyers',
    lines: [
      `Planned buyers: ${market}.`,
      'Confirm demand BEFORE investing: visit 2–3 real buyers (market, BAMB depot, supermarket, processor, neighbours), ask their quality specs, volumes and prices, and get at least one expression of interest in writing.',
      'Price honesty: never plan on a guess — use BAMB bulletins, market visits and buyer quotes; prices move with season.',
      'Alternative buyers (plan B) must exist before you commit inputs.',
    ],
  });
  sections.push({
    h: '4 · Starting budget (ranges — VERIFY with local quotes)',
    lines: budget
      ? [
          `Total capital the starter plans to invest: ~P${budget.toLocaleString()}.`,
          'Split the budget into: land prep & planting stock (30–45%), inputs/feed (35–50%), tools/water (10–20%), contingency (10%). Percentages are planning ranges, not rules.',
          'Get 2–3 written quotes per input from different agro-dealers/suppliers.',
        ]
      : [
          'Complete the budget with real quotes: land prep & stock, inputs/feed per season, tools & water, transport, contingency (≥10%).',
          'The assistant\'s agribusiness topic explains break-even: cost per hectare/animal vs expected price — never borrow before you know break-even.',
        ],
  });
  sections.push({
    h: '5 · Stepwise action plan (edit into your calendar)',
    lines: [
      'Step 1 — This month: confirm land & water rights; open a separate farm bank account; start a records notebook.',
      'Step 2 — Month 1: visit buyers & funders listed below; get 3 quotes for every input; join/start a producer group if possible.',
      'Step 3 — Month 1–2: complete soil/water test where relevant; prepare land; order certified seed/stock.',
      'Step 4 — Season start: plant/stock following the stage checklist the assistant gives for your enterprise; photograph & record every batch.',
      'Step 5 — Monthly: update the income/expense/activity records; compare actual vs plan; ask the assistant anything.',
      'Step 6 — At first sale: grade, weigh, record the real price; reinvest before expanding.',
    ],
  });
  sections.push({
    h: '6 · Funding routes to approach',
    lines: FUNDING_ROUTES.map((f, i) => `${i + 1}. ${f}.`).concat([
      'Before applying: one-page summary of this plan + records + break-even numbers. Grants/loans favour documented starters.',
    ]),
  });
  sections.push({
    h: '7 · Risk & honesty check',
    lines: [
      'This is a decision-support DRAFT built from your answers — not a guarantee of profit and not financial/legal advice.',
      'Biggest risks to address: market access (section 3), drought/water (section 2), price falls (section 4 break-even), and health/quality failures (master the knowledge topics).',
      'Start small and prove the system before scaling — one well-run unit beats five neglected ones.',
      'For a bankable version: run the enterprise for 1 season on records, then update this plan with REAL numbers, or use the paid human review service where offered.',
    ],
  });
  return { enterprise: ent, sections, name, location };
}

function savePlan(sessionId, input, plan) {
  const rec = {
    id: crypto.randomUUID(),
    sessionId: String(sessionId || 'anon').slice(0, 80),
    name: clean(input.name, 60),
    enterprise: plan.enterprise ? plan.enterprise.key : 'mixed',
    location: clean(input.location, 80),
    budget: num(input.budget),
    at: Date.now(),
  };
  store.bizplans.push(rec);
  store._scheduleFlush();
  store.bump('bizplans.generated');
  return rec;
}

module.exports = { ENTERPRISE_OPTIONS, FUNDING_ROUTES, buildPlan, savePlan };

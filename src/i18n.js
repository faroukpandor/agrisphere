'use strict';

/**
 * i18n v1 — Setswana detection + starter phrase pack (R3).
 * v1 scope: detect Setswana input, route to matching topics, answer with a
 * Setswana wrapper + English core (full translation is a staged roadmap).
 */

const TN_MARKERS = [
  'dumela', 'ke a leboga', 'aowa', 'ee', 'tsamaya sentle', 'tsamaya',
  'mabele', 'dinawa', 'manoko', 'merogo', 'dikgomo', 'poho', 'podi', 'dipodi',
  'dinku', 'dikoko', 'temothuo', 'lebaro', 'pula', 'noka', 'letsatsi',
  'kgomo', 'namane', 'bupi', 'mmidi', 'mabele a ', 'tlhago', 'botlhole',
  'go lema', 'tlhokomelo', 'kumo', 'bogadi', 'lefatshe', 'seloko', 'seboko',
];

// Markers 4 characters or shorter must appear as standalone words, else
// English words ("sheep", "pula" is rare in EN but "ee" inside "sheep")
// would false-positive the language detector.
const SHORT_TN = TN_MARKERS.filter((m) => m.length <= 4);
const LONG_TN = TN_MARKERS.filter((m) => m.length > 4);

function detectLang(text) {
  const t = ' ' + String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ') + ' ';
  let hits = 0;
  for (const m of LONG_TN) if (t.includes(m)) hits++;
  for (const m of SHORT_TN) {
    if (t.includes(' ' + m + ' ')) hits++;
  }
  return hits >= 1 ? 'tn' : 'en';
}

// Setswana noun -> knowledge topic key mapping (starter set)
const TN_TOPICS = {
  mabele: 'crop-sorghum',
  mmidi: 'crop-maize',
  dinawa: 'crop-cowpea',
  manoko: 'crop-groundnut',
  merogo: 'crop-leafyveg',
  ditamati: 'crop-tomato',
  dikgomo: 'livestock-basics',
  poho: 'livestock-basics',
  kgomo: 'livestock-basics',
  podi: 'prod-smallstock',
  dipodi: 'prod-smallstock',
  dinku: 'prod-smallstock',
  dikoko: 'prod-poultry',
  ditlhapi: 'prod-aquaculture',
  dinotshe: 'prod-beekeeping',
  noka: 'nrm-water',
  pula: 'nrm-climate',
  lefatshe: 'nrm-soil',
  kumo: 'livestock-basics',
};

function tnTopic(text) {
  const t = String(text || '').toLowerCase();
  for (const [w, id] of Object.entries(TN_TOPICS)) {
    if (t.includes(w)) return id;
  }
  return null;
}

const PHRASES = {
  tn: {
    greeting: (name) => `Dumela${name ? ', ' + name : ''}! Ke AgriSphere — mothusi wa gago wa temothuo. 🌱`,
    welcome: 'Ke thusa ka mmidi, mabele, merogo, dikgomo, ditlhapi, ditlhopho tsa theko le go rekisa.',
    wrapper: '⏳ Puo ya Setswana e santse e tlhabololwa — karabo e e fa fa tlase e buiwa ka Setswana go le gonnye le Seperetsi/Sekgoa. (Setswana mode v1)',
    yes: 'Ee',
    no: 'Aowa',
    thanks: 'Ke a leboga!',
  },
};

function phrase(lang, key, vars) {
  const p = PHRASES[lang] && PHRASES[lang][key];
  return typeof p === 'function' ? p(vars) : (p || '');
}

module.exports = { detectLang, tnTopic, phrase, TN_TOPICS };

'use strict';

/**
 * Insights (R13) — anonymised, aggregate-only intelligence for org partners.
 * Strict rules:
 *   - No raw user text, no names, no phones, no individual ids.
 *   - Numbers are counts/ratios only; "demand terms" are single keywords with
 *     counts aggregated across the whole user base (no sentences).
 *   - Admin/moderation endpoints that expose raw queue text are separate and
 *     ADMIN_TOKEN-protected (src/insights is never given them).
 */

const store = require('./store');

const STOP = new Set([
  'a','an','the','i','me','my','we','you','your','have','has','is','are','was',
  'do','does','did','can','could','should','will','would','what','which','where',
  'when','why','how','about','for','to','of','in','on','at','it','its','with',
  'and','or','but','please','tell','want','need','help','there','know','ask',
  'give','advice','some','any','this','that','from','am','be','been','not','just',
  'too','very','really','so','if','then','than','also','pls','plz','hey','into',
  'onto','near','around','through','start','stop','begin','more','farm','farms',
  'farming','farmer','farmers','crop','crops','grow','grows','growing','plant',
  'plants','planting','raise','rearing','whats','dont','im','ill','ive','get',
  'got','make','use','using','new','one','two','way','ways','best','good','well',
]);

function statPrefix(prefix) {
  const out = {};
  for (const [k, v] of Object.entries(store.stats || {})) {
    if (k.startsWith(prefix) && typeof v === 'number') out[k.slice(prefix.length) || 'total'] = v;
  }
  return out;
}

function demandTerms(limit = 12) {
  const freq = {};
  for (const u of store.unanswered || []) {
    const words = String(u.text || '').toLowerCase()
      .replace(/[^\p{L}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w));
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

function publicInsights() {
  const listings = store.listings || [];
  const programs = store.programs || [];
  const experiences = store.experiences || [];
  const ratings = store.ratings || [];
  const byCat = {};
  for (const l of listings) byCat[l.category] = (byCat[l.category] || 0) + 1;
  const progFunnel = {};
  for (const p of programs) progFunnel[p.status || 'open'] = (progFunnel[p.status || 'open'] || 0) + 1;
  const ratingByTarget = {};
  for (const r of ratings) {
    ratingByTarget[r.targetType] = ratingByTarget[r.targetType] || { count: 0, sum: 0 };
    ratingByTarget[r.targetType].count += 1;
    ratingByTarget[r.targetType].sum += r.score;
  }
  for (const [k, v] of Object.entries(ratingByTarget)) {
    ratingByTarget[k] = { count: v.count, avg: Math.round((v.sum / v.count) * 10) / 10 };
  }
  const lastRefDate = (store.priceRefs || []).length
    ? store.priceRefs.map((r) => r.date).sort().pop()
    : null;

  return {
    generatedAt: new Date().toISOString(),
    note: 'Anonymised aggregates only — no raw text, names or ids. Opt-outs honoured globally.',
    traffic: {
      totalMessages: store.stats['msgs.total'] || 0,
      byChannel: statPrefix('msgs.'),
      setswanaMessages: store.stats['tn.msgs'] || 0,
      channelOptOuts: statPrefix('optouts.'),
    },
    knowledge: {
      topics: require('./knowledge').entries.length + require('./topics-d').entries.length,
      learnedLessons: store.listLearned().length,
      unansweredTotal: store.unanswered.length,
      answersByCategory: statPrefix('answers.kb.'),
      triggerAnswers: statPrefix('answers.trigger.'),
      demandTerms: demandTerms(),
    },
    marketplace: {
      total: listings.length,
      byCategory: byCat,
      flagged: listings.filter((l) => l.flags > 0).length,
    },
    programmes: {
      total: programs.length,
      byStatus: progFunnel,
      applications: (programs || []).reduce((a, p) => a + (p.applications || []).length, 0),
      deliveries: (programs || []).reduce((a, p) => a + (p.deliveries || []).length, 0),
      openDisputes: (programs || []).reduce((a, p) => a + (p.disputes || []).filter((d) => d.status === 'open').length, 0),
      settled: programs.filter((p) => p.status === 'settled').length,
    },
    tourism: { total: experiences.length, flagged: experiences.filter((e) => e.flags > 0).length },
    trust: { ratingsByTarget: ratingByTarget, orgsRegistered: store.orgs.length },
    prices: { references: (store.priceRefs || []).length, latestBulletinDate: lastRefDate },
  };
}

/** Admin-only moderation bundle (raw text visible only here, behind guard). */
function moderationBundle() {
  return {
    flaggedListings: (store.listings || []).filter((l) => l.flags > 0).map((l) => ({
      id: l.id, title: l.title, category: l.category, flags: l.flags, ownerId: l.ownerId,
      createdAt: l.createdAt,
    })),
    flaggedExperiences: (store.experiences || []).filter((e) => e.flags > 0).map((e) => ({
      id: e.id, partner: e.partner, title: e.title, flags: e.flags, ownerId: e.ownerId,
    })),
    flaggedProgrammes: (store.programs || []).filter((p) => p.flags > 0).map((p) => ({
      id: p.id, title: p.title, product: p.product, flags: p.flags, ownerId: p.ownerId,
    })),
    unanswered: store.unanswered.slice(-40).reverse(),
    photoQuestions: (store.photoQuestions || []).slice(-20).reverse(),
    feedback: store.feedback.slice(-40).reverse(),
    feedbackStats: {
      good: (store.feedback || []).filter((f) => f.good).length,
      bad: (store.feedback || []).filter((f) => !f.good).length,
    },
    photos: { total: store.stats['photos.total'] || 0, unanswered: (store.photoQuestions || []).filter((p) => !p.answered).length },
  };
}

module.exports = { publicInsights, moderationBundle };

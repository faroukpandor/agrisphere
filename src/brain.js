'use strict';

/**
 * AgriSphere brain: retrieval engine + self-learning memory.
 *
 * Pipeline for an incoming message:
 *   1. Normalize text.
 *   2. "teach:" pattern -> learn permanently (highest priority store).
 *   3. Trigger intents (greeting, help, ...) matched by key phrases.
 *   4. Knowledge-base scoring: keyword overlap + bigram overlap + phrase
 *      containment, with category boosts (disease symptoms, crop names).
 *   5. Fallback: log to the "unanswered" learning queue; if LLM mode is
 *      enabled, draft a grounded answer from the closest KB entries.
 */

const KB = require('./knowledge');
const store = require('./store');
const config = require('./config');
const llm = require('./llm');

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s) {
  return norm(s).split(' ').filter(Boolean);
}

function bigrams(s) {
  const t = tokens(s);
  const out = [];
  for (let i = 0; i < t.length - 1; i++) out.push(`${t[i]} ${t[i + 1]}`);
  return out;
}

// A few common "noise" words that shouldn't drive matching.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'i', 'me', 'my', 'we', 'you', 'your', 'have', 'has', 'is',
  'are', 'was', 'do', 'does', 'did', 'can', 'could', 'should', 'will', 'would',
  'what', 'which', 'where', 'when', 'why', 'how', 'about', 'for', 'to', 'of',
  'in', 'on', 'at', 'it', 'its', 'with', 'and', 'or', 'but', 'please', 'tell',
  'want', 'need', 'help', 'there', 'know', 'ask', 'give', 'advice', 'some',
  'any', 'this', 'that', 'from', 'am', 'be', 'been', 'not', 'just', 'too',
  'very', 'really', 'so', 'if', 'then', 'than', 'also', 'pls', 'plz', 'hey',
  // filler words
  'into', 'onto', 'near', 'around', 'through', 'start', 'stop', 'begin', 'more',
  // domain-generic words (they appear in almost every topic and add noise;
  // the specific noun/symptom carries the meaning)
  'farm', 'farms', 'farming', 'farmer', 'farmers', 'crop', 'crops', 'grow',
  'grows', 'growing', 'plant', 'plants', 'planting', 'raise', 'rearing',
]);

function sigWords(s) {
  return tokens(s).filter((w) => !STOPWORDS.has(w));
}

function overlap(a, b) {
  const seen = new Set(a);
  return b.filter((w) => seen.has(w)).length;
}

// Light morphological similarity: "gullies"~"gully", "tomatoes"~"tomato",
// "planting"~"plant". Deliberately strict for short words to avoid nonsense
// matches ("cake"~"calendar" must never happen).
function similar(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const m = Math.min(a.length, b.length);
  if (m < 4) return false;
  // shared prefix must cover all but the last char of the shorter word,
  // and at least 3 characters (guards tiny-word false positives)
  let i = 0;
  while (i < m && a[i] === b[i]) i++;
  return i >= Math.max(3, m - 1);
}

// ---------------------------------------------------------------------------
// Intent triggers — conservative by design so real questions reach the
// knowledge base. Rules:
//   1. exact equality (a tapped button, e.g. "Crop doctor");
//   2. "cmd" style: text starts with "/" + key (Telegram "/start");
//   3. text starts with a multi-word key followed by at most two more words;
//   4. 3+ word keys may appear anywhere in the sentence;
//   5. greetings/thanks may lead the sentence (chatty openers).
// ---------------------------------------------------------------------------
// Single-word keys that still make sense at the end of a question.
const TAIL_COMMAND_KEYS = new Set(['compliance', 'compliant', 'ethics', 'ethical', 'privacy', 'terms']);

function matchTrigger(text) {
  const t = norm(text);
  if (!t) return null;
  const tw = t.split(' ').length;

  for (const tr of KB.triggers) {
    for (const k of tr.keys) {
      const key = norm(k);
      if (!key) continue;
      const kw = key.split(' ').length;

      if (t === key) return tr;                                  // 1
      if (t.startsWith('/' + key)) return tr;                    // 2
      if (t.startsWith(key + ' ')) {                             // 3
        if (kw >= 2 && tw - kw <= 2) return tr;
      }
      if (kw >= 3 && (t.includes(' ' + key + ' ') || t.endsWith(' ' + key))) return tr; // 4
      // command-like single words may appear at the end of the sentence
      if (kw === 1 && TAIL_COMMAND_KEYS.has(key) && t.endsWith(' ' + key)) return tr;
      // 5: chatty openers (greeting / thanks) may head the sentence
      if ((tr.id === 'greet' || tr.id === 'thanks' || tr.id === 'bye') && t.startsWith(key + ' ')) {
        return tr;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Knowledge scoring
// ---------------------------------------------------------------------------
const SYMPTOM_WORDS = new Set([
  'yellow', 'yellowing', 'brown', 'spots', 'spot', 'holes', 'hole', 'wilting',
  'wilt', 'rot', 'rotting', 'rotten', 'mould', 'mold', 'mildew', 'blight',
  'streak', 'stripes', 'stunted', 'dead', 'die', 'dying', 'curling', 'curled',
  'tunnels', 'mines', 'frass', 'sawdust', 'sick', 'disease', 'virus', 'fungus',
  'fungal', 'lesions', 'canker', 'cracked', 'browning', 'black', 'white',
  'powdery', 'rust', 'galls', 'swollen', 'tissue', 'leaves', 'leaf',
]);

const LIVESTOCK_WORDS = new Set([
  'cattle', 'goat', 'goats', 'sheep', 'chicken', 'chickens', 'poultry',
  'livestock', 'cow', 'cows', 'calf', 'calves', 'beef', 'milk', 'dairy',
  'veterinary', 'vet', 'dip', 'vaccination', 'vaccine', 'newcastle',
  'anthrax', 'foot', 'mouth', 'fmd', 'pig', 'pigs', 'piggery', 'swine',
]);

function scoreEntry(entry, sig, bigr) {
  const kw = sigWords(entry.keywords.join(' '));
  const qs = entry.questions.join(' ');
  const qBigr = bigrams(qs);

  let base = 0;
  let matched = 0;
  const matchedKws = new Set();
  for (const w of sig) {
    for (const k of kw) {
      const hits = k.includes(w) || w.includes(k) || similar(k, w);
      if (hits && !matchedKws.has(k)) { matchedKws.add(k); matched++; }
    }
  }
  base += 1.5 * (matched / Math.max(3, kw.length));

  const contained = sig.filter((w) => kw.some((k) => k === w || similar(k, w)));
  base += 1.0 * (contained.length / Math.max(1, sig.length));

  // bigram match with light plural-awareness: "dairy cows" ~ "dairy cow"
  const bigrHit = bigr.filter((b) => {
    const [w1, w2] = b.split(' ');
    return qBigr.some((q) => {
      const [q1, q2] = q.split(' ');
      return (q1 === w1 || similar(q1, w1)) && (q2 === w2 || similar(q2, w2));
    });
  }).length;
  base += 0.7 * (bigrHit / Math.max(2, bigr.length));

  // category boosts
  if (entry.category === 'disease' || entry.category === 'pest') {
    const sym = sig.filter((w) => SYMPTOM_WORDS.has(w)).length;
    if (sym > 0) base += 0.35 * Math.min(sym, 3);
  }
  if (entry.category === 'livestock' || entry.category === 'production') {
    const live = sig.filter((w) => LIVESTOCK_WORDS.has(w)).length;
    if (live > 0) base += 0.4 * Math.min(live, 3);
  }

  return { entry, score: base, matched, wordHits: contained };
}

// ---------------------------------------------------------------------------
// Main brain
// ---------------------------------------------------------------------------
function buildContext(channel, userId, userName) {
  return {
    channel,
    userId: userId || 'anon',
    userName: (userName || '').trim() || null,
    botName: config.BOT_NAME,
  };
}

function stripTeachDirective(text) {
  // "teach: question → answer"  (accepts ->, =>, or just teach: q : a)
  const m = String(text || '').match(/^\s*(?:teach|learn)\s*[:\-]\s*([^→=>]+)\s*(?:→|=>|->|=|:)\s*(.+)$/is);
  if (!m) return null;
  const q = m[1].trim().replace(/[.!?]+$/, '');
  const a = m[2].trim();
  if (!q || !a || a.length < 2) return null;
  return { q, a };
}

function extractUserText(raw) {
  // Remove common button-payload wrappers from channels, e.g. {"payload":"x"}
  if (!raw) return '';
  if (typeof raw === 'string' && raw.startsWith('{') && raw.includes('"payload"')) {
    try {
      const o = JSON.parse(raw);
      if (o.payload) return String(o.payload);
    } catch (_) { /* keep raw */ }
  }
  return String(raw);
}

/**
 * processMessage — the one entry point every channel uses.
 * Returns { text, buttons, meta: {engine, entryId, topic, confident} }
 */
async function processMessage(rawText, ctx, session) {
  const text = extractUserText(rawText);
  const normText = norm(text);
  const t = tokens(text);

  store.bump(`msgs.${ctx.channel}`);
  store.bump('msgs.total');

  if (!normText) {
    return {
      text: 'I did not catch that — please type a question or tap an option. Try "help" to see what I can do. 🌱',
      buttons: simpleButtons(['Help']),
      meta: { engine: 'local', entryId: null, confident: false },
    };
  }

  const profanityCheck = /(fuck|shit|bitch|cunt|stupid)/i.test(text);
  if (profanityCheck) {
    return {
      text: 'Let us keep it respectful please — I am here to help you farm, not to fight. 😅 Ask me about crops, pests or prices!',
      buttons: simpleButtons(['🌽 Crops', '🩺 Crop doctor']),
      meta: { engine: 'local', entryId: 'polite', confident: true },
    };
  }

  // 1) TEACH directive — permanent self-learning
  const lesson = stripTeachDirective(text);
  if (lesson) {
    store.addLearned(lesson.q, lesson.a, ctx.userName || ctx.userId || 'user');
    store.bump('learned.total');
    return {
      text: `✅ Taught! I now know:\n\nQ: ${lesson.q}\nA: ${lesson.a}\n\nI will answer that for every farmer who asks. Thank you for making me smarter 🧠🌱`,
      buttons: simpleButtons(['🧠 What else do you know?', 'Help']),
      meta: { engine: 'teach', entryId: 'teach', confident: true },
    };
  }

  // 2) Learned Q&A — exact-normalized match (user-taught beats everything)
  const learnedHits = store.findLearned(normText);
  if (learnedHits.length) {
    const hit = learnedHits[0];
    store.bump('answers.learned');
    return {
      text: `${hit.answer}\n\n— 🧠 from a lesson taught ${timeAgo(hit.at)}`,
      buttons: simpleButtons(['👍', '👎']),
      meta: { engine: 'learned', entryId: 'learned:' + hit.question, confident: true },
    };
  }

  // 3) Triggers
  const trig = matchTrigger(text);
  if (trig) {
    store.bump(`answers.trigger.${trig.id}`);
    const answer = typeof trig.answer === 'function' ? trig.answer(ctx) : trig.answer;
    return {
      text: answer,
      buttons: trig.buttons || simpleButtons(['Help']),
      meta: { engine: 'local', entryId: trig.id, confident: true },
    };
  }

  // 4) Knowledge base scoring
  const sig = sigWords(text);
  const bigr = bigrams(text);
  let best = null;
  if (sig.length > 0) {
    for (const entry of KB.entries) {
      const r = scoreEntry(entry, sig, bigr, new Set(sig));
      if (!best || r.score > best.score) best = r;
    }
  }

  const threshold = config.MATCH_THRESHOLD;
  if (best && best.score >= threshold && best.matched >= 1) {
    store.bump(`answers.kb.${best.entry.category}`);
    const entry = KB.entries.find((e) => e.id === best.entry.id);
    const answer = typeof entry.answer === 'function' ? entry.answer(ctx) : entry.answer;
    return {
      text: answer,
      buttons: entry.buttons || simpleButtons(['Help']),
      meta: {
        engine: 'local',
        entryId: entry.id,
        category: entry.category,
        confident: true,
        score: Math.round(best.score * 100) / 100,
      },
    };
  }

  // 5) Fallback — learning queue + optional grounded LLM draft
  store.addUnanswered(text, ctx.userId, ctx.channel);
  store.bump('unanswered.total');

  const learnedCount = store.listLearned().length;
  let fallbackText =
    '🤔 Good question — I do not have a confident answer yet, so I have added it to my learning queue for an agronomist to answer.\n\n' +
    'Meanwhile, try:\n' +
    '• Rephrase with a crop name + symptom, e.g. "maize yellow leaves" or "tomato holes"\n' +
    '• Ask for "help" to browse topics\n' +
    '• Teach me yourself! Type: teach: <question> → <answer>\n' +
    `\n📚 I currently know ${KB.entries.length} topics + ${learnedCount} lessons taught by farmers like you.`;

  let llmText = null;
  if (config.ENABLE_LLM) {
    try {
      llmText = await llm.groundedAnswer(text, ctx, session);
    } catch (err) {
      store.bump('llm.errors');
      console.error('[llm] error:', err.message);
    }
  }

  return {
    text: llmText
      ? `${llmText}\n\n— 🤖 draft from LLM mode (please verify; my queue also recorded this question).`
      : fallbackText,
    buttons: llmText ? simpleButtons(['👍', '👎']) : simpleButtons(['🧠 Teach me', 'Help']),
    meta: { engine: llmText ? 'llm' : 'fallback', entryId: null, confident: false },
  };
}

function simpleButtons(labels) {
  return labels.map((label) => ({ label }));
}

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

module.exports = { processMessage, buildContext, norm };

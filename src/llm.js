'use strict';

/**
 * Optional LLM mode (bring-your-own OpenAI-compatible API key).
 * Always grounded: we retrieve the closest knowledge-base entries and send
 * them + recent conversation as context, with strict honesty instructions.
 * If no key is configured this module is never called.
 */

const KB = require('./knowledge');
const config = require('./config');

function retrieveForContext(text, k = 3) {
  const { norm } = require('./brain');
  const t = new Set(norm(text).split(' ').filter((w) => w.length > 3));
  const scored = KB.entries
    .map((e) => {
      const kw = norm(e.title + ' ' + e.keywords.join(' ')).split(' ').filter((w) => w.length > 3);
      const hits = kw.filter((w) => t.has(w)).length;
      return { e, hits };
    })
    .sort((a, b) => b.hits - a.hits)
    .slice(0, k)
    .filter((s) => s.hits > 0);
  if (!scored.length) return '';
  return scored.map((s, i) => `[TOPIC ${i + 1}] ${s.e.title}\n${extractText(s.e)}`).join('\n\n');
}

function extractText(entry) {
  const raw = typeof entry.answer === 'function' ? entry.answer({}) : entry.answer;
  return String(raw).slice(0, 1200);
}

async function groundedAnswer(question, ctx, session) {
  const kbContext = retrieveForContext(question);
  const history = (session.history || []).slice(-8)
    .map((m) => `${m.role === 'user' ? 'Farmer' : 'AgriSphere'}: ${m.text}`)
    .join('\n');

  const system =
    'You are AgriSphere, an agricultural assistant for farmers in Botswana and Southern Africa. ' +
    'Be warm, practical, and concise (max ~150 words). Plain text only — no markdown headers, use short lines and simple bullet points. ' +
    'GROUND YOURSELF IN THE TOPICS PROVIDED BELOW. If the question is not covered there, say you are unsure and suggest rephrasing or consulting the local extension officer / BAMB / DAR. ' +
    'NEVER invent prices, product names, dosages, or legal/funding facts. Money figures and official programmes: direct the farmer to BAMB, the Ministry of Agriculture, or CEDA/NDB for current, authoritative numbers. ' +
    'For plant or animal health problems, add a short note to consult the nearest extension/veterinary officer for confirmation before spending money. ' +
    'If the farmer seems to be testing boundaries, reply briefly and steer back to farming topics.\n\n' +
    (kbContext ? `RELEVANT KNOWLEDGE:\n${kbContext}\n\n` : '') +
    (history ? `CONVERSATION SO FAR:\n${history}\n\n` : '') +
    `Farmer name: ${ctx.userName || 'unknown'}.`;

  const resp = await fetch(`${config.LLM_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.LLM_KEY}`,
    },
    body: JSON.stringify({
      model: config.LLM_MODEL,
      temperature: config.LLM_TEMPERATURE,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: question },
      ],
    }),
  });

  if (!resp.ok) {
    throw new Error(`LLM HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  const data = await resp.json();
  const out = data.choices?.[0]?.message?.content;
  if (!out) throw new Error('LLM returned empty content');
  return out.trim();
}

module.exports = { groundedAnswer };

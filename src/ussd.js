'use strict';

/**
 * USSD engine (R2) — a session-based menu tree compatible with standard USSD
 * gateways (Africa's Talking-style request: sessionId, phoneNumber, text).
 * Gives every-phone access: Ask a question, latest prices, programmes,
 * marketplace, teach, help. Replies are CON (continuation) or END.
 *
 * The same handler can be mounted behind SMS/USSD aggregators or a web demo.
 */

const store = require('./store');
const prices = require('./prices');
const brain = require('./brain');
const config = require('./config');

const pending = new Map(); // sessionId -> {step, question, state}
const LIMIT = 158; // keep USSD payloads short

function cut(s, n = LIMIT) { return String(s || '').slice(0, n); }

async function handle({ sessionId, phoneNumber, text }) {
  const sid = String(sessionId || 'default');
  const phone = String(phoneNumber || 'anon');
  const entry = String(text || '').trim();
  const state = pending.get(sid);

  // ---- main menu ----
  if (!entry || entry === '*' || entry === '0' || (entry === '00' && state && state.step === 'root')) {
    pending.set(sid, { step: 'root', phone });
    return {
      reply: 'AgriSphere 🌱\n1 Ask a question\n2 Latest prices\n3 Buyer programmes\n4 Marketplace\n5 Teach me\n6 Help',
      end: false,
    };
  }

  // ---- free question flow ----
  if (state && state.step === 'ask' && entry !== '#') {
    pending.delete(sid);
    const result = await brain.processMessage(entry, { channel: 'ussd', userId: phone, userName: '' }, store.getSession(phone));
    return { reply: cut(result.text), end: true };
  }
  if (entry === '1') {
    pending.set(sid, { step: 'ask', phone });
    return { reply: 'Type your question, e.g. maize yellow leaves? (reply # to cancel)', end: false };
  }

  // ---- prices ----
  if (entry === '2' || (state && state.step === 'prices')) {
    pending.delete(sid);
    const refs = prices.latestByItem();
    if (!refs.length) {
      return { reply: 'No bulletin prices loaded yet. Check BAMB website or your extension officer for official prices. (Admins can load bulletins.)', end: true };
    }
    const lines = refs.slice(0, 5).map((r) => `${r.item} (${r.unit || ''}): ${r.price} [${r.source}, ${r.date}]`);
    return { reply: cut('Latest official refs:\n' + lines.join('\n') + '\nAlways verify — prices move.'), end: true };
  }

  // ---- programmes ----
  if (entry === '3' || (state && state.step === 'prog')) {
    pending.set(sid, { step: 'prog', phone });
    const progs = store.programs.filter((p) => p.status === 'open' || !p.status).slice(0, 6);
    if (!progs.length) return { reply: 'No open buyer programmes right now.', end: true };
    const lines = progs.map((p, i) => `${i + 1}. ${p.product} — ${p.orgName}`).join('\n');
    return { reply: cut('Open programmes:\n' + lines + '\nReply P1-P6 for details or 0 for menu'), end: false };
  }
  if (state && state.step === 'progdetail') {
    pending.delete(sid);
    const m = /^P?(\d)$/i.exec(entry);
    if (!m) return { reply: 'Menu', end: false };
    const progs = store.programs.filter((p) => p.status === 'open' || !p.status);
    const p = progs[Number(m[1]) - 1];
    if (!p) return { reply: 'Not found.', end: true };
    return {
      reply: cut(`${p.orgName}: ${p.product} ${p.volume || ''}. Price: ${p.priceFormula || 'ask buyer'}. Areas: ${p.locations || '—'}. Contact ${p.contact}`),
      end: true,
    };
  }

  // ---- marketplace ----
  if (entry === '4') {
    const byCat = {};
    for (const l of store.listings) byCat[l.category] = (byCat[l.category] || 0) + 1;
    const summary = Object.entries(byCat).map(([c, n]) => `${c}: ${n}`).join(', ');
    return { reply: cut(`Marketplace listings: ${summary || 'none yet'}. Full board + posting: web app (marketplace page) or WhatsApp.`), end: true };
  }

  // ---- teach ----
  if (entry === '5') {
    pending.set(sid, { step: 'ask', phone });
    return {
      reply: 'Teach me: reply as teach: question -> answer (one line, max 150 chars). # cancels.',
      end: false,
      teachHint: true,
    };
  }

  // ---- help ----
  if (entry === '6') {
    return {
      reply: cut('AgriSphere: free agri assistant. 1 Ask · 2 Prices · 3 Programmes · 4 Market · 5 Teach · 6 Help. Also on web, WhatsApp, Messenger, Telegram. Not emergency service: call 997/998/999.'),
      end: true,
    };
  }

  // ---- catch-all: treat as question (menus are forgiving) ----
  const result = await brain.processMessage(entry, { channel: 'ussd', userId: phone, userName: '' }, store.getSession(phone));
  pending.delete(sid);
  return { reply: cut(result.text), end: true };
}

module.exports = { handle, pending };

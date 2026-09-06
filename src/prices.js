'use strict';

/**
 * Price transparency references (R8) — honesty by design:
 * entries are added ONLY by admins from official/public bulletins
 * (BAMB depot bulletins, BMC schedules, market reports) and always carry
 * item, unit, price, source, area and date. The bot never invents prices.
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');

function addReference({ item, unit, price, source, area, date, url }) {
  const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
  const it = clean(item, 60);
  const src = clean(source, 120);
  const p = clean(price, 60);
  if (!it || !src || !p) return { error: 'item, price and source are required' };
  const rec = {
    id: crypto.randomUUID(),
    item: it,
    unit: clean(unit, 40),
    price: p,
    source: src,
    area: clean(area, 60) || 'Botswana',
    date: clean(date, 30) || new Date().toISOString().slice(0, 10),
    url: clean(url, 240),
    addedAt: Date.now(),
  };
  store.priceRefs.push(rec);
  store._scheduleFlush();
  store.bump('prices.refs');
  return { ref: rec };
}

function removeReference(id, adminToken) {
  if (config.ADMIN_TOKEN && adminToken !== config.ADMIN_TOKEN) return { error: 'not allowed', code: 403 };
  const idx = store.priceRefs.findIndex((r) => r.id === id);
  if (idx === -1) return { error: 'not found' };
  store.priceRefs.splice(idx, 1);
  store._scheduleFlush();
  return { ok: true };
}

function listReferences({ item, limit } = {}) {
  let out = store.priceRefs.slice();
  if (item) {
    const q = String(item).toLowerCase();
    out = out.filter((r) => r.item.toLowerCase().includes(q));
  }
  const lim = Math.min(Number(limit) || 40, 100);
  return out
    .sort((a, b) => b.date.localeCompare(a.date) || b.addedAt - a.addedAt)
    .slice(0, lim)
    .map((r) => ({ ...r }));
}

function latestByItem() {
  const map = {};
  for (const r of store.priceRefs) {
    const key = r.item.toLowerCase();
    if (!map[key] || r.date > map[key].date) map[key] = r;
  }
  return Object.values(map).sort((a, b) => a.item.localeCompare(b.item));
}

function matchItem(keywords) {
  const kw = String(keywords || '').toLowerCase();
  return listReferences().filter((r) => kw.split(' ').some((w) => w.length > 2 && r.item.toLowerCase().includes(w)));
}

module.exports = { addReference, removeReference, listReferences, latestByItem, matchItem };

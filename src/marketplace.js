'use strict';

/**
 * AgriSphere community marketplace — the stakeholder value engine.
 * A free, moderated-style community board where producers, buyers, input
 * suppliers and service providers find each other. AgriSphere is a
 * noticeboard only: it never handles payments or takes a cut.
 *
 * Governance (see COMPLIANCE.md):
 *   - no counterfeit/spurious listings tolerated (reporting + admin removal)
 *   - honest descriptions, truthful grading, contact visible to both sides
 *   - listings auto-expire after 30 days (kept modest & current)
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');

const CATEGORIES = [
  'produce',    // grain, vegetables, fruit, eggs, milk...
  'livestock',  // cattle, goats, sheep, poultry, pigs, fish...
  'inputs',     // seed, fertiliser, feed, chemicals, tools
  'machinery',  // tractors, pumps, rippers, planters, hire services
  'services',   // spraying, transport, vet, agronomy, processing
  'land',       // fields, grazing, boreholes/water access
  'jobs',       // farm work & labour wanted/offered
  'other',
];

const MAX_LISTINGS_PER_OWNER = 25;
const LISTING_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function sanitize(text, max) {
  return String(text || '')
    .replace(/[^\p{L}\p{N}\s.,;:!?@#+%&()\/'’-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function pruneExpired() {
  const now = Date.now();
  const before = store.listings.length;
  store.listings = store.listings.filter((l) => l.expiresAt > now);
  if (store.listings.length !== before) store._scheduleFlush();
}

function visible(listing) {
  return {
    id: listing.id,
    category: listing.category,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    contact: listing.contact,
    ownerId: listing.ownerId,
    createdAt: listing.createdAt,
    expiresAt: listing.expiresAt,
  };
}

function list({ category, q } = {}) {
  pruneExpired();
  let out = store.listings.slice();
  if (category && CATEGORIES.includes(category)) {
    out = out.filter((l) => l.category === category);
  }
  if (q) {
    const needle = String(q).toLowerCase();
    out = out.filter((l) =>
      (l.title + ' ' + l.description + ' ' + l.location).toLowerCase().includes(needle)
    );
  }
  return out
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(visible);
}

function create({ category, title, description, price, location, contact, ownerId }) {
  pruneExpired();
  const cat = CATEGORIES.includes(category) ? category : 'other';
  const t = sanitize(title, 90);
  if (!t) return { error: 'title is required' };
  const d = sanitize(description, 600);
  const loc = sanitize(location, 80);
  const con = sanitize(contact, 120);
  if (!con) return { error: 'a contact method is required' };
  const owner = String(ownerId || '').slice(0, 80) || crypto.randomUUID();

  const owned = store.listings.filter((l) => l.ownerId === owner).length;
  if (owned >= MAX_LISTINGS_PER_OWNER) {
    return { error: `maximum ${MAX_LISTINGS_PER_OWNER} active listings per account` };
  }

  const listing = {
    id: crypto.randomUUID(),
    category: cat,
    title: t,
    description: d,
    price: sanitize(price, 60),
    location: loc,
    contact: con,
    ownerId: owner,
    createdAt: Date.now(),
    expiresAt: Date.now() + LISTING_TTL_MS,
  };
  store.listings.push(listing);
  store._scheduleFlush();
  store.bump('marketplace.created');
  return { listing: visible(listing) };
}

function remove(id, ownerId, adminToken) {
  pruneExpired();
  const idx = store.listings.findIndex((l) => l.id === id);
  if (idx === -1) return { error: 'listing not found' };
  const listing = store.listings[idx];
  const isAdmin = config.ADMIN_TOKEN && adminToken === config.ADMIN_TOKEN;
  if (!isAdmin && listing.ownerId !== String(ownerId || '')) {
    return { error: 'not allowed', code: 403 };
  }
  store.listings.splice(idx, 1);
  store._scheduleFlush();
  store.bump('marketplace.removed');
  return { ok: true };
}

function report(id) {
  pruneExpired();
  const listing = store.listings.find((l) => l.id === id);
  if (!listing) return { error: 'listing not found' };
  listing.flags = (listing.flags || 0) + 1;
  store._scheduleFlush();
  store.bump('marketplace.flags');
  return { ok: true };
}

function stats() {
  pruneExpired();
  const byCat = {};
  for (const l of store.listings) byCat[l.category] = (byCat[l.category] || 0) + 1;
  return { total: store.listings.length, byCategory: byCat, categories: CATEGORIES };
}

module.exports = { CATEGORIES, list, create, remove, report, stats };

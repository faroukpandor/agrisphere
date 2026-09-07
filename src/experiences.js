'use strict';

/**
 * AgriSphere agri-tourism experiences — partner catalogue.
 *
 * Concept: tourists chat the assistant ("farm stay near Maun this weekend")
 * and are guided to curated experiences offered by participating partners
 * (farm stays, community trusts, lodges, market & harvest tours, birding,
 * craft & tasting experiences). AgriSphere is a lead-generation + listing
 * layer: partners confirm bookings directly; no payments are handled here.
 *
 * Rules (docs/COMPLIANCE.md §9):
 *   - Safety & liability notices on every listing (remote/rural activities).
 *   - Honest descriptions, current prices, verified partner contact.
 *   - Listing agreement governs partner conduct (see docs/templates/).
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');
const ratings = require('./ratings');
const orgs = require('./orgs');

const TYPES = [
  'farm-stay',
  'market-tour',
  'harvest-festival',
  'nature-birding',
  'craft-community',
  'food-tasting',
  'ranch-outdoor',
  'other',
];

const MAX_PER_PARTNER = 30;
const TTL_MS = 180 * 24 * 60 * 60 * 1000; // 6 months

function clean(v, max) {
  return String(v || '')
    .replace(/[^\p{L}\p{N}\s.,;:!?@#+%&()\/'’₹£€-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function prune() {
  const now = Date.now();
  const before = store.experiences.length;
  store.experiences = store.experiences.filter((e) => e.expiresAt > now);
  if (store.experiences.length !== before) store._scheduleFlush();
}

function visible(e) {
  return {
    id: e.id,
    partner: e.partner,
    title: e.title,
    type: e.type,
    location: e.location,
    priceRange: e.priceRange,
    duration: e.duration,
    groupSize: e.groupSize,
    season: e.season,
    description: e.description,
    whatsIncluded: e.whatsIncluded,
    safetyNote: e.safetyNote,
    contact: e.contact,
    ownerId: e.ownerId,
    verified: e.verified || false,
    createdAt: e.createdAt,
    expiresAt: e.expiresAt,
    rating: ratings.aggregateFor('experience', e.id),
  };
}

function listExperiences({ type, location, q } = {}) {
  prune();
  let out = store.experiences.slice();
  if (type && TYPES.includes(type)) out = out.filter((e) => e.type === type);
  if (location) out = out.filter((e) => (e.location || '').toLowerCase().includes(String(location).toLowerCase()));
  if (q) {
    const n = String(q).toLowerCase();
    out = out.filter((e) =>
      (e.title + ' ' + e.description + ' ' + e.partner + ' ' + e.location).toLowerCase().includes(n)
    );
  }
  return out.sort((a, b) => b.createdAt - a.createdAt).map(visible);
}

function createExperience(body) {
  prune();
  const owner = String(body.ownerId || '').slice(0, 80) || crypto.randomUUID();
  const owned = store.experiences.filter((e) => e.ownerId === owner).length;
  if (owned >= MAX_PER_PARTNER) return { error: `maximum ${MAX_PER_PARTNER} listings per partner` };

  const partner = clean(body.partner, 90);
  const title = clean(body.title, 90);
  const location = clean(body.location, 80);
  const contact = clean(body.contact, 120);
  if (!partner || !title || !location || !contact) {
    return { error: 'partner, title, location and contact are required' };
  }

  const experience = {
    id: crypto.randomUUID(),
    ownerId: owner,
    partner,
    title,
    type: TYPES.includes(body.type) ? body.type : 'other',
    location,
    priceRange: clean(body.priceRange, 80),
    duration: clean(body.duration, 80),
    groupSize: clean(body.groupSize, 80),
    season: clean(body.season, 120),
    description: clean(body.description, 700),
    whatsIncluded: clean(body.whatsIncluded, 400),
    safetyNote: clean(body.safetyNote, 300) || 'Standard rural-tourism precautions apply — confirm access, weather and medical provisions with the partner before travelling.',
    contact,
    verified: !!store.getSession(owner).verified || !!orgs.orgOf(owner)?.verified,
    createdAt: Date.now(),
    expiresAt: Date.now() + TTL_MS,
  };
  store.experiences.push(experience);
  store._scheduleFlush();
  store.bump('experiences.created');
  return { experience: visible(experience) };
}

function removeExperience(id, ownerId, adminToken) {
  prune();
  const idx = store.experiences.findIndex((e) => e.id === id);
  if (idx === -1) return { error: 'experience not found' };
  const isAdmin = config.ADMIN_TOKEN && adminToken === config.ADMIN_TOKEN;
  if (!isAdmin && store.experiences[idx].ownerId !== String(ownerId || '')) return { error: 'not allowed', code: 403 };
  store.experiences.splice(idx, 1);
  store._scheduleFlush();
  store.bump('experiences.removed');
  return { ok: true };
}

function reportExperience(id) {
  prune();
  const e = store.experiences.find((x) => x.id === id);
  if (!e) return { error: 'experience not found' };
  e.flags = (e.flags || 0) + 1;
  store._scheduleFlush();
  store.bump('experiences.flags');
  return { ok: true };
}

module.exports = { TYPES, listExperiences, createExperience, removeExperience, reportExperience };

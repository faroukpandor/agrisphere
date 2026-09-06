'use strict';

/**
 * Organisations module (R10+R11): buyers, co-ops, NGOs, extension, insurers,
 * input suppliers & media register for org accounts + API keys, then manage
 * programmes, storefronts and insight access. Org verification happens via
 * the ADMIN_TOKEN (human checks registration documents).
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');

const ORG_TYPES = ['buyer', 'coop', 'ngo', 'extension', 'insurer', 'input', 'media', 'other'];

function clean(v, max) {
  return String(v || '').replace(/[^\p{L}\p{N}\s.,;:!?@#+&()\/'’.-]/gu, '')
    .replace(/\s+/g, ' ').trim().slice(0, max);
}

function register({ name, type, contact, phone, area, description, ownerId, verifiedByAdmin }) {
  const nm = clean(name, 90);
  const ct = clean(contact, 120);
  if (!nm || !ct) return { error: 'name and contact are required' };
  const owner = String(ownerId || '').slice(0, 80) || crypto.randomUUID();
  const typ = ORG_TYPES.includes(type) ? type : 'other';
  const apiKey = crypto.randomBytes(24).toString('hex');
  const org = {
    id: crypto.randomUUID(),
    ownerId: owner,
    name: nm,
    type: typ,
    contact: ct,
    phone: clean(phone, 20),
    area: clean(area, 80),
    description: clean(description, 400),
    verified: verifiedByAdmin === true,
    apiKeyHash: sha256(apiKey),
    createdAt: Date.now(),
  };
  store.orgs.push(org);
  store._scheduleFlush();
  store.bump('orgs.registered');
  return { org: visible(org), apiKey }; // apiKey shown once
}

function visible(o) {
  return {
    id: o.id, ownerId: o.ownerId, name: o.name, type: o.type, contact: o.contact,
    phone: o.phone, area: o.area, description: o.description, verified: !!o.verified,
    createdAt: o.createdAt,
  };
}

function findByOwner(ownerId) {
  return store.orgs.find((o) => o.ownerId === String(ownerId || ''));
}

function verifyApiKey(apiKey, ownerId) {
  const org = store.orgs.find((o) => o.ownerId === String(ownerId || ''));
  if (!org) return null;
  return timingSafeEqual(org.apiKeyHash, sha256(String(apiKey || ''))) ? org : null;
}

function verifyOrg(orgId, adminToken) {
  if (config.ADMIN_TOKEN && adminToken !== config.ADMIN_TOKEN) return { error: 'not allowed', code: 403 };
  const org = store.orgs.find((o) => o.id === orgId);
  if (!org) return { error: 'not found' };
  org.verified = true;
  store._scheduleFlush();
  return { ok: true };
}

function assetsOf(ownerId) {
  const owner = String(ownerId || '');
  return {
    programs: store.programs.filter((p) => p.ownerId === owner).length,
    listings: store.listings.filter((l) => l.ownerId === owner).length,
    experiences: store.experiences.filter((e) => e.ownerId === owner).length,
    bizplans: store.bizplans.filter((b) => b.sessionId === owner).length,
  };
}

function listAll(adminToken) {
  if (config.ADMIN_TOKEN && adminToken !== config.ADMIN_TOKEN) return { error: 'not allowed', code: 403 };
  return store.orgs.map(visible);
}

function sha256(v) {
  return crypto.createHash('sha256').update(String(v)).digest('hex');
}

function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a), 'hex');
  const bb = Buffer.from(String(b), 'hex');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = { ORG_TYPES, register, visible, findByOwner, verifyApiKey, verifyOrg, assetsOf, listAll };

'use strict';

/**
 * Organisations module (R10+R11): buyers, co-ops, NGOs, extension, insurers,
 * input suppliers & media register for org accounts + API keys, then manage
 * programmes, storefronts and insight access. Org verification happens via
 * the ADMIN_TOKEN (human checks registration documents).
 *
 * R10 co-op workspaces v1: an org owner (leader) can add member accounts
 * (consent-first: joining means the leader adds the member's existing web
 * identity). Member assets aggregate into the workspace total for leaders;
 * verified-org listings by members carry the badge automatically.
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
    members: [],
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
    memberCount: (o.members || []).length,
    createdAt: o.createdAt,
  };
}

function findByOwner(ownerId) {
  return store.orgs.find((o) => o.ownerId === String(ownerId || ''));
}

/** Org that owns this account, or lists it as a member (co-op workspace). */
function orgOf(ownerId) {
  const o = String(ownerId || '');
  return store.orgs.find((x) => x.ownerId === o || (x.members || []).some((m) => m.id === o)) || null;
}

function roleIn(org, ownerId) {
  const o = String(ownerId || '');
  if (org && org.ownerId === o) return 'leader';
  if (org && (org.members || []).some((m) => m.id === o)) return 'member';
  return null;
}

function addMember(orgId, requesterId, adminToken, memberId, role) {
  const org = store.orgs.find((x) => x.id === orgId);
  if (!org) return { error: 'organisation not found' };
  const isAdmin = config.ADMIN_TOKEN && adminToken === config.ADMIN_TOKEN;
  if (!isAdmin && org.ownerId !== String(requesterId || '')) return { error: 'not allowed', code: 403 };
  const mid = String(memberId || '').trim().slice(0, 80);
  const rl = role === 'leader' ? 'leader' : 'member';
  if (!mid) return { error: 'member id is required' };
  if (org.ownerId === mid) return { error: 'the leader is already part of the organisation' };
  if ((org.members || []).some((m) => m.id === mid)) return { error: 'already a member' };
  org.members = org.members || [];
  org.members.push({ id: mid, role: rl, at: Date.now() });
  store._scheduleFlush();
  store.bump('orgs.members.added');
  return { ok: true, members: org.members };
}

function removeMember(orgId, requesterId, adminToken, memberId) {
  const org = store.orgs.find((x) => x.id === orgId);
  if (!org) return { error: 'organisation not found' };
  const isAdmin = config.ADMIN_TOKEN && adminToken === config.ADMIN_TOKEN;
  if (!isAdmin && org.ownerId !== String(requesterId || '')) return { error: 'not allowed', code: 403 };
  const before = (org.members || []).length;
  org.members = (org.members || []).filter((m) => m.id !== String(memberId || ''));
  if (org.members.length === before) return { error: 'not a member' };
  store._scheduleFlush();
  store.bump('orgs.members.removed');
  return { ok: true };
}

/** Asset counters for a single account. */
function assetsOf(ownerId) {
  const owner = String(ownerId || '');
  return {
    programs: store.programs.filter((p) => p.ownerId === owner).length,
    listings: store.listings.filter((l) => l.ownerId === owner).length,
    experiences: store.experiences.filter((e) => e.ownerId === owner).length,
    bizplans: store.bizplans.filter((b) => b.sessionId === owner).length,
  };
}

/** Co-op workspace view: org + members + assets aggregated (leader only). */
function workspace(ownerId) {
  const org = orgOf(ownerId);
  if (!org) return { error: 'no organisation for this owner', code: 404 };
  const role = roleIn(org, ownerId);
  const mine = assetsOf(ownerId);
  const isLeader = role === 'leader';
  const memberAssets = isLeader
    ? (org.members || []).map((m) => ({ memberId: m.id, role: m.role, assets: assetsOf(m.id) }))
    : [];
  const total = isLeader
    ? memberAssets.reduce((a, ma) => ({
        programs: a.programs + ma.assets.programs,
        listings: a.listings + ma.assets.listings,
        experiences: a.experiences + ma.assets.experiences,
        bizplans: a.bizplans + ma.assets.bizplans,
      }), { ...mine })
    : mine;
  return {
    org: { ...visible(org), members: org.members || [], yourRole: role },
    role,
    assets: mine,
    workspaceTotal: isLeader ? total : null,
    memberAssets,
  };
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
  store.bump('orgs.verified');
  return { ok: true };
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

module.exports = {
  ORG_TYPES, register, visible, findByOwner, orgOf, roleIn, addMember, removeMember,
  verifyApiKey, verifyOrg, assetsOf, workspace, listAll,
};

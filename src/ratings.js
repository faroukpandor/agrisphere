'use strict';

/**
 * Ratings & reputation (R6). Parties rate each other after marketplace deals,
 * programme deliveries and experiences. One rating per (target, rater) pair;
 * aggregates power badges. AgriSphere never "deletes" honest ratings — only
 * admins may remove abusive ones.
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');

const TARGET_TYPES = ['listing', 'program', 'experience', 'farmer', 'buyer', 'partner', 'org'];

function addRating({ targetType, targetId, byOwnerId, score, comment, role }) {
  if (!TARGET_TYPES.includes(targetType)) return { error: 'unknown targetType' };
  if (!targetId || !byOwnerId) return { error: 'targetId and byOwnerId are required' };
  const sc = Number(score);
  if (!Number.isFinite(sc) || sc < 1 || sc > 5) return { error: 'score must be 1-5' };

  const existing = store.ratings.find(
    (r) => r.targetType === targetType && r.targetId === String(targetId) && r.byOwnerId === String(byOwnerId)
  );
  if (existing) {
    existing.score = sc;
    if (comment) existing.comment = String(comment).slice(0, 500);
    existing.updatedAt = Date.now();
  } else {
    store.ratings.push({
      id: crypto.randomUUID(),
      targetType, targetId: String(targetId), byOwnerId: String(byOwnerId),
      score: sc, comment: String(comment || '').slice(0, 500),
      role: String(role || '').slice(0, 30), at: Date.now(),
    });
  }
  store._scheduleFlush();
  store.bump('ratings.total');
  return { ok: true };
}

function aggregateFor(targetType, targetId) {
  const list = store.ratings.filter((r) => r.targetType === targetType && r.targetId === String(targetId));
  if (!list.length) return null;
  const sum = list.reduce((a, r) => a + r.score, 0);
  return { avg: Math.round((sum / list.length) * 10) / 10, count: list.length };
}

function listFor(targetType, targetId) {
  return store.ratings
    .filter((r) => r.targetType === targetType && r.targetId === String(targetId))
    .sort((a, b) => b.at - a.at);
}

function removeRating(id, adminToken) {
  if (config.ADMIN_TOKEN && adminToken !== config.ADMIN_TOKEN) return { error: 'not allowed', code: 403 };
  const idx = store.ratings.findIndex((r) => r.id === id);
  if (idx === -1) return { error: 'not found' };
  store.ratings.splice(idx, 1);
  store._scheduleFlush();
  return { ok: true };
}

module.exports = { TARGET_TYPES, addRating, aggregateFor, listFor, removeRating };

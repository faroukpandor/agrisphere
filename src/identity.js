'use strict';

/**
 * Identity & verification v1 (R5) — consent-first.
 * - OTP via phone (dev-log or SMS provider when configured).
 * - Verified sessions power "verified" badges on listings, programmes &
 *   applications.
 * - Agent/organisation verification happens through ADMIN_TOKEN endpoints.
 */

const crypto = require('crypto');
const store = require('./store');
const config = require('./config');

function issueOtp(phone) {
  const code = String(crypto.randomInt(100000, 999999));
  const rec = {
    codeHash: sha256(code),
    phone,
    expiresAt: Date.now() + config.OTP_TTL_SECONDS * 1000,
    attempts: 0,
  };
  store.otps[phone] = rec;
  store._scheduleFlush();
  // Delivery: SMS provider when configured, otherwise console (dev log).
  const note = sendOtp(phone, code);
  return { devOtp: config.DEV_OTP ? code : undefined, note };
}

function verifyOtp(phone, code) {
  const rec = store.otps[phone];
  if (!rec) return { ok: false, error: 'no code issued for this number' };
  if (Date.now() > rec.expiresAt) return { ok: false, error: 'code expired' };
  rec.attempts = (rec.attempts || 0) + 1;
  if (rec.attempts > 5) {
    delete store.otps[phone];
    store._scheduleFlush();
    return { ok: false, error: 'too many attempts — request a new code' };
  }
  if (sha256(String(code).trim()) !== rec.codeHash) return { ok: false, error: 'wrong code' };
  delete store.otps[phone];
  store._scheduleFlush();
  return { ok: true };
}

function markVerified(accountId, phone) {
  const session = store.getSession(accountId);
  session.phone = String(phone || '').replace(/[^\d+]/g, '').slice(0, 20);
  session.verified = true;
  session.verifiedAt = Date.now();
  store.saveSession(accountId, session);
  store.bump('identity.verified');
  return true;
}

function isVerified(accountId) {
  const s = store.getSession(accountId);
  return !!(s && s.verified);
}

function profileOf(accountId) {
  const s = store.getSession(accountId);
  return s
    ? { verified: !!s.verified, phone: s.phone || '', name: s.name || '' }
    : { verified: false, phone: '', name: '' };
}

function sha256(v) {
  return crypto.createHash('sha256').update(String(v)).digest('hex');
}

function sendOtp(phone, code) {
  if (config.SMS_PROVIDER_URL) {
    console.log(`[sms] -> ${phone}: AgriSphere code ${code} (expires ${Math.round(config.OTP_TTL_SECONDS / 60)} min)`);
    return 'sms';
  }
  console.log(`[otp:dev] -> ${phone}: code ${code}`);
  return 'dev-log';
}

module.exports = { issueOtp, verifyOtp, markVerified, isVerified, profileOf };

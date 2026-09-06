'use strict';

/**
 * Upload helper (R18) — stores user images under DATA_DIR/uploads and serves
 * them via /uploads (same-origin static). Honest path: photos are for the
 * human review queue and delivery evidence — AgriSphere does NOT claim
 * AI vision; a real diagnosis still needs an extension officer / vet.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

const MAX_BYTES = 2.5 * 1024 * 1024;

function uploadsDir() {
  const dir = path.join(config.DATA_DIR, 'uploads');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  return dir;
}

/** Accepts a data URL ("data:image/png;base64,...") or raw base64. */
function saveImage(dataUrl) {
  const raw = String(dataUrl || '');
  let mime = '';
  let b64 = raw;
  const m = raw.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/s);
  if (m) {
    mime = m[1];
    b64 = m[2];
  } else if (/^[A-Za-z0-9+/=\s]+$/.test(raw) && raw.length > 64) {
    mime = 'image/png'; // treat bare base64 as png (client sends typed data-urls normally)
  } else {
    return { error: 'image must be sent as a data:image/*;base64 URL' };
  }
  let buf;
  try { buf = Buffer.from(b64, 'base64'); } catch (_) { return { error: 'invalid base64' }; }
  if (!buf.length || buf.length > MAX_BYTES) return { error: `image too large — max ${Math.round(MAX_BYTES / 1024 / 1024 * 10) / 10} MB` };
  const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : 'png';
  // magic-byte sanity check (keep it honest — reject text masquerading as image)
  const okMagic =
    (ext === 'jpg' && buf[0] === 0xff && buf[1] === 0xd8) ||
    (ext === 'png' && buf[0] === 0x89 && buf[1] === 0x50) ||
    (ext === 'gif' && buf[0] === 0x47 && buf[1] === 0x49) ||
    (ext === 'webp' && buf.toString('ascii', 0, 4) === 'RIFF');
  if (!okMagic) return { error: 'file is not a valid image' };
  const name = `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}.${ext}`;
  try {
    fs.writeFileSync(path.join(uploadsDir(), name), buf);
  } catch (err) {
    return { error: 'could not store image: ' + err.message };
  }
  return { url: `/uploads/${name}` };
}

module.exports = { saveImage, uploadsDir, MAX_BYTES };

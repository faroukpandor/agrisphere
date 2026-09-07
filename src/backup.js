'use strict';

/**
 * Backup support (audit O-series close-out).
 *
 *  - snapshot(): full JSON dump of every store collection (nothing omitted —
 *    use with care: it contains unredacted account data; protect downloads).
 *  - writeAuto(): periodic on-disk snapshot inside DATA_DIR/backups with
 *    pruning to the newest BACKUP_KEEP. The disk itself (Render Disk in
 *    production) makes the instance durable across restarts; these snapshots
 *    additionally protect against single-file corruption and give the
 *    operator a file to copy off-site.
 *
 * Off-site rule (runbook): a Render disk is NOT an off-site backup. After
 * each deploy or at least weekly, download the snapshot from
 * GET /api/admin/backup to operator storage (or script it with the admin
 * token into your own bucket).
 */

const fs = require('fs');
const path = require('path');
const store = require('./store');
const config = require('./config');

const BACKUP_KEEP = 10;

function snapshot() {
  const out = { app: 'agrisphere', schema: 'backup/v1', takenAt: new Date().toISOString() };
  for (const name of store.COLLECTIONS) out[name] = store[name];
  return out;
}

function writeAuto() {
  const dir = path.join(config.DATA_DIR, 'backups');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) { return { error: 'backup dir unavailable' }; }
  const file = path.join(dir, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(snapshot()));
  } catch (err) {
    console.error('[backup] auto-write failed:', err.message);
    return { error: err.message };
  }
  // prune oldest beyond BACKUP_KEEP
  try {
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
      .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    for (const old of files.slice(BACKUP_KEEP)) {
      fs.unlinkSync(path.join(dir, old.f));
    }
  } catch (_) { /* pruning is best-effort */ }
  store.bump('backups.auto');
  return { file, kept: BACKUP_KEEP };
}

module.exports = { snapshot, writeAuto };

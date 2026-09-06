'use strict';

/**
 * AgriSphere persistence layer (R12) — pluggable backend.
 *
 * Backends:
 *   - "json"  (default): atomic JSON files per collection. Zero dependencies,
 *     free-tier friendly. Writes are atomic (tmp + rename).
 *   - "sqlite": optional node:sqlite key-value table. Falls back to json when
 *     node:sqlite is unavailable or disabled.
 *
 * Collections stored (all JSON-serialisable):
 *   learned, feedback, unanswered, listings, programs, experiences, bizplans,
 *   sessions, stats, otps, ratings, priceRefs, orgs, alerts.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const COLLECTIONS = [
  'learned', 'feedback', 'unanswered', 'listings', 'programs', 'experiences',
  'bizplans', 'sessions', 'stats', 'otps', 'ratings', 'priceRefs', 'orgs', 'alerts',
];

// ---------------------------------------------------------------------------
// SQLite backend (best effort, guarded)
// ---------------------------------------------------------------------------
function makeSqliteBackend(dir) {
  let db = null;
  try {
    // eslint-disable-next-line global-require
    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(path.join(dir, 'agrisphere.db'));
    db.exec('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
  } catch (err) {
    console.warn('[store] sqlite unavailable, falling back to json:', err.message);
    return null;
  }
  return {
    read(name) {
      const row = db.prepare('SELECT v FROM kv WHERE k = ?').get(name);
      return row ? JSON.parse(row.v) : undefined;
    },
    write(name, value) {
      db.prepare(
        'INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v'
      ).run(name, JSON.stringify(value));
    },
    close() { try { db.close(); } catch (_) {} },
  };
}

// ---------------------------------------------------------------------------
// JSON backend
// ---------------------------------------------------------------------------
function makeJsonBackend(dir) {
  return {
    read(name) {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf8'));
      } catch (_) { return undefined; }
    },
    write(name, value) {
      const target = path.join(dir, `${name}.json`);
      const tmp = `${target}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(value));
      fs.renameSync(tmp, target); // atomic on same filesystem
    },
    close() {},
  };
}

class Store {
  constructor(dir = config.DATA_DIR) {
    this.dir = dir;
    this.backendName = config.DATA_BACKEND === 'sqlite' ? 'sqlite' : 'json';
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}

    this.backend = this.backendName === 'sqlite'
      ? (makeSqliteBackend(dir) || makeJsonBackend(dir))
      : makeJsonBackend(dir);

    // Seed missing collections with defaults.
    const defaults = {
      learned: [], feedback: [], unanswered: [], listings: [], programs: [],
      experiences: [], bizplans: [], otps: [], ratings: [], priceRefs: [],
      orgs: [], alerts: [], sessions: {}, stats: {},
    };
    for (const name of COLLECTIONS) {
      if (this.backend.read(name) === undefined) this.backend.write(name, defaults[name] || {});
    }
    for (const name of COLLECTIONS) this[name] = this.backend.read(name);

    this.flushTimer = null;
    this.pending = false;
    const stop = () => { this.flushNow(); this.backend.close(); process.exit(0); };
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
  }

  _scheduleFlush() {
    this.pending = true;
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => { this.flushNow(); }, 300);
  }

  flushNow() {
    if (!this.pending) return;
    this.pending = false;
    clearTimeout(this.flushTimer);
    this.flushTimer = null;
    for (const name of COLLECTIONS) {
      try { this.backend.write(name, this[name]); } catch (err) {
        console.error(`[store] flush ${name} failed:`, err.message);
      }
    }
  }

  // ---- stats -------------------------------------------------------------
  bump(stat, by = 1) {
    this.stats[stat] = (this.stats[stat] || 0) + by;
    this._scheduleFlush();
  }

  // ---- sessions ----------------------------------------------------------
  getSession(id) {
    if (!id) return { id: '', history: [], name: '', phone: '', verified: false, lang: config.DEFAULT_LANG, createdAt: Date.now() };
    if (!this.sessions[id]) {
      this.sessions[id] = { history: [], name: '', phone: '', verified: false, lang: config.DEFAULT_LANG, createdAt: Date.now() };
      this._scheduleFlush();
    }
    return this.sessions[id];
  }

  saveSession(id, session) {
    if (!id) return;
    this.sessions[id] = session;
    this._scheduleFlush();
  }

  // ---- learned -----------------------------------------------------------
  addLearned(q, a, by) {
    this.learned.push({ question: q, answer: a, by: by || 'unknown', at: Date.now(), used: 0 });
    this._scheduleFlush();
  }
  findLearned(normalized) {
    const hits = this.learned.filter((l) => norm(l.question) === normalized);
    for (const h of hits) h.used = (h.used || 0) + 1;
    if (hits.length) this._scheduleFlush();
    return hits;
  }
  listLearned() { return this.learned; }

  // ---- feedback & unanswered ---------------------------------------------
  addFeedback(rec) { this.feedback.push(rec); this._scheduleFlush(); }
  addUnanswered(text, sessionId, channel) {
    this.unanswered.push({
      id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      text, sessionId, channel, answered: false, at: Date.now(),
    });
    this._scheduleFlush();
  }

  // ---- marketplace (listings) extra API ----------------------------------
  addListing(listing) { this.listings.push(listing); this._scheduleFlush(); }
}

function norm(s) {
  return String(s || '').toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = new Store();
module.exports.Store = Store; // expose class for tests

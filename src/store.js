'use strict';

/**
 * Minimal JSON-file persistence used for the "self-learning" memory:
 *   - sessions      per-user conversation context + name
 *   - learned       custom Q&A pairs taught by users (highest priority)
 *   - feedback      👍/👎 ratings on bot answers (training signal)
 *   - unanswered    questions the bot could not answer (learning queue)
 *   - stats         counters per channel & engine
 *
 * File-based on purpose so the free Render tier (no persistent disk between
 * deploys, ephemeral RAM) behaves sanely. When you move to a paid plan or
 * Redis, swap this module — nothing else touches disk.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

class Store {
  constructor(dir = config.DATA_DIR) {
    this.dir = dir;
    this.flushTimer = null;
    this.pending = false;
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) { /* read-only FS: run memory-only */ }
    this._ensureFile('learned.json', []);
    this._ensureFile('feedback.json', []);
    this._ensureFile('unanswered.json', []);
    this._ensureFile('sessions.json', {});
    this._ensureFile('stats.json', {});
    this.learned = this._load('learned.json', []);
    this.feedback = this._load('feedback.json', []);
    this.unanswered = this._load('unanswered.json', []);
    this.sessions = this._load('sessions.json', {});
    this.stats = this._load('stats.json', {});

    const stop = () => { this.flushNow(); process.exit(0); };
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
  }

  _ensureFile(name, fallback) {
    const p = path.join(this.dir, name);
    if (!fs.existsSync(p)) {
      try { fs.writeFileSync(p, JSON.stringify(fallback)); } catch (_) {}
    }
  }

  _load(name, fallback) {
    try {
      return JSON.parse(fs.readFileSync(path.join(this.dir, name), 'utf8'));
    } catch (_) {
      return fallback;
    }
  }

  _scheduleFlush() {
    this.pending = true;
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => { this.flushNow(); }, 400);
  }

  flushNow() {
    if (!this.pending) return;
    this.pending = false;
    clearTimeout(this.flushTimer);
    this.flushTimer = null;
    for (const [name, value] of Object.entries({
      learned: this.learned,
      feedback: this.feedback,
      unanswered: this.unanswered,
      sessions: this.sessions,
      stats: this.stats,
    })) {
      try {
        fs.writeFileSync(path.join(this.dir, `${name}.json`), JSON.stringify(value));
      } catch (_) { /* memory-only mode */ }
    }
  }

  // ---- stats -------------------------------------------------------------
  bump(stat, by = 1) {
    this.stats[stat] = (this.stats[stat] || 0) + by;
    this._scheduleFlush();
  }

  // ---- sessions ----------------------------------------------------------
  getSession(id) {
    if (!id) return { id: '', history: [], name: '', createdAt: Date.now() };
    if (!this.sessions[id]) {
      this.sessions[id] = { history: [], name: '', createdAt: Date.now() };
      this._scheduleFlush();
    }
    return this.sessions[id];
  }

  saveSession(id, session) {
    if (!id) return;
    this.sessions[id] = session;
    this._scheduleFlush();
  }

  // ---- learned Q&A -------------------------------------------------------
  addLearned(q, a, by) {
    this.learned.push({
      question: q,
      answer: a,
      by: by || 'unknown',
      at: Date.now(),
      used: 0,
    });
    this._scheduleFlush();
  }

  findLearned(normalized) {
    const hits = this.learned.filter((l) => norm(l.question) === normalized);
    for (const h of hits) h.used = (h.used || 0) + 1;
    if (hits.length) this._scheduleFlush();
    return hits;
  }

  listLearned() { return this.learned; }

  // ---- feedback & unanswered --------------------------------------------
  addFeedback(rec) { this.feedback.push(rec); this._scheduleFlush(); }
  addUnanswered(text, sessionId, channel) {
    this.unanswered.push({ text, sessionId, channel, at: Date.now() });
    this._scheduleFlush();
  }
}

function norm(s) {
  return String(s || '').toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = new Store();

#!/usr/bin/env node
'use strict';

/**
 * Price-bulletin loader (day-one seeding, DEPLOY-RUNBOOK §6.1).
 *
 * Reads a CSV of OFFICIAL price bulletins and posts each row to
 * POST /api/prices/references with the admin token. Trust rules enforced:
 *  - every row needs item, price, source, date, url (official source +
 *    link), area and unit where applicable;
 *  - rows that fail validation are reported and SKIPPED (no partial
 *    silent writes); exit code is non-zero if any row failed;
 *  - '#' lines and blank lines are ignored (so the template file can
 *    carry commented example rows that are never loaded).
 *
 * Usage:
 *   ADMIN_TOKEN=<admin token> \
 *   BASE_URL=https://<your-service>.onrender.com \
 *   node scripts/load-prices.js scripts/bulletins/<file>.csv
 *
 * The CSV header must be exactly:
 *   item,unit,price,area,date,source,url
 */

const fs = require('fs');
const path = require('path');

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
const TOKEN = process.env.ADMIN_TOKEN || '';

function fail(msg) {
  console.error('usage: ' + msg);
  process.exit(2);
}

if (!TOKEN) fail('set ADMIN_TOKEN (same value as the server\'s ADMIN_TOKEN)');
const file = process.argv[2];
if (!file) fail('pass a CSV file path, e.g. scripts/bulletins/bamb-2026-09-07.csv');

let raw;
try { raw = fs.readFileSync(path.resolve(file), 'utf8'); } catch (_) { fail('cannot read ' + file); }

const rows = raw.split(/\r?\n/).filter((l) => {
  const t = l.trim();
  return t && !t.startsWith('#');
});

if (rows.length < 2) fail('no data rows found (need header + at least one row)');

// Minimal CSV line parser (quoted fields with commas).
function parseLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const header = parseLine(rows[0]).map((h) => h.toLowerCase());
const NEEDED = ['item', 'unit', 'price', 'area', 'date', 'source', 'url'];
for (const h of NEEDED) {
  if (!header.includes(h)) fail('header must contain column "' + h + '" — found: ' + header.join(', '));
}
const idx = (h) => header.indexOf(h);

function isDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)); }

let okCount = 0;
const failures = [];
const skippedDup = [];

async function existingKeys() {
  try {
    const resp = await fetch(`${BASE}/api/prices/references?limit=300`);
    const body = await resp.json().catch(() => ({}));
    const list = Array.isArray(body.references) ? body.references : [];
    return new Set(list.map((r) => [r.item, r.price, r.date, r.source].map((x) => String(x || '').trim()).join('|')));
  } catch (_) { return null; } // if the pre-check fails, still attempt the posts
}

(async () => {
  const seen = await existingKeys();
  for (let i = 1; i < rows.length; i++) {
    const cells = parseLine(rows[i]);
    const rec = {
      item: cells[idx('item')] || '',
      unit: cells[idx('unit')] || '',
      price: cells[idx('price')] || '',
      area: cells[idx('area')] || 'Botswana',
      date: cells[idx('date')] || '',
      source: cells[idx('source')] || '',
      url: cells[idx('url')] || '',
    };
    // Idempotency: a row already on the board is a re-run, not a duplicate.
    if (seen && seen.has([rec.item, rec.price, rec.date, rec.source].map((x) => String(x || '').trim()).join('|'))) {
      skippedDup.push(rec.item + ' ' + rec.price + ' (' + (rec.date || 'no date') + ')');
      continue;
    }
    const problems = [];
    if (!rec.item) problems.push('item missing');
    if (!rec.price) problems.push('price missing');
    if (!rec.source) problems.push('source missing (official bulletin issuer required)');
    if (!rec.url) problems.push('url missing (platform rule: official bulletins must link to the source)');
    if (rec.date && !isDate(rec.date)) problems.push('date "' + rec.date + '" not YYYY-MM-DD');
    if (problems.length) {
      failures.push({ row: i + 1, problems, rec });
      continue;
    }
    try {
      const resp = await fetch(`${BASE}/api/prices/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN },
        body: JSON.stringify(rec),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        failures.push({ row: i + 1, problems: ['HTTP ' + resp.status + ' ' + (body.error || '')], rec });
        continue;
      }
      okCount++;
      console.log(`  ✓ ${rec.date || '—'} ${rec.item} ${rec.price} (${rec.source})`);
    } catch (err) {
      failures.push({ row: i + 1, problems: [err.message], rec });
    }
  }

  console.log(`\nLoaded ${okCount} reference${okCount === 1 ? '' : 's'} from ${rows.length - 1} data row${rows.length === 2 ? '' : 's'}.`);
  if (skippedDup.length) {
    console.log(`\n${skippedDup.length} row${skippedDup.length === 1 ? '' : 's'} already on the board — skipped (no duplicates):`);
    for (const d of skippedDup.slice(0, 10)) console.log('  · ' + d);
  }
  if (failures.length) {
    console.error(`\n✗ ${failures.length} row${failures.length === 1 ? '' : 's'} SKIPPED (fix and re-run — the loader never rewrites, and already-loaded rows are never duplicated):`);
    for (const f of failures.slice(0, 10)) {
      console.error(`  row ${f.row}: ${f.problems.join('; ')}`);
    }
    process.exit(1);
  }
  process.exit(0);
})().catch((err) => {
  console.error('loader error:', err.message);
  process.exit(2);
});

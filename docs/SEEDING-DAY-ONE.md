# Day-One Seeding Pack — first load on the live instance

> Companion to DEPLOY-RUNBOOK §6. When the durable instance is up, load it
> in this order. Every item is [operator]-executed with real content only —
> no placeholder data ever reaches a public page.

## 0. Gate: runbook §4 passed
- [ ] Health 200, `/trust` renders, admin/backup verified, **durability
  test passed** (restart keeps data).
- [ ] Off-site backup of the (empty) instance taken.

## 1. Price references (official bulletins only)
1. [ ] Obtain the latest official bulletin (e.g. BAMB depot bulletin) with
   its date and URL. If none is published today, use the most recent
   official one — and say its date on the board (the board shows the date).
2. [ ] Create `scripts/bulletins/bamb-YYYY-MM-DD.csv` from the template
   (delete the `#` comment markers, fill REAL figures).
3. [ ] Load:
   `ADMIN_TOKEN=… BASE_URL=https://<service>.onrender.com node scripts/load-prices.js scripts/bulletins/bamb-2026-09-07.csv`
4. [ ] Verify on `/prices.html` (item, price, source, date, link visible)
   and in `/trust` (reference counter moved). Log the load + filename in
   the governance log.

## 2. Programme board (genuine buyer-led programmes)
1. [ ] Only programmes with a real buyer sponsor and full fair-terms
   fields: price formula, delivery window, specs, advance/input terms,
   payment timeline, written contract reference (OFFTAKE template).
2. [ ] Recommended first programmes: one BAMB-linked grain demand (if
   confirmed by the buyer) and one pilot-partner export or local-market
   programme — never invented "demo" programmes on a public board.
3. [ ] Verify `/programs.html` shows the fair-terms summary and the
   programme page renders its playbook.

## 3. Knowledge & content sanity
1. [ ] Grep-check the knowledge base for Botswana-correct references
   (Temo Letlotlo naming, BAMB depots, MIRA-era beef chain) — the 2026
   refresh named these; confirm they are what ships.
2. [ ] Extension/vet contacts: add the short real list used by the pilot
   (`teach:` entries or KB update) and note the update route for future
   changes.
3. [ ] Ask 10 pilot-type questions on Web, USSD and (if enabled)
   WhatsApp; confirm honest escalation lines and no empty answers slipping
   to the moderation queue unnoticed.

## 4. Geo-trace (export-readiness) pilot data
1. [ ] Create **real** pilot holdings only with their owners present and
   consent ticked (a demo run on the live instance with fake ranches would
   poison the trust page counters — use a local instance for demos).
2. [ ] If a pilot partner is live: share one holding to the partner
   account, build one consignment with a complete chain, export CSV, and
   email the file to the partner as the first deliverable (OFFER §5).

## 5. Trust & moderation hygiene
1. [ ] Review `/api/admin/moderation` — empty queues are the goal at
   launch; check counters on `/trust` read sensibly (no unexplained
   sessions/messages).
2. [ ] Set expectations in the UI copy where it matters (nothing claims
   "live in production" beyond what is true; the footer/trust page wording
   is accurate for this instance).

## 6. Backup & handover
1. [ ] Take the first real off-site backup (`/api/admin/backup`) and store
   it (runbook §5).
2. [ ] Governance-log entry: date, instance URL, seeded items, counters,
   known gaps, next review date.
3. [ ] Send the pilot partner the demo script + offer PDF
   (PILOT-OUTREACH §6) and book the week-4 checkpoint.

# AgriSphere — Governance Log

> What changed, who decided, what was verified, and what is due next.
> One entry per release/decision. Entries are dated; nothing is retro-edited
> without a struck-through correction note.

## 2026-09-07 — Production-readiness release (deploy-ready code)

**Scope (per collective recommendations — AUDIT §10, STRATEGY §§8–9):**
- O1 resolved: `render.yaml` now uses a paid plan with a persistent disk at
  `/var/data` + `DATA_DIR`; free-tier ephemeral storage is no longer the
  production path. In-app backups: auto snapshot every 6 h (keeps 10) + on
  demand `GET /api/admin/backup` (admin) for off-site copies.
- E-gap resolved: `GET /api/me/export` (full account export incl. history,
  listings, programmes, applications, ratings, alerts, photos, org records,
  geo-trace) and `DELETE /api/me` (erasure incl. photo files on disk).
- Security: global headers (nosniff, XFO, referrer-policy, permissions
  policy, COOP, HSTS behind proxy); production refuses an open admin surface
  (`ADMIN_TOKEN` missing → 503) and refuses webhook verification without
  `VERIFY_TOKEN`; geo-trace writes rate-limited.
- Product (W1 flagship wedge shipped to code): consent-first geo-trace
  holdings with owner-controlled sharing, consignment lots with gapless
  holding chains, and self-declared EUDR-readiness export (CSV/JSON) — docs
  for the Dec-2026/2027 timeline, deliberately not a certificate/TRACES
  statement.
- Trust: public `/trust` page (HTML + JSON) publishes live counters and the
  honesty commitments; no marketing numbers.
- CI: workflow written at `ops/ci.yml` (Node 20+22, syntax checks, smoke suite). Activation note: this sandbox's GitHub App lacks the `workflows` permission, so the file lives outside `.github/workflows/` — copy it into place per DEPLOY-RUNBOOK §CI (one command) when the GitHub connection allows workflow files.

**Verification:** smoke suite extended 130 → **164 assertions, exit 0**
(security headers, trust facts, dignity export/erase round-trip, geo-trace
CRUD/authorisation/export incl. consent & overlap rejections, admin backup
auth).

**Decision recorded:** deployment stays **staged/quiet** until the
[operator] items in DEPLOY-RUNBOOK §1 (entity, DPA, channel tokens, LOIs)
are done. No public "live" claim will be made before the §4 durability test
passes on the real instance.

**Due next:** §4.6 durability test on first real deploy; off-site backup;
entity + pilot LOIs; WhatsApp test-number demo.

## 2026-09-07 — Deep-research revision (research + strategy + compliance)

**Scope:** added `docs/RESEARCH-2026-REFRESH.md` (EUDR, Temo Letlotlo,
Farmer.Chat landscape, agritech capital, Pula×Bayer, GlobalG.A.P. v6,
DigiFarm lesson, BMC halal/BRCGS); revised `STRATEGY.md §§8–9`
(repositioning around EUDR geo-trace wedge W1–W5, revised 90-day plan);
`COMPLIANCE.md §11` standards appendix + universal (Islamic-derived)
practice map in non-religious, no-Arabic terms; `AUDIT.md §10` superseding
advice; compliance checklist gained EX1/EX2 export rows.

**Verification:** smoke suite green (130 at that point).

## 2026-09-07 — Audit release (earlier the same day)

**Scope:** full enterprise & application audit (`docs/AUDIT.md`), Express 5
upgrade (npm audit 0), admin token header-only + timing-safe, dependency-free
rate limiting, upload nosniff, notify opt-out honouring. Findings A1–A8,
O1–O6, E1–E6 recorded — this log's parent entries trace their resolution.

---

## Review cadence (owned by the repository, ticked each month)

- [ ] AUDIT.md §8 checklist re-run
- [ ] Learned-content moderation pass
- [ ] RESEARCH-2026-REFRESH.md quarterly re-check (EUDR acts, Temo Letlotlo,
      funding landscape)
- [ ] Off-site backup verified
- [ ] `/trust` numbers reviewed by a second person

## 2026-09-07 — W1 demo UI + pilot outreach pack + DPA template

**Scope (STRATEGY §9 Day 1–30 execution, code + business documents):**
- Geo-trace workspace UI shipped: `/geotrace.html` (+ `/geotrace.js`) —
  consent-checkbox holding form, holdings list with revocable sharing
  editor, consignment creation, lot builder with multi-holding chain rows
  (date-ordered, open periods auto-close server-side), JSON/CSV export
  downloads, honest info line with the EUDR deadlines and limits. Nav link
  added to the home page ("🗺️ Export-ready").
- `docs/OFFER-EUDR-READINESS-2026.md`: one-page pilot offer for export
  chains — calendar, what the tool does/does not do, 90-day pilot terms,
  price envelope placeholder, success measure = lots exported with complete
  chains (not registration vanity metrics).
- `docs/PILOT-OUTREACH-2026.md`: three role-based conversation cards
  (export chain, co-op/union, insurer/BAMB), outreach sequence, BAMB
  republication permission letter draft, MoA/Temo Letlotlo complement
  briefing, open-item checklist for the owner, 60-second demo script.
- `docs/templates/DATA-PROCESSING-AGREEMENT.md`: DPA template (universal
  language, professional review required); COMPLIANCE §6 + §10 and AUDIT
  §11 pointers updated (data governance 6.5 → 9.5/10).
- Smoke suite extended 164 → **167 assertions, exit 0** (geo-trace UI page,
  client script, home-nav link).

**Verification:** live preview serves `/geotrace.html` (200) with the new
build; full suite green; static assets need no server restart.

**Decision recorded:** owner completes the [owner:] fields in
OFFER/PILOT-OUTREACH docs and the open-item checklist before any external
send-out; lawyer review of the five templates is a hard gate before
signature.

**Due next (owner):** entity registration; one-pager to PDF; week-1
outreach sends; first demo slot; deploy per DEPLOY-RUNBOOK.

## 2026-09-07 — "Generate all" close-out: remaining collective artefacts

**Scope (completes the generatable set of STRATEGY §§8–9 + COMPLIANCE §11 +
AUDIT §11):**
- Templates (docs/templates/, all "professional review required", universal
  non-confessional language): PILOT-LOI-AGREEMENT (tracks A/B/C, decision
  point, no-exclusivity, honesty clause); ADVANCE-PURCHASE-GROUP-CONTRACT
  (interest-free advance on defined goods, transparent formula, fair
  failure triggers, documentation-layer-only framing);
  ROTATING-SAVINGS-GROUP-RULES (member-run mutual pool, closed membership,
  regulatory boundaries spelled out); REPUBLICATION-AGREEMENT (short form
  for BAMB bulletins & official content: attribution, no alteration, free,
  revocable).
- WhatsApp test-number launch checklist (docs/WHATSAPP-LAUNCH-CHECKLIST.md):
  Meta portfolio/app/test number steps, env var mapping, webhook
  verification, end-to-end test, message-template rules, demo-day script,
  test-number limits, production-number path, official-docs-first rule.
- Grants & programme capital pack (docs/GRANTS-2026-PREP.md): window
  classes to scan quarterly (verify-before-apply), evidence-pack map,
  standard proposal skeleton, budget skeleton, per-window checklist,
  parastatal service-contract track, honesty rules for proposals.
- Day-one seeding: docs/SEEDING-DAY-ONE.md (first-load order) +
  scripts/load-prices.js + scripts/bulletins/ (README + commented
  template CSV). Loader verified end-to-end on a live instance: official
  rows load, commented rows never load, invalid rows rejected with
  reasons, re-runs skip already-loaded rows (no duplicates), exit codes
  honest.

**Verification:** loader tested twice against a fresh server (2 loaded /
re-run 0 loaded + 2 dup-skipped / board total 2); node --check clean;
smoke suite 167/167; preview health 200.

**Decision recorded:** no placeholder data ever ships to a public page;
the template CSV's example rows are commented out by design and the loader
skips '#' lines — first live load requires a real official bulletin.

**Due next (owner):** real bulletin load on first deploy; WhatsApp
test-number activation; LOI sends; grant-window scan on the quarterly
cadence.

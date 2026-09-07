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

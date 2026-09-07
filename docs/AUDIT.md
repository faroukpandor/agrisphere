# AgriSphere — Collective Enterprise & Application Audit

**Date:** 2026-09-07 (reviewed against the running tree `a9ce163` + audit hardening commit)
**Auditor:** collective review session (agent + repo evidence; human owner review required for the items marked ☑️)
**Scope:** code/application, security, data governance, operations/deployment, business model, ethics & compliance, roadmap truthfulness
**Method:** live evidence (test suite, dependency audit, endpoint probes, code inspection, config review, docs cross-check) + documented advice. No white-box fuzzing or external pen test was run — see §9.

---

## 1. Executive summary

| Dimension | Verdict | Score (0–10) |
|---|---|---|
| Application integrity (tests, determinism, no invented content) | **Strong** | 9 |
| Security posture (dependency, auth, abuse, uploads) | **Good with fixes applied this audit** | 7.5 → 8 |
| Data governance & data dignity (opt-out, verification, ratings rules) | **Good; export/delete gap** | 6.5 |
| Operations & durability (backups, Render free-tier persistence, DR) | **Weak — the #1 blocker for real pilots** | 4 |
| Business model soundness (B2B2F guardrails, honesty) | **Well-designed on paper; zero revenue validated** | 6 |
| Governance & compliance documentation | **Good for a pre-revenue project** | 7 |
| Honest framing / non-overclaiming | **Excellent — consistently** | 9 |
| Roadmap truthfulness (STRATEGY.md vs code) | **Good** (10/19 boxes are build-complete; each open item has an honest suffix) | 8 |

**Overall:** a well-governed, honest, test-covered platform that is *product-complete for pilots* on its own preview host, but **not yet deployment-complete for real users**: the operational layer (durable data on the chosen host, backups, real channels, entity) and the partnership layer are the true critical path — not more features.

---

## 2. Application audit (code & behaviour)

### 2.1 What was verified live
- **Test suite:** `node test/smoke.js` → **130 assertions green** (was 127 before this audit's hardening assertions; 68 at the start of the P0 build-out). Fresh `DATA_DIR` each run; covers chat routing, Setswana, teach/learn, all three stakeholder tracks, lifecycle, identity, orgs, USSD, compliance packs, moderation, photos, rate limiting.
- **Dependency audit:** was **3 moderate** (express 4.21.2 → body-parser 1.20.x → qs ≤6.15.3: DoS + array-limit bypass). **Fixed by migrating to express ^5.2.1 → `npm audit` reports 0 vulnerabilities.** Full 130-assertion suite re-run green after migration. Single runtime dependency remains (express).
- **Determinism & honesty:** the bot has no generative model on by default (`ENABLE_LLM` off); all content is from the curated 73-topic corpus or user-taught lessons; prices only from admin-loaded bulletins with source+date (validated in tests: price add without source → 400, without admin → 403).
- **Escaping:** web UI escapes all dynamic text (`escapeHtml` before `innerHTML`) in chat, marketplace, programmes, admin, account, prices pages — spot-checked.
- **Probes run during this audit:** rate limiter returns 429 on the 7th OTP request; admin query-string token now rejected (403) while header token works; uploads serve with `X-Content-Type-Options: nosniff`.

### 2.2 Findings table (application)

| # | Finding | Severity | Status / advice |
|---|---|---|---|
| A1 | **Admin token accepted via query string** → leaks into logs/history | Medium | **Fixed** — header-only + constant-time comparison (`crypto.timingSafeEqual`) |
| A2 | **No rate limiting** on OTP issue (SMS-bombing), alerts subscribe, reports (flag-abuse), photos, chat | Medium | **Fixed** — dependency-free sliding-window limiter: OTP 6/15 min per phone+IP, verify 20/15 min, alerts 12/h, photos 15/h, reports 10/10 min, chat 150/5 min; 429 JSON. Note: in-memory only — swap for shared store if horizontal scaling |
| A3 | **Admin/owner auth is a capability model** — `x-owner-id` is a self-asserted browser UUID; anyone who obtains an id can act as that user | Medium (by design) | Keep for v1 (no password burden for farmers) — **document as capability model**; mitigations in place (verification badges, admin moderation, rate limits). Add real accounts only when org tiers need them |
| A4 | **OTP verification ties any session id to a phone** once the code is known; codes are 6-digit | Low | TTL 10 min + 5-attempt lockout + rate limit now. Fine for v1; move to longer codes/SMS provider before regulated use |
| A5 | **Uploads are unauthenticated URLs** under `/uploads` (unguessable names, magic-byte validated, size ≤2.5 MB, nosniff now) | Low | Acceptable for a review queue; add signed URLs or auth when photos carry commercial sensitivity |
| A6 | **`node:sqlite` backend requires Node ≥22**; `package.json` engines says ≥18; on Node 18–21 the store silently falls back to JSON | Low | **Advice:** raise `engines` to ≥22 when `DATA_BACKEND=sqlite` is used in production, or log a warning on fallback (healthz already reports `backend`) |
| A7 | **No CSP/security headers** (helmet) | Low | **Advice:** add `helmet` (or the handful of headers manually) before public launch |
| A8 | **In-memory maps** (rate-limit buckets, USSD pending sessions) are not shared across instances | Low | Single-instance deployment assumption is fine; document it |

---

## 3. Data governance & data dignity audit

| Area | Evidence | Verdict |
|---|---|---|
| **Consent-first verification** | OTP flow; phone stored only after verification; sessions opt-in by typing | ✔ |
| **Opt-out** | Channel-level STOP/START now honoured in ingest **and** in the alert bus (`alerts.optout-skipped` counter) — gap found & fixed this audit | ✔ |
| **Ratings honesty** | One rating per (target, rater) — updates not duplicates; only admins may delete; 1–5 enforced | ✔ |
| **Insights anonymisation** | `/api/insights` tested to contain no raw text/names; demand terms are single keywords | ✔ |
| **PII inventory** | Sessions hold name (optional), phone (only when verified), chat history; listings/orgs hold user-entered contact | Documented informally only |
| **Data export (portability)** | **Missing** — no per-user "download my data" | **Advice (P1):** add `GET /api/account/export` returning the user's sessions/history/listings/alerts/org membership as JSON |
| **Data deletion** | Channel opt-out exists; **no full account deletion endpoint**; org/listing deletion exists | **Advice (P1):** add `DELETE /api/account` (clears session, listings, alerts, applications, removes from org member lists) to complete the dignity story |
| **Children/emergency** | No emergency-service claims on any channel; chatbot is not a medical/vet diagnostic | ✔ — keep it that way in marketing too |

---

## 4. Operations & deployment audit — **critical path**

| # | Finding | Severity | Advice |
|---|---|---|---|
| O1 | **Render free tier has an ephemeral filesystem** — the JSON/SQLite state (`data/`) lives on the instance disk; a free service's instance is recreated on spin-down/restart, so **learned lessons, listings, programmes and photos can be lost between cold starts** | **Critical for real use** | (a) For pilots: keep the current preview role, or (b) move to a paid Render instance with a **persistent disk** mounted at `DATA_DIR`, or (c) run `DATA_BACKEND=sqlite`/Postgres pointing at a **managed external DB** (e.g. Render Postgres — note free Postgres expires after ~30 days; treat as demo). Re-verify against Render's current docs at deploy time. |
| O2 | **No backup/restore tooling** beyond the atomic JSON files | High | **Advice (P1):** admin `GET /api/admin/backup` → download one JSON bundle of all collections; document restore. Cheap and enables weekly exports |
| O3 | **Free-tier cold start (~30 s+) breaks webhook flows** — Meta/Telegram have short timeouts and retry; a sleeping instance can drop inbound messages | High for channels | Wake-up strategy: a cron ping (Render cron on paid, or UptimeRobot free) + document that live WhatsApp/Telegram should run on a warm (paid) instance |
| O4 | **No structured logging/metrics/alerting** beyond console + counter stats | Medium | Add request logging middleware (one line) and route `/healthz` counters into an uptime monitor; revisit before SLA-backed orgs (see docs/templates/SERVICE-LEVEL-AGREEMENT.md) |
| O5 | **Single developer, no CI** | Medium | **Advice:** GitHub Actions running `npm ci && node test/smoke.js` on every push (PR #1 already has Sourcery checks; add the test job). Cheap, catches regressions like this audit's express migration |
| O6 | Runtime state correctly gitignored (`.data/`, `.smoke-data/`, `data/uploads/`, `*.sqlite`) | ✔ | Keep — and never commit `data/` exports |

---

## 5. Business model & enterprise audit

### 5.1 Soundness check against the standing guardrails
| Guardrail (user-mandated) | Evidence | Verdict |
|---|---|---|
| Farmers free forever | All farmer-facing features free; pricing only for org/feature/API tiers (I1–I7) | ✔ |
| Organisations pay (ethical B2B2F) | MONETISATION.md + templates; no farmer-side fee paths found in code | ✔ |
| No unlicensed credit | No lending code; finance content is advisory with disclaimers; advance terms are *buyer-offered and documented*, not AgriSphere credit | ✔ |
| No money handling in-house | Settlement statements explicitly "AgriSphere does not handle money"; no PSP integration exists (correctly deferred to licensed partners) | ✔ |
| No advice bias / pay-to-play | No sponsored-ranking logic exists; featured tier is roadmap only and flagged "sponsorship labelled" in strategy | ✔ |
| Universal ethics, non-confessional | Knowledge base finance/ethics content uses universal equivalents only; no religious framing (verified in COMPLIANCE.md) | ✔ |
| AI-independent core | Deterministic retrieval default; LLM opt-in and grounded | ✔ |

### 5.2 Enterprise gaps (not code)
| # | Gap | Advice |
|---|---|---|
| E1 | **No legal entity/bank account** yet (founder-run) | ☑️ Owner action: register (e.g. sole proprietor → Pty) before signing the 3 pilot letters of intent in STRATEGY §4.3 |
| E2 | **Zero revenue validated**; Year-1 envelope is P120k–300k (≈US$9–22k) | Realistic. Do not build revenue features before 3 signed pilots (buyer, co-op/union, NGO/ministry) |
| E3 | **No data-processing agreement for orgs** or formal privacy policy hosted on the deployed site | Template from COMPLIANCE.md; publish at launch URL with contact |
| E4 | **Channel activation still needs humans** (Meta Business verification, WhatsApp template approval, Telegram setWebhook, USSD shortcode/aggregator) | STRATEGY R1 status is honest: adapter done, activation open. Timebox: WhatsApp test number demo first |
| E5 | **Botswana Tourism & BAMB/BMC data partnerships** unstarted | Bulletin feeds = the single highest-trust feature; approach BAMB for permission to republish bulletins with attribution (R8 built, data rights open) |
| E6 | **Trademark/name check** for "AgriSphere" + open-source licence implications of GPL-3.0 for org licensing (white-label) | ☑️ Verify before selling org licences; GPL is fine for hosted SaaS (no distribution) but confirm white-label terms with counsel |

---

## 6. Governance & compliance audit
- `docs/COMPLIANCE.md` (ethics/privacy/standards + review cadence), `docs/MONETISATION.md`, `docs/RESEARCH.md`, `docs/STRATEGY.md` (R1–R19 with per-item truth status) exist and are internally consistent; templates set (MOU/SLA/tourism/premium) matches the four income tracks.
- **Weak spot:** review cadence is *documented* but nothing enforces it (no dated review log, no changelog of governance decisions). **Advice:** add a one-page `docs/GOVERNANCE-LOG.md` with quarterly entry template; owner fills it on the dates in COMPLIANCE.md.
- **Content sourcing:** corpus entries list sources inline (FAO/CABI/WOAH/Codex/GlobalG.A.P./national); disclaimers are present in chat, USSD, compliance packs, and plans. Consistent with "honest escalation" requirement (human queue + extension/vet routing).

---

## 7. Acceptance-criteria mapping (original standing task)
| Requirement | Status |
|---|---|
| Self-learning multi-channel agri chatbot core with zero-external-AI independence | ✔ shipped, tested, 73 topics + learned memory + Setswana v1 + 4 channels (web/PWA live, 3 webhook adapters) |
| Marketplace/e-commerce + crop-disease/ML ambition | Marketplace ✔; crop-doctor triage ✔; **ML/vision honestly deferred** (photo queue = human review; no AI claim) |
| Full production + NRM coverage grounded in authoritative sources | ✔ (61→73 topic areas; modules A–D) |
| Islamic best practice "in substance", universal & non-confessional | ✔ audited in content |
| Recurrent/passive income design, multi-stakeholder | ✔ documented (I1–I7, B2B2F) |
| Governance/compliance docs non-overclaiming with review cadence | ✔ docs; cadence enforcement open (see §6) |
| Three stakeholder tracks + all documents/templates | ✔ shipped |
| Render-hostname live claim only after real deployment | ✔ respected (preview :3000 only; hostname still not claimed) |

---

## 8. Consolidated advice (prioritised)

**Do now (0–2 weeks) — hardening, low effort**
1. Add CI: GitHub Actions `node test/smoke.js` per push (O5).
2. Add `GET /api/admin/backup` (JSON bundle download) + document restore (O2).
3. Add `GET /api/account/export` + `DELETE /api/account` for data dignity completeness (§3).
4. Add security headers (helmet or manual) (A7); raise `engines.node` to ≥22 or log sqlite fallback (A6).
5. Open `docs/GOVERNANCE-LOG.md` with first dated entry (this audit) (§6).

**Next (2–6 weeks) — deployment decision**
6. **Decide the data-durability path before any public launch** (O1): paid Render + persistent disk, or external managed DB. Document the choice in README/STRATEGY.
7. Deploy the branch to Render only when a *durable* data path is chosen; then and only then claim the hostname live (standing rule).
8. CI + warm-instance wake-up (O3) if channels go live.

**Next quarter — enterprise**
9. Register entity + bank account (E1); sign 3 pilot LOIs (STRATEGY §4.3) using the template set.
10. BAMB bulletin permission + WhatsApp test-number demo video (E5/E4).
11. Re-run this audit after the first real deployment and after the first paying org (30- and 90-day cadence).

**Defer deliberately (with reasons)**
- Paid org features/quotas, insight report tiers, featured placements — until ≥3 pilots signed (E2).
- AI photo diagnosis — until a real partner (extension/vet) reviews accuracy (honesty rule).
- USSD shortcode, PSP hooks — partnership-gated by definition.

---

## 9. Limitations of this audit
- No external penetration test, no load test, no fuzzing; uploads validated by magic bytes but not decoded/re-encoded.
- Render free-tier persistence claim (O1) should be re-verified against Render's current documentation at deploy time.
- Rate limiter is per-process (fine for the single-instance design; documented).
- Enterprise items (E1, E6) require legal/business confirmation by the owner — marked ☑️.

*Prepared as the collective audit record for AgriSphere. Next review: on first Render deployment of this branch, or 30 days from this date, whichever comes first.*

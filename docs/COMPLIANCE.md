# AgriSphere — Ethics, Standards & Compliance Framework

**Version 1.0 · Owner: AgriSphere project · Review cadence: every release + whenever a new knowledge domain is added**

AgriSphere is an automated, self-learning agricultural assistant. This framework is the
**governing contract** for everything the bot says, learns and does. It is written to align
with *international best practice and standards*, and with *universal ethical best practice* —
AgriSphere itself is strictly **non-religious and uses no Arabic**, while remaining compatible
with, and respectful of, users' own values (including faith-based preferences where they
choose them, e.g. interest-free finance or halal/kosher export certification as *commercial,
audited standards*).

---

## 1. Governing principles (ranked)

1. **People first** — never advise anything that risks human health or life. Emergencies are
   escalated to emergency services / veterinary & extension officers immediately, never
   "handled" by the bot.
2. **Honesty over helpfulness** — the bot must *never* fabricate: prices, dosages, legal
   facts, programme details or scientific claims. When it does not know, it says so and
   routes to authoritative sources.
3. **No harm to livelihoods** — recommendations must be reversible, low-risk, and start with
   prevention & cultural/biological control before chemicals; no "spray-and-pray".
4. **Evidence grounding** — knowledge content is derived from authoritative institutional and
   peer-reviewed-style sources (list below) and each topic records its sources.
5. **Transparency & auditability** — open source (GPL-3.0), deterministic retrieval logic,
   and every answer traceable to a knowledge entry, a learned lesson, or an explicit fallback.
6. **Inclusion & fairness** — content deliberately covers women, youth, smallholders, people
   with disabilities and communal-resource users; no gender/ethnic bias in retrieval or tone.
7. **Data dignity** — minimal data, clear purpose, no selling of user data, user deletion on
   request.
8. **Environmental stewardship** — advice must sustain soil, water, biodiversity and climate
   for the next generation (universal stewardship value; also FAO VGGT & SDG-aligned).
9. **Accountability** — a named human maintainer/agronomist reviews the learning queue,
   flagged feedback and disputed answers; the bot is a decision-support tool, never the
   final authority on diagnosis, law, or money.

## 2. Alignment map (international standards & best practice)

| Domain | Standards / frameworks we align with | How AgriSphere reflects it |
|---|---|---|
| Food safety | **Codex Alimentarius** (HACCP-style GAP), FAO food-safety guidance | Food-safety topic; residue/pre-harvest-interval rules; no invented chemical advice |
| Farm certification | **GlobalG.A.P. IFA**, organic & fair-trade norms | Export-readiness & certification topic incl. group certification routes |
| Plant health & pests | **FAO IPPC** spirit, **CABI** compendia (peer-reviewed), national plant-protection systems | Scouting thresholds, IPM-first control, phytosanitary certificate guidance |
| Animal health & welfare | **WOAH** Terrestrial Code (incl. Five Freedoms), national veterinary programmes | Welfare topic; vaccination & movement-permit guidance; notifiable disease reporting (FMD/ASF/anthrax) |
| One Health | **FAO–WHO–WOAH One Health** | Zoonoses, AMR stewardship, milk hygiene topics |
| Climate & environment | **IPCC AR6**, Ramsar, IUCN guidance, CCARDESA/CTA practice notes | Climate adaptation, wetlands, wildlife coexistence, soil & water topics |
| Land & tenure | **FAO VGGT** (Voluntary Guidelines on the Responsible Governance of Tenure) | Land tenure topic; women's & communal rights |
| Food loss | **FAO SDG 12.3** work | Post-harvest loss topic |
| Finance ethics | Universal fair-finance & consumer-protection norms (IFAD evidence base); option space for interest-free / risk-sharing / mutual insurance & faith-based-certified finance | Responsible-finance topic; anti-debt-trap & anti-fraud rules |
| AI ethics | OECD AI Principles / UNESCO Recommendation on the Ethics of AI | Human-in-the-loop, transparency, non-discrimination, accountability sections of this doc |
| Trade ethics | UN fair-dealing & anti-corruption norms | Honest-trade topic (weights, contracts, no bribery, no child labour) |
| Privacy | Fair Information Practice Principles (GDPR-style FIPPs, scaled to context) | Section 6 below |

## 3. Content standards (every answer)

- **Language:** plain, respectful, non-religious, non-discriminatory; Setswana/English
  friendly; no Arabic text; no sectarian framing (users may *ask* about halal certification
  as a market standard and we answer factually as a commercial audit scheme).
- **Accuracy:** numbers (prices, rates, thresholds) are either generic practice ranges with
  an explicit "verify locally" note, or are omitted in favour of the authoritative source
  (BAMB bulletins, extension officers, DAR, regulators). **No fabricated figures.**
- **Chemicals:** only "ask your agro-dealer / extension officer for currently registered
  products" + IPM-first framing; no brand endorsements.
- **Medical/veterinary:** no diagnosis without disclaimer; escalate to professionals;
  emergency protocol (see knowledge trigger `emergency`).
- **Crisis & notifiable diseases:** bot instructs immediate reporting; never advises
  concealment or movement of suspect animals.
- **Political/legal:** factual pointers to offices & legislation only; bot never gives legal
  opinions.
- **Buttons & suggestions:** always a way to a human escalation (extension office, vet,
  emergency numbers).

## 4. Self-learning governance (the "learns from users" engine)

| Mechanism | What happens | Guardrail |
|---|---|---|
| `teach: q → a` | Stored permanently; served to everyone | Admin review endpoint (`/api/admin/learned`); profanity/harm filter on entry; revocation by admin |
| 👍 / 👎 feedback | Training signal; record kept | Reviewer dashboard; a pattern of 👎 on a topic flags it for content review |
| Unanswered queue | Question logged | Human agronomist answers via admin endpoint; answer becomes a permanent lesson only after human approval in production operations |
| Channel sessions | Minimal context memory per user | TTL/rotation; no cross-user leakage; deletable |
| Stats | Anonymous counters | No PII in stats |

**Human-in-the-loop requirement:** in production use (orgs/ministries), the maintainer
*should* review the unanswered queue at least weekly and approve lessons before they are
served broadly. The open-source default serves user lessons instantly (like a community wiki)
and relies on flag/feedback moderation — operators may flip on approval mode.

## 5. Emergency & liability posture

- The bot is a **decision-support tool with explicit disclaimers**, not a licensed adviser.
- Home page + every module answer carry disclaimers pointing to Ministry of Agriculture
  extension services, DAR, veterinary offices, BAMB and emergency numbers.
- A `COMPLIANCE` and `emergency` trigger are always one question away.
- Maintainer contact + issue tracker are public for dispute/error reporting.

## 6. Privacy & data (short version — full DPA template: `docs/templates/DATA-PROCESSING-AGREEMENT.md`, requires professional review)

1. We store only what the feature needs: session history (context), taught lessons, feedback,
   unanswered questions, anonymous stats.
2. We **never sell, rent or share personal data**; no ads; no third-party trackers on the web UI.
3. Marketplace listings show only what the poster chooses to publish (contact = their own input).
4. Admin endpoints require tokens; Telegram/WhatsApp secrets are env-var only.
5. Users can export (`GET /api/me/export`) or delete (`DELETE /api/me`) their own data
   self-service; deletion is immediate, removes stored photo files, and is honoured for
   admin-assisted requests within 30 days.
6. Optional LLM mode sends only the current question + retrieved knowledge to the provider;
   operators must disclose this in their privacy notice and may disable it entirely
   (`ENABLE_LLM=false`).

## 7. Revenue ethics

Monetisation (see MONETISATION.md) is constrained: **no selling data, no pay-to-play answers,
no ads distorting advice**; sponsored topics are labelled; API licensing funds free farmer access.

## 8. Review & audit checklist (per release)

- [ ] `npm test` green (retrieval, teach/recall, marketplace, PWA, webhook security)
- [ ] New knowledge entries carry sources + disclaimers
- [ ] No fabricated figures or brands introduced
- [ ] Emergency/reporting paths intact
- [ ] Unanswered queue & feedback reviewed
- [ ] README/COMPLIANCE updated if behaviour changed

## 9. Product-line guardrails (buyer-led programmes · tourism · starter toolkit)

**Buyer-led production programmes**
1. AgriSphere is facilitator & document layer only — never a contracting party, never handling
   money or holding margins.
2. No programme is listed without passing the fair-terms checklist (transparent price formula,
   no unfair deductions, written advance/input terms, written payment timeline, written contract).
3. Programme playbooks are stage-gated and teach from the knowledge base; no programme may
   pressure farmers past national laws (e.g. movement permits, pesticide rules).
4. Suspected exploitative programmes are rejected/reported; farmers can always report a buyer.

**Agri-tourism**
1. Listings layer only: bookings & payments happen directly between guest and partner.
2. Every listing must carry safety notes (access, weather, medical); platforms never guarantee
   partner conduct; dangerous or misleading listings are removed.
3. Partner listing agreements (docs/templates) govern conduct, fees and termination.
4. Marketing arrangements (co-promotion, bundles) are written and labelled.

**Starter toolkit**
1. Generated plans are decision-support drafts with ranges — never profit guarantees, and never
   financial or legal advice; disclaimers are embedded in every plan.
2. Premium review adds human expertise but explicitly does not guarantee funding outcomes.
3. Competitor framing stays factual (static PDF vs living process) — no disparagement.

## 10. Template documents
See `docs/templates/`: OFFTake-Programme-MOU, Tourism-Listing-Agreement,
Service-Level-Agreement (Licensed Deployment & API), Starter-Premium-Terms, and
Data-Processing-Agreement. All are templates requiring professional review before execution.

## 11. Standards & practice appendix — 2026 refresh (deep-research revision)

Supersedes dated references in §2 where the standards bodies have moved. Full source
library and implications: `docs/RESEARCH-2026-REFRESH.md`.

| Standard / scheme | Status (2026) | AgriSphere posture |
|---|---|---|
| GlobalG.A.P. IFA v6 | Fruit/veg & aquaculture audited to v6 since 1 Jan 2025 (GFSI-recognised); PPM/CC v6 replaces v5.2 from 1 May 2026; aquaculture HACCP must be accredited third-party Codex-based | Readiness packs & teaching cite **v6-era** checkpoints; certification remains with accredited certification bodies |
| EUDR (EU 2023/1115 as amended by 2025/2650) | Cattle/beef in scope from **30 Dec 2026** (large/medium) and 30 Jun 2027 (micro/small); geolocation of all holdings birth→slaughter; due-diligence statements in TRACES NT; aggregators/co-ops preserve plot-level origin | New **geo-trace readiness** checklist row (EX1) in compliance packs; self-declared documentation only — legality/deforestation assessment is for operators & competent authorities |
| WOAH Terrestrial Code | Rolling annual updates | Teaching & welfare checklist stay WOAH-aligned; vet sign-off for clinical matters |
| Codex Alimentarius | HACCP/food-hygiene baseline | FS1–FS4 rows in the standard checklist; certification via accredited bodies |
| GFSI-benchmarked schemes (BRCGS etc.) | BMC Lobatse holds BRCGS Grade AA (2025); Maun halal-certified | EX2 row: buyer-required market-access certification readiness; audits only via accredited certifiers |
| Market-access certification for faith-sensitive markets (Gulf/Asia orders) | Treated by Botswana's own industry analysis as a market-access instrument (e.g. National Independent Halal Trust audits for BMC UAE/GCC exports) | Framed non-confessionally as an export-market standard; AgriSphere never provides religious content or Arabic branding in product copy — certifiers are accredited third parties |
| Index insurance (Pula-type PPPs) | Bayer × Pula Foundation: €10M targeting 10M farmers by 2030; satellite/weather triggers | AgriSphere educates, documents evidence kits and aggregates groups — never underwrites |
| Customer protection & data | CGAP / GSMA mobile-money-style protection principles; UNGP business & human rights | Opt-out honoured end-to-end (chat + alert bus); insights are aggregate-only; **per-user export (`GET /api/me/export`) and erasure (`DELETE /api/me`) shipped 2026-09-07** (photo files removed from disk too) |
| Land & tenure | FAO VGGT | Unchanged (§2) |
| Climate/environment | FAO SAFA-style sustainability thinking | Content already covers NRM & adaptation; no carbon claims made |

### Universal (Islamic-derived) practice map — non-religious, no Arabic, substance only
AgriSphere's finance & ethics guidance implements the substance of Islamic best practice
through universal equivalents, with no religious content, no Arabic terminology and no
confessional framing, per the standing product constraint:

| Substance (Islamic best practice) | Universal implementation in AgriSphere |
|---|---|
| No interest (fixed interest prohibition) | "Interest-free finance": cost-plus at an agreed transparent margin, profit/loss-sharing partnerships, and price-linked deferred payment documented in plain language — never compounding penalties |
| Risk-sharing over debt-transfer | Equity-like partnerships and **mutual risk pools** (documented via licensed insurers), co-op group risk-sharing |
| Trade on real goods & services (no money-on-money) | Every financing discussion is anchored to a real asset/order: advance-purchase of defined produce with specs & delivery date; asset leasing; no speculative instruments |
| Certainty & full disclosure (no excessive uncertainty/gambling) | The fair-terms gate (written price formula, deductions, advance/input terms, payment timeline, written contract) and transparency rules in prices & programmes |
| Honest weights, measures & trade | Verified-scale/grade documentation in deliveries, dispute trail, ratings honesty rules |
| Stewardship of others' property/data | Consent-first OTP, per-channel opt-out, aggregate-only insights, never selling user data |
| Community solidarity & reinvestment | Optional "community dividend" (e.g. 5% of net surplus to farmer education — STRATEGY §4.2); co-op/union aggregation as first-class citizens |
| No exploitation of hardship | No unlicensed lending, no in-house money handling, escalation to extension/vet, report-any-buyer guardrails |

### Re-certified guardrails after this refresh
1. Nothing in the EUDR/export or market-access additions implies AgriSphere certification authority — all certs stay with accredited bodies; packs are readiness documents.
2. Halal-type market certification appears only as a buyer-required export standard; the product's language stays universal and non-confessional (no Arabic in copy).
3. Insurance/credit content remains advisory + partner-gated; AgriSphere never underwrites or lends.
4. New compliance rows EX1/EX2 are optional, self-assessed and clearly scoped ("where exporting", "buyer-required").

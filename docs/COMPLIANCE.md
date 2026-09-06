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

## 6. Privacy & data (short version — see repo issues for a full DPA template)

1. We store only what the feature needs: session history (context), taught lessons, feedback,
   unanswered questions, anonymous stats.
2. We **never sell, rent or share personal data**; no ads; no third-party trackers on the web UI.
3. Marketplace listings show only what the poster chooses to publish (contact = their own input).
4. Admin endpoints require tokens; Telegram/WhatsApp secrets are env-var only.
5. Users may request deletion of their session/lessons by opening a GitHub issue or using the
   admin endpoint; we honour deletion within 30 days.
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

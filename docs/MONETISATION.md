# AgriSphere — Recurring Income & Value Playbook

**Purpose:** keep the assistant free for individual farmers while building sustainable,
ethical, recurring revenue for the owner/orchestrator — and value for every stakeholder.

> ⚖️ Guardrails (from COMPLIANCE.md §7): **no selling farmer data · no pay-to-play answers ·
> no ads that distort advice · sponsored content clearly labelled.** Income streams below all
> respect these.

---

## 1. Why this can earn

- **The product is a platform, not a page:** one brain, many channels (Web/PWA, WhatsApp,
  Messenger, Telegram) + a community marketplace + an API. Organisations pay for *access,
  integration and curation*, farmers get the core free.
- **Differentiation:** provider-independent (bring any LLM or none), deterministic + auditable,
  honest (never fabricates), standards-aligned, offline-capable PWA, self-learning with human
  review. This is what NGOs, co-ops, ministries and agribusinesses must show funders.
- **Low marginal cost:** content & code are in this repo; deployment is one service.

## 2. Revenue streams (ordered by effort → value)

### A. Licensed API & white-label chatbot (primary recurring) 💳
- **What:** subscription tiers for orgs to embed AgriSphere: hosted widget, REST API
  (`/api/chat`), branded white-label (name/colours), custom knowledge packs, channel hookup.
- **Tiers (indicative, local-market pricing to be validated):**
  - *Community* — free: web chat + marketplace, for individual farmers & <10-person groups.
  - *Starter* — ~P250–P900/month: 1 branded channel (WhatsApp **or** Messenger **or** Telegram
    + web), up to N messages/mo, basic analytics.
  - *Growth* — ~P1,500–P5,000/month: all channels, marketplace storefront, co-op group
    certification onboarding, custom topic packs.
  - *Enterprise / Programme* — annual contract: ministry/NGO/district deployments, SLA,
    agronomist-reviewed learning queue, dedicated trainer, data-locality options.
- **Licence:** GPL-3.0 covers the code; **commercial hosting/API service** is a separate
  service contract (open-core model: the code is free, the managed service & support earn).

### B. Verified marketplace features (marketplace)
- Listing produce is free (liquidity first). Paid, small fees later:
  - **Featured/verified listings** (badge + top placement) — input suppliers, buyers,
    transporters, agro-dealers.
  - **Co-op & business storefronts** (branded page + bulk listing + analytics).
  - Keep farmer-to-farmer free forever; charge the *commercial* side only.

### C. Sponsored knowledge & programmes (clearly labelled)
- Vetted sponsors (seed houses, government programmes, NGOs, insurers, processors) may
  sponsor a topic or an awareness campaign. Answers stay independent; sponsorship is
  displayed as a label. No sponsored entry may change agronomic advice.

### D. Professional services (high margin, builds A)
- WhatsApp/Messenger/Telegram activation & Meta business verification (agency-style fee).
- Custom knowledge packs: an organisation's input/product/extension content turned into
  audited, standards-aligned topics.
- Training & facilitation: co-op onboarding to certification (GlobalG.A.P. group path),
  digital-literacy workshops — often grant-funded (CEDA/NDB youth windows, NGOs).

### E. Data & insight products (only anonymised, only with consent)
- Aggregated, anonymised market-signal reports (what farmers ask/buy regionally) sold to
  development programmes — **never raw data, never PII**; opt-out honoured.

### F. Grants & partnerships (early cash)
- Youth-in-ag, climate adaptation (adaptation fund windows), digital agriculture & One Health
  programmes are natural funders for district deployments — the COMPLIANCE.md framework and
  channels story make proposals strong.

## 3. Stakeholder value matrix (who gains what)

| Stakeholder | Value from AgriSphere |
|---|---|
| Smallholder farmers | Free expert-style guidance, crop doctor, honest prices method, marketplace, offline PWA, local language |
| Women & youth | Inclusion-focused content, low-capital enterprise paths, co-op & funding pointers |
| Co-ops & producer groups | Group certification route, joint marketing, storefront, bulk-listing |
| Buyers & processors | Aggregation-ready listings, quality & safety signal, traceability guidance |
| Agro-dealers & input suppliers | Verified storefronts, informed customers (better input use), sponsored topics |
| Extension & veterinary services | Learning queue triage, amplified reach, One Health reporting links, analytics on farmer needs |
| Government & NGOs | Standards-aligned delivery channel, anonymised needs data, emergency notification path |
| Owner/orchestrator | Recurring licence + services income with ethical moat |

## 4. 90-day go-to-market checklist

1. **Deploy & verify** the public app on Render; merge to main; health endpoint green.
2. **Pilot partners (5–10):** 2 co-ops, 1 NGO, 1 input supplier, 1 buyers' association, 1
   district extension office — free 3-month pilots in exchange for testimonials & content.
3. **Activate Telegram** (zero-cost proof of multi-channel) + WhatsApp via Meta test number;
   open Meta business verification for a real number.
4. **Pricing validation** via pilot feedback; publish tier sheet.
5. **Landing + licence plumbing:** stripe-like payments (or manual invoicing at first),
   API keys for orgs (`/api/chat` already keyless — add per-tenant keys behind
   `ADMIN_TOKEN`/org model in a follow-up release).
6. **First paid contracts:** aim for 2 Starter + 1 Growth + 1 programme grant in 90 days.

## 5. Follow-on releases that unlock revenue (roadmap)

- Org accounts: API keys, usage metering, branded widget config.
- Approval-mode learning queue UI for enterprise ops.
- PWA push notifications (marketplace alerts, early-warning weather/pest).
- Marketplace categories → structured catalogue w/ photos & verification badges.
- Multilingual UI (Setswana first).

## 6. Track revenues (added with the three product lines)

| Track | Asset built | Who pays | Mechanism |
|---|---|---|---|
| Starter toolkit | `/biz.html` guided plan generator + living plan loop | Individual starters (small) & funders/trainers (large) | Free draft; Premium human plan review & bankable export (see templates/STARTER-PREMIUM-TERMS.md); co-op/group plans; train-the-trainer programmes |
| Buyer-led production | `/programs.html` structured programmes + playbooks + applications inbox | Buyers & programme operators | Fair-terms listing is free at launch to build liquidity; commercial tier later: featured programmes, application analytics, API orchestration; SLA template in docs/templates |
| Agri-tourism | `/tourism.html` experience catalogue + trip finder | Partners (farm stays, lodges, trusts, DMOs) | Free listings at launch; later: featured placements, lead fees, destination marketing contracts; listing-agreement template in docs/templates |

Sequencing: launch all three free (network effects), monetise commercial tiers once listings
and usage prove value — the free core for farmers never changes.

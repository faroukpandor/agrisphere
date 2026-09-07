# 🌍🌱 AgriSphere

**Automated, self-learning agricultural assistant & community marketplace** for farmers,
agripreneurs and the organisations that serve them — on the **Web (installable PWA)**,
**WhatsApp**, **Facebook Messenger** and **Telegram**, all sharing one brain and one memory.

AgriSphere is *provider-independent*: it runs on a deterministic, auditable retrieval engine
with **no AI vendor required** (an optional OpenAI-compatible LLM mode can be enabled by the
operator). It is built to international best practice & standards and universal ethics —
non-religious, no Arabic — while respecting users' own values (e.g. interest-free finance,
faith-based export certifications) where they choose them.

> ⚠️ **Honesty rule:** AgriSphere never invents prices, dosages or regulations; serious
> problems are always routed to extension officers, DAR Sebele, vets and emergency services.

---

## What it covers (73 knowledge topics + platform menus)

**🌾 All agricultural production systems** — field crops (maize, sorghum, cowpeas,
groundnuts, sunflower, sweet potato); horticulture (tomato, leafy veg/morogo, protected
cultivation & hydroponics); livestock (cattle & vet basics, feedlots, dairy, goats/sheep,
pigs, poultry); aquaculture (tilapia & catfish); beekeeping; agroforestry & fruit trees;
conservation agriculture; rangeland & pastoral systems; urban/backyard production;
integrated crop–livestock; oyster mushrooms.

**🌍 Natural resource management systems** — soil health & erosion control; water,
watersheds & borehole governance; wetlands & pans; forests & woodlands; wildlife
coexistence; pollinators & biodiversity; climate adaptation; solar farm energy.

**📜 Standards & markets** — food safety (Codex/HACCP-style GAP), export readiness &
certification (GlobalG.A.P., organic, fair-trade, faith-based certification pathways),
traceability, seed systems, post-harvest loss, BAMB marketing, honest trade ethics.

**🤝 People & finance** — responsible farm finance (incl. interest-free/risk-sharing &
mutual insurance options), cooperatives, women & youth, land tenure (FAO VGGT-aligned),
One Health, digital tools, value chains & aggregation, nutrition-sensitive farming.

Each topic lists the authoritative/peer-reviewed-style sources it is grounded in
(FAO, CABI, WOAH, Codex, GlobalG.A.P., IPCC, Ramsar, IUCN, One Health, CCARDESA, national
extension & veterinary services). See **docs/COMPLIANCE.md** for the full framework,
**docs/MONETISATION.md** for the ethical income model,
**docs/RESEARCH.md** for the global market intelligence, **docs/RESEARCH-2026-REFRESH.md** for the 2026 stakeholder/market refresh (EUDR, Temo Letlotlo, competitive landscape), **docs/STRATEGY.md** for the remodelling roadmap, **docs/AUDIT.md** for the enterprise & application audit, and **docs/COMPLIANCE.md §11** for the standards refresh, **docs/DEPLOY-RUNBOOK.md** for the deploy procedures, and **docs/GOVERNANCE-LOG.md** for decisions & review cadence, **docs/OFFER-EUDR-READINESS-2026.md** for the export-readiness pilot offer, and **docs/PILOT-OUTREACH-2026.md** for the pilot outreach pack (letters, LOI sheets, demo script). A public trust page with live engine facts is served at `/trust`, and the geo-trace (export-readiness) workspace is at `/geotrace.html`.

---

## ✨ Features

| Capability | How |
|---|---|
| 🧠 **Self-learning** | `teach: <question> → <answer>`; 👍/👎 ratings; unanswered-question learning queue with human review |
| 🩺 **Crop Doctor** | Symptom triage: “my maize leaves have yellow stripes” → likely cause + IPM control + escalation |
| 🚨 **Emergency & reporting** | People-first escalation (997/999/998), notifiable disease & wildlife protocols |
| 🌾 **Community marketplace** | Free listings board — produce, livestock, inputs, machinery, services, land, jobs (`/market.html`) |
| 📋 **Starter toolkit** | Guided plan generator (`/biz.html`): answers → draft business plan + budget ranges + action plan + funding routes — a living plan that beats static-PDF sellers |
| 🤝 **Buyer-led programmes** | Structured demand programmes (`/programs.html`) with fair-terms gate, farmer applications inbox, stage-gated production playbooks |
| 🧭 **Agri-tourism** | Partner experience catalogue + trip finder (`/tourism.html`): farm stays, market tours, festivals; listings & leads only — bookings with partners direct |
| 🤝 **Partner tracks** | `/partner.html` + contract templates for buyer MOUs, tourism listings, licensed deployments & premium plan review (`docs/templates/`) |
| ✅ **Verified badges** | Consent-first phone verification (OTP, `/account.html`); verified listings & applications carry the ✔ badge; organisations verified by humans via admin console |
| 💰 **Official price board** | `/prices.html` — admin-loaded bulletin references only (BAMB/BMC… with source+date+area); the bot quotes this board, never invents prices |
| 🏢 **Organisations** | Register a buyer/co-op/NGO/extension/insurer/input/media org → assets dashboard + one-show API key (hash-only storage) |
| 🔔 **Alerts** | Keyword price alerts + programme-update pings to WhatsApp/SMS/Telegram (dev-log until tokens set) |
| ⚙️ **Programme lifecycle** | Open → contracting → in-production → delivering → settled, with milestones, batch deliveries, dispute trail, settlement record and a printable **compliance readiness pack** (self-declared, not a certificate) |
| 📟 **USSD engine** | Standard gateway request/response (`/api/ussd` + `/ussd.html` simulator) — any phone can ask, check prices, programmes, marketplace |
| 👤 **Account hub** | `/account.html` — one browser identity across listings, applications, reviews, alerts & org |
| 🛡️ **Admin console** | `/admin.html` — learning queue, teach verified answers, load bulletins, verify organisations, moderation queue (flags/photos/feedback) |
| 🤝 **Co-op workspaces** | Org leaders add member accounts; member assets aggregate into workspace totals (consent + role scoping) |
| 🧭 **Insights (anonymised)** | `/api/insights` — aggregate-only stats & demand terms; no raw text, names or ids |
| 🤝 **Settlement statements** | Printable delivery manifest + settlement record per programme (`/api/programs/:id/settlement-statement`) — document layer only, never money handling |
| 📸 **Photo review queue** | 📷 camera button in chat sends field/plant photos to the human moderation queue (honest path: no AI-vision claims); delivery evidence photos land in compliance packs & statements |
| 📱 **Multi-channel** | Web + PWA, WhatsApp, Messenger, Telegram webhooks on one Express app |
| 🔌 **Provider-independent AI** | Deterministic retrieval by default; optional grounded LLM via any OpenAI-compatible API |
| 📲 **PWA / offline** | Installable; service worker caches the shell; works on low bandwidth |
| 🔐 **Governed learning** | Admin endpoints for learned lessons, unanswered queue, feedback; token-protected |
| 🛠 **Zero external services** | No database needed on free tier — JSON state; swap Redis on paid plans |

## 🚀 Deploy on Render (5 minutes)

1. Dashboard → **New + → Web Service** → connect `faroukpandor/agrisphere`.
2. **Build:** empty · **Start:** `npm start` · Instance: Free (spins down after ~15 min idle, wakes on request).
3. Optional env vars: `ADMIN_TOKEN`, `TEACH_TOKEN`, `VERIFY_TOKEN`, `OPENAI_API_KEY`,
   `WHATSAPP_TOKEN`+`WHATSAPP_PHONE_ID`, `FACEBOOK_PAGE_TOKEN`, `TELEGRAM_TOKEN`,
   `DATA_BACKEND` (`json` default | `sqlite` for org-grade persistence), `DATA_DIR`,
   `SMS_PROVIDER_URL` (production OTP delivery; without it preview prints codes to the log).
   `render.yaml` pins `NODE_ENV=production`, which also disables preview-OTP exposure.
4. Deploy → open `/healthz` → expect `{"status":"ok", ...}`.

> If an old service (e.g. `agrisphere-dnkb`) exists with failed/no deployments, recreate the
> service from the repo — a hostname with no live instance behind it shows the classic
> “site not working” empty-reply behaviour.

### Local development

```bash
npm install
npm start      # → http://localhost:3000  (chat UI + /market.html)
npm test       # 127 end-to-end assertions (smoke: chat, tracks, P0 platform layer, workspaces/insights/moderation/photos)
```

## 📱 Channel activation

- **Telegram (easiest):** BotFather → token env var → `setWebhook` to `/webhooks/telegram/<TOKEN>`.
- **WhatsApp:** Meta Cloud API test number or verified business number → webhook `/webhooks/whatsapp`.
- **Messenger:** Page + Meta app → token env var → subscribe → webhook `/webhooks/messenger`.
Without tokens all channel webhooks run in safe “dev echo” mode (verify + log) so you can
develop end-to-end before activating.

## 🔌 API surface

| Route | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | `{ message, sessionId?, name? }` → reply, buttons, engine, recordId |
| `/api/feedback` | POST | training signal `{ recordId, good }` |
| `/api/teach` | POST | programmatic lesson (token = `TEACH_TOKEN` if set) |
| `/api/history/:session` | GET | conversation context |
| `/api/marketplace/listings` | GET/POST | browse / post listings (delete + report by id) |
| `/api/programs` · `/api/programs/:id/applications` | GET/POST | buyer-led programmes: browse, post (fair-terms gate), apply, owner inbox |
| `/api/experiences` | GET/POST | agri-tourism catalogue: browse/filter, partner listings, report |
| `/api/bizplan/enterprises` · `/api/bizplan/generate` | GET/POST | starter toolkit: enterprise list + guided plan generation |
| `/api/admin/learned` · `/api/admin/unanswered` | GET | learning queue review (`ADMIN_TOKEN`) |
| `/api/identity/otp` · `/api/identity/verify` · `/api/identity/status` | POST/GET | phone OTP verification (headers: `x-owner-id`) |
| `/api/prices/references` | GET/POST/DELETE | official bulletin board (add/remove admin-only via `x-admin-token`) |
| `/api/ratings` | POST | `{targetType, targetId, byOwnerId, score 1–5}` (dedupe per rater) |
| `/api/ratings/:targetType/:targetId` · `/api/ratings/:id` | GET/DELETE | aggregates + moderation removal (admin) |
| `/api/orgs/register` · `/api/orgs/mine` · `/api/orgs/assets` | POST/GET | organisations + one-show API key; `x-owner-id` scoping |
| `/api/orgs` · `/api/orgs/:id/verify` | GET/POST | admin list & document-check verification |
| `/api/orgs/:id/members` · `/api/orgs/:id/members/:memberId` | POST/DELETE | co-op workspace membership (leader/admin) |
| `/api/insights` | GET | anonymised aggregates (no PII) |
| `/api/admin/moderation` | GET | flagged content, photo queue, feedback (admin) |
| `/api/programs/:id/settlement-statement` | GET | printable settlement statement (owner/applicant/admin) |
| `/api/photos` | POST | data-URL image → human review queue (`/uploads/*` served) |
| `/api/alerts` · `/api/alerts/subscribe` · `/api/alerts/:id` | GET/POST/DELETE | keyword alert subscriptions |
| `/api/notify/digest` | GET | admin digest summary |
| `/api/programs/:id/status` · `/milestones/:idx` · `/deliveries` · `/disputes` · `/disputes/:id/resolve` · `/settle` | POST | programme lifecycle engine (owner/admin) |
| `/api/programs/:id/compliance-pack` | GET | printable readiness pack (`?format=html`); owner, producer applicant or admin |
| `/api/ussd` | POST | USSD gateway `{sessionId, phoneNumber, text}` → `CON/END` text |
| `/webhooks/{whatsapp,messenger}` | GET/POST | Meta verification + inbound |
| `/webhooks/telegram/:secret` | POST | Telegram inbound |
| `/healthz` | GET | status: engine, channels, topics, marketplace, learned |

## 🗂 Structure

```
server.js            Express routes: chat, feedback, marketplace, programmes, tourism, bizplan, identity/OTP, prices, ratings, orgs, alerts, compliance pack, USSD, webhooks, admin
src/config.js        env-driven config (backend, OTP, SMS, org keys, …)
src/store.js         pluggable persistence: JSON (atomic) default or node:sqlite; sessions, learned, unanswered, listings, programmes, orgs, alerts, otps, priceRefs, ratings, stats
src/knowledge.js     merged knowledge core (triggers/entries + disclaimers)
src/topics-a/b/c.js  production / NRM / cattle & value-chain modules
src/topics-d.js      market-research module: extra crops, soil testing, hermetic storage, insurance, market calendar, agritourism, pesticide safety + platform menu triggers
src/brain.js         retrieval: Setswana v1 → teach → learned → triggers → scored KB → fallback queue
src/i18n.js          Setswana detection + noun→topic routing (v1, wrapper answers)
src/identity.js      OTP issue/verify (sha256, TTL, 5 attempts) → session verified badge
src/prices.js        official bulletin references (source+date required, admin add)
src/ratings.js       1–5 ratings, dedupe per target+rater, admin removal
src/orgs.js          org registration (buyer/coop/ngo/extension/insurer/input/media), one-show API keys (hash-only), owner scoping, admin verify
src/notify.js        alert subscriptions + outbound (WhatsApp/Telegram/SMS when configured, else dev-log)
src/compliance.js    delivery-readiness pack builder + HTML renderer (self-declared)
src/ussd.js          session menu engine (CON/END, 158-char limit, pending map)
src/marketplace.js   listings board logic (30-day TTL, category model, reporting)
src/channels.js      WhatsApp/Messenger/Telegram adapters
src/llm.js           optional grounded LLM (OpenAI-compatible, off by default)
src/store.js         JSON persistence (sessions, learned, feedback, unanswered, listings, stats)
public/              chat UI + track pages (biz/programs/tourism/partner) + market + prices board + account & orgs + USSD simulator + admin console + PWA
src/programs.js      buyer-led programme logic (fair-terms gate, playbooks)
src/experiences.js   agri-tourism catalogue logic
src/bizplan.js       guided business-plan generator
docs/COMPLIANCE.md   ethics, standards & compliance framework
docs/MONETISATION.md recurring income & stakeholder-value playbook
docs/RESEARCH.md     global/continental/regional/local market intelligence (with sources)
docs/STRATEGY.md     remodelling & refactor blueprint, competitive scorecard, income architecture
docs/templates/      contract/partner templates (MOU, tourism, SLA, premium terms)
test/smoke.js        end-to-end assertions
render.yaml          optional blueprint
```

## 🧪 Test

```bash
npm test
```
Covers: health, UI shell, intents & KB routing across all domains (crops, crop-doctor,
production systems, NRM, standards, finance, ethics, people), teach/recall self-learning,
unanswered queue, feedback, marketplace CRUD + report, PWA manifest/service-worker/icons,
and webhook security for all three channels.

## 📊 Market research & strategy
Read the evidence: [docs/RESEARCH.md](docs/RESEARCH.md) (global → continental → SADC → Botswana: buyers, producers, competitors, brokers, gaps) and [docs/STRATEGY.md](docs/STRATEGY.md) (remodelling priorities, competitive scorecard, fair income architecture).

## 🤝 Stakeholders & income

Free for farmers. Ethical revenue: licensed API/white-label chatbot services for
organisations, verified marketplace storefronts, labelled sponsored topics, professional
channel/certification services, anonymised market-signal reports, and development-programme
partnerships — full playbook in **docs/MONETISATION.md**. Rules: no selling data, no
pay-to-play answers, no ads that distort advice.

## 📄 License

GPL-3.0. Built for Botswana farmers 🇧🇼 — contributions, knowledge topics and
extension-officer reviews welcome via GitHub issues/PRs.

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

## What it covers (84 knowledge units today)

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
extension & veterinary services). See **docs/COMPLIANCE.md** for the full framework and
**docs/MONETISATION.md** for the ethical income model.

---

## ✨ Features

| Capability | How |
|---|---|
| 🧠 **Self-learning** | `teach: <question> → <answer>`; 👍/👎 ratings; unanswered-question learning queue with human review |
| 🩺 **Crop Doctor** | Symptom triage: “my maize leaves have yellow stripes” → likely cause + IPM control + escalation |
| 🚨 **Emergency & reporting** | People-first escalation (997/999/998), notifiable disease & wildlife protocols |
| 🌾 **Community marketplace** | Free listings board — produce, livestock, inputs, machinery, services, land, jobs (`/market.html`) |
| 📱 **Multi-channel** | Web + PWA, WhatsApp, Messenger, Telegram webhooks on one Express app |
| 🔌 **Provider-independent AI** | Deterministic retrieval by default; optional grounded LLM via any OpenAI-compatible API |
| 📲 **PWA / offline** | Installable; service worker caches the shell; works on low bandwidth |
| 🔐 **Governed learning** | Admin endpoints for learned lessons, unanswered queue, feedback; token-protected |
| 🛠 **Zero external services** | No database needed on free tier — JSON state; swap Redis on paid plans |

## 🚀 Deploy on Render (5 minutes)

1. Dashboard → **New + → Web Service** → connect `faroukpandor/agrisphere`.
2. **Build:** empty · **Start:** `npm start` · Instance: Free (spins down after ~15 min idle, wakes on request).
3. Optional env vars: `ADMIN_TOKEN`, `TEACH_TOKEN`, `VERIFY_TOKEN`, `OPENAI_API_KEY`,
   `WHATSAPP_TOKEN`+`WHATSAPP_PHONE_ID`, `FACEBOOK_PAGE_TOKEN`, `TELEGRAM_TOKEN`.
4. Deploy → open `/healthz` → expect `{"status":"ok", ...}`.

> If an old service (e.g. `agrisphere-dnkb`) exists with failed/no deployments, recreate the
> service from the repo — a hostname with no live instance behind it shows the classic
> “site not working” empty-reply behaviour.

### Local development

```bash
npm install
npm start      # → http://localhost:3000  (chat UI + /market.html)
npm test       # 30+ end-to-end assertions
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
| `/api/admin/learned` · `/api/admin/unanswered` | GET | learning queue review (`ADMIN_TOKEN`) |
| `/webhooks/{whatsapp,messenger}` | GET/POST | Meta verification + inbound |
| `/webhooks/telegram/:secret` | POST | Telegram inbound |
| `/healthz` | GET | status: engine, channels, topics, marketplace, learned |

## 🗂 Structure

```
server.js            Express routes: chat, feedback, marketplace, webhooks, admin
src/config.js        env-driven config
src/knowledge.js     merged knowledge core (triggers/entries + disclaimers)
src/topics-a.js      production systems module
src/topics-b.js      NRM + standards + finance/ethics + people + platform triggers
src/topics-c.js      cattle systems, more crops, land, value chains
src/brain.js         retrieval: teach → learned → triggers → scored KB → fallback queue
src/marketplace.js   listings board logic (30-day TTL, category model, reporting)
src/channels.js      WhatsApp/Messenger/Telegram adapters
src/llm.js           optional grounded LLM (OpenAI-compatible, off by default)
src/store.js         JSON persistence (sessions, learned, feedback, unanswered, listings, stats)
public/              chat UI + marketplace + PWA (manifest, sw, icons)
docs/COMPLIANCE.md   ethics, standards & compliance framework
docs/MONETISATION.md recurring income & stakeholder-value playbook
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

## 🤝 Stakeholders & income

Free for farmers. Ethical revenue: licensed API/white-label chatbot services for
organisations, verified marketplace storefronts, labelled sponsored topics, professional
channel/certification services, anonymised market-signal reports, and development-programme
partnerships — full playbook in **docs/MONETISATION.md**. Rules: no selling data, no
pay-to-play answers, no ads that distort advice.

## 📄 License

GPL-3.0. Built for Botswana farmers 🇧🇼 — contributions, knowledge topics and
extension-officer reviews welcome via GitHub issues/PRs.

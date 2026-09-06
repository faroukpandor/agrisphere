# 🌍🌱 AgriSphere

**AgriSphere** is an automated, **self-learning agricultural assistant** built for farmers and
agripreneurs — available on the **Web**, **WhatsApp**, **Facebook Messenger** and **Telegram**,
all sharing one brain and one memory.

It answers questions about crops (maize, sorghum, cowpeas, groundnuts, tomatoes, leafy
vegetables…), acts as a **Crop Doctor** for pest & disease problems, points farmers to
authoritative market-price sources (BAMB bulletins), and shares selling, livestock and
agribusiness guidance — with honest, Botswana-flavoured, extension-service advice.

> ⚠️ **Important:** AgriSphere gives general guidance, **never** fabricated prices or dosages,
> and always directs serious problems to extension officers, DAR Sebele and veterinarians.

---

## ✨ What it does

| Capability | How |
|---|---|
| 🧠 **Self-learning** | `teach: <question> → <answer>` stores a lesson permanently; 👍/👎 ratings and unanswered questions build a training queue for review. |
| 🩺 **Crop Doctor** | Describe symptoms (“my maize leaves have yellow stripes”) → likely causes + practical IPM control. |
| 🌽 **Production guides** | Planting, spacing, seed rates, fertiliser, harvest & storage for 19 topics. |
| 💰 **Prices & markets** | Teaches the *method*: BAMB depot bulletins, grading, where to sell — no invented numbers. |
| 📱 **Multi-channel** | One Express app serves the Web UI + webhooks for WhatsApp, Messenger, Telegram. |
| 🔌 **Optional LLM mode** | Bring your own OpenAI-compatible key for grounded, knowledge-based replies (off by default). |
| 🛠 **Zero external services** | No database required on the free tier — state persists to local JSON (swap in Redis on paid plans). |

---

## 🚀 Deploy on Render (5 minutes)

This repository is designed for a **Render Web Service**:

1. **Dashboard** → **New +** → **Web Service** → connect the `faroukpandor/agrisphere` repo.
2. Settings:
   - **Build Command:** *(leave empty)* — there is nothing to compile.
   - **Start Command:** `npm start`
   - **Instance type:** Free (spins down after ~15 min idle; wakes on request).
3. Add these **Environment Variables** (all optional except none — it runs with zero config):
   | Variable | Purpose |
   |---|---|
   | `ADMIN_TOKEN` | Protect `/api/admin/*` endpoints. |
   | `TEACH_TOKEN` | Protect the programmatic `/api/teach` endpoint. |
   | `OPENAI_API_KEY` | Enable grounded LLM drafting (also `OPENAI_MODEL`, `OPENAI_BASE_URL`). |
   | `VERIFY_TOKEN` | Webhook verify token for WhatsApp/Messenger (default exists — change it). |
   | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | Activate WhatsApp outbound. |
   | `FACEBOOK_PAGE_TOKEN` | Activate Messenger outbound. |
   | `TELEGRAM_TOKEN` | Activate Telegram outbound. |
4. **Deploy.** After the first successful deploy, open `https://<your-app>.onrender.com/healthz` — you should see JSON `{ "status": "ok", ... }`.

> If an old service named `agrisphere-dnkb` exists on your dashboard with failed/no
> deployments: click it, then **Settings → delete and redeploy**, or simply create a fresh
> Web Service from the repo — the old hostname may keep failing until the service is
> recreated (a hostname with no live instance behind it shows exactly the “site not
> working” behaviour you saw).

### Local development

```bash
npm install
npm start          # → http://localhost:3000
# or
npm run dev        # auto-restart on changes (node --watch)
```

## 📱 Activating the chat channels

The web chat is live automatically at the app URL. The three messenger adapters are already
coded — they need one-time platform setup:

### Telegram (easiest)
1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → get your `TELEGRAM_TOKEN`.
2. Set `TELEGRAM_TOKEN` env var on Render and redeploy.
3. Tell Telegram where your app lives:
   `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-app>.onrender.com/webhooks/telegram/<TOKEN>"`
4. Message your bot — it replies. 🎉

### WhatsApp (Meta Cloud API)
1. Go to developers.facebook.com → **WhatsApp** → create an app → get `WHATSAPP_PHONE_ID` (test number) + `WHATSAPP_TOKEN`.
2. Set env vars + your service URL as the webhook: `https://<your-app>.onrender.com/webhooks/whatsapp`, verify token = `VERIFY_TOKEN`, subscribe to `messages`.
3. A public phone number requires Meta **business verification** — until then the bot works with the test number in dev-echo mode.

### Facebook Messenger
1. Create a Facebook **Page** + **Meta app**, connect the Page, get `FACEBOOK_PAGE_TOKEN`.
2. Set env var, then subscribe: `curl -X POST "https://graph.facebook.com/v21.0/me/subscribed_apps?access_token=<PAGE_TOKEN>&subscribed_fields=messages"`
3. Webhook URL: `https://<your-app>.onrender.com/webhooks/messenger`, verify token = `VERIFY_TOKEN`.

## 🧪 Test it

```bash
npm test     # runs test/smoke.js against a live local server
```

Manual: open the web UI → type `help`, then `teach: price of cabbages at Gaborone? → about P25 per head at Main Mall` and ask the same question again.

## 🔌 API

| Route | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | `{ message, sessionId?, name? }` → `{ reply, buttons, engine, recordId }` |
| `/api/feedback` | POST | `{ recordId, good, comment? }` — training signal |
| `/api/teach` | POST | `{ question, answer, token? }` (token = `TEACH_TOKEN` if set) |
| `/api/admin/learned` | GET | All farmer-taught lessons (`ADMIN_TOKEN` header or `?token=`) |
| `/api/admin/unanswered` | GET | The learning queue — questions the bot couldn't answer |
| `/webhooks/whatsapp` | GET/POST | Meta Cloud API webhook |
| `/webhooks/messenger` | GET/POST | Messenger webhook |
| `/webhooks/telegram/:secret` | POST | Telegram webhook (`:secret` = your `TELEGRAM_TOKEN`) |

## 🗂 Project structure

```
server.js          Express app + routes + webhook wiring
src/config.js      env-driven configuration
src/store.js       JSON persistence (sessions, learned, feedback, unanswered, stats)
src/knowledge.js   Seed knowledge base (19 topics, 14 intents) + content disclaimers
src/brain.js       Retrieval engine: teach-priority → triggers → scored KB → fallback queue
src/llm.js         Optional grounded LLM drafting (OpenAI-compatible)
src/channels.js    Channel parsers/senders (web, WhatsApp, Messenger, Telegram)
public/            Web chat UI (index.html, styles.css, app.js)
test/smoke.js      End-to-end smoke tests
data/              Runtime self-learning state (auto-created, git-ignored)
```

## 📄 License

GPL-3.0 — see [LICENSE](LICENSE). Built for Botswana farmers 🇧🇼; contributions, new
knowledge topics and extension-officer reviews are very welcome via GitHub issues/PRs.

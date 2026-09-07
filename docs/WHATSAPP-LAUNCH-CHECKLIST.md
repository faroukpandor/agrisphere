# WhatsApp Test-Number Launch Checklist (R1 activation)

> Purpose: get the **Meta test number** talking to AgriSphere's webhook
> (`/webhooks/whatsapp`) so a real phone can demo the assistant on
> WhatsApp — the Day 1–30 milestone in STRATEGY §9. Test numbers are for
> development/demo: they can message a small fixed set of recipients and
> are not for production traffic. A production WhatsApp Business number is
> a separate step (see §9).
>
> You will need: admin access to a Meta Business Portfolio (or create one)
> and the ability to set environment variables on the deployed instance
> (Render dashboard). Steps follow Meta's Cloud API flow; exact dashboard
> labels can change — where they differ, follow the official docs links
> at the end rather than guessing.

## 0. Honest pre-flight
- Without these credentials, `healthz` shows `channels.whatsapp: false`
  and the bot works on Web/USSD/Telegram(dev) only. That is by design and
  is displayed honestly everywhere.
- This checklist activates the **test number demo** — not the production
  channel. Treat test-number limitations (§8) as features, not bugs.

## 1. Meta prerequisites (owner action, ~1–2 hours)
1. [ ] Create/confirm a **Meta Business Portfolio** at business.facebook.com
   (portfolio name: `[e.g. AgriSphere]`).
2. [ ] Create a **Meta app** (developers.facebook.com → My Apps → Create
   App → type **Business**) with a contact email.
3. [ ] Add the **WhatsApp** product to the app (Dashboard → Add Product).
4. [ ] Link the app to the Business Portfolio; add yourself with admin role.

## 2. Get the test number
1. [ ] WhatsApp → **API Setup**: choose a test number from the dropdown
   (format `+1 …` — test numbers are US-format regardless of your market;
   fine for the demo).
2. [ ] Copy the **Temporary access token** (valid ~24 h — during active
   development; for a demo day, generate it that day) and the **Phone
   number ID** and **WhatsApp Business Account (WABA) ID**.
3. [ ] Recipients: a test number can message up to **5 recipient phone
   numbers** you verify in the dashboard (add your own + the pilot
   lead's). Any phone can *message in* to the number via the WhatsApp
   app.

## 3. Configure the instance (Render / server env vars)
Set on the deployed instance (Render → Environment; never in the repo):

| Variable | Value |
|---|---|
| `WHATSAPP_TOKEN` | the temporary (or permanent) access token |
| `WHATSAPP_PHONE_ID` | Phone Number ID from §2 |
| `VERIFY_TOKEN` | any long random string you choose (must match §4 exactly) |
| `TELEGRAM_TOKEN` | optional — same webhook pattern, for the Telegram demo |

1. [ ] After saving, **restart/deploy** the service and confirm in logs:
   `Channels: whatsapp=true …`.
2. [ ] Confirm `curl https://<your-service>.onrender.com/healthz` shows
   `"whatsapp": true`.

## 4. Point Meta at the webhook
1. [ ] WhatsApp → **Configuration → Webhook**: click **Edit**.
2. [ ] Callback URL:
   `https://<your-service>.onrender.com/webhooks/whatsapp`
   (the platform must be reachable from the public internet — the live
   Render instance, not localhost).
3. [ ] Verify token: the same `VERIFY_TOKEN` string from §3.
4. [ ] Click **Verify and save** — AgriSphere answers Meta's
   `hub.challenge` handshake on `GET /webhooks/whatsapp`.
   If verification fails: check the token is identical, the service is up
   (`/healthz` 200), and there is no proxy stripping the query string.
5. [ ] Under **Webhook fields**, subscribe to at least: `messages`.
   (`message_template_status_update` is useful later.)

## 5. First end-to-end test
1. [ ] From the dashboard, **send a test message** to one of your 5
   recipient numbers (or message the test number from that phone first).
2. [ ] Send "hello" from the phone → expect the AgriSphere greeting within
   seconds.
3. [ ] Ask a crop question → knowledge-base answer; ask the same question
   again after a `teach:` instruction → learned recall (self-learning
   demo).
4. [ ] Confirm the session appears in `/healthz` (`sessions`, `msgs`
   counters move) and messages persist after a restart (durable disk).
5. [ ] Check `store` stats and the unanswered queue via the admin console
   — the honest learning loop is visible end to end.

## 6. Business-initiated messages (templates)
- Replies inside the 24-hour customer-service window need **no template**.
- Outside that window (e.g. alert digests, price notifications from the
  notify bus) WhatsApp requires an **approved message template**:
  1. [ ] WhatsApp → **Message templates** → Create: name
     `agrisphere_alert`, category **Utility**/Marketing as applicable,
     body e.g. `Hi {{1}}, AgriSphere: {{2}}` — keep it plain and honest
     (no price promise, no guarantee wording).
  2. [ ] Submit for review (can take hours–days; plan the demo day around
     it). Approved templates only for proactive messages.
- Until templates are approved, the demo is **user-initiated**: farmers
  message first, the bot answers freely — which is the actual pilot
  pattern anyway.

## 7. Demo-day script (WhatsApp version)
1. Phone → WhatsApp → send "Dumela" (or "hello") to the test number.
2. Ask: *"how do I plant maize?"* → crop guide; *"my maize has yellow
   stripes"* → streak triage with the honest escalation line.
3. *"teach: what is the Gaborone ARC phone? → 390 1234 (example)"* then ask
   it again → learned recall (self-learning, live).
4. *"show me prices"* → references from official bulletins (seed §8 of
   DEPLOY-RUNBOOK first so the board is not empty).
5. Close: *"what can you not do?"* → the bot answers honestly (no photo
   diagnosis, no money handling) — that answer is the pitch.

## 8. Test-number limitations (know them before the demo)
- Messages to more than the 5 verified recipient numbers will fail.
- The temporary access token expires (~24 h) — regenerate before each
  demo day; the number/phone ID stay stable.
- Test numbers are not for production: rate limits and the "test" label
  apply. Launching for real farmers requires a production number (§9).

## 9. Production number path (later milestone, not this checklist)
1. Own a Botswana phone number or buy a virtual number that Meta supports
   for WhatsApp Business in Botswana.
2. WhatsApp → **Phone numbers → Add**: register it (SMS/voice code),
   set the display name, and complete **business verification** when the
   dashboard asks (entity documents — ties to the entity step).
3. Move the same webhook config to the production number; keep the test
   number for staging.
4. Update `healthz` expectations and the pilot documentation.

## 10. Official references (check these, not third-party blogs)
- Meta WhatsApp Cloud API docs: developers.facebook.com → WhatsApp
- Webhook setup guide & verification handshake (same docs, "Webhooks")
- Message templates guide & category rules (same docs, "Message templates")
- If the dashboard contradicts this checklist, the official docs win;
  log the difference in the governance log so this file stays current.

## 11. Owner checklist before the first demo
- [ ] Entity/business documents ready (Meta business verification asks
  for them at various steps).
- [ ] Deployed instance running per DEPLOY-RUNBOOK (durable disk).
- [ ] Pilot partner's phone among the 5 recipients.
- [ ] Prices seeded from official bulletins (§6 runbook / seeding pack).
- [ ] Governance-log entry after the demo: what worked, what did not.

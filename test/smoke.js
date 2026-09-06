'use strict';

/**
 * AgriSphere smoke test — boots the app on an ephemeral port and exercises
 * the core promise: self-learning chat over every surface.
 */

const assert = require('assert');

process.env.PORT = process.env.PORT || '3911';
process.env.DATA_DIR = process.env.DATA_DIR || '.smoke-data';
process.env.VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'smoke-verify';
process.env.TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || 'smoke-tg-token';

const fs = require('fs');
try { fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true }); } catch (_) {}

const server = require('../server');
const base = `http://127.0.0.1:${process.env.PORT}`;

const sid = 'smoke-session-1';
async function chat(message, name) {
  const r = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: sid, name }),
  });
  assert.strictEqual(r.status, 200, 'chat should be 200');
  return r.json();
}

(async () => {
  const results = [];
  const check = (label, cond, extra = '') => {
    assert.ok(cond, `${label}${extra ? ' — ' + extra : ''}`);
    results.push(`✓ ${label}`);
  };

  // 1. healthz
  const health = await (await fetch(`${base}/healthz`)).json();
  check('healthz ok', health.status === 'ok');

  // 2. static UI served
  const ui = await fetch(`${base}/`);
  const uiText = await ui.text();
  check('web UI served', ui.status === 200 && uiText.includes('AgriSphere'));

  // 3. greeting trigger
  let r = await chat('hello', 'Modise');
  check('greeting intent', r.engine === 'local' && /Dumela/i.test(r.reply), r.reply.slice(0, 60));
  check('greeting buttons', Array.isArray(r.buttons) && r.buttons.length > 0);

  // 4. KB scoring — crop guide
  r = await chat('how do I plant maize in Botswana?');
  check('maize KB hit', r.entryId === 'crop-maize', JSON.stringify({ entryId: r.entryId, engine: r.engine }));

  // 5. KB scoring — disease with symptom boost
  r = await chat('my maize leaves have yellow stripes');
  check('streak disease hit', r.entryId === 'disease-maize-streak', JSON.stringify({ entryId: r.entryId, reply: r.reply.slice(0, 50) }));

  // 6. pest query
  r = await chat('what is eating my tomato leaves with tunnels?');
  check('tuta hit', r.entryId === 'pest-tuta', JSON.stringify({ entryId: r.entryId }));

  // 7. prices honesty
  r = await chat('maize price today');
  check('market hit', r.entryId === 'market-bamb', JSON.stringify({ entryId: r.entryId }));

  // 8. teach directive → learned memory wins afterwards
  r = await chat('teach: what is the phone number of Gaborone ARC? → 390 1234 (example, verify locally)');
  check('teach accepted', r.engine === 'teach');
  r = await chat('what is the phone number of Gaborone ARC?');
  check('learned recall', r.engine === 'learned' && /390 1234/.test(r.reply), JSON.stringify({ engine: r.engine }));

  // 9. unknown → queued, not fabricated
  r = await chat('what is the lunar planting calendar for kgatleng?');
  check('unknown queued', r.engine === 'fallback' || r.engine === 'llm');
  const admin = await (await fetch(`${base}/api/admin/unanswered`)).json();
  check('unanswered recorded', admin.unanswered.some((u) => /lunar/.test(u.text)));

  // 10. feedback
  const fb = await (await fetch(`${base}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recordId: 'smoke-1', good: true, sessionId: sid }),
  })).json();
  check('feedback stored', fb.ok === true);

  // 11. webhook verifications
  const waVerify = await fetch(`${base}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=smoke-verify&hub.challenge=ch123`);
  check('whatsapp verify challenge', waVerify.status === 200 && (await waVerify.text()) === 'ch123');
  const waBad = await fetch(`${base}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=x`);
  check('whatsapp bad token rejected', waBad.status === 403);
  const mgVerify = await fetch(`${base}/webhooks/messenger?hub.mode=subscribe&hub.verify_token=smoke-verify&hub.challenge=ch456`);
  check('messenger verify challenge', mgVerify.status === 200 && (await mgVerify.text()) === 'ch456');

  // 12. whatsapp inbound text → dev echo (no tokens) & reply produced
  const waMsg = await fetch(`${base}/webhooks/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{ id: '1', changes: [{ value: { messaging_product: 'whatsapp', messages: [{ from: '26770000000', type: 'text', text: { body: 'sorghum spacing' } }] }, field: 'messages' }] }],
    }),
  });
  check('whatsapp ingest 200', waMsg.status === 200);

  // 13. messenger postback
  const mgMsg = await fetch(`${base}/webhooks/messenger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ object: 'page', entry: [{ id: '1', messaging: [{ sender: { id: 'psid1' }, recipient: { id: 'page1' }, postback: { payload: 'help' } }] }] }),
  });
  check('messenger ingest 200', mgMsg.status === 200);

  // 14. telegram inbound (secret must match TELEGRAM_TOKEN)
  const tgMsg = await fetch(`${base}/webhooks/telegram/smoke-tg-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ update_id: 1, message: { message_id: 1, chat: { id: 12345, first_name: 'Kefentse' }, from: { id: 12345, first_name: 'Kefentse' }, text: 'dumela' } }),
  });
  check('telegram ingest 200', tgMsg.status === 200);
  const tgBad = await fetch(`${base}/webhooks/telegram/wrong-secret`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  check('telegram wrong secret rejected', tgBad.status === 403);

  // 15. history persisted
  const hist = await (await fetch(`${base}/api/history/${sid}`)).json();
  check('history stored', Array.isArray(hist.history) && hist.history.length >= 4, `len=${hist.history.length}`);

  console.log('\nAll smoke tests passed:\n' + results.join('\n'));
  server.close(() => process.exit(0));
})().catch((err) => {
  console.error('\nSMOKE TEST FAILED:', err.message);
  server.close(() => process.exit(1));
});

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

  // 9. extended domain coverage (production, NRM, standards, finance, people)
  const routes = [
    ['how to start a piggery', 'prod-pigs'],
    ['how to start poultry farming', 'prod-poultry'],
    ['beekeeping for honey income', 'prod-beekeeping'],
    ['digging a fish pond for tilapia', 'prod-aquaculture'],
    ['my field is eroding into gullies', 'nrm-soil'],
    ['can i farm near wetlands', 'nrm-wetlands'],
    ['elephants keep raiding my crops', 'nrm-wildlife'],
    ['how do i export vegetables', 'quality-export'],
    ['how to stop post harvest losses', 'quality-postharvest'],
    ['interest free finance for farmers', 'finance-responsible'],
    ['should we start a cooperative', 'people-coops'],
    ['what are the five freedoms', 'welfare-animals'],
    ['how do i look after dairy cows', 'cattle-dairy'],
  ];
  for (const [q, want] of routes) {
    r = await chat(q);
    check(`route: ${q} → ${want}`, r.entryId === want && r.engine === 'local', JSON.stringify({ got: r.entryId }));
  }

  // 10. platform transparency triggers
  r = await chat('how does agrisphere make money?');
  check('monetisation trigger', r.entryId === 'monetisation');
  r = await chat('is agrisphere compliant with ethics?');
  check('compliance trigger', r.entryId === 'compliance');

  // 11. unknown → queued, not fabricated
  r = await chat('what is the lunar planting calendar for kgatleng?');
  check('unknown queued', r.engine === 'fallback' || r.engine === 'llm');
  const admin = await (await fetch(`${base}/api/admin/unanswered`)).json();
  check('unanswered recorded', admin.unanswered.some((u) => /lunar/.test(u.text)));

  // 12. feedback
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

  // 16. marketplace CRUD + reporting
  const post1 = await (await fetch(`${base}/api/marketplace/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'produce', title: '2 t maize grade A', price: 'P3,100/t', location: 'Mahalapye', contact: '71234567', ownerId: 'owner-1' }),
  })).json();
  check('marketplace create', post1.listing && post1.listing.id, JSON.stringify(post1));
  const ml = await (await fetch(`${base}/api/marketplace/listings?category=produce`)).json();
  check('marketplace list', ml.listings.length >= 1 && ml.listings[0].title.includes('maize'));
  const del = await (await fetch(`${base}/api/marketplace/listings/${post1.listing.id}`, {
    method: 'DELETE', headers: { 'x-owner-id': 'owner-1' },
  })).json();
  check('marketplace delete (owner)', del.ok === true);
  const post2 = await (await fetch(`${base}/api/marketplace/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'services', title: 'spraying service', contact: '70000000', ownerId: 'owner-2' }),
  })).json();
  const delDenied = await (await fetch(`${base}/api/marketplace/listings/${post2.listing.id}`, {
    method: 'DELETE', headers: { 'x-owner-id': 'owner-1' },
  })).json();
  check('marketplace delete denied to others', delDenied.error === 'not allowed');
  const rep = await (await fetch(`${base}/api/marketplace/listings/${post2.listing.id}/report`, { method: 'POST' })).json();
  check('marketplace report', rep.ok === true);

  // 17. three tracks: triggers
  r = await chat('I need to write my business plan');
  check('starter trigger reachable', ['bizplan-menu', 'agribusiness'].includes(r.entryId), 'entry=' + r.entryId);
  r = await chat('business plan');
  check('business plan exact hits starter menu', r.entryId === 'bizplan-menu');
  r = await chat('buyer led production programmes');
  check('programmes trigger', r.entryId === 'programs-menu');
  r = await chat('agri tourism experiences');
  check('tourism trigger', r.entryId === 'tourism-menu');
  r = await chat('agritourism experiences');
  check('agritourism single-word routes', r.entryId === 'tourism-menu');

  // 18. starter business plan generator
  const bp = await (await fetch(`${base}/api/bizplan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
    body: JSON.stringify({ name: 'Testo', location: 'Mahalapye', enterprise: 'poultry', landHa: '', budget: '50000', water: 'borehole', market: 'local butchery + restaurants' }),
  })).json();
  check('bizplan generated', bp.enterprise.key === 'poultry' && bp.sections.length >= 5);
  check('bizplan honest disclaimer', /not financial or legal advice/i.test(bp.disclaimer));
  check('bizplan sections', bp.sections.some((s) => /Executive summary/.test(s.h)) && bp.sections.some((s) => /Funding routes/.test(s.h)));

  // 19. buyer-led programmes CRUD + fair-terms gate + application inbox
  const noFair = await (await fetch(`${base}/api/programs`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgName: 'Bad Buyer', title: 'cheap maize', product: 'maize', contact: '1' }),
  })).json();
  check('programme fair-terms gate', !!noFair.error && /fair-terms/i.test(noFair.error));
  const prog = await (await fetch(`${base}/api/programs`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgName: 'Kgale Milling', title: '2027 maize demand', product: 'maize', volume: '40 t', qualitySpecs: 'moisture <=12.5%', priceFormula: 'BAMB week price + P150/t bonus', advancePct: '30% advance', deliveryWindow: 'Feb-Mar 2027', locations: 'Mahalapye/Palapye', contact: 'buyer@example.com', fairTerms: ['confirmed'], ownerId: 'buyer-1' }),
  })).json();
  check('programme created', !!prog.program && prog.program.applicationsCount === 0, JSON.stringify(prog));
  const progId = prog.program.id;
  const app = await (await fetch(`${base}/api/programs/${progId}/applications`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-owner-id': 'farmer-1' },
    body: JSON.stringify({ name: 'Neo Farm', location: 'Palapye', capacity: '10 ha maize', contact: '71111111' }),
  })).json();
  check('farmer applied', app.ok === true);
  const inbox = await (await fetch(`${base}/api/programs/${progId}/applications`, { headers: { 'x-owner-id': 'buyer-1' } })).json();
  check('buyer sees applications', inbox.applications.length === 1 && inbox.applications[0].name === 'Neo Farm');
  const inboxDenied = await (await fetch(`${base}/api/programs/${progId}/applications`, { headers: { 'x-owner-id': 'intruder' } })).json();
  check('applications protected', inboxDenied.error === 'not allowed');
  const pb = await (await fetch(`${base}/api/programs/${progId}`)).json();
  check('playbook for maize', pb.playbook.stages.length >= 5 && pb.playbook.stages[0][0].toLowerCase().includes('contract'));

  // 20. agri-tourism experiences
  const exp = await (await fetch(`${base}/api/experiences`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partner: 'Morula Farm Stay', title: 'Weekend farm stay', type: 'farm-stay', location: 'Maun', priceRange: 'P850/night', contact: '72222222', ownerId: 'partner-1', description: 'milking demo, guided walk' }),
  })).json();
  check('experience created', !!exp.experience);
  const exps = await (await fetch(`${base}/api/experiences?type=farm-stay&location=maun`)).json();
  check('experience filter', exps.experiences.some((e) => e.partner === 'Morula Farm Stay'));
  const expRep = await (await fetch(`${base}/api/experiences/${exp.experience.id}/report`, { method: 'POST' })).json();
  check('experience report', expRep.ok === true);

  // 21. track pages served
  for (const page of ['/biz.html', '/programs.html', '/tourism.html', '/partner.html']) {
    const pr = await fetch(base + page);
    check('page ' + page, pr.status === 200 && (await pr.text()).includes('AgriSphere'));
  }

  // 22. PWA assets
  const manifest = await (await fetch(`${base}/manifest.webmanifest`)).json();
  check('manifest served', manifest.name && manifest.display === 'standalone' && manifest.icons.length >= 3);
  const sw = await (await fetch(`${base}/sw.js`)).text();
  check('service worker served', sw.includes('agrisphere-v1'));
  for (const icon of ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-64.png']) {
    const ir = await fetch(base + icon);
    const ib = Buffer.from(await ir.arrayBuffer());
    check('icon png ' + icon, ir.status === 200 && ib[0] === 0x89 && ib[1] === 0x50);
  }
  const market = await (await fetch(`${base}/market.html`)).text();
  check('marketplace page served', market.includes('AgriSphere'));

  // 18. history persisted
  const hist = await (await fetch(`${base}/api/history/${sid}`)).json();
  check('history stored', Array.isArray(hist.history) && hist.history.length >= 4, `len=${hist.history.length}`);

  console.log('\nAll smoke tests passed:\n' + results.join('\n'));
  server.close(() => process.exit(0));
})().catch((err) => {
  console.error('\nSMOKE TEST FAILED:', err.message);
  server.close(() => process.exit(1));
});

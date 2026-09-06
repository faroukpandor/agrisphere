/* AgriSphere buyer-led programmes client */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const OWNER_KEY = 'agrisphere.orgId.v1';
  const ownerId = localStorage.getItem(OWNER_KEY) || (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  localStorage.setItem(OWNER_KEY, ownerId);

  const grid = $('programs');
  const box = $('postBox');

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function timeAgo(ts) {
    const d = Math.round((Date.now() - ts) / 86400000);
    return d < 1 ? 'today' : d + ' d ago';
  }

  async function load() {
    try {
      const q = $('progQ').value.trim();
      const resp = await fetch('/api/programs' + (q ? '?q=' + encodeURIComponent(q) : ''));
      const d = await resp.json();
      $('progCount').textContent = d.programs.length + ' open programme' + (d.programs.length === 1 ? '' : 's');
      render(d.programs);
    } catch (_) {
      grid.innerHTML = '<p class="loading">Could not load programmes.</p>';
    }
  }

  function render(programs) {
    if (!programs.length) {
      grid.innerHTML = '<p class="loading">No open programmes match — check back soon, or be the first buyer to post one. 🤝</p>';
      return;
    }
    grid.innerHTML = '';
    programs.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.innerHTML =
        '<div class="l-head"><span class="l-cat">🤝 ' + esc(p.orgName) + '</span><span class="l-age">' + timeAgo(p.createdAt) + '</span></div>' +
        '<h3>' + esc(p.product) + ' — ' + esc(p.title) + '</h3>' +
        (p.volume ? '<p><strong>Volume:</strong> ' + esc(p.volume) + '</p>' : '') +
        (p.qualitySpecs ? '<p><strong>Quality:</strong> ' + esc(p.qualitySpecs) + '</p>' : '') +
        '<p><strong>💰 Price formula:</strong> ' + esc(p.priceFormula) + '</p>' +
        ((p.advancePct || p.inputCredit) ? '<p><strong>Advance / terms:</strong> ' + esc([p.advancePct, p.inputCredit].filter(Boolean).join(' · ')) + '</p>' : '') +
        (p.deliveryWindow ? '<p><strong>Delivery:</strong> ' + esc(p.deliveryWindow) + '</p>' : '') +
        (p.locations ? '<p><strong>Areas:</strong> ' + esc(p.locations) + '</p>' : '') +
        (p.requirements ? '<p class="fine"><strong>Who should apply:</strong> ' + esc(p.requirements) + '</p>' : '') +
        '<p class="fine">✔ Fair terms confirmed · written contract offered · ' + p.applicationsCount + ' application' + (p.applicationsCount === 1 ? '' : 's') + '</p>' +
        '<div class="l-foot">' +
          '<button class="act pb" data-id="' + p.id + '">📋 Production playbook</button>' +
          '<button class="btn-contact" data-apply="' + p.id + '">✍ Apply as farmer</button>' +
        '</div>' +
        '<div id="play-' + p.id + '" class="playbook" hidden></div>' +
        '<div id="apply-' + p.id + '" class="applyform" hidden>' +
          '<h4>Apply to ' + esc(p.product) + ' programme</h4>' +
          '<input class="apName" placeholder="Your / group name *" />' +
          '<input class="apLoc" placeholder="Your location" />' +
          '<input class="apCap" placeholder="What you can supply (area / volume) *" />' +
          '<input class="apContact" placeholder="Phone / WhatsApp *" />' +
          '<textarea class="apMsg" rows="2" placeholder="Experience, group size, previous buyers…"></textarea>' +
          '<button class="btn btn-primary apSend" data-id="' + p.id + '">Submit application</button>' +
        '</div>';
      grid.appendChild(card);
    });

    grid.querySelectorAll('.pb').forEach((b) => b.addEventListener('click', async () => {
      const out = $('play-' + b.dataset.id);
      if (out.hidden === false) { out.hidden = true; return; }
      out.hidden = false;
      out.innerHTML = '<p class="loading">Loading playbook…</p>';
      try {
        const d = await (await fetch('/api/programs/' + b.dataset.id)).json();
        out.innerHTML = '<h4>📋 Stage-gated production playbook</h4><ol>' +
          d.playbook.stages.map((s) => '<li><strong>' + esc(s[0]) + '</strong>' + (s[1] ? '<br>' + esc(s[1]) : '') + '</li>').join('') +
          '</ol><p class="fine">' + esc(d.playbook.note || '') + ' Ask the assistant in chat: e.g. "' + esc(d.program.product) + ' harvest and storage".</p>';
      } catch (_) { out.innerHTML = '<p class="fine">Playbook unavailable.</p>'; }
    }));

    grid.querySelectorAll('[data-apply]').forEach((a) => a.addEventListener('click', () => {
      const f = $('apply-' + a.dataset.apply);
      f.hidden = !f.hidden;
      if (!f.hidden) f.querySelector('input').focus();
    }));

    grid.querySelectorAll('.apSend').forEach((b) => b.addEventListener('click', async () => {
      const f = $('apply-' + b.dataset.id);
      const body = {
        name: f.querySelector('.apName').value.trim(),
        location: f.querySelector('.apLoc').value.trim(),
        capacity: f.querySelector('.apCap').value.trim(),
        contact: f.querySelector('.apContact').value.trim(),
        message: f.querySelector('.apMsg').value.trim(),
      };
      if (!body.name || !body.capacity || !body.contact) { alert('Name, capacity and contact are required.'); return; }
      const r = await fetch('/api/programs/' + b.dataset.id + '/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-id': ownerId },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || 'Could not apply'); return; }
      f.hidden = true;
      alert('✅ Application sent to the buyer. Keep your production records ready — they will contact you.');
      load();
    }));
  }

  async function loadFairTerms() {
    const d = await (await fetch('/api/programs')).json();
    $('fairList').innerHTML = d.fairTerms.map((t) => '<li>' + esc(t) + '</li>').join('');
  }

  $('progForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!$('pFair').checked) { $('progMsg').textContent = '⚠️ Fair-terms confirmation is required to post.'; return; }
    const btn = $('postProgBtn');
    btn.disabled = true;
    $('progMsg').textContent = 'Posting…';
    const body = {
      orgName: $('pOrg').value.trim(),
      title: $('pTitle').value.trim(),
      product: $('pProduct').value.trim(),
      volume: $('pVolume').value.trim(),
      qualitySpecs: $('pQuality').value.trim(),
      priceFormula: $('pPrice').value.trim(),
      advancePct: $('pAdvance').value.trim(),
      inputCredit: $('pPay').value.trim() ? 'Payment within ' + $('pPay').value.trim() + ' of delivery' : '',
      deliveryWindow: $('pWindow').value.trim(),
      locations: $('pLocations').value.trim(),
      requirements: $('pReqs').value.trim(),
      contact: $('pContact').value.trim(),
      fairTerms: ['confirmed'],
      ownerId,
    };
    try {
      const resp = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await resp.json();
      if (!resp.ok) throw new Error(d.error || 'post failed');
      $('progMsg').textContent = '✅ Programme posted! Save this programme ID to view applications: ' + d.program.id;
      $('progForm').reset();
      box.open = false;
      load();
    } catch (err) {
      $('progMsg').textContent = '⚠️ ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });

  $('progSearch').addEventListener('click', load);
  $('progQ').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); load(); } });

  $('appsBtn').addEventListener('click', async () => {
    const id = $('progIdLookup').value.trim();
    const out = $('appsOut');
    if (!id) { out.innerHTML = '<p class="fine">Paste the programme ID.</p>'; return; }
    out.innerHTML = '<p class="loading">Loading…</p>';
    const r = await fetch('/api/programs/' + id + '/applications', { headers: { 'x-owner-id': ownerId } });
    const d = await r.json();
    if (!r.ok) { out.innerHTML = '<p class="fine">⚠️ ' + esc(d.error || 'Not found or not your programme.') + '</p>'; return; }
    if (!d.applications.length) { out.innerHTML = '<p class="fine">No applications yet.</p>'; return; }
    out.innerHTML = '<h4>' + d.applications.length + ' applicant(s)</h4>' + d.applications.map((a) =>
      '<div class="app-row"><strong>' + esc(a.name) + '</strong> · ' + esc(a.location || '—') +
      '<br>Can supply: ' + esc(a.capacity) +
      (a.message ? '<br>Note: ' + esc(a.message) : '') +
      '<br>📞 <a href="tel:' + esc(a.contact.replace(/\s+/g, '')) + '">' + esc(a.contact) + '</a></div>'
    ).join('');
  });

  loadFairTerms();
  load();
})();

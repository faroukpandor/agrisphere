/* AgriSphere buyer-led programmes client */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const OWNER_KEY = 'agrisphere.ownerId.v1'; // one web identity per browser
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
      const owned = p.ownerId === ownerId;
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
          (owned ? '<button class="act mgmt" data-mgmt="' + p.id + '">⚙️ Manage</button>' : '') +
        '</div>' +
        '<div id="play-' + p.id + '" class="playbook" hidden></div>' +
        (owned ? '<div id="mgmt-' + p.id + '" class="manage" hidden></div>' : '') +
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

    // ---- owner lifecycle management (status / milestones / deliveries /
    //      disputes / settlement / compliance pack) ----
    const STATUSES = ['open', 'contracting', 'in-production', 'delivering', 'settled', 'closed'];
    grid.querySelectorAll('[data-mgmt]').forEach((b) => b.addEventListener('click', async () => {
      const out = $('mgmt-' + b.dataset.mgmt);
      if (out.hidden === false) { out.hidden = true; return; }
      out.hidden = false;
      out.innerHTML = '<p class="loading">Loading programme…</p>';
      await mgmtRender(b.dataset.mgmt, out);
    }));

    async function mgmtApi(method, path, body) {
      const r = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-owner-id': ownerId },
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await r.json().catch(() => ({}));
      return { ok: r.ok, d };
    }

    async function mgmtRender(id, out) {
      try {
        const d = await (await fetch('/api/programs/' + id, { headers: { 'x-owner-id': ownerId } })).json();
        const p = d.program;
        out.innerHTML =
          '<h4>⚙️ Manage · ' + esc(p.orgName) + ' — ' + esc(p.product) + '</h4>' +
          '<p><span class="pill">' + esc(p.status) + '</span> · ' + p.milestonesDone + '/' + p.milestonesTotal + ' milestones · ' + p.deliveriesCount + ' deliveries' + (p.openDisputes ? ' · ⚠ ' + p.openDisputes + ' open dispute' + (p.openDisputes === 1 ? '' : 's') : '') + '</p>' +

          '<div class="mg-row"><strong>Status</strong> ' +
          '<select class="stSel">' + STATUSES.map((s2) => '<option value="' + s2 + '"' + (s2 === p.status ? ' selected' : '') + '>' + s2 + '</option>').join('') + '</select> ' +
          '<button class="btn btn-primary stGo" style="padding:.35rem .8rem; font-size:.85rem;">Set</button></div>' +

          '<div class="mg-row"><strong>Milestones</strong><ul class="mg-list">' +
          (p.milestones || []).map((m) =>
            '<li><label style="font-weight:500;"><input type="checkbox" class="msCk" data-i="' + m.idx + '"' + (m.status === 'done' ? ' checked' : '') + ' /> ' +
            esc(m.stage) + '</label>' + (m.status === 'done' && m.at ? '<span class="fine"> ✓ ' + new Date(m.at).toLocaleDateString() + '</span>' : '') + '</li>').join('') +
          '</ul></div>' +

          '<div class="mg-row"><strong>Deliveries / batch records</strong>' +
          (p.deliveries && p.deliveries.length
            ? '<table class="mg-tbl"><tr><th>Date</th><th>Batch</th><th>Qty</th><th>Quality</th></tr>' +
              p.deliveries.map((dl) => '<tr><td>' + esc(dl.date) + '</td><td>' + esc(dl.batchCode || '—') + '</td><td>' + esc(dl.qty) + (dl.unit ? ' ' + esc(dl.unit) : '') + '</td><td>' + esc(dl.quality || '—') + '</td></tr>').join('') + '</table>'
            : '<p class="fine">No deliveries recorded.</p>') +
          '<div class="dl-add"><input class="dlQty" placeholder="Qty * (e.g. 12 t)" style="width:110px;"/>' +
          '<input class="dlBatch" placeholder="Batch code (e.g. KG-2027-001)" style="flex:1;"/>' +
          '<input class="dlQuality" placeholder="Quality note" style="flex:1;"/>' +
          '<input class="dlDate" type="date" style="width:150px;"/>' +
          '<button class="btn btn-primary dlGo" style="padding:.35rem .8rem; font-size:.85rem;">Record</button></div></div>' +

          '<div class="mg-row"><strong>Disputes</strong>' +
          ((p.disputes || []).length
            ? '<ul class="mg-list">' + p.disputes.map((ds) =>
                '<li>' + (ds.status === 'open' ? '⚠ ' : '✔ ') + esc(ds.text) + ' <span class="fine">— ' + esc(ds.by) + ' (' + ds.status + ')</span>' +
                (ds.status === 'open'
                  ? '<div class="ds-res"><input class="dsResTxt" placeholder="Resolution note *" style="flex:1;" /><button class="btn btn-primary dsResGo" data-d="' + ds.id + '" style="padding:.3rem .7rem; font-size:.82rem;">Resolve</button></div>'
                  : '') + '</li>').join('') + '</ul>'
            : '<p class="fine">No disputes.</p>') + '</div>' +

          (p.status !== 'settled'
            ? '<div class="mg-row"><strong>Settle (record agreed payment)</strong> ' +
              '<input class="setAmt" placeholder="Amount paid * (e.g. P18,240 net)" style="flex:1;" />' +
              '<input class="setMtd" placeholder="Method (e.g. direct deposit)" style="flex:1;" />' +
              '<button class="btn btn-primary setGo" style="padding:.35rem .8rem; font-size:.85rem;">Record settlement</button></div>'
            : '<p class="ok-note">✅ Settled ' + (p.settlement && p.settlement.amount ? '— ' + esc(p.settlement.amount) + ' (' + esc(p.settlement.method || '') + ')' : '') + '</p>') +

          '<div class="mg-row"><a class="btn btn-ghost2" href="/api/programs/' + id + '/compliance-pack?format=html" target="_blank" rel="noopener">📜 Compliance readiness pack (print / PDF)</a></div>';

        out.querySelector('.stGo').addEventListener('click', async () => {
          const r = await mgmtApi('POST', '/api/programs/' + id + '/status', { status: out.querySelector('.stSel').value });
          if (r.ok) { await mgmtRender(id, out); load(); } else alert(r.d.error || 'Failed');
        });
        out.querySelectorAll('.msCk').forEach((ck) => ck.addEventListener('change', async () => {
          await mgmtApi('POST', '/api/programs/' + id + '/milestones/' + ck.dataset.i, { done: ck.checked });
          await mgmtRender(id, out); load();
        }));
        out.querySelector('.dlGo').addEventListener('click', async () => {
          const qty = out.querySelector('.dlQty').value.trim();
          if (!qty) { alert('Qty is required.'); return; }
          const r = await mgmtApi('POST', '/api/programs/' + id + '/deliveries', {
            qty, batchCode: out.querySelector('.dlBatch').value.trim(),
            quality: out.querySelector('.dlQuality').value.trim(),
            date: out.querySelector('.dlDate').value,
          });
          if (r.ok) { await mgmtRender(id, out); load(); } else alert(r.d.error || 'Failed');
        });
        out.querySelectorAll('.dsResGo').forEach((b2) => b2.addEventListener('click', async () => {
          const txt = b2.closest('.ds-res').querySelector('.dsResTxt').value.trim();
          if (!txt) { alert('Resolution note required.'); return; }
          const r = await mgmtApi('POST', '/api/programs/' + id + '/disputes/' + b2.dataset.d + '/resolve', { resolution: txt });
          if (r.ok) { await mgmtRender(id, out); load(); } else alert(r.d.error || 'Failed');
        }));
        const setBtn = out.querySelector('.setGo');
        if (setBtn) setBtn.addEventListener('click', async () => {
          const amount = out.querySelector('.setAmt').value.trim();
          if (!amount) { alert('Amount required.'); return; }
          const r = await mgmtApi('POST', '/api/programs/' + id + '/settle', { amount, method: out.querySelector('.setMtd').value.trim() });
          if (r.ok) { await mgmtRender(id, out); load(); } else alert(r.d.error || 'Failed');
        });
      } catch (_) {
        out.innerHTML = '<p class="fine">Manage view unavailable — are you the owner? (owner id: ' + esc(ownerId.slice(0, 8)) + '…)</p>';
      }
    }
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

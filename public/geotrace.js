/* AgriSphere geo-trace client (W1 — EUDR-readiness documentation layer). */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const OWNER_KEY = 'agrisphere.ownerId.v1';
  const ownerId = localStorage.getItem(OWNER_KEY) ||
    (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  localStorage.setItem(OWNER_KEY, ownerId);

  const H = () => ({ 'Content-Type': 'application/json', 'x-owner-id': ownerId });

  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const num = (v) => (Number.isFinite(Number(v)) && v !== '' && v !== null && v !== undefined ? Number(v) : null);
  const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

  /* ------------------------------------------------------------------ info */
  async function loadInfo() {
    try {
      const info = await (await fetch('/api/geotrace/info')).json();
      $('infoLine').innerHTML =
        'Deadlines referenced: <strong>' + esc(info.deadline.largeMediumOperators) +
        '</strong> (large/medium EU operators) and <strong>' + esc(info.deadline.microSmallOperators) +
        '</strong> (micro/small). ' + esc(info.deadline.label) + '. Self-declared documentation only — ' +
        esc(info.limits.join(' '));
    } catch (_) { /* non-fatal */ }
  }

  /* ---------------------------------------------------------------- state */
  let myHoldings = [];
  const chainSegs = []; // segments being composed for a lot
  let activeConsignmentId = null;

  /* ------------------------------------------------------------- holdings */
  async function loadHoldings() {
    try {
      const data = await (await fetch('/api/geotrace/holdings', { headers: H() })).json();
      myHoldings = data.holdings || [];
      renderHoldings();
      seedChainSelects();
    } catch (_) {
      $('holdingsBox').innerHTML = '<p class="loading">Could not load holdings.</p>';
    }
  }

  function renderHoldings() {
    const box = $('holdingsBox');
    if (!myHoldings.length) {
      box.innerHTML = '<p class="fine">No holdings recorded yet on this browser identity. ' +
        'Record your first holding above (consent required).</p>';
      return;
    }
    box.innerHTML = '<h3>Your holdings (' + myHoldings.length + ')</h3>' + myHoldings.map((h) => {
      const shared = (h.sharedWith || []).map((x) => esc(x.slice(0, 10) + '…')).join(', ') || 'none';
      return '<div class="post-card" style="padding:1rem">' +
        '<p><strong>🗺️ ' + esc(h.name) + '</strong> <span class="fine">' + esc(h.ref) + ' · ' +
        esc(h.district || '—') + ' · ' + esc(h.kind) + '</span></p>' +
        '<p class="fine">' + esc(h.lat) + ', ' + esc(h.lng) + ' · recorded ' + new Date(h.consentAt).toLocaleDateString() +
        ' · shared with: ' + shared + '</p>' +
        '<div class="frow frow-actions">' +
        '<label class="fine" style="flex:1">Share with (owner ids, space/comma separated — replaces the list): ' +
        '<input id="share-' + h.id + '" class="share-in" style="width:100%" placeholder="e.g. co-op account owner id" value="' +
        esc((h.sharedWith || []).join(' ')) + '" /></label></div>' +
        '<div class="frow frow-actions"><span class="fine">Sharing lets a named co-op/buyer account chain this holding into its export lots. You can revoke any time.</span>' +
        '<button class="btn btn-ghost-dark" data-share="' + h.id + '">Save sharing</button>' +
        '<button class="btn btn-ghost-dark" data-delh="' + h.id + '">Delete holding</button></div>' +
        '</div>';
    }).join('');
  }

  async function onShare(id, btn) {
    const val = String($('share-' + id).value || '');
    const list = val.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);
    btn.disabled = true;
    try {
      const r = await (await fetch('/api/geotrace/holdings/' + id + '/share', {
        method: 'POST', headers: H(),
        body: JSON.stringify({ with: list }),
      })).json();
      if (r.error) alert('Sharing failed: ' + r.error);
    } catch (_) { alert('Sharing failed — try again.'); }
    btn.disabled = false;
    loadHoldings();
  }

  $('holdingForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const lat = num($('hLat').value);
    const lng = num($('hLng').value);
    const msg = $('holdingMsg');
    msg.textContent = 'Saving…';
    try {
      const r = await (await fetch('/api/geotrace/holdings', {
        method: 'POST', headers: H(),
        body: JSON.stringify({
          name: $('hName').value, district: $('hDistrict').value, kind: $('hKind').value,
          lat, lng, notes: $('hNotes').value, consent: $('hConsent').checked,
        }),
      })).json();
      if (r.error) { msg.textContent = '⚠️ ' + r.error; return; }
      msg.textContent = '✅ ' + r.holding.ref + ' recorded (consent on file).';
      $('holdingForm').reset();
      loadHoldings();
    } catch (_) { msg.textContent = '⚠️ Could not save — try again.'; }
  });

  document.addEventListener('click', async (ev) => {
    const shareBtn = ev.target.closest('[data-share]');
    if (shareBtn) return onShare(shareBtn.dataset.share, shareBtn);
    const delBtn = ev.target.closest('[data-delh]');
    if (!delBtn) return;
    if (!confirm('Delete this holding? This cannot be undone. (You must remove any consignment lot that chains through it first.)')) return;
    const r = await (await fetch('/api/geotrace/holdings/' + delBtn.dataset.delh, {
      method: 'DELETE', headers: H(),
    })).json();
    if (r.error) alert('Could not delete: ' + r.error);
    loadHoldings();
  });

  /* ---------------------------------------------------------- consignments */
  async function loadConsignments() {
    try {
      const data = await (await fetch('/api/geotrace/consignments', { headers: H() })).json();
      renderConsignments(data.consignments || []);
    } catch (_) {
      $('consignmentsBox').innerHTML = '<p class="loading">Could not load consignments.</p>';
    }
  }

  async function loadConsignmentDetail(id) {
    try {
      const data = await (await fetch('/api/geotrace/consignments/' + id, { headers: H() })).json();
      return data.consignment || null;
    } catch (_) { return null; }
  }

  function chainSummary(lot) {
    return (lot.chain || []).map((s) =>
      esc(s.holdingName) + ' (' + fmtDate(s.from) + ' → ' + (s.to ? fmtDate(s.to) : 'now') + ')').join(' → ');
  }

  function renderConsignments(list) {
    const box = $('consignmentsBox');
    if (!list.length) {
      box.innerHTML = '<p class="fine">No consignments yet. Create one above, then add lots with holding chains.</p>';
      return;
    }
    box.innerHTML = '<h3>Your consignments (' + list.length + ')</h3>' + list.map((c) =>
      '<div class="post-card" style="padding:1rem" data-cid="' + c.id + '">' +
      '<p><strong>📦 ' + esc(c.title) + '</strong> <span class="fine">' + esc(c.ref) + ' · buyer: ' +
      esc(c.buyer || '—') + ' · destination: ' + esc(c.destination) + ' · ' + esc(c.species) +
      ' · heads: ' + c.headTotal + ' · lots: ' + c.lotCount + '</span></p>' +
      '<div class="frow frow-actions">' +
      '<button class="btn btn-ghost-dark" data-lots="' + c.id + '">＋ Add lot / view lots</button>' +
      '<button class="btn btn-ghost-dark" data-exp="' + c.id + '|json">⬇ Export JSON</button>' +
      '<button class="btn btn-ghost-dark" data-exp="' + c.id + '|csv">⬇ Export CSV</button>' +
      '<button class="btn btn-ghost-dark" data-delc="' + c.id + '">Delete</button></div>' +
      '<div data-lotsbox="' + c.id + '"></div>' +
      '</div>').join('');
    for (const c of list) {
      loadConsignmentDetail(c.id).then((detail) => {
        if (!detail) return;
        const lb = document.querySelector('[data-lotsbox="' + c.id + '"]');
        if (!lb) return;
        if (!detail.lots.length) {
          lb.innerHTML = '<p class="fine">No lots yet — a lot links animals to the holdings they passed through (dates).</p>';
          return;
        }
        lb.innerHTML = '<div class="fine">' + detail.lots.map((l) =>
          '<p><strong>Lot ' + esc(l.label) + '</strong> — ' + l.headCount + ' head:<br/>' + chainSummary(l) + '</p>'
        ).join('') + '</div>';
      });
    }
  }

  $('consignmentForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const msg = $('consignmentMsg');
    msg.textContent = 'Creating…';
    try {
      const r = await (await fetch('/api/geotrace/consignments', {
        method: 'POST', headers: H(),
        body: JSON.stringify({
          title: $('cTitle').value, buyer: $('cBuyer').value, destination: $('cDest').value,
          species: $('cSpecies').value, programmeId: $('cProgramme').value,
        }),
      })).json();
      if (r.error) { msg.textContent = '⚠️ ' + r.error; return; }
      msg.textContent = '✅ ' + r.consignment.ref + ' created — now add its first lot.';
      $('consignmentForm').reset();
      loadConsignments();
    } catch (_) { msg.textContent = '⚠️ Could not create.'; }
  });

  document.addEventListener('click', async (ev) => {
    const lotBtn = ev.target.closest('[data-lots]');
    if (lotBtn) { openLotBuilder(lotBtn.dataset.lots); return; }
    const expBtn = ev.target.closest('[data-exp]');
    if (expBtn) {
      const [id, format] = expBtn.dataset.exp.split('|');
      return downloadExport(id, format);
    }
    const delBtn = ev.target.closest('[data-delc]');
    if (!delBtn) return;
    if (!confirm('Delete this consignment? Its lots are deleted with it.')) return;
    const r = await (await fetch('/api/geotrace/consignments/' + delBtn.dataset.delc, {
      method: 'DELETE', headers: H(),
    })).json();
    if (r.error) alert('Could not delete: ' + r.error);
    loadConsignments();
  });

  async function downloadExport(id, format) {
    const resp = await fetch('/api/geotrace/consignments/' + id + '/export?format=' + format, { headers: H() });
    if (!resp.ok) { alert('Export not allowed (' + resp.status + ') — own the consignment or use an admin token.'); return; }
    const blob = await resp.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'agrisphere-geotrace-' + id.slice(0, 8) + '.' + (format === 'csv' ? 'csv' : 'json');
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ----------------------------------------------------- lot builder (v1) */
  function seedChainSelects() {
    document.querySelectorAll('.chain-select').forEach((sel) => {
      const keep = sel.value;
      sel.innerHTML = '<option value="">— choose holding —</option>' +
        myHoldings.map((h) => '<option value="' + h.id + '">' + esc(h.name) + ' (' + esc(h.ref) + ')</option>').join('');
      if (keep) sel.value = keep;
    });
  }

  function openLotBuilder(cid) {
    const lb = document.querySelector('[data-lotsbox="' + cid + '"]');
    if (!lb) return;
    if (activeConsignmentId === cid && lb.dataset.open) { lb.dataset.open = ''; lb.innerHTML = ''; return; }
    activeConsignmentId = cid;
    chainSegs.length = 0;
    lb.dataset.open = '1';
    renderChainRows(lb);
    lb.insertAdjacentHTML('beforeend',
      '<div class="frow"><label>Heads * <input id="lotHeads" type="number" min="1" value="10" /></label>' +
      '<label>Lot label <input id="lotLabel" maxlength="80" placeholder="e.g. Steers batch A" /></label>' +
      '<button type="button" class="btn btn-ghost-dark" id="addSegBtn" style="align-self:end">＋ Segment</button></div>' +
      '<div class="frow frow-actions"><p class="fine">Segments run in date order — the tool closes open periods at the next move and rejects overlaps. Only holdings you own or that were shared with you can be chained.</p>' +
      '<button type="button" class="btn btn-primary" id="saveLotBtn">Save lot</button></div>' +
      '<p class="post-msg" data-lotmsg role="status"></p>');
    $('addSegBtn').addEventListener('click', () => {
      if (!myHoldings.length) { alert('Record at least one holding first.'); return; }
      chainSegs.push({ holdingId: '', from: '', to: '' });
      renderChainRows(lb);
    });
    $('saveLotBtn').addEventListener('click', async () => {
      const msg = lb.querySelector('[data-lotmsg]');
      const heads = Number($('lotHeads').value);
      const chain = chainSegs.map((s) => ({ holdingId: s.holdingId, from: s.from, to: s.to || undefined }))
        .filter((s) => s.holdingId && s.from);
      msg.textContent = 'Saving lot…';
      const r = await (await fetch('/api/geotrace/consignments/' + cid + '/lots', {
        method: 'POST', headers: H(),
        body: JSON.stringify({ headCount: heads, label: $('lotLabel').value, chain }),
      })).json();
      if (r.error) { msg.textContent = '⚠️ ' + r.error; return; }
      msg.textContent = '✅ Lot saved (' + r.headTotal + ' heads on this consignment).';
      lb.dataset.open = '';
      loadConsignments();
    });
  }

  function renderChainRows(lb) {
    let rowsHtml = '<p class="fine"><strong>Holding chain:</strong> where did these animals stay, in order?</p>';
    chainSegs.forEach((seg, i) => {
      rowsHtml += '<div class="frow" style="margin-bottom:.4rem">' +
        '<select class="chain-select" data-ridx="' + i + '" style="min-width:180px"></select>' +
        '<label>From <input type="date" data-ridx="' + i + '" data-f="from" value="' + fmtDate(seg.from) + '" /></label>' +
        '<label>To (blank = still there) <input type="date" data-ridx="' + i + '" data-f="to" value="' + fmtDate(seg.to) + '" /></label>' +
        '<button type="button" class="btn btn-ghost-dark" data-rrem="' + i + '">✕</button></div>';
    });
    const holder = lb.querySelector('[data-chainrows]');
    if (holder) holder.outerHTML = '<div data-chainrows>' + rowsHtml + '</div>';
    else lb.insertAdjacentHTML('beforeend', '<div data-chainrows>' + rowsHtml + '</div>');
    seedChainSelects();
    lb.querySelectorAll('[data-chainrows] select').forEach((sel) => {
      const seg = chainSegs[Number(sel.dataset.ridx)];
      sel.value = seg.holdingId;
      sel.addEventListener('change', () => { chainSegs[Number(sel.dataset.ridx)].holdingId = sel.value; });
    });
    lb.querySelectorAll('[data-chainrows] input[type=date]').forEach((inp) => {
      const seg = chainSegs[Number(inp.dataset.ridx)];
      inp.addEventListener('change', () => { seg[inp.dataset.f] = inp.value; });
    });
    lb.querySelectorAll('[data-rrem]').forEach((btn) => {
      btn.addEventListener('click', () => {
        chainSegs.splice(Number(btn.dataset.rrem), 1);
        renderChainRows(lb);
      });
    });
  }

  /* ------------------------------------------------------------------ boot */
  loadInfo();
  loadHoldings();
  loadConsignments();
})();

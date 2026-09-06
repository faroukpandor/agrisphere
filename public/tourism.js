/* AgriSphere agri-tourism client */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const OWNER_KEY = 'agrisphere.ownerId.v1'; // one web identity per browser
  const ownerId = localStorage.getItem(OWNER_KEY) || (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  localStorage.setItem(OWNER_KEY, ownerId);

  const TYPE_LABELS = {
    'farm-stay': '🏡 Farm stay', 'market-tour': '🧺 Market & food tour',
    'harvest-festival': '🌾 Harvest festival', 'nature-birding': '🐦 Nature & birding',
    'craft-community': '🧶 Craft & community', 'food-tasting': '🍲 Tasting & cooking',
    'ranch-outdoor': '🐎 Ranch & outdoor', 'other': '📦 Other',
  };
  const TYPE_KEYS = Object.keys(TYPE_LABELS);
  const selected = new Set();

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // type chips + select options
  function seedTypes() {
    const chips = $('typeChips');
    chips.innerHTML = '';
    TYPE_KEYS.forEach((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = TYPE_LABELS[k];
      b.dataset.k = k;
      b.addEventListener('click', () => {
        if (selected.has(k)) { selected.delete(k); b.classList.remove('chip-on'); }
        else { selected.add(k); b.classList.add('chip-on'); }
      });
      chips.appendChild(b);
    });
    const sel = $('eType');
    TYPE_KEYS.forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = TYPE_LABELS[k];
      sel.appendChild(o);
    });
  }

  async function load(filter) {
    const grid = $('expGrid');
    try {
      const params = new URLSearchParams();
      if (filter && filter.type) params.set('type', filter.type);
      if (filter && filter.q) params.set('q', filter.q);
      if (filter && filter.location) params.set('location', filter.location);
      const resp = await fetch('/api/experiences?' + params.toString());
      const d = await resp.json();
      $('tCount').textContent = d.experiences.length + ' experience' + (d.experiences.length === 1 ? '' : 's');
      render(d.experiences);
    } catch (_) {
      grid.innerHTML = '<p class="loading">Could not load experiences.</p>';
    }
  }

  function render(list) {
    const grid = $('expGrid');
    if (!list.length) {
      grid.innerHTML = '<p class="loading">No matching experiences yet — try another area, or ask a partner to list one! 🏡</p>';
      return;
    }
    grid.innerHTML = '';
    list.forEach((e) => {
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.innerHTML =
        '<div class="l-head"><span class="l-cat">' + (TYPE_LABELS[e.type] || '📦') + '</span><span class="l-age">' + esc(e.partner) + '</span></div>' +
        '<h3>' + esc(e.title) + '</h3>' +
        '<p><strong>📍</strong> ' + esc(e.location) + '</p>' +
        '<div class="l-meta">' +
          (e.priceRange ? '<span>💰 ' + esc(e.priceRange) + '</span>' : '') +
          (e.duration ? '<span>⏱ ' + esc(e.duration) + '</span>' : '') +
          (e.groupSize ? '<span>👥 ' + esc(e.groupSize) + '</span>' : '') +
          (e.season ? '<span>🗓 ' + esc(e.season) + '</span>' : '') +
        '</div>' +
        (e.whatsIncluded ? '<p><strong>Included:</strong> ' + esc(e.whatsIncluded) + '</p>' : '') +
        (e.description ? '<p class="fine">' + esc(e.description) + '</p>' : '') +
        '<p class="fine">⚠️ ' + esc(e.safetyNote) + '</p>' +
        '<div class="l-foot">' +
          '<a class="btn-contact" href="tel:' + esc(e.contact.replace(/\s+/g, '')) + '">📞 Book / enquire: ' + esc(e.contact) + '</a>' +
          '<button class="act flag" data-id="' + e.id + '">🚩 Report</button>' +
        '</div>';
      grid.appendChild(card);
    });
    grid.querySelectorAll('.flag').forEach((b) => b.addEventListener('click', async () => {
      b.disabled = true;
      b.textContent = '🚩 Reported — thank you';
      await fetch('/api/experiences/' + b.dataset.id + '/report', { method: 'POST' });
    }));
  }

  $('tSearch').addEventListener('click', () => {
    const q = [];
    if ($('tLoc').value.trim()) q.push($('tLoc').value.trim());
    if ($('tGroup').value.trim()) q.push($('tGroup').value.trim());
    if ($('tWhen').value.trim()) q.push($('tWhen').value.trim());
    const type = selected.size === 1 ? [...selected][0] : '';
    const qs = q.join(' ');
    load({ type, q: qs, location: $('tLoc').value.trim() || undefined });
  });

  $('expForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    $('expMsg').textContent = 'Posting…';
    const body = {
      partner: $('ePartner').value.trim(),
      title: $('eTitle').value.trim(),
      type: $('eType').value,
      location: $('eLoc').value.trim(),
      priceRange: $('ePrice').value.trim(),
      duration: $('eDur').value.trim(),
      groupSize: $('eGroup').value.trim(),
      season: $('eSeason').value.trim(),
      whatsIncluded: $('eIncluded').value.trim(),
      description: $('eDesc').value.trim(),
      contact: $('eContact').value.trim(),
      ownerId,
    };
    try {
      const resp = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await resp.json();
      if (!resp.ok) throw new Error(d.error || 'post failed');
      $('expMsg').textContent = '✅ Experience listed! It is live on the board now.';
      $('expForm').reset();
      load({});
    } catch (err) {
      $('expMsg').textContent = '⚠️ ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });

  seedTypes();
  load({});
})();

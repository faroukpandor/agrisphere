/* AgriSphere marketplace client */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const OWNER_KEY = 'agrisphere.ownerId.v1';
  const ownerId = localStorage.getItem(OWNER_KEY) ||
    (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  localStorage.setItem(OWNER_KEY, ownerId);

  const grid = $('listings');
  const catSel = $('catSel');
  const searchQ = $('searchQ');
  const countBadge = $('countBadge');

  const CAT_ICON = {
    produce: '🌽', livestock: '🐄', inputs: '🧪', machinery: '🚜',
    services: '🧑‍🌾', land: '🗺️', jobs: '💼', other: '📦',
  };

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function timeAgo(ts) {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + ' h ago';
    return Math.round(hrs / 24) + ' d ago';
  }

  async function load() {
    try {
      const params = new URLSearchParams();
      if (catSel.value) params.set('category', catSel.value);
      if (searchQ.value.trim()) params.set('q', searchQ.value.trim());
      const resp = await fetch('/api/marketplace/listings?' + params.toString());
      const data = await resp.json();

      if (!catSel.dataset.seeded) {
        data.categories.forEach((c) => {
          const o = document.createElement('option');
          o.value = c;
          o.textContent = (CAT_ICON[c] || '') + ' ' + c[0].toUpperCase() + c.slice(1);
          catSel.appendChild(o);
        });
        catSel.dataset.seeded = '1';
      }
      countBadge.textContent = data.stats.total + ' active listing' + (data.stats.total === 1 ? '' : 's');
      render(data.listings);
    } catch (err) {
      grid.innerHTML = '<p class="loading">Could not load listings — check your connection and try again.</p>';
    }
  }

  function render(listings) {
    if (!listings.length) {
      grid.innerHTML = '<p class="loading">No listings here yet — be the first to post! 🌱</p>';
      return;
    }
    grid.innerHTML = '';
    listings.forEach((l) => {
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.innerHTML =
        '<div class="l-head">' +
          '<span class="l-cat">' + (CAT_ICON[l.category] || '📦') + ' ' + esc(l.category) + '</span>' +
          '<span class="l-age">' + timeAgo(l.createdAt) + '</span>' +
        '</div>' +
        '<h3>' + esc(l.title) + '</h3>' +
        (l.description ? '<p>' + esc(l.description) + '</p>' : '') +
        '<div class="l-meta">' +
          (l.price ? '<span>💰 ' + esc(l.price) + '</span>' : '') +
          (l.location ? '<span>📍 ' + esc(l.location) + '</span>' : '') +
        '</div>' +
        '<div class="l-foot">' +
          '<a class="btn-contact" href="tel:' + esc(l.contact.replace(/\s+/g, '')) + '">📞 ' + esc(l.contact) + '</a>' +
          (l.ownerId === ownerId
            ? '<button class="act del" data-id="' + l.id + '" title="Delete your listing">🗑 Remove</button>'
            : '<button class="act flag" data-id="' + l.id + '" title="Report a suspicious or dishonest listing">🚩 Report</button>') +
        '</div>';
      grid.appendChild(card);
    });
    grid.querySelectorAll('.del').forEach((b) => b.addEventListener('click', () => del(b.dataset.id)));
    grid.querySelectorAll('.flag').forEach((b) => b.addEventListener('click', () => flag(b.dataset.id, b)));
  }

  async function del(id) {
    if (!confirm('Remove this listing?')) return;
    const r = await fetch('/api/marketplace/listings/' + id, {
      method: 'DELETE',
      headers: { 'x-owner-id': ownerId },
    });
    if (r.ok) { load(); } else { alert('Could not remove listing.'); }
  }

  async function flag(id, btn) {
    btn.disabled = true;
    btn.textContent = '🚩 Reported — thank you';
    await fetch('/api/marketplace/listings/' + id + '/report', { method: 'POST' });
  }

  $('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('postBtn');
    const msg = $('postMsg');
    btn.disabled = true;
    msg.textContent = '';
    const body = {
      category: $('fCat').value,
      title: $('fTitle').value.trim(),
      description: $('fDesc').value.trim(),
      price: $('fPrice').value.trim(),
      location: $('fLoc').value.trim(),
      contact: $('fContact').value.trim(),
      ownerId,
    };
    try {
      const resp = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'post failed');
      msg.textContent = '✅ Listing posted — it will appear at the top.';
      $('postForm').reset();
      load();
    } catch (err) {
      msg.textContent = '⚠️ ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });

  $('searchBtn').addEventListener('click', load);
  catSel.addEventListener('change', load);
  searchQ.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); load(); } });

  load();
})();

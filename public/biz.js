/* AgriSphere starter toolkit client */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  async function loadEnterprises() {
    try {
      const r = await fetch('/api/bizplan/enterprises');
      const d = await r.json();
      const sel = $('fEnt');
      d.enterprises.forEach((e) => {
        const o = document.createElement('option');
        o.value = e.key;
        o.textContent = e.label;
        sel.appendChild(o);
      });
    } catch (_) {
      const sel = $('fEnt');
      const o = document.createElement('option');
      o.value = 'mixed';
      o.textContent = 'Mixed crops + livestock';
      sel.appendChild(o);
    }
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderPlan(data) {
    const out = $('planOut');
    out.innerHTML = '';
    const card = document.createElement('article');
    card.className = 'plan-card';
    const head = document.createElement('div');
    head.className = 'plan-head';
    head.innerHTML =
      '<h2>🌱 Draft business plan — ' + esc(data.name || 'starter') + '</h2>' +
      '<p class="fine">' + esc(data.disclaimer) + '</p>' +
      '<p><button class="btn btn-ghost-dark" onclick="window.print()">🖨 Print / save as PDF</button></p>';
    card.appendChild(head);
    data.sections.forEach((sec) => {
      const h = document.createElement('h3');
      h.textContent = sec.h;
      card.appendChild(h);
      const ul = document.createElement('ul');
      sec.lines.forEach((l) => {
        const li = document.createElement('li');
        li.textContent = l;
        ul.appendChild(li);
      });
      card.appendChild(ul);
    });
    const tail = document.createElement('p');
    tail.className = 'fine';
    tail.textContent = 'Next step: put Step 1–2 of the action plan into your calendar this week, then ask the assistant about your chosen enterprise.';
    card.appendChild(tail);
    out.appendChild(card);
    out.scrollIntoView({ behavior: 'smooth' });
  }

  $('bpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('bpBtn');
    const msg = $('bpMsg');
    btn.disabled = true;
    msg.textContent = 'Building your draft…';
    const body = {
      name: $('fName').value,
      location: $('fLoc').value,
      enterprise: $('fEnt').value,
      landHa: $('fLand').value,
      budget: $('fBudget').value,
      water: $('fWater').value,
      labour: $('fLabour').value,
      startWindow: $('fWindow').value,
      market: $('fMarket').value,
    };
    try {
      const resp = await fetch('/api/bizplan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': (localStorage.getItem('agrisphere.sid.v1') || 'anon') },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Could not generate plan');
      msg.textContent = '✅ Draft ready — review, then save as PDF.';
      renderPlan(data);
    } catch (err) {
      msg.textContent = '⚠️ ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });

  loadEnterprises();
})();

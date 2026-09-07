/* AgriSphere web chat client */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const messagesEl = $('messages');
  const suggestionsEl = $('suggestions');
  const form = $('chatForm');
  const input = $('input');
  const resetBtn = $('resetBtn');

  const SID_KEY = 'agrisphere.sid.v1';
  const NAME_KEY = 'agrisphere.name.v1';
  const sessionId = localStorage.getItem(SID_KEY) || (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  localStorage.setItem(SID_KEY, sessionId);

  const QUICK = ['🌽 Crops', '🩺 Crop doctor', '💰 Prices', '🛒 Selling', '🌦️ Weather', '🐄 Livestock', '🧠 Teach me'];
  let busy = false;
  let lastRecordId = null;
  let greeted = false;

  // ---------- helpers ----------
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderText(s) {
    let out = escapeHtml(s);
    // simple **bold** support
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // inline code
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    return out.replace(/\n/g, '<br>');
  }

  function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(role, html, recordId) {
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;
    wrap.appendChild(bubble);

    if (role === 'bot' && recordId) {
      const actions = document.createElement('div');
      actions.className = 'actions';
      actions.innerHTML =
        '<button class="act fb" data-good="1" title="Good answer">👍</button>' +
        '<button class="act fb" data-good="0" title="Wrong or unhelpful">👎</button>';
      wrap.appendChild(actions);
      actions.querySelectorAll('.fb').forEach((btn) => {
        btn.addEventListener('click', () => sendFeedback(recordId, btn.dataset.good === '1', btn));
      });
    }
    messagesEl.appendChild(wrap);
    scrollDown();
    return wrap;
  }

  function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot typing';
    wrap.innerHTML = '<div class="bubble"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(wrap);
    scrollDown();
    return wrap;
  }

  function renderSuggestions(labels) {
    suggestionsEl.innerHTML = '';
    (labels || []).forEach((label) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = label;
      b.type = 'button';
      b.addEventListener('click', () => {
        if (busy) return;
        input.value = label.replace(/^[^\p{L}\p{N}]+/u, '').trim(); // strip leading emoji for clean text
        send();
      });
      suggestionsEl.appendChild(b);
    });
  }

  async function sendFeedback(recordId, good, btn) {
    if (btn.dataset.done) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, good, sessionId }),
      });
      btn.dataset.done = '1';
      btn.classList.add('done');
      btn.title = good ? 'Thanks — noted 👍' : 'Thanks — I will learn from this 👎';
    } catch (_) { /* ignore */ }
  }

  async function send() {
    const message = input.value.trim();
    if (!message || busy) return;
    input.value = '';
    busy = true;
    renderSuggestions([]);
    addMessage('user', renderText(message));
    const typing = addTyping();

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId, name: localStorage.getItem(NAME_KEY) || '' }),
      });
      typing.remove();
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      lastRecordId = data.recordId;
      addMessage('bot', renderText(data.reply), data.recordId);
      const chips = (data.suggested || []).concat(data.buttons || []).filter(Boolean);
      renderSuggestions(chips.length ? chips : QUICK);
    } catch (err) {
      typing.remove();
      addMessage('bot', renderText('😔 Sorry — I could not reach the server. If this keeps happening the deployment may be asleep; try again in a minute.'));
      renderSuggestions(QUICK);
    } finally {
      busy = false;
    }
  }

  // ---- photo capture (R18): send to human review queue ----
  const camBtn = document.getElementById('camBtn');
  const camFile = document.getElementById('camFile');
  if (camBtn && camFile) {
    camBtn.addEventListener('click', () => camFile.click());
    camFile.addEventListener('change', async () => {
      const f = camFile.files && camFile.files[0];
      camFile.value = '';
      if (!f) return;
      if (busy) return;
      if (f.size > 2500000) { addMessage('bot', renderText('📷 Photo too large — please send one under ~2.5 MB (or a smaller/compressed shot).')); return; }
      busy = true;
      addMessage('user', renderText('📷 [photo: ' + (f.name || 'plant photo') + ']'));
      const typing = addTyping();
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resp = await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: String(reader.result).slice(0, 3400000), sessionId, channel: 'web', question: 'photo from web chat' }),
          });
          typing.remove();
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok || !data.ok) throw new Error((data && data.error) || 'HTTP ' + resp.status);
          addMessage('bot', renderText(data.reply || '📷 Photo received.'));
          renderSuggestions(QUICK);
        } catch (_) {
          typing.remove();
          addMessage('bot', renderText('😔 Could not upload the photo — try again, or take it to your extension officer directly.'));
          renderSuggestions(QUICK);
        } finally { busy = false; }
      };
      reader.onerror = () => { typing.remove(); busy = false; addMessage('bot', renderText('😔 Could not read that file.')); };
      reader.readAsDataURL(f);
    });
  }

  function welcome() {
    renderSuggestions(QUICK);
    scrollDown();
    fetch('/healthz').then((r) => r.json()).then((h) => {
      if (h && typeof h.learned === 'number') {
        $('learnedCount').textContent = h.learned + ' lessons learned';
      }
    }).catch(() => {});
    greeted = true;
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); send(); });

  resetBtn.addEventListener('click', () => {
    localStorage.removeItem(SID_KEY);
    location.reload();
  });

  welcome();
})();

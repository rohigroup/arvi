(() => {
  const STORAGE_KEY = 'arvi_web_session_id';
  const HISTORY_KEY = 'arvi_web_chat_history';
  const MAX_HISTORY = 20;

  function getSessionId() {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      const random = globalThis.crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
      id = `web_${random}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
    } catch { return []; }
  }

  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
  }

  function createWidget() {
    if (document.querySelector('[data-arvi-web-chat]')) return;
    const root = document.createElement('div');
    root.dataset.arviWebChat = 'true';
    root.innerHTML = `
      <button class="arvi-chat-launcher" type="button" aria-label="Hablar con ARVI" aria-expanded="false">
        <span class="arvi-chat-launcher-mark" aria-hidden="true"></span><span class="arvi-chat-launcher-label">Hablar con ARVI</span>
      </button>
      <section class="arvi-chat-panel" aria-label="Chat con ARVI" hidden>
        <header class="arvi-chat-header">
          <div class="arvi-chat-brand"><span class="arvi-chat-mark" aria-hidden="true"></span><div><strong>ARVI</strong><small>En línea</small></div></div>
          <button class="arvi-chat-close" type="button" aria-label="Cerrar chat">×</button>
        </header>
        <div class="arvi-chat-messages" aria-live="polite"></div>
        <div class="arvi-chat-status" hidden>ARVI está pensando…</div>
        <form class="arvi-chat-form">
          <label class="sr-only" for="arvi-chat-input">Escribe tu mensaje</label>
          <textarea id="arvi-chat-input" class="arvi-chat-input" rows="1" maxlength="1200" placeholder="Escribe tu mensaje…" required></textarea>
          <button class="arvi-chat-send" type="submit">Enviar</button>
        </form>
        <div class="arvi-chat-handoff" hidden><a href="https://wa.me/573183074381" target="_blank" rel="noopener">Continuar por WhatsApp</a></div>
      </section>`;
    document.body.appendChild(root);

    const launcher = root.querySelector('.arvi-chat-launcher');
    const panel = root.querySelector('.arvi-chat-panel');
    const close = root.querySelector('.arvi-chat-close');
    const form = root.querySelector('.arvi-chat-form');
    const input = root.querySelector('.arvi-chat-input');
    const messages = root.querySelector('.arvi-chat-messages');
    const status = root.querySelector('.arvi-chat-status');
    const handoff = root.querySelector('.arvi-chat-handoff');
    let history = loadHistory();

    function addMessage(role, text, persist = true) {
      const row = document.createElement('div');
      row.className = `arvi-chat-message ${role === 'user' ? 'is-user' : 'is-arvi'}`;
      const bubble = document.createElement('div');
      bubble.className = 'arvi-chat-bubble';
      bubble.textContent = text;
      row.appendChild(bubble);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
      if (persist) { history.push({ role, text, ts: Date.now() }); saveHistory(history); }
    }

    if (history.length) history.forEach(m => addMessage(m.role, m.text, false));
    else addMessage('assistant', 'Hola 👋 Soy ARVI. Cuéntame qué quieres automatizar o qué duda tienes sobre nuestras soluciones.');

    function openPanel() { panel.hidden = false; launcher.setAttribute('aria-expanded','true'); requestAnimationFrame(() => panel.classList.add('is-open')); setTimeout(() => input.focus(),80); }
    function closePanel() { panel.classList.remove('is-open'); launcher.setAttribute('aria-expanded','false'); setTimeout(() => { panel.hidden = true; },180); }
    launcher.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
    close.addEventListener('click', closePanel);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addMessage('user', text);
      input.value = ''; input.disabled = true; status.hidden = false; handoff.hidden = true;
      try {
        const response = await fetch('/api/chat', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ channel:'web', session_id:getSessionId(), message:text, page:`${location.pathname}${location.search || ''}`, tenant:'rohi-group' })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'chat_failed');
        addMessage('assistant', String(data.response || 'No pude responder en este momento. Intenta de nuevo.'));
        if (data.handoff === true) handoff.hidden = false;
      } catch (error) {
        addMessage('assistant', 'Tuve un problema para responder. Puedes intentarlo de nuevo en unos segundos.');
        console.error('[ARVI web chat]', error);
      } finally { input.disabled = false; status.hidden = true; input.focus(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createWidget); else createWidget();
})();

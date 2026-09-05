/* ARVI Web Chat V1 — this file is written through a detached Git object commit; do not publish separately. */
(() => {
  'use strict';

  if (window.ARVI_WEBCHAT_DISABLE === true || document.querySelector('[data-arvi-webchat-root]')) return;

  const CONFIG = {
    apiUrl: '/api/chat',
    clickUrl: '/api/click',
    tenant: 'rohi-group',
    whatsappUrl: 'https://wa.me/573183074381?text=Hola%2C%20quiero%20continuar%20mi%20conversaci%C3%B3n%20con%20ARVI.',
    sessionKey: 'arvi_webchat_session_v1',
    historyKey: 'arvi_webchat_history_v1',
    openKey: 'arvi_webchat_open_v1',
    historyTtlMs: 24 * 60 * 60 * 1000,
    maxStoredMessages: 30,
    maxMessageLength: 1200,
    ...window.ARVI_WEBCHAT,
  };

  const state = {
    open: false,
    pending: false,
    sessionId: getSessionId(),
    history: loadHistory(),
  };

  const root = document.createElement('div');
  root.dataset.arviWebchatRoot = 'true';
  root.innerHTML = `
    <button class="arvi-webchat-launcher" type="button" aria-label="Hablar con ARVI" aria-expanded="false" aria-controls="arviWebchatPanel">
      <span class="arvi-webchat-launcher__mark" aria-hidden="true"></span>
      <span class="arvi-webchat-launcher__label">Hablar con ARVI</span>
      <span class="arvi-webchat-launcher__status" aria-hidden="true"></span>
    </button>
    <section class="arvi-webchat-panel" id="arviWebchatPanel" aria-label="Chat con ARVI" aria-hidden="true">
      <header class="arvi-webchat-header">
        <div class="arvi-webchat-identity">
          <span class="arvi-webchat-avatar" aria-hidden="true"></span>
          <div><strong>ARVI</strong><span><i></i> Disponible en esta página</span></div>
        </div>
        <button class="arvi-webchat-close" type="button" aria-label="Minimizar chat">×</button>
      </header>
      <div class="arvi-webchat-context" aria-live="polite"></div>
      <div class="arvi-webchat-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="arvi-webchat-typing" aria-hidden="true"><span></span><span></span><span></span><b>ARVI está pensando…</b></div>
      <form class="arvi-webchat-form">
        <label class="arvi-webchat-sr-only" for="arviWebchatInput">Escribe tu mensaje</label>
        <textarea id="arviWebchatInput" rows="1" maxlength="${CONFIG.maxMessageLength}" placeholder="Escribe tu mensaje…" autocomplete="off"></textarea>
        <button type="submit" aria-label="Enviar mensaje">➜</button>
      </form>
      <div class="arvi-webchat-footer"><span>ARVI puede equivocarse. Verifica decisiones importantes.</span></div>
    </section>`;

  document.body.appendChild(root);
  mountStyles();

  const launcher = root.querySelector('.arvi-webchat-launcher');
  const panel = root.querySelector('.arvi-webchat-panel');
  const close = root.querySelector('.arvi-webchat-close');
  const messages = root.querySelector('.arvi-webchat-messages');
  const context = root.querySelector('.arvi-webchat-context');
  const typing = root.querySelector('.arvi-webchat-typing');
  const form = root.querySelector('.arvi-webchat-form');
  const input = root.querySelector('#arviWebchatInput');
  const submit = form.querySelector('button[type="submit"]');

  context.textContent = contextLabel();
  renderHistory();

  launcher.addEventListener('click', () => setOpen(!state.open));
  close.addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', onSubmit);
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.open) setOpen(false);
  });

  if (sessionStorage.getItem(CONFIG.openKey) === '1') setOpen(true, { focus: false, track: false });

  function setOpen(next, options = {}) {
    const { focus = true, track = true } = options;
    state.open = Boolean(next);
    launcher.setAttribute('aria-expanded', String(state.open));
    panel.setAttribute('aria-hidden', String(!state.open));
    panel.classList.toggle('is-open', state.open);
    launcher.classList.toggle('is-hidden', state.open);
    sessionStorage.setItem(CONFIG.openKey, state.open ? '1' : '0');
    if (state.open) {
      if (track) trackClick('webchat-open', window.location.pathname);
      ensureGreeting();
      requestAnimationFrame(() => {
        scrollToBottom();
        if (focus) input.focus({ preventScroll: true });
      });
    }
  }

  function ensureGreeting() {
    if (state.history.length) return;
    const greeting = greetingForPage();
    addMessage('assistant', greeting, { persist: true });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (state.pending) return;

    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    autoGrow();
    addMessage('user', message, { persist: true });
    setPending(true);

    const payload = {
      channel: 'web',
      session_id: state.sessionId,
      message,
      page: {
        path: window.location.pathname,
        title: document.title || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || window.location.href,
        host: window.location.hostname,
      },
      tenant: CONFIG.tenant,
      history: state.history.slice(-12).map(item => ({ role: item.role, content: item.content })),
    };

    try {
      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-ARVI-Web-Chat': '1' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      const data = await readJson(response);
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);

      const reply = cleanReply(data?.response || data?.reply || data?.output);
      if (!reply) throw new Error('EMPTY_RESPONSE');

      addMessage('assistant', reply, { persist: true });
      if (data?.handoff?.whatsapp_url || data?.handoff === true) {
        addHandoff(data?.handoff?.whatsapp_url || CONFIG.whatsappUrl, data?.handoff?.label);
      }
      trackClick('webchat-message-success', window.location.pathname);
    } catch (error) {
      console.warn('ARVI_WEBCHAT_ERROR', error?.message || error);
      addSystemError();
      trackClick('webchat-message-error', window.location.pathname);
    } finally {
      setPending(false);
    }
  }

  function setPending(next) {
    state.pending = Boolean(next);
    input.disabled = state.pending;
    submit.disabled = state.pending;
    typing.classList.toggle('is-visible', state.pending);
    typing.setAttribute('aria-hidden', String(!state.pending));
    if (state.pending) scrollToBottom();
  }

  function addMessage(role, content, options = {}) {
    const safeRole = role === 'user' ? 'user' : 'assistant';
    const text = String(content || '').trim();
    if (!text) return;

    const item = { role: safeRole, content: text, at: Date.now() };
    if (options.persist) {
      state.history.push(item);
      if (state.history.length > CONFIG.maxStoredMessages) state.history = state.history.slice(-CONFIG.maxStoredMessages);
      saveHistory();
    }

    messages.appendChild(messageNode(item));
    scrollToBottom();
  }

  function messageNode(item) {
    const wrap = document.createElement('div');
    wrap.className = `arvi-webchat-message is-${item.role}`;
    const bubble = document.createElement('div');
    bubble.className = 'arvi-webchat-message__bubble';
    bubble.textContent = item.content;
    wrap.appendChild(bubble);
    return wrap;
  }

  function renderHistory() {
    messages.textContent = '';
    state.history.forEach(item => messages.appendChild(messageNode(item)));
  }

  function addSystemError() {
    const wrap = document.createElement('div');
    wrap.className = 'arvi-webchat-message is-assistant';
    const bubble = document.createElement('div');
    bubble.className = 'arvi-webchat-message__bubble is-error';
    bubble.textContent = 'No pude responder en este momento. Puedes intentar de nuevo o continuar por WhatsApp.';
    const link = document.createElement('a');
    link.href = CONFIG.whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Continuar por WhatsApp →';
    link.addEventListener('click', () => trackClick('webchat-fallback-whatsapp', link.href));
    bubble.appendChild(document.createElement('br'));
    bubble.appendChild(link);
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    scrollToBottom();
  }

  function addHandoff(url, label) {
    const wrap = document.createElement('div');
    wrap.className = 'arvi-webchat-handoff';
    const text = document.createElement('span');
    text.textContent = '¿Quieres continuar con una persona?';
    const link = document.createElement('a');
    link.href = safeWhatsAppUrl(url) || CONFIG.whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = label || 'Seguir por WhatsApp';
    link.addEventListener('click', () => trackClick('webchat-handoff-whatsapp', link.href));
    wrap.append(text, link);
    messages.appendChild(wrap);
    scrollToBottom();
  }

  function greetingForPage() {
    const path = window.location.pathname;
    if (path.startsWith('/precios')) return 'Hola 👋 Soy ARVI. Veo que estás revisando precios. Cuéntame qué quieres automatizar y te ayudo a ubicar la opción que más sentido tiene.';
    if (path.includes('/sectores/belleza')) return 'Hola 👋 Soy ARVI. Estás viendo ARVI Agenda. Si me cuentas cómo manejas hoy tus citas, puedo ayudarte a entender qué parte se puede automatizar.';
    if (path.includes('/sectores/hoteles')) return 'Hola 👋 Soy ARVI. Estás revisando nuestra solución para hotelería. ¿Qué parte de recepción o atención por WhatsApp te está quitando más tiempo?';
    if (path.includes('/diagnostico')) return 'Hola 👋 Soy ARVI. Puedo acompañarte mientras haces el diagnóstico. ¿Qué proceso de tu negocio quieres revisar primero?';
    if (path.includes('/calculadora-roi')) return 'Hola 👋 Soy ARVI. Si quieres, te ayudo a interpretar qué tareas vale la pena medir antes de automatizar.';
    if (path.includes('/agente')) return 'Hola 👋 Soy ARVI. Aquí puedes probar cómo se siente conversar conmigo sin salir de la página. ¿Qué hace tu negocio?';
    return 'Hola 👋 Soy ARVI. Puedo ayudarte a entender qué automatizar en tu negocio, cómo funcionaría y por dónde conviene empezar. ¿Qué quieres resolver?';
  }

  function contextLabel() {
    const path = window.location.pathname;
    if (path === '/' || path === '') return 'Contexto: sitio principal de ARVI';
    if (path.startsWith('/precios')) return 'Contexto: precios y planes de ARVI';
    if (path.includes('/sectores/belleza')) return 'Contexto: ARVI Agenda';
    if (path.includes('/sectores/hoteles')) return 'Contexto: ARVI para hotelería';
    if (path.includes('/diagnostico')) return 'Contexto: diagnóstico ARVI';
    if (path.includes('/calculadora-roi')) return 'Contexto: calculadora de ROI';
    return `Contexto: ${document.title.split('|')[0].trim() || 'ARVI'}`;
  }

  function getSessionId() {
    try {
      const existing = localStorage.getItem(CONFIG.sessionKey);
      if (existing && /^web_[A-Za-z0-9_-]{12,80}$/.test(existing)) return existing;
      const raw = crypto?.randomUUID ? crypto.randomUUID().replace(/-/g, '') : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      const id = `web_${raw.slice(0, 48)}`;
      localStorage.setItem(CONFIG.sessionKey, id);
      return id;
    } catch {
      return `web_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
    }
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CONFIG.historyKey) || 'null');
      if (!parsed || !Array.isArray(parsed.items) || Date.now() - Number(parsed.updatedAt || 0) > CONFIG.historyTtlMs) return [];
      return parsed.items
        .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
        .slice(-CONFIG.maxStoredMessages)
        .map(item => ({ role: item.role, content: item.content.slice(0, 8000), at: Number(item.at || Date.now()) }));
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(CONFIG.historyKey, JSON.stringify({ updatedAt: Date.now(), items: state.history }));
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }

  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  function cleanReply(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\u0000/g, '').trim().slice(0, 8000);
  }

  function safeWhatsAppUrl(value) {
    try {
      const url = new URL(value);
      return ['wa.me', 'api.whatsapp.com'].includes(url.hostname) ? url.toString() : '';
    } catch {
      return '';
    }
  }

  async function readJson(response) {
    try { return await response.json(); } catch { return {}; }
  }

  function trackClick(id, target) {
    const payload = JSON.stringify({
      id,
      path: window.location.pathname,
      source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
      target: String(target || '').slice(0, 180),
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CONFIG.clickUrl, new Blob([payload], { type: 'application/json' }));
        return;
      }
      fetch(CONFIG.clickUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Analytics must never block chat.
    }
  }

  function mountStyles() {
    if (document.getElementById('arviWebchatStyles')) return;
    const style = document.createElement('style');
    style.id = 'arviWebchatStyles';
    style.textContent = `
      [data-arvi-webchat-root]{--awc-blue:#003A70;--awc-green:#22C55E;--awc-cyan:#06B6D4;--awc-violet:#7C3AED;--awc-950:#0B1424;--awc-900:#101D32;--awc-700:#334863;--awc-500:#64748B;--awc-100:#EEF2F7;--awc-white:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .arvi-webchat-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
      .arvi-webchat-launcher{position:fixed;right:22px;bottom:22px;z-index:1200;min-height:60px;display:flex;align-items:center;gap:10px;padding:9px 18px 9px 9px;border:1px solid rgba(255,255,255,.15);border-radius:999px;color:#fff;background:linear-gradient(135deg,var(--awc-950),var(--awc-blue));box-shadow:0 18px 48px rgba(0,58,112,.3),0 0 0 1px rgba(34,197,94,.08);cursor:pointer;font:800 13px/1 "Plus Jakarta Sans",Inter,sans-serif;transition:transform .22s ease,box-shadow .22s ease,opacity .18s ease}
      .arvi-webchat-launcher:hover{transform:translateY(-4px);box-shadow:0 24px 58px rgba(0,58,112,.38),0 0 0 4px rgba(34,197,94,.08)}
      .arvi-webchat-launcher.is-hidden{opacity:0;pointer-events:none;transform:translateY(8px)}
      .arvi-webchat-launcher__mark,.arvi-webchat-avatar{background:rgba(255,255,255,.08) url('https://res.cloudinary.com/dmh6nxvur/image/upload/c_crop,x_520,y_220,w_550,h_530/v1788451865/arvi/brand/isotipo-a.png') center/30px 30px no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
      .arvi-webchat-launcher__mark{width:40px;height:40px;flex:0 0 40px;border-radius:50%}
      .arvi-webchat-launcher__status{position:absolute;right:8px;top:7px;width:10px;height:10px;border-radius:50%;background:var(--awc-green);box-shadow:0 0 0 4px rgba(34,197,94,.14)}
      .arvi-webchat-panel{position:fixed;right:22px;bottom:22px;z-index:1201;width:min(390px,calc(100vw - 28px));height:min(620px,calc(100dvh - 44px));display:grid;grid-template-rows:auto auto minmax(0,1fr) auto auto auto;overflow:hidden;border:1px solid rgba(203,213,225,.85);border-radius:25px;background:#F8FAFC;box-shadow:0 30px 90px rgba(11,20,36,.28),0 0 0 1px rgba(255,255,255,.7);opacity:0;pointer-events:none;transform:translateY(18px) scale(.985);transform-origin:bottom right;transition:opacity .2s ease,transform .24s cubic-bezier(.2,.8,.2,1)}
      .arvi-webchat-panel.is-open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}
      .arvi-webchat-header{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 15px 14px 16px;color:#fff;background:radial-gradient(circle at 90% 0%,rgba(124,58,237,.22),transparent 32%),linear-gradient(135deg,var(--awc-950),var(--awc-blue))}
      .arvi-webchat-identity{display:flex;align-items:center;gap:11px;min-width:0}.arvi-webchat-avatar{width:44px;height:44px;flex:0 0 44px;border-radius:14px;background-size:32px 32px}.arvi-webchat-identity strong{display:block;font:800 15px/1.2 "Plus Jakarta Sans",Inter,sans-serif}.arvi-webchat-identity span{display:flex;align-items:center;gap:6px;margin-top:5px;color:#C8D9E9;font-size:11px}.arvi-webchat-identity i{width:7px;height:7px;border-radius:50%;background:var(--awc-green);box-shadow:0 0 0 4px rgba(34,197,94,.12)}
      .arvi-webchat-close{width:38px;height:38px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;background:rgba(255,255,255,.07);cursor:pointer;font:400 25px/1 Inter,sans-serif}.arvi-webchat-close:hover{background:rgba(255,255,255,.12)}
      .arvi-webchat-context{padding:9px 15px;border-bottom:1px solid #E4EBF2;color:var(--awc-500);background:#fff;font-size:10px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .arvi-webchat-messages{min-height:0;overflow-y:auto;padding:17px 14px 10px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#CBD5E1 transparent}
      .arvi-webchat-message{display:flex;margin:0 0 11px}.arvi-webchat-message.is-user{justify-content:flex-end}.arvi-webchat-message__bubble{max-width:86%;padding:11px 13px;border-radius:16px 16px 16px 5px;color:var(--awc-900);background:#fff;border:1px solid #DCE5EE;box-shadow:0 6px 18px rgba(0,58,112,.055);font-size:13px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}.arvi-webchat-message.is-user .arvi-webchat-message__bubble{color:#fff;background:linear-gradient(135deg,var(--awc-blue),#07558B);border-color:transparent;border-radius:16px 16px 5px 16px}.arvi-webchat-message__bubble.is-error{background:#FFF9F1;border-color:#F2D7AE;color:#65491F}.arvi-webchat-message__bubble a{display:inline-block;margin-top:7px;color:var(--awc-blue);font-weight:800;text-decoration:none}
      .arvi-webchat-typing{display:none;align-items:center;gap:5px;padding:3px 16px 8px;color:var(--awc-500);font-size:10px}.arvi-webchat-typing.is-visible{display:flex}.arvi-webchat-typing span{width:5px;height:5px;border-radius:50%;background:var(--awc-cyan);animation:awc-dot 1.2s ease-in-out infinite}.arvi-webchat-typing span:nth-child(2){animation-delay:.16s}.arvi-webchat-typing span:nth-child(3){animation-delay:.32s}.arvi-webchat-typing b{margin-left:4px;font-weight:700}
      .arvi-webchat-form{display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:8px;padding:10px 12px 9px;border-top:1px solid #E1E9F0;background:#fff}.arvi-webchat-form textarea{width:100%;min-height:44px;max-height:112px;resize:none;padding:12px 13px;border:1px solid #CBD5E1;border-radius:14px;outline:none;color:var(--awc-900);background:#F8FAFC;font:500 13px/1.45 Inter,sans-serif}.arvi-webchat-form textarea:focus{border-color:rgba(0,58,112,.45);box-shadow:0 0 0 3px rgba(6,182,212,.09)}.arvi-webchat-form button{width:44px;height:44px;align-self:end;border:0;border-radius:14px;color:#07160C;background:var(--awc-green);cursor:pointer;font:900 19px/1 Inter,sans-serif;transition:transform .16s ease,opacity .16s ease}.arvi-webchat-form button:hover{transform:translateY(-1px)}.arvi-webchat-form button:disabled,.arvi-webchat-form textarea:disabled{opacity:.55;cursor:wait}
      .arvi-webchat-footer{padding:0 12px 10px;text-align:center;color:#8294A7;background:#fff;font-size:9px;line-height:1.35}
      .arvi-webchat-handoff{margin:4px 0 13px;padding:12px 13px;border:1px solid rgba(34,197,94,.22);border-radius:15px;background:#EAF9F0;color:#315F40;font-size:11px;line-height:1.45}.arvi-webchat-handoff span{display:block;font-weight:700}.arvi-webchat-handoff a{display:inline-flex;margin-top:8px;padding:8px 10px;border-radius:999px;color:#07160C;background:var(--awc-green);text-decoration:none;font-weight:800}
      @keyframes awc-dot{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-3px);opacity:1}}
      @media(max-width:640px){.arvi-webchat-launcher{right:14px;bottom:14px;width:60px;height:60px;min-height:60px;padding:10px;border-radius:50%}.arvi-webchat-launcher__label{display:none}.arvi-webchat-launcher__mark{width:40px;height:40px;flex-basis:40px}.arvi-webchat-panel{right:7px;bottom:7px;width:calc(100vw - 14px);height:min(680px,calc(100dvh - 14px));border-radius:22px}.arvi-webchat-context{font-size:9px}}
      @media(prefers-reduced-motion:no-preference){.arvi-webchat-launcher{animation:awc-launch .55s .7s cubic-bezier(.2,.8,.2,1) both}.arvi-webchat-launcher__status{animation:awc-pulse 2.2s ease-out infinite}.arvi-webchat-panel.is-open{animation:awc-panel .24s cubic-bezier(.2,.8,.2,1) both}}
      @keyframes awc-launch{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes awc-panel{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes awc-pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.28)}70%,100%{box-shadow:0 0 0 10px rgba(34,197,94,0)}}
      @media(prefers-reduced-motion:reduce){.arvi-webchat-launcher,.arvi-webchat-panel,.arvi-webchat-form button{transition:none!important;animation:none!important}.arvi-webchat-launcher:hover,.arvi-webchat-form button:hover{transform:none!important}.arvi-webchat-typing span{animation:none!important}}
    `;
    document.head.appendChild(style);
  }
})();

(() => {
  const config = window.ARVI_HUB;
  if (!config) return;

  setText('heroEyebrow', config.hero?.eyebrow);
  setText('heroTitle', config.hero?.title);
  setText('heroDescription', config.hero?.description);

  const featuredCard = document.getElementById('featuredCard');
  if (config.featured?.active && featuredCard) {
    featuredCard.classList.remove('hidden');
    setText('featuredBadge', config.featured.badge || 'Destacado');
    setText('featuredTitle', config.featured.title);
    setText('featuredDescription', config.featured.description);
    const button = document.getElementById('featuredButton');
    button.textContent = config.featured.cta || 'Abrir';
    button.href = config.featured.href;
    addTracking(button, config.featured.id);
  }

  const primaryGrid = document.getElementById('primaryGrid');
  (config.primaryCards || []).forEach(card => {
    if (card.active === false) return;
    const anchor = document.createElement('a');
    anchor.className = 'primary-card';
    anchor.href = card.href;
    anchor.innerHTML = `
      <span class="primary-topline"></span>
      <span class="primary-icon" aria-hidden="true">${card.icon || '↗'}</span>
      <h3>${card.title}</h3>
      <p>${card.description || ''}</p>
      <div class="primary-meta">${(card.meta || []).map(item => `<span class="meta-chip">${item}</span>`).join('')}</div>
      <span class="primary-cta">${card.cta || 'Abrir'} <span aria-hidden="true">↗</span></span>`;
    addTracking(anchor, card.id);
    primaryGrid.appendChild(anchor);
  });

  const quickGrid = document.getElementById('quickGrid');
  (config.quickLinks || []).forEach(link => {
    if (link.active === false) return;
    const anchor = document.createElement('a');
    anchor.className = 'quick-card';
    anchor.href = link.href;
    anchor.innerHTML = `
      <span class="quick-topline"></span>
      <span class="quick-icon" aria-hidden="true">${link.icon || '↗'}</span>
      ${link.status ? `<span class="quick-status">${link.status}</span>` : ''}
      <h3>${link.title}</h3>
      <p>${link.description || ''}</p>
      <span class="quick-cta">Abrir <span aria-hidden="true">↗</span></span>`;
    addTracking(anchor, link.id);
    quickGrid.appendChild(anchor);
  });

  const footer = document.getElementById('footerLinks');
  (config.footerLinks || []).forEach(link => {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    addTracking(anchor, link.id);
    footer.appendChild(anchor);
  });

  mountChatBubble();

  function mountChatBubble() {
    if (document.querySelector('.arvi-chat-bubble')) return;

    const style = document.createElement('style');
    style.textContent = `
      .arvi-chat-bubble{position:fixed;right:22px;bottom:22px;z-index:1000;display:inline-flex;align-items:center;gap:10px;min-height:58px;padding:8px 16px 8px 9px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:linear-gradient(135deg,#0B1424,#003A70);color:#fff;text-decoration:none;font:700 13px/1.1 "Plus Jakarta Sans",Inter,sans-serif;box-shadow:0 18px 48px rgba(0,58,112,.28),0 0 0 1px rgba(34,197,94,.1);transition:transform .22s ease,box-shadow .22s ease}.arvi-chat-bubble:hover{transform:translateY(-4px);box-shadow:0 24px 58px rgba(0,58,112,.36),0 0 0 4px rgba(34,197,94,.09)}.arvi-chat-bubble__mark{width:40px;height:40px;flex:0 0 40px;border-radius:50%;background:rgba(255,255,255,.08) url('https://res.cloudinary.com/dmh6nxvur/image/upload/c_crop,x_520,y_220,w_550,h_530/v1788451865/arvi/brand/isotipo-a.png') center/30px 30px no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}.arvi-chat-bubble::after{content:"";position:absolute;right:7px;top:7px;width:10px;height:10px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 4px rgba(34,197,94,.14)}@media(max-width:640px){.arvi-chat-bubble{right:14px;bottom:14px;width:58px;height:58px;min-height:58px;padding:9px;border-radius:50%;font-size:0}.arvi-chat-bubble__mark{width:40px;height:40px;flex-basis:40px}}@media(prefers-reduced-motion:reduce){.arvi-chat-bubble{transition:none}.arvi-chat-bubble:hover{transform:none}}
    `;
    document.head.appendChild(style);

    const bubble = document.createElement('a');
    bubble.className = 'arvi-chat-bubble';
    bubble.href = 'https://wa.me/573183074381?text=Hola%2C%20quiero%20hablar%20con%20ARVI.';
    bubble.target = '_blank';
    bubble.rel = 'noopener';
    bubble.setAttribute('aria-label', 'Hablar con ARVI por WhatsApp');
    bubble.innerHTML = '<span class="arvi-chat-bubble__mark" aria-hidden="true"></span><span>Hablar con ARVI</span>';
    addTracking(bubble, 'floating-whatsapp');
    document.body.appendChild(bubble);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && value) element.textContent = value;
  }

  function addTracking(element, id) {
    if (!element || !id) return;
    element.dataset.trackId = id;
    element.addEventListener('click', () => trackClick(id, element.href));
  }

  function trackClick(id, href) {
    const payload = JSON.stringify({
      id,
      path: window.location.pathname,
      source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
      target: safeTarget(href),
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/click', new Blob([payload], { type: 'application/json' }));
        return;
      }
      fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // no-op
    }
  }

  function safeTarget(href) {
    try {
      const url = new URL(href, window.location.origin);
      return `${url.hostname}${url.pathname}`.slice(0, 180);
    } catch {
      return '';
    }
  }
})();

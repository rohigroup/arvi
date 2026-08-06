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

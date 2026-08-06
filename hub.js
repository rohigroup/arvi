(() => {
  const config = window.ARVI_HUB;

  if (!config) {
    console.error('No se encontró la configuración de enlaces de Arvi.');
    return;
  }

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && value) element.textContent = value;
  };

  setText('profileKicker', config.profile?.kicker);
  setText('profileTitle', config.profile?.title);
  setText('profileCopy', config.profile?.description);

  const addTracking = (element, id) => {
    if (!element || !id) return;
    element.dataset.trackId = id;
    element.addEventListener('click', () => trackClick(id, element.href));
  };

  const featured = config.featured;
  const featuredCard = document.getElementById('featuredCard');

  if (featured?.active && featuredCard) {
    featuredCard.classList.remove('hidden');
    setText('featuredBadge', featured.badge || 'Destacado');
    setText('featuredTitle', featured.title);
    setText('featuredDescription', featured.description);

    const button = document.getElementById('featuredButton');
    button.textContent = featured.cta || 'Abrir';
    button.href = featured.href;
    addTracking(button, featured.id);
  }

  const linksList = document.getElementById('linksList');

  (config.links || []).forEach(link => {
    if (link.active === false) return;

    const anchor = document.createElement('a');
    anchor.className = `link-card${link.primary ? ' primary' : ''}`;
    anchor.href = link.href;
    anchor.setAttribute('aria-label', link.title);

    const icon = document.createElement('span');
    icon.className = 'link-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = link.icon || '↗';

    const copy = document.createElement('span');
    copy.className = 'link-copy';

    const titleRow = document.createElement('span');
    titleRow.className = 'link-title-row';

    const title = document.createElement('strong');
    title.className = 'link-title';
    title.textContent = link.title;
    titleRow.appendChild(title);

    if (link.status) {
      const status = document.createElement('span');
      status.className = 'link-status';
      status.textContent = link.status;
      titleRow.appendChild(status);
    }

    const description = document.createElement('span');
    description.className = 'link-description';
    description.textContent = link.description || '';

    copy.append(titleRow, description);

    const arrow = document.createElement('span');
    arrow.className = 'link-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';

    anchor.append(icon, copy, arrow);
    addTracking(anchor, link.id);
    linksList.appendChild(anchor);
  });

  const footer = document.getElementById('footerLinks');

  (config.footerLinks || []).forEach(link => {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    addTracking(anchor, link.id);
    footer.appendChild(anchor);
  });

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
      // El registro del clic nunca debe impedir la navegación.
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

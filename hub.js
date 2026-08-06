(() => {
  'use strict';

  const config = window.ARVI_LINKS;
  if (!config) {
    console.error('No fue posible cargar la configuración de enlaces de Arvi.');
    return;
  }

  const byId = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const node = byId(id);
    if (node) node.textContent = value || '';
  };

  setText('profileKicker', config.profile.kicker);
  setText('profileTitle', config.profile.title);
  setText('profileDescription', config.profile.description);

  hydrateFeatured(config.featured);
  renderLinks(config.links);
  renderFooter(config.footer);
  setupShare();

  function hydrateFeatured(featured) {
    const link = byId('featuredLink');
    if (!link || !featured) return;

    link.href = featured.href;
    link.dataset.linkId = featured.id;
    if (featured.external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    setText('featuredEyebrow', featured.eyebrow);
    setText('featuredTitle', featured.title);
    setText('featuredDescription', featured.description);
    setText('featuredMeta', featured.meta);
    link.addEventListener('click', () => trackClick(featured.id));
  }

  function renderLinks(items = []) {
    const root = byId('links');
    if (!root) return;

    root.replaceChildren(...items.map((item) => {
      const link = document.createElement('a');
      link.className = `link-card tone-${item.tone || 'soft'}`;
      link.href = item.href;
      link.dataset.linkId = item.id;
      link.setAttribute('aria-label', `${item.title}. ${item.description || ''}`.trim());

      if (item.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      link.innerHTML = `
        <span class="link-icon" aria-hidden="true">${iconMarkup(item.icon)}</span>
        <span class="link-copy">
          <span class="link-eyebrow">${escapeHtml(item.eyebrow || '')}</span>
          <strong class="link-title">${escapeHtml(item.title)}</strong>
          <span class="link-description">${escapeHtml(item.description || '')}</span>
        </span>
        <span class="link-arrow" aria-hidden="true">→</span>
      `;

      link.addEventListener('click', () => trackClick(item.id));
      return link;
    }));
  }

  function renderFooter(items = []) {
    const root = byId('footerLinks');
    if (!root) return;

    root.replaceChildren(...items.map((item) => {
      const link = document.createElement('a');
      link.className = 'footer-link';
      link.href = item.href;
      link.textContent = item.label;
      link.dataset.linkId = item.id;

      if (item.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      link.addEventListener('click', () => trackClick(item.id));
      return link;
    }));
  }

  function setupShare() {
    const button = byId('shareButton');
    const status = byId('shareStatus');
    if (!button) return;

    button.addEventListener('click', async () => {
      const shareData = {
        title: 'Arvi | Automatiza y vive',
        text: 'Conoce las soluciones, capacitaciones y herramientas de Arvi.',
        url: window.location.href,
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          showStatus('Enlace compartido.');
          return;
        }

        await navigator.clipboard.writeText(window.location.href);
        showStatus('Enlace copiado.');
      } catch (error) {
        if (error?.name !== 'AbortError') showStatus('No fue posible compartir el enlace.');
      }
    });

    function showStatus(message) {
      if (!status) return;
      status.textContent = message;
      window.setTimeout(() => {
        status.textContent = '';
      }, 2500);
    }
  }

  function trackClick(linkId) {
    if (!linkId) return;

    const body = JSON.stringify({
      linkId,
      path: window.location.pathname,
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/click', new Blob([body], { type: 'application/json' }));
        return;
      }

      fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // La analítica nunca debe impedir que el enlace abra.
    }
  }

  function iconMarkup(name) {
    const icons = {
      sparkles: '<svg viewBox="0 0 24 24"><path d="m12 3 1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3Z"/><path d="m18.5 14 .85 2.65L22 17.5l-2.65.85L18.5 21l-.85-2.65L15 17.5l2.65-.85.85-2.65Z"/><path d="m5 13 .65 2L7.5 16l-1.85.65L5 18.5l-.65-1.85L2.5 16l1.85-.65L5 13Z"/></svg>',
      bot: '<svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4"/><path d="M8.5 12h.01M15.5 12h.01"/><path d="M8 16h8"/></svg>',
      academy: '<svg viewBox="0 0 24 24"><path d="m3 10 9-5 9 5-9 5-9-5Z"/><path d="M7 12.5V17c2.8 2 7.2 2 10 0v-4.5"/><path d="M21 10v6"/></svg>',
      payroll: '<svg viewBox="0 0 24 24"><path d="M7 3h10l3 3v15H4V3h3Z"/><path d="M8 8h8M8 12h8M8 16h4"/><path d="M17 3v4h3"/></svg>',
      teams: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    };

    return icons[name] || icons.sparkles;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();

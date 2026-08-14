(() => {
  const hostname = window.location.hostname.toLowerCase();
  const path = window.location.pathname;

  if (hostname.startsWith('agente.') && (path === '/' || path === '')) {
    window.location.replace('/agente');
    return;
  }

  if (hostname.startsWith('diagnostico.') && (path === '/' || path === '')) {
    window.location.replace('/diagnostico');
  }
})();

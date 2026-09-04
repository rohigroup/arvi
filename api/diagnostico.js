const fs = require('fs');
const path = require('path');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).end('Method Not Allowed');
  }

  try {
    const sourcePath = path.join(process.cwd(), 'diagnostico.html');
    let html = fs.readFileSync(sourcePath, 'utf8');

    const brandHead = [
      '<link rel="canonical" href="https://arvi.rohigroup.co/diagnostico">',
      '<link rel="stylesheet" href="/diagnostico-brand.css">',
    ].join('');

    html = html.replace('</head>', `${brandHead}</head>`);

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    if (request.method === 'HEAD') return response.status(200).end();
    return response.status(200).send(html);
  } catch (error) {
    console.error('ARVI_DIAGNOSTIC_RENDER_ERROR', error);
    return response.status(500).send('No fue posible cargar el diagnóstico.');
  }
};

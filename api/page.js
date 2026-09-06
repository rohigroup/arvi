const fs = require('fs');
const path = require('path');

const ALLOWED_FILES = new Set([
  'index.html',
  'chatbot-whatsapp-ia.html',
  'agentes-ia.html',
  'automatizacion-procesos.html',
  'sectores-belleza.html',
  'sectores-hoteles.html',
  'sectores/consultorios.html',
  'sectores/pymes.html',
  'casos/agenda-belleza-whatsapp.html',
  'recursos.html',
  'recurso-chatbot-vs-agente-ia.html',
  'recursos/cuanto-cuesta-chatbot-whatsapp-colombia.html',
  'recursos/automatizar-citas-whatsapp.html',
  'precios.html',
  'calculadora-roi.html',
  'links.html',
]);

const LOADER = '<script src="/web-chat-loader.js" defer></script>';

module.exports = async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).end('Method Not Allowed');
  }

  const file = typeof request.query?.file === 'string' ? request.query.file : '';
  if (!ALLOWED_FILES.has(file)) return response.status(404).end('Not Found');

  try {
    const sourcePath = path.join(process.cwd(), file);
    let html = fs.readFileSync(sourcePath, 'utf8');

    if (!html.includes('/web-chat-loader.js')) {
      html = html.includes('</body>')
        ? html.replace('</body>', `${LOADER}</body>`)
        : `${html}${LOADER}`;
    }

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    response.setHeader('X-ARVI-WebChat', 'v1');
    if (request.method === 'HEAD') return response.status(200).end();
    return response.status(200).send(html);
  } catch (error) {
    console.error('ARVI_PAGE_RENDER_ERROR', { file, error });
    return response.status(500).send('No fue posible cargar esta página.');
  }
};

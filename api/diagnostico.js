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
      '<style>.arvi-chat-bubble{position:fixed;right:22px;bottom:22px;z-index:1000;display:inline-flex;align-items:center;gap:10px;min-height:58px;padding:8px 16px 8px 9px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:linear-gradient(135deg,#0B1424,#003A70);color:#fff;text-decoration:none;font:700 13px/1.1 "Plus Jakarta Sans",Inter,sans-serif;box-shadow:0 18px 48px rgba(0,58,112,.34);transition:transform .22s ease,box-shadow .22s ease}.arvi-chat-bubble:hover{transform:translateY(-4px);box-shadow:0 24px 58px rgba(0,58,112,.44)}.arvi-chat-bubble__mark{width:40px;height:40px;flex:0 0 40px;border-radius:50%;background:rgba(255,255,255,.08) url("https://res.cloudinary.com/dmh6nxvur/image/upload/c_crop,x_520,y_220,w_550,h_530/v1788451865/arvi/brand/isotipo-a.png") center/30px 30px no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}.arvi-chat-bubble::after{content:"";position:absolute;right:7px;top:7px;width:10px;height:10px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 4px rgba(34,197,94,.14)}@media(max-width:640px){.arvi-chat-bubble{right:14px;bottom:14px;width:58px;height:58px;min-height:58px;padding:9px;border-radius:50%;font-size:0}.arvi-chat-bubble__mark{width:40px;height:40px;flex-basis:40px}}@media(prefers-reduced-motion:reduce){.arvi-chat-bubble{transition:none}.arvi-chat-bubble:hover{transform:none}}</style>',
    ].join('');

    const bubble = '<a class="arvi-chat-bubble" href="https://wa.me/573183074381?text=Hola%2C%20estoy%20haciendo%20el%20diagn%C3%B3stico%20de%20ARVI%20y%20quiero%20hablar%20con%20ustedes." target="_blank" rel="noopener" aria-label="Hablar con ARVI por WhatsApp"><span class="arvi-chat-bubble__mark" aria-hidden="true"></span><span>Hablar con ARVI</span></a>';

    html = html.replace('</head>', `${brandHead}</head>`);
    html = html.replace('</body>', `${bubble}</body>`);

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    if (request.method === 'HEAD') return response.status(200).end();
    return response.status(200).send(html);
  } catch (error) {
    console.error('ARVI_DIAGNOSTIC_RENDER_ERROR', error);
    return response.status(500).send('No fue posible cargar el diagnóstico.');
  }
};

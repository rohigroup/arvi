const ID_PATTERN = /^[a-z0-9_-]{1,64}$/;

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ code: 'METHOD_NOT_ALLOWED' });
  }

  const body = normalizeBody(request.body);
  const id = cleanText(body.id, 64);

  if (!ID_PATTERN.test(id)) {
    return response.status(400).json({ code: 'INVALID_EVENT' });
  }

  const event = {
    event: 'ARVI_HUB_CLICK',
    id,
    path: cleanText(body.path, 120),
    source: cleanText(body.source, 60),
    target: cleanText(body.target, 180),
    occurred_at: new Date().toISOString(),
  };

  console.info(JSON.stringify(event));
  return response.status(204).end();
};

function normalizeBody(body) {
  if (body && typeof body === 'object') return body;

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return {};
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

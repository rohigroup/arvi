const MAX_MESSAGE = 1200;
const ALLOWED_CHANNEL = 'web';
const ALLOWED_TENANT = 'rohi-group';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });

  const webhookUrl = process.env.ARVI_WEBCHAT_N8N_URL;
  const webhookSecret = process.env.ARVI_WEBCHAT_SECRET;
  if (!webhookUrl) return json(res, 503, { error: 'webchat_not_configured' });

  const body = req.body || {};
  const channel = cleanText(body.channel, 20);
  const tenant = cleanText(body.tenant, 80);
  const sessionId = cleanText(body.session_id, 160);
  const message = cleanText(body.message, MAX_MESSAGE);
  const page = cleanText(body.page, 300) || '/';

  if (channel !== ALLOWED_CHANNEL || tenant !== ALLOWED_TENANT) return json(res, 400, { error: 'invalid_channel_or_tenant' });
  if (!/^web_[A-Za-z0-9_-]{8,160}$/.test(sessionId)) return json(res, 400, { error: 'invalid_session' });
  if (!message) return json(res, 400, { error: 'message_required' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret ? { 'X-ARVI-Webhook-Secret': webhookSecret } : {})
      },
      body: JSON.stringify({ channel, tenant, session_id: sessionId, message, page }),
      signal: controller.signal
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json(res, 502, { error: 'upstream_error' });
    const response = cleanText(data.response, 6000);
    if (!response) return json(res, 502, { error: 'empty_upstream_response' });

    return json(res, 200, { response, handoff: data.handoff === true });
  } catch (error) {
    return json(res, error?.name === 'AbortError' ? 504 : 502, { error: error?.name === 'AbortError' ? 'upstream_timeout' : 'upstream_unavailable' });
  } finally {
    clearTimeout(timeout);
  }
}

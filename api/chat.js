const MAX_MESSAGE = 1200;
const MAX_PAGE = 500;
const CONTROL_HUB_TIMEOUT_MS = 18_000;
const DEFAULT_SITE_KEY = 'arvi-public-site';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function parseBody(value) {
  if (typeof value !== 'string') return value && typeof value === 'object' ? value : {};
  try { return JSON.parse(value); } catch { return {}; }
}

function parseHttpsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });

  const controlHubUrl = parseHttpsUrl(process.env.ARVI_CONTROL_HUB_WEB_CHAT_URL);
  const controlHubToken = cleanText(process.env.ARVI_CONTROL_HUB_WEB_CHAT_TOKEN, 512);
  const siteKey = cleanText(process.env.ARVI_WEB_CHAT_SITE_KEY || DEFAULT_SITE_KEY, 80);
  if (!controlHubUrl || !controlHubToken || !/^[a-z0-9][a-z0-9._-]{2,79}$/.test(siteKey)) {
    return json(res, 503, { error: 'webchat_not_configured' });
  }

  const body = parseBody(req.body);
  if ('tenant' in body || 'channel' in body || 'site_key' in body || 'tenant_id' in body || 'channel_id' in body) {
    return json(res, 400, { error: 'invalid_authority_fields' });
  }

  const sessionId = cleanText(body.session_id, 164);
  const messageId = cleanText(body.message_id, 168);
  const message = cleanText(body.message, MAX_MESSAGE);
  const page = cleanText(body.page, MAX_PAGE) || '/';

  if (!/^web_[A-Za-z0-9_-]{8,160}$/.test(sessionId)) return json(res, 400, { error: 'invalid_session' });
  if (!/^webmsg_[A-Za-z0-9_-]{8,160}$/.test(messageId)) return json(res, 400, { error: 'invalid_message_id' });
  if (!message) return json(res, 400, { error: 'message_required' });
  if (!page.startsWith('/')) return json(res, 400, { error: 'invalid_page' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONTROL_HUB_TIMEOUT_MS);

  try {
    const upstream = await fetch(controlHubUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${controlHubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_key: siteKey,
        session_id: sessionId,
        message_id: messageId,
        message,
        page,
      }),
      signal: controller.signal,
    });

    const data = await upstream.json().catch(() => ({}));

    if (upstream.status === 202 && data?.pending === true) {
      return json(res, 202, {
        pending: true,
        conversation_id: cleanText(data.conversation_id, 64) || undefined,
      });
    }

    if (!upstream.ok) return json(res, 502, { error: 'control_hub_unavailable' });

    const response = cleanText(data?.response, 4000);
    if (!response) return json(res, 502, { error: 'empty_control_hub_response' });

    return json(res, 200, {
      response,
      handoff: data?.handoff === true,
      replayed: data?.replayed === true,
      conversation_id: cleanText(data?.conversation_id, 64) || undefined,
    });
  } catch (error) {
    return json(
      res,
      error?.name === 'AbortError' ? 504 : 502,
      { error: error?.name === 'AbortError' ? 'control_hub_timeout' : 'control_hub_unavailable' },
    );
  } finally {
    clearTimeout(timeout);
  }
}

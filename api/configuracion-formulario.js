const SUPABASE_URL = 'https://buwiddoznkygramillcp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_y47Tkaub__SjLC0s_hfaIQ__YF2D98V';
const MAX_BODY_BYTES = 180_000;

const RPC = Object.freeze({
  create: 'arvi_form_create_draft',
  get: 'arvi_form_get',
  save: 'arvi_form_save_draft',
  submit: 'arvi_form_submit',
});

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

function text(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function parseBody(value) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string') return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isHash(value) {
  return /^[0-9a-f]{64}$/i.test(value);
}

function answers(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function byteLength(value) {
  try { return Buffer.byteLength(JSON.stringify(value), 'utf8'); } catch { return Infinity; }
}

function mapUpstreamError(status, payload) {
  const message = text(payload?.message || payload?.error || payload?.hint, 300);
  if (message.includes('revision_conflict')) return [409, 'revision_conflict'];
  if (message.includes('form_not_found_or_invalid_token')) return [404, 'form_not_found_or_invalid_token'];
  if (message.includes('invalid_resume_token_hash')) return [400, 'invalid_resume_token_hash'];
  if (status >= 500) return [502, 'form_backend_unavailable'];
  return [400, 'form_request_rejected'];
}

async function callRpc(name, args) {
  const upstream = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(args),
  });

  const raw = await upstream.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = { message: raw }; }

  if (!upstream.ok) {
    const [status, error] = mapUpstreamError(upstream.status, data);
    const err = new Error(error);
    err.publicStatus = status;
    err.publicCode = error;
    throw err;
  }
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const body = parseBody(req.body);
  if (byteLength(body) > MAX_BODY_BYTES) return json(res, 413, { ok: false, error: 'payload_too_large' });

  const origin = text(req.headers.origin, 300);
  if (origin && !/^https:\/\/(?:[a-z0-9-]+\.)?arvi\.rohigroup\.co$/i.test(origin) && !/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return json(res, 403, { ok: false, error: 'origin_not_allowed' });
  }

  // Honeypot: bots that fill hidden fields get a harmless success without touching the database.
  if (text(body.website, 200)) return json(res, 200, { ok: true, data: { accepted: true } });

  const action = text(body.action, 20);
  if (!RPC[action]) return json(res, 400, { ok: false, error: 'invalid_action' });

  try {
    let args;

    if (action === 'create') {
      const formAnswers = answers(body.answers);
      const hash = text(body.resume_token_hash, 64);
      if (!formAnswers || !isHash(hash)) return json(res, 400, { ok: false, error: 'invalid_payload' });

      args = {
        p_form_type: 'master_configuration',
        p_form_version: '4.0',
        p_organization_name: text(body.organization_name, 240),
        p_contact_name: text(body.contact_name, 240),
        p_answers: formAnswers,
        p_resume_token_hash: hash,
        p_source: 'arvi_public_configuration_form',
      };
    }

    if (action === 'get') {
      const id = text(body.id, 64);
      const hash = text(body.resume_token_hash, 64);
      if (!isUuid(id) || !isHash(hash)) return json(res, 400, { ok: false, error: 'invalid_payload' });
      args = { p_id: id, p_resume_token_hash: hash };
    }

    if (action === 'save' || action === 'submit') {
      const id = text(body.id, 64);
      const hash = text(body.resume_token_hash, 64);
      const revision = Number(body.expected_revision);
      const formAnswers = answers(body.answers);
      if (!isUuid(id) || !isHash(hash) || !Number.isInteger(revision) || revision < 1 || !formAnswers) {
        return json(res, 400, { ok: false, error: 'invalid_payload' });
      }

      args = {
        p_id: id,
        p_resume_token_hash: hash,
        p_expected_revision: revision,
        p_organization_name: text(body.organization_name, 240),
        p_contact_name: text(body.contact_name, 240),
        p_answers: formAnswers,
      };
    }

    const data = await callRpc(RPC[action], args);
    return json(res, 200, { ok: true, data });
  } catch (error) {
    console.error('ARVI_CONFIGURATION_FORM_ERROR', {
      action,
      code: error?.publicCode || 'unexpected_error',
    });
    return json(
      res,
      error?.publicStatus || 502,
      { ok: false, error: error?.publicCode || 'form_backend_unavailable' },
    );
  }
};

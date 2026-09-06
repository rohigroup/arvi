# Web Chat ARVI V1 — Acceptance Criteria

## User journey
1. Visitor opens any intended ARVI commercial page.
2. Floating ARVI launcher opens an in-page chat panel.
3. Visitor sends a message without leaving the site.
4. The browser keeps one anonymous `web_*` session across navigation.
5. Each user turn receives one opaque `webmsg_*` request id that is reused for retries of that same turn.
6. `/api/chat` validates only neutral browser fields and forwards them server-to-server to Control Hub.
7. Control Hub resolves tenant/channel authority, persists the canonical conversation/message, invokes n8n, records the reply and returns it to the public facade.
8. ARVI answers inside the same panel.
9. WhatsApp is offered only as optional handoff.

## Authority boundary
Browser payload:
- `session_id`
- `message_id`
- `message`
- `page`

The browser must not send `tenant`, `tenant_id`, `channel`, `channel_id` or `site_key`. `/api/chat` rejects those authority fields.

Server-side public-site configuration:
- `ARVI_CONTROL_HUB_WEB_CHAT_URL`
- `ARVI_CONTROL_HUB_WEB_CHAT_TOKEN`
- `ARVI_WEB_CHAT_SITE_KEY` (optional; defaults to `arvi-public-site`)

Control Hub is the owner of tenant resolution, conversation/message persistence, idempotency and handoff state. n8n is an orchestrator for the AI turn, not the source of truth.

## Retry behavior
- `202 pending` is retried with the exact same `message_id` and payload.
- recoverable 5xx/timeout responses are retried with that same id so Control Hub can reconcile a request that may already have been accepted.
- a reused id with changed session/content/page must be rejected by Control Hub before n8n runs.
- one browser turn must never create two canonical inbound messages.

## Loader coverage
`api/page.js` injects `/web-chat-loader.js` for every allowlisted commercial HTML surface. `vercel.json` routes both clean URLs and their direct `.html` equivalents through that function, so the widget does not depend on a visitor using only the canonical clean route.

The agent and diagnostic subdomains remain separate product surfaces and are intentionally not converted into the public commercial chat surface by this block.

## Required before merge
- Control Hub PR for Web Chat is green.
- canonical clean/incremental database test path passes for the new Web Chat migrations.
- Control Hub production migration/channel/secrets remain blocked until explicit authorization.
- public preview is configured with the Control Hub preview endpoint/token only after the Control Hub database/runtime prerequisite exists in a safe environment.
- mobile panel verified at 320px+.
- direct `.html` and clean URLs both expose the loader on intended public pages.
- existing WhatsApp workflow remains unchanged.
- one end-to-end preview demonstrates browser → public facade → Control Hub → n8n → Control Hub → bubble.

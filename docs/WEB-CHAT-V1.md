# Web Chat ARVI V1 — Acceptance Criteria

## User journey
1. Visitor opens any ARVI commercial page.
2. Floating ARVI launcher opens an in-page chat panel.
3. Visitor sends a message without leaving the site.
4. The browser keeps an anonymous `web_*` session across navigation.
5. `/api/chat` forwards validated input to the n8n web adapter.
6. ARVI answers inside the panel.
7. Page path is supplied as context.
8. WhatsApp is offered only as optional handoff.

## Required before merge
- n8n web adapter returns `{ response, handoff }`.
- `ARVI_WEBCHAT_N8N_URL` configured server-side.
- Web chat loader included on every intended public surface.
- No direct n8n webhook URL in browser code.
- Mobile panel verified at 320px+.
- Existing WhatsApp workflow unchanged.
- One preview used to validate motion + chat together.

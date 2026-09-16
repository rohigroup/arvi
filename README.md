# ARVI — sitio público

Sitio comercial y de posicionamiento orgánico de ARVI, la línea de automatización con inteligencia artificial de Rohi Group.

## Objetivo

La raíz `arvi.rohigroup.co` funciona como sitio comercial e indexable. La arquitectura busca que personas, buscadores y sistemas de IA puedan entender con claridad qué es ARVI, qué problemas resuelve y en qué categorías compite.

## Posicionamiento

Promesa principal:

**ARVI convierte conversaciones en acciones.**

La marca se presenta como una plataforma de automatización empresarial que conecta atención, contactos, agenda, seguimiento y procesos con IA y control humano. El mensaje público debe evitar reducir ARVI a “un bot” o a una automatización aislada.

## Rutas comerciales

- `/` — home comercial y entidad principal de ARVI.
- `/chatbot-whatsapp-ia` — automatización conversacional y agentes IA para WhatsApp.
- `/agentes-ia` — agentes de inteligencia artificial para procesos empresariales.
- `/automatizacion-procesos` — automatización e integración de procesos.
- `/automatizacion-whatsapp-valledupar` — landing local para automatización de WhatsApp e IA en Valledupar.
- `/agente` — landing comercial existente de ARVI Agente IA.
- `/diagnostico-express` — diagnóstico de baja fricción: 6 preguntas, sin registro ni persistencia de respuestas.
- `/diagnostico` — diagnóstico económico-operativo profundo.
- `/links` — hub del ecosistema ARVI, preservado para bio y accesos rápidos.

## Web Chat ARVI V1

La bubble flotante deja de ser un simple acceso a WhatsApp y se convierte en un chat web embebido.

Arquitectura:

`browser -> /api/chat -> ARVI Control Hub /api/web-chat -> canonical conversation/messages -> n8n -> Control Hub -> /api/chat -> browser`

Autoridad:
- el navegador solo aporta `session_id`, `message_id`, `message` y `page`;
- el navegador no puede elegir tenant, canal ni `site_key`;
- la web pública conserva únicamente un facade same-origin;
- Control Hub resuelve tenant/canal y es la fuente de verdad de conversación, mensajes, idempotencia y handoff;
- n8n orquesta el turno de IA, pero no es el ledger canónico.

Archivos del bloque:
- `web-chat-v1.js` — cliente, sesión anónima persistente, id por turno, retry idempotente, historial local y panel de conversación.
- `web-chat-v1.css` — UI responsive del panel.
- `web-chat-loader.js` — loader reutilizable para superficies estáticas.
- `api/chat.js` — proxy server-side hacia Control Hub; no expone credenciales ni acepta autoridad del navegador.
- `api/page.js` — sirve las superficies comerciales allowlisted e inyecta el loader de forma determinística.

Variables server-side esperadas en el sitio público:
- `ARVI_CONTROL_HUB_WEB_CHAT_URL`
- `ARVI_CONTROL_HUB_WEB_CHAT_TOKEN`
- `ARVI_WEB_CHAT_SITE_KEY` (opcional; por defecto `arvi-public-site`)

Contrato browser → `/api/chat`:
- `session_id`
- `message_id`
- `message`
- `page`

WhatsApp queda como handoff opcional, no como transporte principal de la bubble.

## SEO

- `robots.txt` expone el sitemap.
- `sitemap.xml` lista las rutas indexables.
- La home incluye datos estructurados `Organization`, `WebSite` y `Service`.
- Las páginas de servicio tienen canonical, metadatos específicos y schema de servicio.
- La página de WhatsApp incluye además preguntas frecuentes visibles y `FAQPage` estructurado.
- La landing `/automatizacion-whatsapp-valledupar` crea una entidad local explícita para consultas de automatización, WhatsApp e IA en Valledupar sin convertir la home nacional en una página local.
- `/diagnostico-express` funciona como puerta de entrada de baja fricción y enlaza al diagnóstico económico-operativo cuando se necesita más profundidad.

## Dominios previstos

- `arvi.rohigroup.co` — sitio principal.
- `agente.arvi.rohigroup.co` — ARVI Agente IA.
- `diagnostico.arvi.rohigroup.co` — diagnóstico.

## Despliegue

El proyecto no necesita npm ni compilación. Vercel sirve HTML/CSS/JS estático y funciones serverless bajo `/api`.

El Web Chat debe permanecer en PREPARE hasta que Control Hub tenga migraciones/canal/secrets validados en un entorno seguro y se complete una aceptación end-to-end en preview. No se debe apuntar la web pública directamente a n8n.

## Próximas capas de posicionamiento

1. Casos reales publicables con métricas verificadas.
2. Centro de recursos y contenido editorial.
3. Search Console, medición de consultas y mejoras por datos reales.
4. Profundizar verticales cuando exista evidencia comercial suficiente.

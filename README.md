# ARVI — sitio público

Sitio comercial y de posicionamiento orgánico de ARVI, la línea de automatización con inteligencia artificial de Rohi Group.

## Objetivo

La raíz `arvi.rohigroup.co` funciona como sitio comercial e indexable. La arquitectura busca que personas, buscadores y sistemas de IA puedan entender con claridad qué es ARVI, qué problemas resuelve y en qué categorías compite.

## Rutas comerciales

- `/` — home comercial y entidad principal de ARVI.
- `/chatbot-whatsapp-ia` — automatización conversacional y agentes IA para WhatsApp.
- `/agentes-ia` — agentes de inteligencia artificial para procesos empresariales.
- `/automatizacion-procesos` — automatización e integración de procesos.
- `/agente` — landing comercial existente de ARVI Agente IA.
- `/diagnostico` — herramienta de diagnóstico.
- `/links` — hub del ecosistema ARVI, preservado para bio y accesos rápidos.

## Web Chat ARVI V1

La bubble flotante deja de ser un simple acceso a WhatsApp y se convierte en un chat web embebido.

Arquitectura:

`browser -> /api/chat -> n8n web adapter -> ARVI core -> /api/chat -> browser`

Archivos del bloque:
- `web-chat-v1.js` — cliente, sesión anónima persistente, historial local y panel de conversación.
- `web-chat-v1.css` — UI responsive del panel.
- `web-chat-loader.js` — loader reutilizable para superficies estáticas.
- `api/chat.js` — proxy server-side; valida contrato y mantiene oculta la URL de n8n.

Variables server-side esperadas:
- `ARVI_WEBCHAT_N8N_URL`
- `ARVI_WEBCHAT_SECRET` (opcional si el webhook se protege por otro mecanismo)

Contrato web:
`channel`, `session_id`, `message`, `page`, `tenant`.

WhatsApp queda como handoff opcional, no como transporte principal de la bubble.

## SEO

- `robots.txt` expone el sitemap.
- `sitemap.xml` lista las rutas indexables iniciales.
- La home incluye datos estructurados `Organization`, `WebSite` y `Service`.
- Las páginas de servicio tienen canonical, metadatos específicos y schema de servicio.
- La página de WhatsApp incluye además preguntas frecuentes visibles y `FAQPage` estructurado.

## Dominios previstos

- `arvi.rohigroup.co` — sitio principal.
- `agente.arvi.rohigroup.co` — ARVI Agente IA.
- `diagnostico.arvi.rohigroup.co` — diagnóstico.

## Despliegue

El proyecto no necesita npm ni compilación. Vercel sirve HTML/CSS/JS estático y funciones serverless bajo `/api`.

## Próximas capas de posicionamiento

1. Verticales: belleza, hotelería, consultorios y PYMES.
2. Casos de uso y casos reales publicables.
3. Centro de recursos y contenido editorial.
4. Calculadora de retorno de automatización.
5. Search Console, medición de consultas y mejoras por datos reales.

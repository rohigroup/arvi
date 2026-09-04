# ARVI — Publicación, Google Search Console e indexación

Este documento define el cierre del sprint SEO una vez `feat/arvi-seo-foundation` llegue a producción.

## 1. Antes de solicitar indexación

Confirmar en producción:

- `https://arvi.rohigroup.co/` responde 200.
- `https://arvi.rohigroup.co/robots.txt` responde 200 y permite rastreo público.
- `https://arvi.rohigroup.co/sitemap.xml` responde 200.
- Las URLs canónicas usan siempre `https://arvi.rohigroup.co/...`.
- No existe `x-robots-tag: noindex` en producción. Los previews de Vercel sí pueden mantener `noindex`.
- Las páginas clave cargan sin depender de JavaScript para mostrar su contenido principal.

## 2. Propiedad en Google Search Console

Preferencia: propiedad de dominio si Rohi Group controla el DNS de `rohigroup.co`.

Alternativa: propiedad de prefijo URL para `https://arvi.rohigroup.co/`.

No agregar un token de verificación al repositorio hasta tener el valor real entregado por Google.

## 3. Sitemap

Enviar:

`https://arvi.rohigroup.co/sitemap.xml`

Registrar fecha de envío y cualquier error reportado por Search Console.

## 4. URLs prioritarias para inspección

Solicitar inspección/indexación de forma prioritaria para:

1. `/`
2. `/chatbot-whatsapp-ia`
3. `/agentes-ia`
4. `/automatizacion-procesos`
5. `/precios`
6. `/calculadora-roi`
7. `/sectores/belleza`
8. `/casos/agenda-belleza-whatsapp`
9. `/recursos`
10. `/recursos/cuanto-cuesta-chatbot-whatsapp-colombia`

No es necesario solicitar manualmente cada URL del sitio si el sitemap y el enlazado interno funcionan correctamente.

## 5. Baseline de medición

Guardar línea base al publicar:

- páginas indexadas;
- impresiones;
- clics;
- consultas donde aparece ARVI;
- posición media por páginas comerciales;
- tráfico orgánico a `/diagnostico`, `/calculadora-roi` y `/precios`;
- clics a WhatsApp desde páginas orgánicas.

No evaluar éxito SEO por posiciones de los primeros días. Registrar tendencia por ventanas semanales y mensuales.

## 6. Consultas estratégicas iniciales

Monitorear, sin forzar stuffing de palabras clave:

- chatbot IA Colombia
- chatbot WhatsApp Colombia
- chatbot inteligencia artificial WhatsApp
- agente IA WhatsApp
- automatización WhatsApp empresas
- automatización con IA Colombia
- automatizar citas WhatsApp
- chatbot para salones de belleza
- automatización para hoteles Colombia
- agentes IA para empresas Colombia

## 7. Entidad ARVI

Mantener consistencia pública en:

- nombre: ARVI;
- relación: producto/solución de Rohi Group SAS;
- ubicación: Valledupar, Cesar, Colombia;
- cobertura: Colombia;
- categoría: automatización con IA, agentes IA y procesos conectados a WhatsApp;
- URLs oficiales;
- perfiles sociales y menciones de terceros.

El objetivo no es repetir estas frases artificialmente, sino evitar contradicciones de identidad entre web, Rohi Group, perfiles sociales, directorios y futuros casos de cliente.

## 8. Después del lanzamiento

Cada contenido nuevo debe:

1. responder una intención de búsqueda real;
2. enlazar a una página comercial o herramienta relacionada;
3. recibir enlaces desde al menos otra página relevante del sitio;
4. incluir `title`, descripción, canonical y schema cuando corresponda;
5. añadirse al sitemap;
6. evitar resultados, cifras o casos no verificados.

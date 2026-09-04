# ARVI — revisión de superficies legacy

Fecha: 2026-09-03

## /links

Corregido en esta rama.

- Wordmark oficial, no texto reconstruido.
- Plus Jakarta Sans + Inter.
- Azul Rohi dominante; verde para acción; cyan/violeta como acentos.
- Canvas claro y hero oscuro como momento especial.
- Eliminado el sistema de iconos con emojis.
- Copys normalizados a `ARVI`.

## /agente

La versión antigua se conserva físicamente como `agente.html`, pero la ruta pública `/agente` apunta a `agente-v2.html`.

La nueva versión:

- usa el sistema visual oficial;
- reutiliza logo y mascota oficiales;
- elimina pricing legacy y emojis;
- separa atención, agenda, seguimiento y handoff humano;
- enlaza a la página de precios vigente y al diagnóstico;
- usa el mismo lenguaje y componentes del sitio SEO actual.

## /diagnostico

La lógica del formulario original no se modifica.

La ruta pública `/diagnostico` pasa por `api/diagnostico.js`, que sirve el HTML original e inyecta `diagnostico-brand.css` después de sus estilos internos. La capa visual corrige:

- Azul Rohi `#003A70`.
- Wordmark oficial.
- Tracking de titulares.
- Botones y estados de acción.
- Gradientes y contraste dentro del sistema ARVI.

Esto permite mantener intactos la captura, validaciones, localStorage y envío a `app.rohigroup.co/api/automation-diagnostics`.

## Regla

No reactivar las superficies antiguas sin este brand pass. El source of truth sigue siendo `docs/BRAND-SOURCE.md`.

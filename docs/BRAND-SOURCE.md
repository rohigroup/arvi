# ARVI — Brand Source of Truth

Este documento es un guardrail de implementación. La identidad de ARVI NO debe reconstruirse por memoria, aproximación ni referencias de campañas anteriores.

## Fuentes oficiales

La fuente visual y verbal aprobada es el **Manual de Marca ARVI / Branding Arvi** entregado por la dirección de marca.

Los masters técnicos ya existentes en el ecosistema ARVI son:

- `logo-arvi.png` — wordmark oficial.
- `isotipo-a.png` — isotipo oficial A con punto verde.
- `arvi-mascota.png` — mascota oficial disponible en aplicación.
- El manual de marca contiene además los estados aprobados de mascota: saludando, pensando, trabajando y celebrando.

Los activos públicos usados por este sitio se sirven desde Cloudinary bajo `arvi/brand/` y deben provenir de esos masters; NO deben regenerarse con IA.

## Identidad visual obligatoria

### Paleta

- Azul Rohi `#003A70` — color dominante.
- Verde ARVI `#22C55E` — acción positiva, CTA y resultados. No usar como color dominante.
- Violeta IA `#7C3AED` — acento puntual.
- Cyan Digital `#06B6D4` — acento puntual.
- Blanco premium `#F8FAFC` — canvas principal.
- Gris Tech 950 `#0B1424`.
- Gris Tech 900 `#101D32`.
- Gris Tech 800 `#1C2D45`.
- Gris Tech 700 `#334863`.
- Gris Tech 500 `#64748B`.
- Gris Tech 300 `#CBD5E1`.
- Gris Tech 100 `#EEF2F7`.

Regla: azul domina; verde señala acción; cyan y violeta se usan con moderación.

### Tipografía

- `Plus Jakarta Sans` — títulos, H1-H3 y CTA.
- `Inter` — cuerpo y UI.
- `JetBrains Mono` — métricas y datos técnicos puntuales.

No sustituir el sistema por Poppins/Nunito en nuevas superficies de marca.

### Logo e isotipo

- Usar el wordmark oficial cuando exista espacio.
- Usar el isotipo oficial solo en espacios reducidos: favicon, avatar, app icon o equivalentes.
- No cambiar colores.
- No añadir sombras, biseles ni 3D al logo.
- No distorsionar, rotar, recortar letras ni reconstruir la A.
- No crear una A textual o geométrica “parecida” como sustituto.

### Mascota

La mascota es un robot 3D premium de cuerpo blanco, cabeza redondeada, pantalla negra, ojos digitales cyan/azules y el isotipo oficial en el pecho.

Usar los estados con intención:

- Saludando — onboarding / bienvenida / primer contacto.
- Pensando — análisis / revisión / objeciones.
- Trabajando — automatización / flujos / dashboards.
- Celebrando — resultados / wins.

No crear variantes genéricas, infantiles, amenazantes, tipo transformer o humanoides realistas.

## Lenguaje y posicionamiento

ARVI debe sentirse:

- 50% inteligencia tecnológica.
- 30% confianza empresarial.
- 20% cercanía humana.

Nunca debe sentirse robótico, corporativo, genérico, infantil, complicado, futurista exagerado o como una startup fría.

Frases rectoras aprobadas:

- **No es un bot. Es tu equipo.**
- **Tecnología amable para negocios reales.**
- **Automatiza y vive.**

El lenguaje debe ser claro, directo, colombiano y centrado en el trabajo real del negocio. Evitar jerga como LLM, pipeline u orquestación en la comunicación comercial salvo contenido técnico específico.

## Regla de implementación web

- Canvas claro `#F8FAFC` y tarjetas blancas como base.
- Fondos oscuros premium reservados para hero/stage de mascota, bandas de proceso, métricas o momentos especiales.
- Radio base de tarjetas: ~20 px.
- Sombras suaves con tinte azul, nunca sombra negra pesada.
- CTA principal verde ARVI.
- No usar emojis como sistema iconográfico de producto. Preferir iconografía lineal tipo Lucide o etiquetas tipográficas.

## Regla de oro

**Cuando exista cualquier duda de branding, detener la implementación y consultar el manual/asset oficial. No improvisar.**

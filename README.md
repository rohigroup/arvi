# Arvi Hub

Portal público de enlaces de Arvi y landing comercial de Arvi Agente IA.

## Rutas

- `/` — hub móvil para usar como enlace principal en Instagram.
- `/agente` — landing comercial de Arvi Agente IA.
- `agente.arvi.rohigroup.co` — redirige internamente a `/agente` cuando el dominio se conecte.

## Editar botones

Los textos, estados y enlaces del hub se administran en `links.js`.

Para ocultar temporalmente un enlace agrega:

```js
active: false
```

Para cambiar la campaña destacada modifica `featured`. El enlace de la biografía de Instagram permanece igual.

## Registro de clics

`/api/click` registra eventos no identificables en los logs de Vercel con el nombre `ARVI_HUB_CLICK`.

No guarda nombres, correos, teléfonos, direcciones IP ni contenido de conversaciones. Es instrumentación básica; no reemplaza una plataforma analítica con historial y panel de reportes.

## Dominios previstos

- `arvi.rohigroup.co` — hub principal.
- `agente.arvi.rohigroup.co` — Arvi Agente IA.

## Despliegue

El proyecto no necesita npm ni proceso de compilación. Vercel sirve los archivos estáticos y publica la función ubicada en `api/click.js`.

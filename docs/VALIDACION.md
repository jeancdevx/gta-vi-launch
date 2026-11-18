# Validación

18 de noviembre de 2026.

## Herramientas

- Tailwind CSS 4.3.5 integrado con Vite y tema propio.
- Oxlint 1.94.0: reglas de corrección, imports, TypeScript, accesibilidad y el
  plugin de estilo solicitado, sin advertencias permitidas.
- Oxfmt 0.79.0: soporte Astro, orden de imports y clases de Tailwind, comillas
  simples y ausencia de punto y coma.
- Husky, lint-staged y commitlint instalados localmente y activados mediante
  `prepare` y `core.hooksPath=.husky/_`.

## Comprobaciones

- `pnpm verify`: lint, formato, comprobación de Astro, cuatro pruebas unitarias
  y build estático correctos; tres páginas generadas.
- `pnpm test:e2e`: cinco casos de Chromium sobre el build estático. Cubren el
  instante de lanzamiento, filtros, búsqueda, URL y zonas alternativas, anchos
  de 320 a 1440 px, y carga de imágenes y fuentes locales.
- Los hooks se probaron mediante commits en un repositorio temporal: rechazo de
  variables sin uso, formato de archivos preparados, rechazo de mensajes
  inválidos y aceptación de un Conventional Commit válido. No se crearon commits
  ni se alteró el índice del proyecto.
- `pnpm assets:sync`: 14 recursos locales, cero pendientes. Los tamaños y SHA256
  están en `docs/assets-report.json`.
- Revisión visual de escritorio y móvil con los assets descargados y las fuentes
  cargadas. Se corrigió la resolución de rutas de assets durante la compilación.
- Se mantienen seis skills locales y sus licencias.

## Alcance

La revisión cubre Chromium; no se ha comprobado en un dispositivo físico, Safari
ni Firefox. Los horarios se calculan según la fuente publicada y no consultan
consolas o cuentas. No se ha publicado ni desplegado el proyecto.

La restricción de red y sockets observada en la primera sesión se resolvió en
esta sesión; no es un bloqueo pendiente de la entrega actual.

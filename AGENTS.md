# GTA VI Launch

Proyecto local de una landing en Astro y TypeScript. No publicar ni desplegar sin que se solicite.

## Skills del proyecto

Las skills viven únicamente en `.agents/skills/`. No instalar ni modificar skills globales.

- `landing-page-design`: estructura, jerarquía, composición y estados.
- `emil-design-eng`: interacciones y detalles de diseño.
- `animate`: transiciones y rendimiento.
- `choreograph`: coordinación de las escenas y el texto.
- `find-skills`: descubrir capacidades adicionales cuando exista una necesidad concreta.
- `web-design-guidelines`: revisión de accesibilidad, rendimiento y UX.

La petición explícita de seguir la identidad de GTA VI prevalece sobre las reglas genéricas de tipografía, paleta, gradientes y navegación de las skills. No convertir el tracker en una página comercial con testimonios o precios.

## Datos y precisión

- Fuente y fecha de lanzamiento en `src/constants.ts`.
- No inventar fechas, horarios, plataformas, disponibilidad o conexiones con servidores.
- La disponibilidad significa que se alcanzó la hora regional calculada, no que se verificó una copia del juego.
- Cada país muestra una ciudad y zona IANA. No afirmar que esa ciudad representa todos sus husos ni que toda tienda desbloquea igual.
- El reloj usa `Date.now()` cada tick, no un contador decreciente acumulativo.
- Probar cambios de disponibilidad, horario de verano, offsets de media hora y cuarto de hora.

## Assets

Inventario: `src/helpers/assets.helpers.ts`. Sincronizar: `pnpm assets:sync`. Mantener procedencia y estado en `docs/assets-report.json`. No marcar como descargados recursos que solo están referenciados por URL. Las imágenes y tipografías mantienen los derechos de sus titulares.

## Estructura y estilos

- Seguir la estructura de https://www.joshwcomeau.com/react/file-structure/ adaptada a Astro, documentada en `docs/ARQUITECTURA.md`.
- Cada componente público tiene `components/Nombre/Nombre.astro` e `index.ts`; mantener sus subcomponentes, tipos, constantes y cliente privados en la misma carpeta.
- Mantener las páginas como entradas de ruta pequeñas y utilizar `@/` para imports de aplicación. Los helpers ejecutados por Node conservan imports relativos con extensión `.ts`.
- Utilizar Tailwind CSS 4 mediante el plugin de Vite, tokens en `src/styles/global.css` y utilidades o `@apply` en la capa de componentes.
- Usar Oxlint y Oxfmt con sus configuraciones locales. No introducir ESLint o Prettier como herramientas paralelas.
- Husky ejecuta lint-staged en `pre-commit` y commitlint en `commit-msg`. Los mensajes siguen Conventional Commits.

## Verificación

`pnpm verify` ejecuta lint, formato, Astro, pruebas unitarias y build. `pnpm test:e2e` verifica el navegador. Preferir la versión de Node especificada en `.nvmrc`. No ocultar errores de red o de instalación. No afirmar que pasó el build o la revisión visual si no se ejecutaron.

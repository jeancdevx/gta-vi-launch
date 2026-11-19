# GTA VI Launch

Landing de fans en **Astro + Tailwind CSS 4 + TypeScript + GSAP** para seguir el
lanzamiento regional de GTA VI. Contadores de tiempo restante y transcurrido, 40
países, zonas adicionales, filtros, búsqueda, mapa ilustrativo y preferencias
guardadas en el navegador.

## Ejecutar

Node 26 y pnpm 10.33.2.

```sh
pnpm install
pnpm assets:sync
pnpm dev
```

Astro muestra la URL de desarrollo en la terminal, normalmente
`http://localhost:4321`. Las imágenes funcionan con URLs de origen cuando no
existe una copia local; `assets:sync` las descarga junto con las tipografías,
sin necesidad de editar el frontend. Las fuentes del juego solo se activan
después de descargarse correctamente.

```sh
pnpm test
pnpm check
pnpm build
pnpm preview
```

## Calidad de código y commits

```sh
pnpm lint          # Oxlint, sin advertencias permitidas
pnpm lint:fix      # Correcciones automáticas de lint
pnpm format        # Lint con correcciones y formato de Oxfmt
pnpm format:check  # Verificación de formato sin cambios
pnpm verify        # Lint, formato, Astro, pruebas unitarias y build
```

`.oxlintrc.json` configura los plugins TypeScript, React, accesibilidad e
imports, junto con las reglas de `@stylistic/eslint-plugin` solicitadas.
`.oxfmtrc.json` habilita Astro, comillas simples, ausencia de punto y coma,
ancho de 80 columnas, orden de imports y clases de Tailwind.

`pnpm install` ejecuta `prepare` e instala los hooks de Husky en este
repositorio. `pre-commit` usa lint-staged para corregir y formatear únicamente
los archivos preparados. `commit-msg` valida Conventional Commits, por ejemplo:

```sh
git commit -m "feat(tracker): agregar una región"
git commit -m "fix(countdown): corregir el cambio de estado"
```

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para el flujo de trabajo.

## Estado de entrega

- Código de la landing y lógica regional implementados.
- Skills instaladas solamente en `.agents/skills`.
- Pruebas de cálculo horario, `astro check` y build estático ejecutados
  correctamente. El build genera la landing, créditos y 404.
- Tailwind integrado mediante `@tailwindcss/vite`, tokens en `@theme`,
  utilidades y estilos compartidos en la capa de componentes.
- Imágenes y tipografías descargadas en `public/`; 14 recursos locales y ninguno
  pendiente en `docs/assets-report.json`.
- Cinco pruebas de navegador aprobadas en Chromium, además de las unitarias.
- Hooks verificados en un repositorio temporal: rechazan errores de lint y
  mensajes inválidos, formatean archivos preparados y aceptan un commit válido.

## Horarios

La
[fuente de Rockstar Support](https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s)
publica el 19 de noviembre de 2026 a medianoche local para PS5 y Xbox Series
X|S. El código convierte la medianoche con `Intl.DateTimeFormat` y zonas IANA,
incluyendo horario de verano y offsets fraccionarios.

## Radar de streamers y escudo sin spoilers

- `src/helpers/streamers.helpers.ts` mantiene el catálogo curado de 5 creadores
  por país (con respaldo regional transparente en territorios sin top 5 local) y
  la clasificación de riesgo de spoiler.
- `api/streamers.ts` expone el endpoint serverless `/api/streamers` para Vercel
  con caché de 60 segundos (`s-maxage=60, stale-while-revalidate=120`). En
  desarrollo local (`pnpm dev`), `astro.config.mjs` monta automáticamente el
  mismo endpoint leyendo `.env`.
- Copia `.env.example` a `.env` (o añade las mismas variables en tu proyecto de
  Vercel):

```sh
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
YOUTUBE_API_KEY=...       # Opcional, para canales de YouTube en vivo
ENABLE_KICK_LIVE=true     # Opcional, para canales de Kick en vivo
```

Sin esas variables, la interfaz opera en **modo directorio** con enlaces
verificados y nunca fabrica espectadores ni estados en vivo falsos.

Cada país tiene una **ciudad de referencia**. Las zonas adicionales son
conversiones del horario local y no una verificación de cada tienda. La
disponibilidad que muestra la página significa que pasó la hora calculada, no
que se consultó una cuenta o consola. El reloj del dispositivo debe ser
correcto.

Pruebas de navegador (en un entorno con Chromium y permisos para un servidor
local):

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Si ya tienes Chrome instalado, puedes indicar su ruta con
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Las pruebas se ejecutan sobre el build
estático y cubren la lógica del tracker, la adaptación a distintos anchos y la
carga local de imágenes y fuentes.

## Organización

La estructura adapta
[la propuesta de Josh Comeau](https://www.joshwcomeau.com/react/file-structure/)
a Astro: organización por función, carpeta por componente, `index.ts` como
entrada pública y archivos privados junto al componente. Las páginas son
entradas de ruta pequeñas. Los imports de aplicación usan el alias `@/`.

| Ruta                            | Contenido                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `src/components/`               | Componentes y sus archivos privados                                            |
| `src/components/LaunchTracker/` | Tracker, tarjetas, mapa, tipos y cliente                                       |
| `src/components/LaunchPage/`    | Composición de la landing y animaciones                                        |
| `src/constants.ts`              | Fecha, fuente, países y zonas alternativas                                     |
| `src/helpers/`                  | Funciones del proyecto, catálogo de assets y pruebas colocadas junto al código |
| `src/utils.ts`                  | Utilidades genéricas                                                           |
| `src/pages/`                    | Rutas de Astro                                                                 |
| `src/styles/global.css`         | Tailwind, tokens y estilos compartidos                                         |
| `tests/browser/`                | Pruebas de navegador                                                           |
| `.agents/skills/`               | Skills exclusivas del proyecto                                                 |

Ver [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md) para las convenciones.

## Skills

Elaya: landing-page-design. Emil Kowalski: emil-design-eng, animate y
choreograph. Vercel: find-skills y web-design-guidelines. Están copiadas dentro
del proyecto y no requieren una instalación global. Su disponibilidad automática
depende del siguiente turno del agente; AGENTS.md las documenta. Para
reinstalarlas o actualizarlas desde el origen:

```sh
pnpm skills:install
```

## Referencias y derechos

[Sitio oficial](https://www.rockstargames.com/VI) ·
[Galería oficial](https://www.rockstargames.com/VI/media) ·
[Referencia educativa de Midudev](https://github.com/midudev/landing-gta-vi).

Los assets y tipografías conservan los derechos de sus titulares. Proyecto
independiente, sin afiliación con Rockstar Games o Take Two Interactive. No se
ha desplegado ni publicado.

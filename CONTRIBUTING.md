# Desarrollo

Usa Node 26 y pnpm 10.33.2. Después de clonar el repositorio:

```sh
pnpm install
pnpm dev
```

`prepare` configura Husky automáticamente en la copia local de Git.

## Calidad

`pnpm format` aplica las correcciones de Oxlint y el formato de Oxfmt. Los
archivos Astro se formatean con `astro: true` y el compilador de Astro instalado
como dependencia explícita. Las clases de Tailwind se ordenan según
`src/styles/global.css` y los imports respetan los grupos de `.oxfmtrc.json`.

Antes de proponer cambios:

```sh
pnpm verify
pnpm test:e2e
```

La segunda orden necesita Chromium. Si tienes Chrome instalado, puedes definir
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` con su ruta.

## Hooks

- `pre-commit`: lint-staged aplica Oxlint con correcciones y después Oxfmt
  únicamente a los archivos preparados. Respeta las exclusiones de ambos
  archivos de configuración; no procesa assets binarios ni skills vendorizadas.
- `commit-msg`: commitlint valida el mensaje con
  `@commitlint/config-conventional`.
- Git detiene el commit si el código o el mensaje no pasan las validaciones.

lint-staged se encarga del índice y conserva los cambios no preparados; no hay
un `git add .` automático en los hooks.

## Conventional Commits

Usa `tipo(ámbito opcional): descripción`, por ejemplo:

```text
feat(tracker): agregar una región
fix(countdown): corregir el cambio de estado
style(hero): ajustar el espacio del título
refactor(components): separar el mapa del listado
test(tracker): cubrir una zona horaria adicional
docs: actualizar los pasos de desarrollo
chore(tooling): actualizar oxlint
```

Los tipos admitidos son `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`,
`refactor`, `revert`, `style` y `test`. Para un cambio incompatible usa `!`
después del tipo o ámbito, o un pie `BREAKING CHANGE:` que explique el cambio.

Para validar un mensaje manualmente, sin crear un commit:

```sh
echo 'feat(tracker): agregar una región' | pnpm commitlint
```

La estructura y los imports se explican en
[docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md).

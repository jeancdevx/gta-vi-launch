# Estructura del proyecto

Adaptación para Astro de
[Delightful React File/Directory Structure, de Josh Comeau](https://www.joshwcomeau.com/react/file-structure/).
La organización es por función y los archivos que pertenecen a un componente
permanecen juntos.

```text
src/
├── components/
│   ├── BaseLayout/
│   │   ├── BaseLayout.astro
│   │   └── index.ts
│   ├── Hero/
│   │   ├── Hero.astro
│   │   ├── LocalCountdown.astro
│   │   └── index.ts
│   ├── LaunchPage/
│   │   ├── LaunchPage.astro
│   │   ├── LaunchPage.animations.ts
│   │   └── index.ts
│   ├── LaunchTracker/
│   │   ├── LaunchTracker.astro
│   │   ├── LaunchTracker.client.ts
│   │   ├── LaunchTracker.types.ts
│   │   ├── CountryCard.astro
│   │   ├── WorldMap.astro
│   │   ├── WorldMap.helpers.ts
│   │   └── index.ts
│   └── ...
├── helpers/
│   ├── assets.helpers.ts
│   ├── release.helpers.ts
│   ├── release.helpers.test.ts
│   ├── search.helpers.ts
│   └── search.helpers.test.ts
├── pages/
│   ├── index.astro
│   ├── acerca.astro
│   └── 404.astro
├── styles/
│   └── global.css
├── constants.ts
└── utils.ts
```

- Un componente público se importa desde su carpeta:
  `import Hero from '@/components/Hero'`.
- Cada `index.ts` reexporta únicamente la entrada pública del componente.
- Los subcomponentes privados se importan directamente desde la misma carpeta.
- Los helpers contienen lógica propia del proyecto; `utils.ts` contiene
  funciones genéricas. Las constantes de una sección viven junto a ella y las
  compartidas en `constants.ts`.
- Las páginas mantienen las rutas de Astro y delegan la presentación a
  componentes.
- Las pruebas unitarias están junto a los helpers. Las pruebas que atraviesan
  varios componentes permanecen en `tests/browser/`.
- El alias `@/*` apunta a `src/*`. Los módulos que también ejecuta Node usan
  imports relativos con extensión para conservar la ejecución nativa de las
  pruebas y del sincronizador de assets.
- Tailwind se integra con Vite. `global.css` declara el tema y contiene los
  estilos compartidos mediante `@apply` en la capa de componentes; los layouts y
  tipografías adaptables también utilizan clases directamente en Astro.

No se añaden hooks de React ni directorios vacíos: la landing utiliza Astro y
TypeScript en el navegador.

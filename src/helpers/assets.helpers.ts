import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const reference =
  'https://raw.githubusercontent.com/midudev/landing-gta-vi/main'

export const assetCatalog = {
  hero: {
    file: 'images/hero-key-background.webp',
    url: `${reference}/src/assets/hero-key-background.webp`,
    source: 'Midudev / Rockstar Games',
    role: 'Arte de portada por capas'
  },
  heroLogo: {
    file: 'images/hero-key-logo.webp',
    url: `${reference}/src/assets/hero-key-logo.webp`,
    source: 'Midudev / Rockstar Games',
    role: 'Logo y composición de portada'
  },
  logo: {
    file: 'images/logo-stack.svg',
    url: `${reference}/public/logo-stack.svg`,
    source: 'Midudev / Rockstar Games',
    role: 'Logo oficial apilado'
  },
  vi: {
    file: 'images/logo-vi.svg',
    url: `${reference}/src/assets/logo-vi.svg`,
    source: 'Midudev / Rockstar Games',
    role: 'Monograma VI'
  },
  fullLogo: {
    file: 'images/full-logo.webp',
    url: `${reference}/src/assets/full-logo.webp`,
    source: 'Midudev / Rockstar Games',
    role: 'Logo completo'
  },
  ps5: {
    file: 'images/ps5.svg',
    url: `${reference}/src/assets/ps5.svg`,
    source: 'Midudev / Sony',
    role: 'PlayStation 5'
  },
  xbox: {
    file: 'images/xbox.svg',
    url: `${reference}/src/assets/xbox.svg`,
    source: 'Midudev / Microsoft',
    role: 'Xbox Series X|S'
  },
  rooftop: {
    file: 'images/jason-lucia-rooftop.jpg',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_Lucia_Rooftop_landscape.0c6p5do~-8~7..jpg?imwidth=1920',
    source: 'Rockstar Games / VI media',
    role: 'Jason y Lucia, rooftop'
  },
  viceCity: {
    file: 'images/vice-city.jpg',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Vice_City_27.0d2e~w_r93hmh.jpg?imwidth=1920',
    source: 'Rockstar Games / VI media',
    role: 'Vice City 27'
  },
  jasonLucia: {
    file: 'images/jason-lucia.jpg',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_14.10e7v.06pcm_t.jpg?imwidth=1920',
    source: 'Rockstar Games / VI media',
    role: 'Jason y Lucia 14'
  }
} as const

export function asset(name: keyof typeof assetCatalog): string {
  const entry = assetCatalog[name]

  return existsSync(resolve(process.cwd(), 'public', entry.file))
    ? `/${entry.file}`
    : entry.url
}

export const hasLocalFonts = existsSync(
  resolve(process.cwd(), 'public/fonts/gta-regular.woff')
)

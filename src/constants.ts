export const release = {
  date: '2026-11-19',
  verifiedAt: '2026-11-18',
  source:
    'https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s',
  platforms: ['PlayStation 5', 'Xbox Series X|S']
} as const

export type Region = {
  id: string
  country: string
  flag: string
  city: string
  zone: string
  continent: 'América' | 'Europa' | 'Asia' | 'Oceanía' | 'África'
  lat: number
  lon: number
}

// Reference time zones, not an assertion of one unlock instant across an entire
// multi-zone country. Regional midnight is converted with Intl, including DST.
export const regions: Region[] = [
  {
    id: 'nz',
    country: 'Nueva Zelanda',
    flag: '🇳🇿',
    city: 'Auckland',
    zone: 'Pacific/Auckland',
    continent: 'Oceanía',
    lat: -36.8,
    lon: 174.8
  },
  {
    id: 'au',
    country: 'Australia',
    flag: '🇦🇺',
    city: 'Sídney',
    zone: 'Australia/Sydney',
    continent: 'Oceanía',
    lat: -33.9,
    lon: 151.2
  },
  {
    id: 'jp',
    country: 'Japón',
    flag: '🇯🇵',
    city: 'Tokio',
    zone: 'Asia/Tokyo',
    continent: 'Asia',
    lat: 35.7,
    lon: 139.7
  },
  {
    id: 'kr',
    country: 'Corea del Sur',
    flag: '🇰🇷',
    city: 'Seúl',
    zone: 'Asia/Seoul',
    continent: 'Asia',
    lat: 37.6,
    lon: 127
  },
  {
    id: 'sg',
    country: 'Singapur',
    flag: '🇸🇬',
    city: 'Singapur',
    zone: 'Asia/Singapore',
    continent: 'Asia',
    lat: 1.3,
    lon: 103.8
  },
  {
    id: 'my',
    country: 'Malasia',
    flag: '🇲🇾',
    city: 'Kuala Lumpur',
    zone: 'Asia/Kuala_Lumpur',
    continent: 'Asia',
    lat: 3.1,
    lon: 101.7
  },
  {
    id: 'ph',
    country: 'Filipinas',
    flag: '🇵🇭',
    city: 'Manila',
    zone: 'Asia/Manila',
    continent: 'Asia',
    lat: 14.6,
    lon: 121
  },
  {
    id: 'id',
    country: 'Indonesia',
    flag: '🇮🇩',
    city: 'Yakarta',
    zone: 'Asia/Jakarta',
    continent: 'Asia',
    lat: -6.2,
    lon: 106.8
  },
  {
    id: 'th',
    country: 'Tailandia',
    flag: '🇹🇭',
    city: 'Bangkok',
    zone: 'Asia/Bangkok',
    continent: 'Asia',
    lat: 13.8,
    lon: 100.5
  },
  {
    id: 'in',
    country: 'India',
    flag: '🇮🇳',
    city: 'Nueva Delhi',
    zone: 'Asia/Kolkata',
    continent: 'Asia',
    lat: 28.6,
    lon: 77.2
  },
  {
    id: 'ae',
    country: 'Emiratos Árabes Unidos',
    flag: '🇦🇪',
    city: 'Dubái',
    zone: 'Asia/Dubai',
    continent: 'Asia',
    lat: 25.2,
    lon: 55.3
  },
  {
    id: 'sa',
    country: 'Arabia Saudita',
    flag: '🇸🇦',
    city: 'Riad',
    zone: 'Asia/Riyadh',
    continent: 'Asia',
    lat: 24.7,
    lon: 46.7
  },
  {
    id: 'tr',
    country: 'Turquía',
    flag: '🇹🇷',
    city: 'Estambul',
    zone: 'Europe/Istanbul',
    continent: 'Europa',
    lat: 41,
    lon: 29
  },
  {
    id: 'za',
    country: 'Sudáfrica',
    flag: '🇿🇦',
    city: 'Johannesburgo',
    zone: 'Africa/Johannesburg',
    continent: 'África',
    lat: -26.2,
    lon: 28
  },
  {
    id: 'fi',
    country: 'Finlandia',
    flag: '🇫🇮',
    city: 'Helsinki',
    zone: 'Europe/Helsinki',
    continent: 'Europa',
    lat: 60.2,
    lon: 24.9
  },
  {
    id: 'gr',
    country: 'Grecia',
    flag: '🇬🇷',
    city: 'Atenas',
    zone: 'Europe/Athens',
    continent: 'Europa',
    lat: 38,
    lon: 23.7
  },
  {
    id: 'es',
    country: 'España',
    flag: '🇪🇸',
    city: 'Madrid',
    zone: 'Europe/Madrid',
    continent: 'Europa',
    lat: 40.4,
    lon: -3.7
  },
  {
    id: 'fr',
    country: 'Francia',
    flag: '🇫🇷',
    city: 'París',
    zone: 'Europe/Paris',
    continent: 'Europa',
    lat: 48.9,
    lon: 2.4
  },
  {
    id: 'de',
    country: 'Alemania',
    flag: '🇩🇪',
    city: 'Berlín',
    zone: 'Europe/Berlin',
    continent: 'Europa',
    lat: 52.5,
    lon: 13.4
  },
  {
    id: 'it',
    country: 'Italia',
    flag: '🇮🇹',
    city: 'Roma',
    zone: 'Europe/Rome',
    continent: 'Europa',
    lat: 41.9,
    lon: 12.5
  },
  {
    id: 'nl',
    country: 'Países Bajos',
    flag: '🇳🇱',
    city: 'Ámsterdam',
    zone: 'Europe/Amsterdam',
    continent: 'Europa',
    lat: 52.4,
    lon: 4.9
  },
  {
    id: 'pl',
    country: 'Polonia',
    flag: '🇵🇱',
    city: 'Varsovia',
    zone: 'Europe/Warsaw',
    continent: 'Europa',
    lat: 52.2,
    lon: 21
  },
  {
    id: 'gb',
    country: 'Reino Unido',
    flag: '🇬🇧',
    city: 'Londres',
    zone: 'Europe/London',
    continent: 'Europa',
    lat: 51.5,
    lon: -0.1
  },
  {
    id: 'pt',
    country: 'Portugal',
    flag: '🇵🇹',
    city: 'Lisboa',
    zone: 'Europe/Lisbon',
    continent: 'Europa',
    lat: 38.7,
    lon: -9.1
  },
  {
    id: 'ie',
    country: 'Irlanda',
    flag: '🇮🇪',
    city: 'Dublín',
    zone: 'Europe/Dublin',
    continent: 'Europa',
    lat: 53.3,
    lon: -6.3
  },
  {
    id: 'ar',
    country: 'Argentina',
    flag: '🇦🇷',
    city: 'Buenos Aires',
    zone: 'America/Argentina/Buenos_Aires',
    continent: 'América',
    lat: -34.6,
    lon: -58.4
  },
  {
    id: 'br',
    country: 'Brasil',
    flag: '🇧🇷',
    city: 'São Paulo',
    zone: 'America/Sao_Paulo',
    continent: 'América',
    lat: -23.6,
    lon: -46.6
  },
  {
    id: 'cl',
    country: 'Chile',
    flag: '🇨🇱',
    city: 'Santiago',
    zone: 'America/Santiago',
    continent: 'América',
    lat: -33.4,
    lon: -70.7
  },
  {
    id: 'uy',
    country: 'Uruguay',
    flag: '🇺🇾',
    city: 'Montevideo',
    zone: 'America/Montevideo',
    continent: 'América',
    lat: -34.9,
    lon: -56.2
  },
  {
    id: 'py',
    country: 'Paraguay',
    flag: '🇵🇾',
    city: 'Asunción',
    zone: 'America/Asuncion',
    continent: 'América',
    lat: -25.3,
    lon: -57.6
  },
  {
    id: 'bo',
    country: 'Bolivia',
    flag: '🇧🇴',
    city: 'La Paz',
    zone: 'America/La_Paz',
    continent: 'América',
    lat: -16.5,
    lon: -68.1
  },
  {
    id: 'pe',
    country: 'Perú',
    flag: '🇵🇪',
    city: 'Lima',
    zone: 'America/Lima',
    continent: 'América',
    lat: -12,
    lon: -77
  },
  {
    id: 'co',
    country: 'Colombia',
    flag: '🇨🇴',
    city: 'Bogotá',
    zone: 'America/Bogota',
    continent: 'América',
    lat: 4.7,
    lon: -74.1
  },
  {
    id: 'ec',
    country: 'Ecuador',
    flag: '🇪🇨',
    city: 'Quito',
    zone: 'America/Guayaquil',
    continent: 'América',
    lat: -0.2,
    lon: -78.5
  },
  {
    id: 'pa',
    country: 'Panamá',
    flag: '🇵🇦',
    city: 'Ciudad de Panamá',
    zone: 'America/Panama',
    continent: 'América',
    lat: 9,
    lon: -79.5
  },
  {
    id: 'us',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    city: 'Nueva York',
    zone: 'America/New_York',
    continent: 'América',
    lat: 40.7,
    lon: -74
  },
  {
    id: 'ca',
    country: 'Canadá',
    flag: '🇨🇦',
    city: 'Toronto',
    zone: 'America/Toronto',
    continent: 'América',
    lat: 43.7,
    lon: -79.4
  },
  {
    id: 'mx',
    country: 'México',
    flag: '🇲🇽',
    city: 'Ciudad de México',
    zone: 'America/Mexico_City',
    continent: 'América',
    lat: 19.4,
    lon: -99.1
  },
  {
    id: 'cr',
    country: 'Costa Rica',
    flag: '🇨🇷',
    city: 'San José',
    zone: 'America/Costa_Rica',
    continent: 'América',
    lat: 9.9,
    lon: -84.1
  },
  {
    id: 'gt',
    country: 'Guatemala',
    flag: '🇬🇹',
    city: 'Ciudad de Guatemala',
    zone: 'America/Guatemala',
    continent: 'América',
    lat: 14.6,
    lon: -90.5
  }
]

export const alternateZones: Record<string, { city: string; zone: string }[]> =
  {
    au: [
      { city: 'Perth', zone: 'Australia/Perth' },
      { city: 'Adelaida', zone: 'Australia/Adelaide' }
    ],
    es: [{ city: 'Canarias', zone: 'Atlantic/Canary' }],
    pt: [{ city: 'Azores', zone: 'Atlantic/Azores' }],
    br: [{ city: 'Manaos', zone: 'America/Manaus' }],
    us: [
      { city: 'Los Ángeles', zone: 'America/Los_Angeles' },
      { city: 'Chicago', zone: 'America/Chicago' },
      { city: 'Honolulu', zone: 'Pacific/Honolulu' }
    ],
    ca: [{ city: 'Vancouver', zone: 'America/Vancouver' }],
    mx: [
      { city: 'Tijuana', zone: 'America/Tijuana' },
      { city: 'Cancún', zone: 'America/Cancun' }
    ],
    cl: [{ city: 'Isla de Pascua', zone: 'Pacific/Easter' }],
    ec: [{ city: 'Galápagos', zone: 'Pacific/Galapagos' }],
    nz: [{ city: 'Islas Chatham', zone: 'Pacific/Chatham' }],
    id: [{ city: 'Bali', zone: 'Asia/Makassar' }]
  }

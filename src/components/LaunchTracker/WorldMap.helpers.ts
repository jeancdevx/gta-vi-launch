import {
  type ExtendedFeature,
  type ExtendedFeatureCollection,
  geoGraticule,
  geoNaturalEarth1,
  geoPath
} from 'd3-geo'
import { feature } from 'topojson-client'
import countriesAtlas from 'world-atlas/countries-110m.json'

import type { Region } from '@/constants'

import { type ProjectionMeta, buildSignalArcPath } from './WorldMap.projection'

export const MAP_WIDTH = 1200

export const MAP_HEIGHT = 560

export const VICE_CITY = {
  label: 'Vice City · Leonida',
  lon: -80.19,
  lat: 25.76
} as const

// ISO 3166-1 numeric codes matching world-atlas/countries-110m.json
const REGION_ISO_CODES: Record<string, string> = {
  nz: '554',
  au: '036',
  jp: '392',
  kr: '410',
  my: '458',
  ph: '608',
  id: '360',
  th: '764',
  in: '356',
  ae: '784',
  sa: '682',
  tr: '792',
  za: '710',
  fi: '246',
  gr: '300',
  es: '724',
  fr: '250',
  de: '276',
  it: '380',
  nl: '528',
  pl: '616',
  gb: '826',
  pt: '620',
  ie: '372',
  ar: '032',
  br: '076',
  cl: '152',
  uy: '858',
  py: '600',
  bo: '068',
  pe: '604',
  co: '170',
  ec: '218',
  pa: '591',
  us: '840',
  ca: '124',
  mx: '484',
  cr: '188',
  gt: '320'
}

const MAJOR_HUB_IDS = new Set([
  'nz',
  'au',
  'jp',
  'in',
  'es',
  'gb',
  'fr',
  'br',
  'ar',
  'pe',
  'mx',
  'us'
])

export type MapSectorId = 'global' | 'america' | 'europe' | 'asia'

export type MapSector = {
  id: MapSectorId
  label: string
  transform: string
}

export const MAP_SECTORS: MapSector[] = [
  { id: 'global', label: 'Global', transform: 'translate(0%, 0%) scale(1)' },
  {
    id: 'america',
    label: 'América',
    transform: 'translate(24%, -3%) scale(1.72)'
  },
  {
    id: 'europe',
    label: 'Europa',
    transform: 'translate(-2%, 22%) scale(2.15)'
  },
  {
    id: 'asia',
    label: 'Asia / Oc.',
    transform: 'translate(-28%, 1%) scale(1.72)'
  }
]

export type TrackedPolygon = {
  id: string
  country: string
  d: string
}

export type MapPin = {
  id: string
  country: string
  city: string
  continent: Region['continent']
  flag: string
  lat: number
  lon: number
  x: number
  y: number
  leftPct: number
  topPct: number
  major: boolean
}

export type TacticalWorldMapData = {
  width: number
  height: number
  spherePath: string
  graticulePath: string
  baseCountriesPaths: string[]
  trackedPolygons: TrackedPolygon[]
  pins: MapPin[]
  viceCity: {
    x: number
    y: number
    leftPct: number
    topPct: number
  }
  ambientArcs: string[]
  projectionMeta: ProjectionMeta
}

type GeoCountryCollection = ExtendedFeatureCollection<ExtendedFeature>

function roundPath(path: string | null): string {
  if (!path) return ''

  return path.replace(/-?\d+\.\d+/g, match => Number(match).toFixed(1))
}

export function createTacticalWorldMap(
  regions: Region[]
): TacticalWorldMapData {
  const topology = countriesAtlas as unknown as Parameters<typeof feature>[0]
  const countriesObject = (
    countriesAtlas as unknown as {
      objects: { countries: Parameters<typeof feature>[1] }
    }
  ).objects.countries
  const countriesGeo = feature(
    topology,
    countriesObject
  ) as unknown as GeoCountryCollection
  const visibleFeatures = countriesGeo.features.filter(
    item => String(item.id) !== '010'
  )
  const visibleCollection: GeoCountryCollection = {
    type: 'FeatureCollection',
    features: visibleFeatures
  }
  const projection = geoNaturalEarth1().fitExtent(
    [
      [24, 18],
      [MAP_WIDTH - 24, MAP_HEIGHT - 18]
    ],
    visibleCollection
  )
  const pathGenerator = geoPath(projection)
  const [translateX, translateY] = projection.translate()
  const projectionMeta: ProjectionMeta = {
    scale: projection.scale(),
    translateX,
    translateY,
    width: MAP_WIDTH,
    height: MAP_HEIGHT
  }

  const regionByIso = new Map<string, Region>()

  for (const region of regions) {
    const iso = REGION_ISO_CODES[region.id]

    if (iso) regionByIso.set(iso, region)
  }

  const baseCountriesPaths: string[] = []
  const trackedPolygons: TrackedPolygon[] = []

  for (const item of visibleFeatures) {
    const iso = String(item.id ?? '').padStart(3, '0')
    const d = roundPath(pathGenerator(item))

    if (!d) continue

    const tracked = regionByIso.get(iso)

    if (tracked) {
      trackedPolygons.push({
        id: tracked.id,
        country: tracked.country,
        d
      })
    } else {
      baseCountriesPaths.push(d)
    }
  }

  const [viceX, viceY] = projection([VICE_CITY.lon, VICE_CITY.lat]) ?? [
    360, 220
  ]
  const pins: MapPin[] = regions.map(region => {
    const [x, y] = projection([region.lon, region.lat]) ?? [0, 0]

    return {
      id: region.id,
      country: region.country,
      city: region.city,
      continent: region.continent,
      flag: region.flag,
      lat: region.lat,
      lon: region.lon,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      leftPct: Number(((x / MAP_WIDTH) * 100).toFixed(3)),
      topPct: Number(((y / MAP_HEIGHT) * 100).toFixed(3)),
      major: MAJOR_HUB_IDS.has(region.id)
    }
  })

  const ambientTargets = ['es', 'pe', 'jp', 'nz', 'br', 'gb']
  const pinById = new Map(pins.map(pin => [pin.id, pin]))
  const ambientArcs = ambientTargets
    .map(id => pinById.get(id))
    .filter((pin): pin is MapPin => Boolean(pin))
    .map(pin => buildSignalArcPath([viceX, viceY], [pin.x, pin.y]))

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    spherePath: roundPath(pathGenerator({ type: 'Sphere' })),
    graticulePath: roundPath(pathGenerator(geoGraticule().step([30, 30])())),
    baseCountriesPaths,
    trackedPolygons,
    pins,
    viceCity: {
      x: Number(viceX.toFixed(1)),
      y: Number(viceY.toFixed(1)),
      leftPct: Number(((viceX / MAP_WIDTH) * 100).toFixed(3)),
      topPct: Number(((viceY / MAP_HEIGHT) * 100).toFixed(3))
    },
    ambientArcs,
    projectionMeta
  }
}

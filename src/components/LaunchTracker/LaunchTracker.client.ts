import {
  type LaunchPhase,
  coarseDurationLabel,
  compactDurationLabel,
  detailedClockState,
  getLaunchPhase,
  releaseInstant,
  solarMidnightLongitude
} from '@/helpers/release.helpers'
import { matchesSearch } from '@/helpers/search.helpers'

import type { Config } from './LaunchTracker.types'
import { createStreamerRadar } from './StreamerRadar.client'
import {
  type ProjectionMeta,
  buildMeridianPath,
  buildSignalArcPath
} from './WorldMap.projection'

type MapProjectionPayload = {
  meta: ProjectionMeta
  viceCity: [number, number]
  pins: Record<string, [number, number]>
}

const config = JSON.parse(
  document.querySelector('#release-data')!.textContent!
) as Config
const mapData = JSON.parse(
  document.querySelector('#map-projection-data')!.textContent!
) as MapProjectionPayload

const { regions, alternateZones } = config
const byId = new Map(regions.map(region => [region.id, region]))
const instants = new Map(
  regions.map(region => [region.id, releaseInstant(region.zone)])
)
const allInstants = [...instants.values()]

const $ = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!
const $$ = <T extends Element = HTMLElement>(selector: string) => [
  ...document.querySelectorAll<T>(selector)
]

const picker = $('[data-region-picker]')
const trigger = $<HTMLButtonElement>('#region-trigger')
const panel = $('#region-panel')
const backdrop = $('#region-backdrop')
const closeButton = $<HTMLButtonElement>('#region-close')
const regionSearch = $<HTMLInputElement>('#region-search')
const optionElements = $$('[data-region-option]')
const optionById = new Map(optionElements.map(option => [option.id, option]))
const optionKey = (regionId: string, zone: string) => `${regionId}::${zone}`
const optionByKey = new Map(
  optionElements.map(option => [
    optionKey(option.dataset.regionOption!, option.dataset.optionZone!),
    option
  ])
)
const zoneWrap = $('#extra-zone-wrap')
const zoneOptions = $('#zone-options')
const search = $<HTMLInputElement>('#country-search')
const filterButtons = $$<HTMLButtonElement>('[data-filter]')
const cards = $$('[data-region]')
  .filter(element => element.tagName !== 'LI')
  .map(element => ({
    element,
    region: byId.get(element.dataset.region!)!,
    instant: instants.get(element.dataset.region!)!,
    status: element.querySelector<HTMLElement>('.country-status')!,
    timer: element.querySelector<HTMLElement>('.country-timer')!
  }))
const mapPins = $$<HTMLButtonElement>('[data-map-region]')
const mapPolygons = $$<SVGPathElement>('[data-map-poly]')
const mapSectorButtons = $$<HTMLButtonElement>('[data-map-sector]')
const mapStage = $('#map-stage')
const mapActiveArc = document.querySelector<SVGPathElement>('#map-active-arc')
const mapMidnightLine =
  document.querySelector<SVGPathElement>('#map-midnight-line')
const url = new URL(location.href)
const mobileQuery = matchMedia('(max-width: 600px)')

let filter = ['all', 'available', 'pending'].includes(
  url.searchParams.get('status') ?? ''
)
  ? url.searchParams.get('status')!
  : 'all'
let activeRegion = byId.get('pe') ?? regions[0]!
let activeZone = activeRegion.zone
let selectedInstant = releaseInstant(activeZone)
let selectedAvailable: boolean | undefined
let currentPhase: LaunchPhase | undefined
let lastAvailability = ''
let activeOptionId = ''
let hoveredMapRegionId: string | null = null

search.value = (url.searchParams.get('q') ?? '').slice(0, 120)

function setText(selector: string, value: string) {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    if (element.textContent !== value) element.textContent = value
  }
}

function updateUrl() {
  const next = new URL(location.href)

  next.searchParams.set('country', activeRegion.id)

  if (activeZone !== activeRegion.zone)
    next.searchParams.set('zone', activeZone)
  else next.searchParams.delete('zone')

  if (filter !== 'all') next.searchParams.set('status', filter)
  else next.searchParams.delete('status')

  if (search.value.trim()) next.searchParams.set('q', search.value.trim())
  else next.searchParams.delete('q')

  history.replaceState(null, '', next)
}

function visibleOptions() {
  return optionElements.filter(option => !option.hidden)
}

function scrollOptionIntoView(option: HTMLElement) {
  const list = $('#region-listbox')
  const listRect = list.getBoundingClientRect()
  const optionRect = option.getBoundingClientRect()

  if (optionRect.top < listRect.top || optionRect.bottom > listRect.bottom)
    list.scrollTop +=
      optionRect.top - listRect.top - (listRect.height - optionRect.height) / 2
}

function setActiveOption(option: HTMLElement | null, scroll = true) {
  activeOptionId = option?.id ?? ''

  if (option) regionSearch.setAttribute('aria-activedescendant', option.id)
  else regionSearch.removeAttribute('aria-activedescendant')

  for (const item of optionElements)
    item.dataset.active = String(item === option)

  if (option && scroll) scrollOptionIntoView(option)
}

function filterOptions(query: string) {
  let count = 0

  for (const option of optionElements) {
    const matches = matchesSearch(
      query,
      option.dataset.country ?? '',
      option.dataset.city ?? '',
      option.dataset.continent ?? ''
    )

    option.hidden = !matches

    if (matches) count++
  }

  setText('#region-result-count', String(count))
  $('#region-listbox').hidden = count === 0
  $('#region-empty').hidden = count > 0

  if (count === 0) {
    setActiveOption(null)

    return
  }

  const current = activeOptionId ? optionById.get(activeOptionId) : undefined

  if (!current || current.hidden) setActiveOption(visibleOptions()[0]!, false)
}

function openPicker() {
  panel.hidden = false
  panel.setAttribute('aria-modal', String(mobileQuery.matches))
  backdrop.dataset.open = 'true'
  trigger.setAttribute('aria-expanded', 'true')
  regionSearch.setAttribute('aria-expanded', 'true')
  regionSearch.value = ''
  filterOptions('')

  const selected = optionByKey.get(optionKey(activeRegion.id, activeZone))

  setActiveOption(selected ?? visibleOptions()[0] ?? null, false)

  if (selected) scrollOptionIntoView(selected)
  regionSearch.focus({ preventScroll: true })

  if (mobileQuery.matches) document.body.style.overflow = 'hidden'
}

function closePicker(returnFocus = true) {
  panel.hidden = true
  panel.removeAttribute('aria-modal')
  backdrop.dataset.open = 'false'
  trigger.setAttribute('aria-expanded', 'false')
  regionSearch.setAttribute('aria-expanded', 'false')
  regionSearch.removeAttribute('aria-activedescendant')
  setActiveOption(null, false)
  document.body.style.overflow = ''

  if (returnFocus) trigger.focus({ preventScroll: true })
}

function renderZones(options: { city: string; zone: string }[]) {
  zoneOptions.replaceChildren(
    ...options.map(option => {
      const button = document.createElement('button')

      button.type = 'button'
      button.dataset.zoneOption = option.zone
      button.textContent = option.city
      button.setAttribute('aria-pressed', String(option.zone === activeZone))
      button.className =
        'min-h-11 border border-white/20 px-3 text-xs leading-4 text-muted transition-colors duration-150 ease-out hover:border-white/40 hover:text-ink aria-pressed:border-vice aria-pressed:bg-vice/10 aria-pressed:text-vice'

      return button
    })
  )
  zoneWrap.hidden = options.length < 2
}

const streamerRadar = createStreamerRadar(regions, () => {
  syncStreamerSignals()
  updateMapHud(hoveredMapRegionId ?? activeRegion.id)
})

function syncStreamerSignals() {
  const heroSummary = streamerRadar.getCountrySummary(activeRegion.id)
  const heroPulse = document.querySelector<HTMLElement>('#hero-streamer-pulse')

  if (heroPulse) heroPulse.hidden = !heroSummary.apiLive

  setText(
    '#hero-streamer-pulse-text',
    heroSummary.liveGtaVi > 0
      ? `${heroSummary.liveGtaVi} de ${heroSummary.total} en GTA VI desde ${activeRegion.country}`
      : `Radar de creadores de ${activeRegion.country}`
  )

  for (const card of cards) {
    const summary = streamerRadar.getCountrySummary(card.region.id)
    const hasLocalLive =
      summary.apiLive && summary.scope === 'country' && summary.liveGtaVi > 0

    card.element.dataset.live = String(hasLocalLive)
  }

  for (const pin of mapPins) {
    const summary = streamerRadar.getCountrySummary(pin.dataset.mapRegion!)

    pin.dataset.live = String(
      summary.apiLive && summary.scope === 'country' && summary.liveGtaVi > 0
    )
  }

  for (const poly of mapPolygons) {
    const summary = streamerRadar.getCountrySummary(poly.dataset.mapPoly!)

    poly.dataset.live = String(
      summary.apiLive && summary.scope === 'country' && summary.liveGtaVi > 0
    )
  }
}

function updateMapArc(regionId: string) {
  if (!mapActiveArc) return

  const target = mapData.pins[regionId]

  if (!target) return

  mapActiveArc.setAttribute('d', buildSignalArcPath(mapData.viceCity, target))
}

function updateMapHud(regionId: string, now = Date.now()) {
  const region = byId.get(regionId) ?? activeRegion
  const instant = instants.get(region.id) ?? selectedInstant
  const available = now >= instant
  const summary = streamerRadar.getCountrySummary(region.id)

  setText('#map-hud-flag', region.flag)
  setText('[data-map-hud-flag]', region.flag)
  setText('#map-hud-country', `${region.country} · ${region.city}`)
  setText('[data-map-hud-country]', `${region.country} · ${region.city}`)

  const statusText =
    summary.apiLive && summary.liveGtaVi > 0
      ? `${summary.liveGtaVi} de ${summary.total} en GTA VI ahora · ${compactDurationLabel(instant, now)}`
      : `${available ? 'Disponible' : 'En espera'} · ${compactDurationLabel(instant, now)}`

  setText('#map-hud-status', statusText)
  setText('[data-map-hud-status]', statusText)
  updateMapArc(region.id)
}

function applyLaunchPhase(phase: LaunchPhase) {
  if (currentPhase === phase) return

  currentPhase = phase
  const heroSection = document.querySelector<HTMLElement>('#hero-section')

  if (heroSection) heroSection.dataset.phase = phase

  const launchBadge = document.querySelector<HTMLElement>(
    '[data-milestone-badge="console-launch"]'
  )

  if (phase === 'countdown') {
    setText('#hero-eyebrow', '19 NOV 2026 · LANZAMIENTO MUNDIAL')
    setText('#hero-title-main', 'Vice City abre')
    setText('#hero-title-accent', ' a medianoche.')
    setText(
      '#hero-subtitle',
      'Elige tu país y sigue la hora local de referencia. Consulta también los canales que cubren el lanzamiento.'
    )
    setText('#tracker-title-main', 'Quién abre')
    setText('#tracker-title-accent', 'primero.')

    if (launchBadge) launchBadge.textContent = 'Confirmado por Rockstar'
  } else if (phase === 'wave') {
    setText('#hero-eyebrow', '19 NOV 2026 · OLA DE DESBLOQUEO EN CURSO')
    setText('#hero-title-main', 'La medianoche ya')
    setText('#hero-title-accent', ' cruza el mapa.')
    setText(
      '#hero-subtitle',
      'La ola avanza país por país. Sigue tu reloj y los canales que cubren el lanzamiento.'
    )
    setText('#tracker-title-main', 'Quién abre')
    setText('#tracker-title-accent', 'primero.')

    if (launchBadge) launchBadge.textContent = 'Desbloqueo en curso'
  } else {
    setText('#hero-eyebrow', '19 NOV 2026 · MEDIANOCHE CUMPLIDA')
    setText('#hero-title-main', 'Todos los relojes')
    setText('#hero-title-accent', ' ya cambiaron.')
    setText(
      '#hero-subtitle',
      'Los 40 países ya cruzaron su medianoche. Sigue los canales por país, activa el escudo sin spoilers y revisa los hitos oficiales.'
    )
    setText('#tracker-title-main', 'Radar de')
    setText('#tracker-title-accent', 'Leonida.')

    if (launchBadge) launchBadge.textContent = 'Ya disponible en consolas'
  }
}

function chooseRegion(id: string, zone?: string, announce = false) {
  activeRegion = byId.get(id) ?? activeRegion
  const options = [
    { city: activeRegion.city, zone: activeRegion.zone },
    ...(alternateZones[activeRegion.id] ?? [])
  ]

  activeZone = options.some(option => option.zone === zone)
    ? zone!
    : activeRegion.zone
  selectedInstant = releaseInstant(activeZone)
  selectedAvailable = undefined

  const city = options.find(option => option.zone === activeZone)!.city

  setText('#region-trigger-flag', activeRegion.flag)
  setText('#region-trigger-country', activeRegion.country)
  setText('#region-trigger-city', `${city} · ${activeRegion.continent}`)
  trigger.setAttribute(
    'aria-label',
    `Región seleccionada: ${activeRegion.country}, ${city}. Abrir selector.`
  )
  renderZones(options)

  for (const option of optionElements) {
    const selected =
      option.dataset.regionOption === activeRegion.id &&
      option.dataset.optionZone === activeZone

    option.setAttribute('aria-selected', String(selected))
  }

  for (const pin of mapPins)
    pin.setAttribute(
      'aria-pressed',
      String(pin.dataset.mapRegion === activeRegion.id)
    )

  for (const poly of mapPolygons)
    poly.dataset.selected = String(poly.dataset.mapPoly === activeRegion.id)

  for (const card of cards)
    card.element.dataset.selected = String(card.region.id === activeRegion.id)

  setText('#local-release', '19 NOV 2026 · 00:00')

  if (announce)
    setText(
      '#selection-feedback',
      `Contador y radar de ${activeRegion.country}, ${city}.`
    )

  try {
    localStorage.setItem(
      'gta-vi-region',
      JSON.stringify({ id: activeRegion.id, zone: activeZone })
    )
  } catch {
    /* Storage can be unavailable in private browsing. */
  }

  streamerRadar.setRegion(activeRegion.id)
  syncStreamerSignals()
  updateUrl()
  tick()
}

const utcFormatter = new Intl.DateTimeFormat('es', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
})

function tick() {
  const now = Date.now()
  const state = detailedClockState(selectedInstant, now)
  const pad = (value: number) => String(value).padStart(2, '0')
  const daysWrap = document.querySelector<HTMLElement>('#clock-days-wrap')

  if (state.days >= 1) {
    if (daysWrap) daysWrap.hidden = false
    setText('#clock-days', pad(state.days))
    setText('#clock-hours', pad(state.hours))
  } else {
    if (daysWrap) daysWrap.hidden = true
    setText('#clock-hours', pad(state.totalHours))
  }

  setText('#clock-minutes', pad(state.minutes))
  setText('#clock-seconds', pad(state.seconds))

  if (selectedAvailable !== state.available) {
    selectedAvailable = state.available
    setText(
      '#local-status',
      state.available ? 'YA LLEGÓ LA HORA' : 'EN CUENTA REGRESIVA'
    )
    setText(
      '#countdown-label',
      state.available
        ? 'Desde la medianoche del lanzamiento'
        : 'Para la medianoche del lanzamiento'
    )
    $('#hero-clock').setAttribute(
      'aria-label',
      state.available
        ? 'Tiempo desde el lanzamiento'
        : 'Tiempo hasta el lanzamiento'
    )
    $('#mi-region').classList.toggle('has-launched', state.available)
  }

  applyLaunchPhase(getLaunchPhase(allInstants, now))

  let availableCount = 0
  let availability = ''

  for (const card of cards) {
    const available = now >= card.instant

    availability += available ? '1' : '0'

    if (available) availableCount++
    const status = available ? 'Disponible' : 'En espera'

    if (card.status.textContent !== status) {
      card.status.textContent = status
      card.element.dataset.available = String(available)
    }

    card.timer.textContent = coarseDurationLabel(card.instant, now)
  }

  for (const pin of mapPins)
    pin.dataset.available = String(now >= instants.get(pin.dataset.mapRegion!)!)

  for (const poly of mapPolygons)
    poly.dataset.available = String(now >= instants.get(poly.dataset.mapPoly!)!)

  if (mapMidnightLine) {
    mapMidnightLine.setAttribute(
      'd',
      buildMeridianPath(solarMidnightLongitude(now), mapData.meta)
    )
  }

  updateMapHud(hoveredMapRegionId ?? activeRegion.id, now)

  setText('#available-count', String(availableCount).padStart(2, '0'))
  const pendingCount = regions.length - availableCount

  setText('#pending-count', String(pendingCount).padStart(2, '0'))
  setText(
    '#pending-label',
    pendingCount === 0
      ? 'países en espera. Todos los territorios ya están en Leonida.'
      : 'países todavía esperan la medianoche.'
  )

  const percentage = String(Math.round((availableCount / regions.length) * 100))
  const progress = $('#progress-number')

  if (progress.dataset.value !== percentage) {
    const unit = document.createElement('small')

    unit.textContent = '%'
    progress.replaceChildren(percentage, unit)
    progress.dataset.value = percentage
    $('#progress-track').setAttribute('aria-valuenow', percentage)
    const fill = document.querySelector<HTMLElement>('#progress-fill')

    if (fill) fill.style.width = `${percentage}%`
  }

  setText('#filter-available-count', String(availableCount))
  setText('#filter-pending-count', String(pendingCount))
  setText('#utc-clock', `${utcFormatter.format(now)} UTC`)

  if (availability !== lastAvailability) {
    lastAvailability = availability
    applyFilters(now)
  }
}

function applyFilters(now = Date.now()) {
  let count = 0

  for (const card of cards) {
    const available = now >= card.instant
    const visible =
      (filter === 'all' || (filter === 'available' ? available : !available)) &&
      matchesSearch(
        search.value,
        card.region.country,
        card.region.city,
        card.region.continent
      )

    card.element.hidden = !visible

    if (visible) count++
  }

  $('#empty-state').hidden = count > 0
  setText(
    '#results-count',
    `${count} ${count === 1 ? 'país' : 'países'} en seguimiento`
  )

  for (const button of filterButtons)
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.filter === filter)
    )
}

let initialId = activeRegion.id
let initialZone: string | undefined

try {
  const saved = JSON.parse(localStorage.getItem('gta-vi-region') ?? 'null')

  if (saved && byId.has(saved.id)) {
    initialId = saved.id
    initialZone = saved.zone
  } else {
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const detected = regions.find(
      region =>
        region.zone === browserZone ||
        alternateZones[region.id]?.some(zone => zone.zone === browserZone)
    )

    if (detected) {
      initialId = detected.id
      initialZone = browserZone
    }
  }
} catch {
  /* Keep Peru as a useful, explicit default. */
}

if (byId.has(url.searchParams.get('country') ?? '')) {
  initialId = url.searchParams.get('country')!
  initialZone = url.searchParams.get('zone') ?? undefined
}

chooseRegion(initialId, initialZone)
applyFilters()

trigger.addEventListener('click', () => {
  if (panel.hidden) openPicker()
  else closePicker()
})
trigger.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openPicker()
  }
})
closeButton.addEventListener('click', () => closePicker())
backdrop.addEventListener('click', () => closePicker())

regionSearch.addEventListener('input', () => filterOptions(regionSearch.value))
regionSearch.addEventListener('keydown', event => {
  const items = visibleOptions()

  if (event.key === 'Escape') {
    event.preventDefault()
    closePicker()

    return
  }

  if (event.key === 'Tab') {
    closePicker(false)

    return
  }

  if (!items.length) return

  const currentIndex = items.findIndex(item => item.id === activeOptionId)

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : items.length - 1
        : (currentIndex + direction + items.length) % items.length

    setActiveOption(items[nextIndex]!)
  } else if (event.key === 'Home') {
    event.preventDefault()
    setActiveOption(items[0]!)
  } else if (event.key === 'End') {
    event.preventDefault()
    setActiveOption(items.at(-1)!)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const option = items.find(item => item.id === activeOptionId) ?? items[0]

    if (option?.dataset.regionOption) {
      chooseRegion(option.dataset.regionOption, option.dataset.optionZone, true)
      closePicker()
    }
  }
})

for (const option of optionElements) {
  option.addEventListener('click', () => {
    chooseRegion(option.dataset.regionOption!, option.dataset.optionZone, true)
    closePicker()
  })
  option.addEventListener('pointerenter', () => setActiveOption(option, false))
}

zoneOptions.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
    '[data-zone-option]'
  )

  if (button?.dataset.zoneOption)
    chooseRegion(activeRegion.id, button.dataset.zoneOption, true)
})

panel.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closePicker()

    return
  }

  if (event.key !== 'Tab' || !mobileQuery.matches) return

  const focusable = [
    ...panel.querySelectorAll<HTMLElement>(
      'button, input, [href], [tabindex]:not([tabindex="-1"])'
    )
  ].filter(element => !element.hidden)

  if (!focusable.length) return

  const first = focusable[0]!
  const last = focusable.at(-1)!

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
})

document.addEventListener('pointerdown', event => {
  if (panel.hidden) return

  if (!picker.contains(event.target as Node)) closePicker(false)
})

search.addEventListener('input', () => {
  applyFilters()
  updateUrl()
})

for (const button of filterButtons)
  button.addEventListener('click', () => {
    filter = button.dataset.filter!
    applyFilters()
    updateUrl()
  })

$('#clear-filters').addEventListener('click', () => {
  filter = 'all'
  search.value = ''
  applyFilters()
  updateUrl()
  search.focus()
})

for (const button of mapSectorButtons) {
  button.addEventListener('click', () => {
    const sector = button.dataset.mapSector ?? 'global'
    const transform =
      button.dataset.sectorTransform ?? 'translate(0%, 0%) scale(1)'

    mapStage.dataset.sector = sector
    mapStage.style.transform = transform

    for (const item of mapSectorButtons)
      item.setAttribute('aria-pressed', String(item === button))
  })
}

function showRegion(id: string, scrollToHero = true) {
  chooseRegion(id, undefined, true)
  closePicker(false)

  if (scrollToHero) {
    $('#mi-region').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'center'
    })
    trigger.focus({ preventScroll: true })
  }
}

for (const button of $$<HTMLButtonElement>('[data-choose-region]'))
  button.addEventListener('click', () => {
    showRegion(button.dataset.chooseRegion!, true)
  })

for (const pin of mapPins) {
  const id = pin.dataset.mapRegion!

  pin.addEventListener('click', () => {
    hoveredMapRegionId = null
    showRegion(id, false)
  })
  pin.addEventListener('pointerenter', () => {
    hoveredMapRegionId = id
    updateMapHud(id)
  })
  pin.addEventListener('pointerleave', () => {
    hoveredMapRegionId = null
    updateMapHud(activeRegion.id)
  })
  pin.addEventListener('focus', () => {
    hoveredMapRegionId = id
    updateMapHud(id)
  })
  pin.addEventListener('blur', () => {
    hoveredMapRegionId = null
    updateMapHud(activeRegion.id)
  })
}

let interval: ReturnType<typeof setInterval> | undefined

function resume() {
  if (interval !== undefined) clearInterval(interval)
  tick()
  interval = setInterval(tick, 1000)
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(interval)
    interval = undefined
  } else resume()
})
window.addEventListener('pageshow', resume)
window.addEventListener('pagehide', () => {
  clearInterval(interval)
  interval = undefined
})
resume()

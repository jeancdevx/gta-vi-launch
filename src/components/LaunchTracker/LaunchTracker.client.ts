import {
  clockState,
  durationLabel,
  releaseInstant
} from '@/helpers/release.helpers'
import { matchesSearch } from '@/helpers/search.helpers'

import type { Config } from './LaunchTracker.types'

const config = JSON.parse(
  document.querySelector('#release-data')!.textContent!
) as Config
const { regions, alternateZones } = config
const byId = new Map(regions.map(r => [r.id, r]))
const instants = new Map(regions.map(r => [r.id, releaseInstant(r.zone)]))
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!
const select = $<HTMLSelectElement>('#region-select')
const zoneSelect = $<HTMLSelectElement>('#zone-select')
const search = $<HTMLInputElement>('#country-search')
const filterButtons = [
  ...document.querySelectorAll<HTMLButtonElement>('[data-filter]')
]
const cards = [...document.querySelectorAll<HTMLElement>('[data-region]')].map(
  element => ({
    element,
    region: byId.get(element.dataset.region!)!,
    instant: instants.get(element.dataset.region!)!,
    status: element.querySelector<HTMLElement>('.country-status')!,
    timer: element.querySelector<HTMLElement>('.country-timer')!
  })
)
const pins = [
  ...document.querySelectorAll<HTMLButtonElement>('[data-map-region]')
]
const url = new URL(location.href)
let filter = ['all', 'available', 'pending'].includes(
  url.searchParams.get('status') ?? ''
)
  ? url.searchParams.get('status')!
  : 'all'
let activeRegion = regions.find(r => r.id === 'pe')!
let activeZone = activeRegion.zone
let selectedInstant = releaseInstant(activeZone)
let selectedAvailable: boolean | undefined
let lastAvailability = ''

search.value = (url.searchParams.get('q') ?? '').slice(0, 120)

function setText(selector: string, value: string) {
  const element = $(selector)

  if (element.textContent !== value) element.textContent = value
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
  select.value = activeRegion.id
  zoneSelect.replaceChildren(
    ...options.map(
      item => new Option(item.city, item.zone, false, item.zone === activeZone)
    )
  )
  $('#extra-zone-wrap').hidden = options.length < 2

  for (const pin of pins)
    pin.setAttribute(
      'aria-pressed',
      String(pin.dataset.mapRegion === activeRegion.id)
    )

  for (const card of cards)
    card.element.classList.toggle(
      'is-selected',
      card.region.id === activeRegion.id
    )
  const city = options.find(o => o.zone === activeZone)!.city

  setText('#local-release', `19 NOV 2026 · 00:00 · ${city}`)

  if (announce)
    setText(
      '#selection-feedback',
      `Contador de ${activeRegion.country}, ${city}.`
    )

  try {
    localStorage.setItem(
      'gta-vi-region',
      JSON.stringify({ id: activeRegion.id, zone: activeZone })
    )
  } catch {
    /* Storage can be unavailable in private browsing. */
  }

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
  const state = clockState(selectedInstant, now)
  const pad = (value: number) => String(value).padStart(2, '0')

  setText('#clock-hours', pad(state.hours))
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
    $('.local-countdown').classList.toggle('has-launched', state.available)
  }

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

    card.timer.textContent = durationLabel(card.instant, now)
  }

  for (const pin of pins)
    pin.dataset.available = String(now >= instants.get(pin.dataset.mapRegion!)!)
  setText('#available-count', String(availableCount).padStart(2, '0'))
  setText(
    '#pending-count',
    String(regions.length - availableCount).padStart(2, '0')
  )
  const percentage = String(Math.round((availableCount / regions.length) * 100))
  const progress = $('#progress-number')

  if (progress.dataset.value !== percentage) {
    const unit = document.createElement('small')

    unit.textContent = '%'
    progress.replaceChildren(percentage, unit)
    progress.dataset.value = percentage
  }

  setText('#filter-available-count', String(availableCount))
  setText('#filter-pending-count', String(regions.length - availableCount))
  setText('#utc-clock', `HORA UTC · ${utcFormatter.format(now)}`)

  if (availability !== lastAvailability) {
    lastAvailability = availability
    applyFilters(now)
  }
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
      r =>
        r.zone === browserZone ||
        alternateZones[r.id]?.some(z => z.zone === browserZone)
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

select.addEventListener('change', () =>
  chooseRegion(select.value, undefined, true)
)
zoneSelect.addEventListener('change', () =>
  chooseRegion(activeRegion.id, zoneSelect.value, true)
)
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

for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-choose-region], [data-map-region]'
)) {
  button.addEventListener('click', () => {
    chooseRegion(
      (button.dataset.chooseRegion ?? button.dataset.mapRegion)!,
      undefined,
      true
    )
    $('#mi-region').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'center'
    })
    select.focus({ preventScroll: true })
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

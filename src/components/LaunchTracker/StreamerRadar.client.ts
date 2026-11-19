import type { Region } from '@/constants'
import {
  type LiveStreamStatus,
  type StreamerProfile,
  type StreamersApiResponse,
  classifySpoilerRisk,
  formatViewers,
  getStreamersForRegion,
  shouldMaskStream,
  streamLookupKey,
  streamersByCountry
} from '@/helpers/streamers.helpers'

type RadarFilter = 'all' | 'gtavi' | 'safe'

export type CountryLiveSummary = {
  liveGtaVi: number
  liveOther: number
  total: number
  scope: 'country' | 'regional'
  apiLive: boolean
}

const SPOILER_STORAGE_KEY = 'gta-vi-spoiler-shield'

export function createStreamerRadar(
  regions: Region[],
  onLiveChange: () => void
) {
  const regionById = new Map(regions.map(region => [region.id, region]))
  const countryNameEl = document.querySelector<HTMLElement>(
    '#radar-country-name'
  )
  const scopeLabelEl = document.querySelector<HTMLElement>('#radar-scope-label')
  const apiStatusEl = document.querySelector<HTMLElement>('#radar-api-status')
  const listEl = document.querySelector<HTMLElement>('#radar-list')
  const emptyEl = document.querySelector<HTMLElement>('#radar-empty')
  const emptyTitleEl = document.querySelector<HTMLElement>('#radar-empty-title')
  const globalWrapEl = document.querySelector<HTMLElement>('#radar-global-wrap')
  const globalCountEl = document.querySelector<HTMLElement>(
    '#radar-global-count'
  )
  const globalListEl = document.querySelector<HTMLElement>('#radar-global-list')
  const filterButtons = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-radar-filter]')
  ]
  const spoilerToggles = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-spoiler-toggle]')
  ]

  let activeRegionId = 'pe'
  let activeFilter: RadarFilter = 'all'
  let spoilerShield = false
  let apiMode: 'loading' | 'live' | 'directory' = 'loading'
  let liveByKey: Record<string, LiveStreamStatus> = {}

  try {
    spoilerShield = localStorage.getItem(SPOILER_STORAGE_KEY) === 'true'
  } catch {
    spoilerShield = false
  }

  function applySpoilerUi() {
    document.documentElement.dataset.spoilerShield = String(spoilerShield)

    for (const button of spoilerToggles) {
      button.setAttribute('aria-pressed', String(spoilerShield))
      button.setAttribute(
        'aria-label',
        spoilerShield
          ? 'Desactivar escudo sin spoilers'
          : 'Activar escudo sin spoilers'
      )
      const stateEl = button.querySelector<HTMLElement>('[data-spoiler-state]')

      if (stateEl) stateEl.textContent = spoilerShield ? 'Activo' : 'Inactivo'
    }
  }

  function getStatus(creator: StreamerProfile): LiveStreamStatus | undefined {
    return liveByKey[streamLookupKey(creator.platform, creator.handle)]
  }

  function getCountrySummary(regionId: string): CountryLiveSummary {
    const roster = getStreamersForRegion(regionId)
    let liveGtaVi = 0
    let liveOther = 0

    if (apiMode === 'live') {
      for (const creator of roster.streamers) {
        const status = getStatus(creator)

        if (!status?.live) continue

        if (status.playingGtaVi) liveGtaVi++
        else liveOther++
      }
    }

    return {
      liveGtaVi,
      liveOther,
      total: roster.streamers.length,
      scope: roster.scope,
      apiLive: apiMode === 'live'
    }
  }

  function renderApiBanner(region: Region) {
    if (!apiStatusEl) return

    if (apiMode === 'loading') {
      apiStatusEl.textContent = 'Comprobando estado en vivo…'

      return
    }

    if (apiMode === 'directory') {
      apiStatusEl.textContent =
        'Estado en vivo no disponible · abre un canal para comprobarlo'

      return
    }

    const summary = getCountrySummary(region.id)

    apiStatusEl.textContent =
      summary.liveGtaVi > 0
        ? `${summary.liveGtaVi} de ${summary.total} canales de ${region.country} en GTA VI ahora`
        : `Ningún canal de ${region.country} está en GTA VI ahora`
  }

  function appendExternalIcon(link: HTMLAnchorElement) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '13')
    svg.setAttribute('height', '13')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '1.5')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('class', 'shrink-0')
    svg.innerHTML =
      "<path d='M14 4h6v6M20 4l-9 9'/><path d='M10 5H5v14h14v-5'/>"
    link.append(svg)
  }

  function buildCreatorRow(creator: StreamerProfile, index: number) {
    const status = getStatus(creator)
    const isLive = Boolean(status?.live)
    const isGtaVi = Boolean(status?.live && status.playingGtaVi)
    const risk = status?.risk ?? classifySpoilerRisk(status?.title)
    const masked = isLive && shouldMaskStream(risk, spoilerShield)
    const showStatus = apiMode === 'live'

    const article = document.createElement('article')

    article.className =
      'grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-1 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.02]' +
      (showStatus
        ? ' md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.55fr)_auto] md:gap-x-6 md:gap-y-0'
        : '')
    article.dataset.streamerId = creator.id
    article.dataset.playingGtavi = String(isGtaVi)

    const left = document.createElement('div')

    left.className = 'col-start-1 row-start-1 flex min-w-0 items-center gap-3'

    const rank = document.createElement('span')

    rank.className =
      'w-6 shrink-0 text-[0.625rem] tabular-nums ' +
      (isGtaVi ? 'text-vice font-semibold' : 'text-[#8f839b]')
    rank.setAttribute('aria-hidden', 'true')
    rank.textContent = String(index + 1).padStart(2, '0')

    const identity = document.createElement('div')

    identity.className = 'min-w-0'

    const nameRow = document.createElement('div')

    nameRow.className = 'flex items-center gap-2'

    const nameHeading = document.createElement('h4')

    nameHeading.className = 'truncate text-sm leading-5 font-semibold text-ink'
    nameHeading.textContent = creator.name

    const platformBadge = document.createElement('span')

    platformBadge.className =
      'shrink-0 border border-white/15 px-1.5 py-0.5 text-[0.625rem] leading-3 font-semibold tracking-[0.08em] text-muted uppercase'
    platformBadge.textContent = creator.platform

    nameRow.append(nameHeading, platformBadge)

    const handleLine = document.createElement('p')

    handleLine.className = 'mt-0.5 truncate text-xs leading-4 text-muted'
    handleLine.textContent = `@${creator.handle} · ${creator.focus}`

    identity.append(nameRow, handleLine)
    left.append(rank, identity)

    const link = document.createElement('a')

    link.href = creator.url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.setAttribute(
      'aria-label',
      `${isLive ? 'Ver directo de' : 'Abrir canal de'} ${creator.name} en ${creator.platform}`
    )
    link.className =
      'col-start-2 row-start-1 justify-self-end md:col-start-3 ' +
      (isGtaVi
        ? 'inline-flex min-h-10 shrink-0 items-center gap-2 border border-vice bg-vice/12 px-3 text-xs leading-4 font-semibold text-vice transition-[border-color,color,background-color,transform] duration-150 ease-out hover:border-peach hover:text-peach active:scale-[0.97]'
        : isLive
          ? 'inline-flex min-h-10 shrink-0 items-center gap-2 border border-white/20 px-3 text-xs leading-4 font-semibold text-ink transition-[border-color,color,transform] duration-150 ease-out hover:border-vice hover:text-vice active:scale-[0.97]'
          : 'inline-flex min-h-10 shrink-0 items-center gap-1.5 px-1 text-xs leading-4 font-semibold text-muted transition-colors duration-150 ease-out hover:text-vice')
    link.textContent = isLive ? 'Ver directo' : 'Abrir canal'
    appendExternalIcon(link)

    if (!showStatus) {
      article.append(left, link)

      return article
    }

    const center = document.createElement('div')

    center.className =
      'col-span-2 row-start-2 min-w-0 pl-9 md:col-span-1 md:col-start-2 md:row-start-1 md:pl-0'

    const statusLine = document.createElement('div')

    statusLine.className = 'flex flex-wrap items-center gap-2 text-xs leading-4'

    const badge = document.createElement('span')

    if (isGtaVi) {
      badge.className =
        'inline-flex items-center gap-1.5 border border-mint/45 bg-mint/12 px-2 py-0.5 text-[0.625rem] leading-4 font-semibold tracking-[0.1em] text-mint uppercase'
      badge.textContent = 'En vivo · GTA VI'
    } else if (isLive) {
      badge.className =
        'inline-flex items-center gap-1.5 border border-peach/35 bg-peach/10 px-2 py-0.5 text-[0.625rem] leading-4 font-semibold tracking-[0.1em] text-peach uppercase'
      badge.textContent = `En vivo · ${status?.gameName || 'Otro juego'}`
    } else {
      badge.className =
        'inline-flex items-center text-[0.625rem] leading-4 font-semibold tracking-[0.1em] text-[#8f839b] uppercase'
      badge.textContent = 'Sin directo'
    }

    statusLine.append(badge)

    if (isLive && typeof status?.viewers === 'number') {
      const viewers = document.createElement('span')

      viewers.className = 'text-xs font-medium text-ink tabular-nums'
      viewers.textContent = `${formatViewers(status.viewers)} viendo`
      statusLine.append(viewers)
    }

    if (isGtaVi && (risk === 'spoiler-free' || risk === 'freeroam')) {
      const safeTag = document.createElement('span')

      safeTag.className =
        'border border-mint/30 px-1.5 py-0.5 text-[0.625rem] leading-3 tracking-[0.08em] text-mint uppercase'
      safeTag.textContent =
        risk === 'spoiler-free' ? 'Sin spoilers' : 'Exploración libre'
      statusLine.append(safeTag)
    } else if (isGtaVi && risk === 'story') {
      const storyTag = document.createElement('span')

      storyTag.className =
        'border border-vice/40 px-1.5 py-0.5 text-[0.625rem] leading-3 tracking-[0.08em] text-vice uppercase'
      storyTag.textContent = 'Modo historia'
      statusLine.append(storyTag)
    }

    const detail = document.createElement('p')

    detail.className = 'mt-1.5 truncate text-xs leading-4 text-muted'

    if (isLive) {
      if (masked) {
        detail.textContent =
          'Título protegido · Escudo sin spoilers activo para evitar destripes.'
        detail.className = 'mt-1.5 text-xs leading-4 text-mint/85'
      } else {
        detail.textContent = status?.title ?? 'Directo en curso'
        detail.className = 'mt-1.5 truncate text-xs leading-4 text-ink/85'
      }

      center.append(statusLine, detail)
    } else {
      center.append(statusLine)
    }

    article.append(left, center, link)

    return article
  }

  function renderGlobalPulse() {
    if (!globalWrapEl || !globalListEl || !globalCountEl) return

    if (apiMode !== 'live') {
      globalWrapEl.hidden = true

      return
    }

    const seen = new Set<string>()
    const liveCards: {
      creator: StreamerProfile
      region: Region
      status: LiveStreamStatus
    }[] = []

    for (const [countryId, roster] of Object.entries(streamersByCountry)) {
      const region = regionById.get(countryId)

      if (!region) continue

      for (const creator of roster) {
        const key = streamLookupKey(creator.platform, creator.handle)

        if (seen.has(key)) continue

        const status = liveByKey[key]

        if (!status?.live || !status.playingGtaVi) continue

        seen.add(key)
        liveCards.push({ creator, region, status })
      }
    }

    liveCards.sort((a, b) => (b.status.viewers ?? 0) - (a.status.viewers ?? 0))

    if (!liveCards.length) {
      globalWrapEl.hidden = true

      return
    }

    globalWrapEl.hidden = false
    globalCountEl.textContent = `${liveCards.length} en directo ahora`

    globalListEl.replaceChildren(
      ...liveCards.slice(0, 6).map(({ creator, region, status }) => {
        const risk = status.risk ?? classifySpoilerRisk(status.title)
        const masked = shouldMaskStream(risk, spoilerShield)
        const card = document.createElement('a')

        card.href = creator.url
        card.target = '_blank'
        card.rel = 'noopener noreferrer'
        card.className =
          'group flex min-w-0 w-full flex-col justify-between overflow-hidden border border-line bg-surface px-4 py-3.5 transition-[border-color,background-color] duration-150 ease-out hover:border-vice/60 hover:bg-surface-raised'

        const top = document.createElement('div')

        top.className = 'flex min-w-0 items-center justify-between gap-2'

        const who = document.createElement('span')

        who.className =
          'min-w-0 truncate text-sm leading-5 font-semibold text-ink'
        who.textContent = `${region.flag} ${creator.name}`

        const viewers = document.createElement('span')

        viewers.className =
          'shrink-0 text-xs leading-4 font-semibold text-mint tabular-nums'
        viewers.textContent =
          typeof status.viewers === 'number'
            ? `${formatViewers(status.viewers)}`
            : 'LIVE'

        top.append(who, viewers)

        const title = document.createElement('p')

        title.className = 'mt-2 min-w-0 truncate text-xs leading-4 text-muted'
        title.textContent = masked
          ? 'Título protegido · Escudo sin spoilers activo'
          : (status.title ?? 'Grand Theft Auto VI')

        const foot = document.createElement('p')

        foot.className =
          'mt-2.5 truncate text-[0.625rem] leading-3 tracking-[0.12em] text-vice uppercase'
        foot.textContent = `${region.country} · ${creator.platform}`

        card.append(top, title, foot)

        return card
      })
    )
  }

  function render() {
    const region = regionById.get(activeRegionId) ?? regions[0]!
    const roster = getStreamersForRegion(region.id)

    if (countryNameEl) countryNameEl.textContent = ` ${region.country}`

    if (scopeLabelEl) {
      scopeLabelEl.textContent =
        roster.scope === 'country'
          ? `${roster.label} · ${region.city} (${region.continent}). Cambia de país en el mapa o el tablero.`
          : `Sin top 5 local verificado: mostramos referentes de la región para ${region.country}.`
    }

    for (const button of filterButtons) {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.radarFilter === activeFilter)
      )
    }

    renderApiBanner(region)

    const filtered = roster.streamers.filter(creator => {
      const status = getStatus(creator)

      if (activeFilter === 'all') return true

      if (activeFilter === 'gtavi')
        return Boolean(status?.live && status.playingGtaVi)

      const risk = status?.risk ?? classifySpoilerRisk(status?.title)

      return (
        Boolean(status?.live && status.playingGtaVi) &&
        (risk === 'spoiler-free' || risk === 'freeroam')
      )
    })

    if (listEl && emptyEl) {
      listEl.hidden = filtered.length === 0
      emptyEl.hidden = filtered.length > 0

      if (filtered.length > 0) {
        listEl.replaceChildren(
          ...filtered.map((creator, idx) => buildCreatorRow(creator, idx))
        )
      } else if (emptyTitleEl) {
        emptyTitleEl.textContent =
          apiMode === 'directory'
            ? 'El estado en vivo no está disponible. Cambia a Todos para ver los canales.'
            : `Ningún canal de ${region.country} coincide con el filtro.`
      }
    }

    renderGlobalPulse()
  }

  async function refreshLiveStatus() {
    try {
      const response = await fetch('/api/streamers', {
        headers: { Accept: 'application/json' }
      })

      if (!response.ok) {
        apiMode = 'directory'
        liveByKey = {}
        render()
        onLiveChange()

        return
      }

      const contentType = response.headers.get('content-type') ?? ''

      if (!contentType.includes('application/json')) {
        apiMode = 'directory'
        liveByKey = {}
        render()
        onLiveChange()

        return
      }

      const data = (await response.json()) as StreamersApiResponse

      apiMode = data.mode === 'live' && data.configured ? 'live' : 'directory'
      liveByKey = data.live ?? {}
      render()
      onLiveChange()
    } catch {
      apiMode = 'directory'
      liveByKey = {}
      render()
      onLiveChange()
    }
  }

  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      const next = button.dataset.radarFilter as RadarFilter | undefined

      if (!next) return

      activeFilter = next
      render()
    })
  }

  for (const button of spoilerToggles) {
    button.addEventListener('click', () => {
      spoilerShield = !spoilerShield

      try {
        localStorage.setItem(SPOILER_STORAGE_KEY, String(spoilerShield))
      } catch {
        /* Storage can be unavailable in private browsing. */
      }

      applySpoilerUi()
      render()
    })
  }

  applySpoilerUi()
  render()

  let pollTimer: ReturnType<typeof setInterval> | undefined

  function startPolling() {
    if (pollTimer !== undefined) clearInterval(pollTimer)

    void refreshLiveStatus()
    pollTimer = setInterval(() => {
      if (!document.hidden) void refreshLiveStatus()
    }, 60_000)
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(pollTimer)
      pollTimer = undefined
    } else {
      startPolling()
    }
  })
  window.addEventListener('pagehide', () => {
    clearInterval(pollTimer)
    pollTimer = undefined
  })

  startPolling()

  return {
    setRegion(regionId: string) {
      activeRegionId = regionId
      render()
    },
    getCountrySummary,
    isSpoilerShieldActive: () => spoilerShield
  }
}

import { release } from '../constants.ts'

const formatters = new Map<string, Intl.DateTimeFormat>()

/** Resolve midnight of the release date in an IANA zone, using its actual offset. */
export function releaseInstant(
  zone: string,
  date: string = release.date
): number {
  const [year, month, day] = date.split('-').map(Number)
  const target = Date.UTC(year, month - 1, day)
  let guess = target
  let formatter = formatters.get(zone)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    })
    formatters.set(zone, formatter)
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const p = Object.fromEntries(
      formatter.formatToParts(guess).map(p => [p.type, p.value])
    )
    const rendered = Date.UTC(
      +p.year,
      +p.month - 1,
      +p.day,
      +p.hour,
      +p.minute,
      +p.second
    )
    const correction = target - rendered

    if (correction === 0) return guess
    guess += correction
  }

  throw new Error(`No se pudo resolver la medianoche en ${zone}`)
}

export type LaunchPhase = 'countdown' | 'wave' | 'live'

export function clockState(instant: number, now: number = Date.now()) {
  const available = now >= instant
  // A future countdown rounds up so a region never reads 00:00:00 before unlock.
  const total = available
    ? Math.floor((now - instant) / 1000)
    : Math.ceil((instant - now) / 1000)

  return {
    available,
    hours: Math.floor(total / 3600),
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60
  }
}

export function detailedClockState(instant: number, now: number = Date.now()) {
  const base = clockState(instant, now)
  const days = Math.floor(base.hours / 24)

  return {
    available: base.available,
    days,
    hours: base.hours % 24,
    totalHours: base.hours,
    minutes: base.minutes,
    seconds: base.seconds
  }
}

export function getLaunchPhase(
  instants: number[],
  now: number = Date.now()
): LaunchPhase {
  let availableCount = 0

  for (const instant of instants) {
    if (now >= instant) availableCount++
  }

  if (availableCount === 0) return 'countdown'

  if (availableCount >= instants.length) return 'live'

  return 'wave'
}

/** Approximate geographic longitude (in degrees, -180..180) currently at solar midnight. */
export function solarMidnightLongitude(now: number = Date.now()): number {
  const utcDayFraction = (((now / 86_400_000) % 1) + 1) % 1
  const raw = -utcDayFraction * 360

  return ((raw + 540) % 360) - 180
}

/** Approximate solar declination in degrees for drawing the real-time night terminator. */
export function solarDeclination(now: number = Date.now()): number {
  const date = new Date(now)
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1)
  const dayOfYear = (now - startOfYear) / 86_400_000

  return -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10))
}

/** Human-readable offset at the release instant, e.g. UTC−05:00. */
export function utcOffsetLabel(
  zone: string,
  date: string = release.date
): string {
  const instant = releaseInstant(zone, date)
  const name =
    new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'longOffset'
    })
      .formatToParts(instant)
      .find(part => part.type === 'timeZoneName')?.value ?? 'GMT'

  return name === 'GMT' ? 'UTC' : name.replace('GMT', 'UTC').replace('-', '−')
}

export function durationLabel(
  instant: number,
  now: number = Date.now()
): string {
  const { available, hours, minutes, seconds } = clockState(instant, now)
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${available ? 'Hace' : 'Faltan'} ${pad(hours)} h ${pad(minutes)} m ${pad(seconds)} s`
}

export function compactDurationLabel(
  instant: number,
  now: number = Date.now()
): string {
  const state = detailedClockState(instant, now)
  const pad = (n: number) => String(n).padStart(2, '0')

  if (state.days >= 2)
    return `${state.available ? 'Hace' : 'Faltan'} ${state.days} d ${pad(state.hours)} h ${pad(state.minutes)} m`

  return durationLabel(instant, now)
}

/** Calmer board label: minutes precision once the hour has passed or is near. */
export function coarseDurationLabel(
  instant: number,
  now: number = Date.now()
): string {
  const state = detailedClockState(instant, now)
  const pad = (n: number) => String(n).padStart(2, '0')
  const prefix = state.available ? 'Hace' : 'Faltan'

  if (state.days >= 2) return `${prefix} ${state.days} d ${pad(state.hours)} h`

  if (state.totalHours >= 1)
    return `${prefix} ${pad(state.totalHours)} h ${pad(state.minutes)} m`

  return `${prefix} ${pad(state.minutes)} m ${pad(state.seconds)} s`
}

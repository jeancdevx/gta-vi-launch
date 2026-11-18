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

export function durationLabel(
  instant: number,
  now: number = Date.now()
): string {
  const { available, hours, minutes, seconds } = clockState(instant, now)
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${available ? 'Hace' : 'Faltan'} ${pad(hours)} h ${pad(minutes)} m ${pad(seconds)} s`
}

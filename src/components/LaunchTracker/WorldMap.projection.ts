export type ProjectionMeta = {
  scale: number
  translateX: number
  translateY: number
  width: number
  height: number
}

const DEG_TO_RAD = Math.PI / 180

/** Exact Natural Earth 1 forward projection matching d3-geo without shipping d3 to the browser. */
export function projectNaturalEarth(
  lon: number,
  lat: number,
  meta: ProjectionMeta
): [number, number] {
  const lambda = lon * DEG_TO_RAD
  const phi = lat * DEG_TO_RAD
  const phi2 = phi * phi
  const phi4 = phi2 * phi2
  const rawX =
    lambda *
    (0.8707 -
      0.131979 * phi2 +
      phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4)))
  const rawY =
    phi *
    (1.007226 +
      phi2 *
        (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4)))

  return [
    meta.translateX + rawX * meta.scale,
    meta.translateY - rawY * meta.scale
  ]
}

export function buildSignalArcPath(
  from: [number, number],
  to: [number, number]
): string {
  const [x1, y1] = from
  const [x2, y2] = to
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.hypot(dx, dy)
  const lift = Math.min(130, Math.max(24, distance * 0.24))
  const cx = (x1 + x2) / 2
  const cy = Math.min(y1, y2) - lift

  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
}

export function buildMeridianPath(lon: number, meta: ProjectionMeta): string {
  const points: string[] = []

  for (let lat = -58; lat <= 82; lat += 4) {
    const [x, y] = projectNaturalEarth(lon, lat, meta)

    points.push(
      `${points.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    )
  }

  return points.join(' ')
}

export function formatCoordinates(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'O'

  return `${Math.abs(lat).toFixed(1)}° ${ns} · ${Math.abs(lon).toFixed(1)}° ${ew}`
}

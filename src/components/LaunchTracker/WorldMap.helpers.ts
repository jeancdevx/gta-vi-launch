// Decorative dot atlas. Country locations use real longitude and latitude;
// simplified continental outlines are intentionally illustrative.
const continents = [
  [
    [-168, 72],
    [-125, 72],
    [-105, 82],
    [-55, 59],
    [-60, 47],
    [-82, 25],
    [-99, 16],
    [-113, 28],
    [-128, 50],
    [-160, 58]
  ],
  [
    [-82, 13],
    [-62, 10],
    [-35, -7],
    [-43, -25],
    [-66, -56],
    [-77, -28]
  ],
  [
    [-54, 60],
    [-22, 69],
    [-31, 83],
    [-52, 83],
    [-65, 73]
  ],
  [
    [-11, 36],
    [-9, 58],
    [10, 72],
    [35, 70],
    [48, 54],
    [29, 36]
  ],
  [
    [-18, 35],
    [9, 37],
    [34, 30],
    [51, 11],
    [42, -14],
    [20, -35],
    [10, -20],
    [-6, 5],
    [-17, 15]
  ],
  [
    [29, 40],
    [44, 70],
    [100, 78],
    [179, 66],
    [159, 48],
    [141, 35],
    [123, 21],
    [106, 2],
    [94, 6],
    [78, 8],
    [65, 25],
    [46, 14]
  ],
  [
    [112, -11],
    [135, -10],
    [154, -23],
    [147, -39],
    [115, -34]
  ],
  [
    [166, -34],
    [179, -39],
    [173, -47],
    [165, -43]
  ],
  [
    [96, 5],
    [119, 1],
    [141, -5],
    [151, -9],
    [120, -10],
    [104, -5]
  ]
]

function contains(x: number, y: number, polygon: number[][]) {
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside
  }

  return inside
}

export function createAtlasDots() {
  const dots: { x: number; y: number }[] = []

  for (let lat = -55; lat <= 80; lat += 3.8)
    for (let lon = -176; lon < 180; lon += 3.8) {
      if (continents.some(p => contains(lon, lat, p)))
        dots.push({ x: (lon + 180) * 3, y: (85 - lat) * 3 })
    }

  return dots
}

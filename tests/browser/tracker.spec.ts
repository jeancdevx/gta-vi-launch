import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // External binary assets are not needed to verify country/time behavior.
  await page.route('https://raw.githubusercontent.com/**', route =>
    route.abort()
  )
  await page.route('https://www.rockstargames.com/**', route => route.abort())
  await page.clock.install({ time: new Date('2026-11-18T16:00:00Z') })
  await page.goto('/?country=pe')
})

test('countries transition from a countdown to elapsed time at the exact instant', async ({
  page
}) => {
  await expect(page.locator('#clock-hours')).toHaveText('13')
  await expect(page.locator('[data-region="pe"] .country-status')).toHaveText(
    'En espera'
  )
  await expect(page.locator('[data-region="jp"] .country-status')).toHaveText(
    'Disponible'
  )
  await expect(page.locator('[data-region="jp"] .country-timer')).toContainText(
    'Hace 01 h'
  )
  await page.clock.setSystemTime(new Date('2026-11-19T05:00:01Z'))
  await page.clock.runFor(1000)
  await expect(page.locator('[data-region="pe"] .country-status')).toHaveText(
    'Disponible'
  )
  await expect(page.locator('#local-status')).toHaveText('YA LLEGÓ LA HORA')
  await expect(page.locator('#clock-hours')).toHaveText('00')
})

test('accent insensitive search, status filters and the empty state work together', async ({
  page
}) => {
  await page.locator('#country-search').fill('PERU')
  await expect(page.locator('.country-card:visible')).toHaveCount(1)
  await page.getByRole('button', { name: /Disponibles/ }).click()
  await expect(page.locator('#empty-state')).toBeVisible()
  await page.getByRole('button', { name: 'Ver todos los países' }).click()
  await expect(page.locator('.country-card:visible')).toHaveCount(40)
  await page.locator('#country-search').fill('país inexistente')
  await expect(page.locator('#empty-state')).toBeVisible()
})

test('country, alternative zone and a shared URL preserve the selected countdown', async ({
  page
}) => {
  await page.locator('#region-select').selectOption('us')
  await expect(page.locator('#extra-zone-wrap')).toBeVisible()
  await page.locator('#zone-select').selectOption('America/Los_Angeles')
  await expect(page.locator('#clock-hours')).toHaveText('16')
  await expect(page).toHaveURL(/zone=America%2FLos_Angeles/)
  await page.reload()
  await expect(page.locator('#region-select')).toHaveValue('us')
  await expect(page.locator('#zone-select')).toHaveValue('America/Los_Angeles')
  await expect(page.locator('#clock-hours')).toHaveText('16')
})

test('mobile and desktop layouts fit the viewport and keep the tracker usable', async ({
  page
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('#hero-title')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )

    expect(overflow, `Overflow at ${width}px`).toBe(false)
  }

  await page.locator('[data-choose-region="nz"]').click()
  await expect(page.locator('#region-select')).toHaveValue('nz')
  await expect(page.locator('#countdown-label')).toHaveText(
    'Desde la medianoche del lanzamiento'
  )
})

test('the static build serves its images and GTA fonts locally', async ({
  page
}) => {
  const assets = await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager'

    await Promise.all(
      [...document.images].map(image => image.decode().catch(() => {}))
    )
    await document.fonts.ready

    return {
      brokenImages: [...document.images]
        .filter(image => image.naturalWidth === 0)
        .map(image => image.src),
      remoteImages: [...document.images]
        .filter(image => new URL(image.src).origin !== location.origin)
        .map(image => image.src),
      gtaFonts: [...document.fonts]
        .filter(font => font.family === 'GTA Art Deco')
        .map(font => font.status)
    }
  })

  expect(assets.brokenImages).toEqual([])
  expect(assets.remoteImages).toEqual([])
  expect(assets.gtaFonts).toEqual(['loaded', 'loaded'])
})

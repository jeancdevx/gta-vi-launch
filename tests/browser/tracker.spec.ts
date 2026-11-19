import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // External binary assets are not needed to verify country/time behavior.
  await page.route('https://raw.githubusercontent.com/**', route =>
    route.abort()
  )
  await page.route('https://www.rockstargames.com/**', route => route.abort())
  await page.clock.install({ time: new Date('2026-11-18T16:00:00Z') })
  await page.clock.pauseAt(new Date('2026-11-18T16:00:00Z'))
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
  await page.locator('#region-trigger').click()
  await page
    .locator('[data-region-option="us"][data-option-zone="America/New_York"]')
    .click()
  await expect(page.locator('#extra-zone-wrap')).toBeVisible()
  await page.locator('[data-zone-option="America/Los_Angeles"]').click()
  await expect(page.locator('#clock-hours')).toHaveText('16')
  await expect(page).toHaveURL(/zone=America%2FLos_Angeles/)
  await page.reload()
  await expect(page.locator('#region-trigger-country')).toHaveText(
    'Estados Unidos'
  )
  await expect(page.locator('#region-trigger-city')).toContainText(
    'Los Ángeles'
  )
  await expect(page.locator('#clock-hours')).toHaveText('16')
})

test('the region picker filters by city and supports keyboard selection', async ({
  page
}) => {
  const trigger = page.locator('#region-trigger')

  await trigger.click()
  await expect(page.locator('#region-panel')).toBeVisible()
  await page.locator('#region-search').fill('los')
  await expect(
    page.locator('[data-option-zone="America/Los_Angeles"]')
  ).toBeVisible()
  await expect(page.locator('#region-result-count')).toHaveText('1')
  await page.keyboard.press('Enter')
  await expect(page.locator('#region-trigger-city')).toContainText(
    'Los Ángeles'
  )
  await expect(page.locator('#region-panel')).toBeHidden()

  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(page.locator('#region-panel')).toBeHidden()
  await expect(trigger).toBeFocused()
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
  await expect(page.locator('#region-trigger-country')).toHaveText(
    'Nueva Zelanda'
  )
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

test('hero transitions to post-launch phase with multi-day clock and official milestones', async ({
  page
}) => {
  await page.clock.setSystemTime(new Date('2026-11-29T08:15:30Z'))
  await page.clock.runFor(1000)

  await expect(page.locator('#hero-section')).toHaveAttribute(
    'data-phase',
    'live'
  )
  await expect(page.locator('#hero-eyebrow')).toHaveText(
    '19 NOV 2026 · MEDIANOCHE CUMPLIDA'
  )
  await expect(page.locator('#clock-days-wrap')).toBeVisible()
  await expect(page.locator('#clock-days')).toHaveText('10')
  await expect(page.locator('#clock-hours')).toHaveText('03')
  await expect(page.locator('#available-count')).toHaveText('40')
  await expect(page.locator('[data-milestone="gta-online"]')).toContainText(
    'Sin fecha confirmada'
  )
  await expect(page.locator('[data-milestone="pc-release"]')).toContainText(
    'Sin fecha confirmada'
  )
})

test('tactical GTA world map renders real country vectors, sectors and updates radar on pin click', async ({
  page
}) => {
  await expect(page.locator('[data-map-poly]')).toHaveCount(39)
  await expect(page.locator('[data-map-region]')).toHaveCount(40)
  await expect(page.locator('#map-midnight-line')).toHaveAttribute('d', /^M/)
  await expect(page.locator('#map-active-arc')).toHaveAttribute('d', /^M/)

  await page.locator('[data-map-sector="europe"]').click()
  await expect(page.locator('#map-stage')).toHaveAttribute(
    'data-sector',
    'europe'
  )

  await page.locator('[data-map-region="es"]').click()
  await expect(page.locator('#map-hud-country')).toHaveText('España · Madrid')
  await expect(page.locator('#radar-country-name')).toContainText('España')
  await expect(page.locator('#radar-list')).toContainText('IlloJuan')
  await expect(page.locator('#radar-list')).toContainText('Vegetta777')
})

test('streamer radar displays live GTA VI status and spoiler shield masks story titles', async ({
  page
}) => {
  await page.route('**/api/streamers', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mode: 'live',
        configured: true,
        updatedAt: '2026-11-19T15:00:00Z',
        providers: { twitch: true, youtube: false, kick: false },
        live: {
          'twitch:illojuan': {
            live: true,
            playingGtaVi: true,
            gameName: 'Grand Theft Auto VI',
            title: 'Misión final de la historia de Jason y Lucia en Vice City',
            viewers: 84200,
            risk: 'story'
          },
          'twitch:rubius': {
            live: true,
            playingGtaVi: true,
            gameName: 'Grand Theft Auto VI',
            title: 'GTA VI SIN SPOILERS explorando Vice Beach',
            viewers: 51300,
            risk: 'spoiler-free'
          },
          'twitch:ibai': {
            live: true,
            playingGtaVi: false,
            gameName: 'Just Chatting',
            title: 'Charlando antes de jugar',
            viewers: 32000,
            risk: 'unknown'
          }
        }
      })
    })
  )

  await page.goto('/?country=es')
  await expect(page.locator('#radar-api-status')).toContainText(
    '2 de 5 canales de España en GTA VI ahora'
  )
  await expect(page.locator('#hero-streamer-pulse-text')).toContainText(
    '2 de 5 en GTA VI desde España'
  )
  await expect(page.locator('#radar-global-wrap')).toBeVisible()
  await expect(page.locator('[data-streamer-id="es-illojuan"]')).toContainText(
    'Misión final de la historia'
  )

  await page.locator('[data-spoiler-toggle]').first().click()
  await expect(page.locator('html')).toHaveAttribute(
    'data-spoiler-shield',
    'true'
  )
  await expect(page.locator('[data-streamer-id="es-illojuan"]')).toContainText(
    'Título protegido'
  )
  await expect(page.locator('[data-streamer-id="es-rubius"]')).toContainText(
    'SIN SPOILERS'
  )

  await page.locator('[data-radar-filter="safe"]').click()
  await expect(page.locator('#radar-list article')).toHaveCount(1)
  await expect(page.locator('#radar-list')).toContainText('Rubius')
})

test('region picker never collides with header and live global pulse never overflows mobile', async ({
  page
}) => {
  await page.route('**/api/streamers', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mode: 'live',
        configured: true,
        updatedAt: '2026-11-19T15:00:00Z',
        providers: { twitch: true, youtube: true, kick: true },
        live: {
          'youtube:ishowspeed': {
            live: true,
            playingGtaVi: true,
            gameName: 'Grand Theft Auto VI',
            title:
              'PLAYING GTA 6 RIGHT NOW WITH SUPERLONGUNBROKENTITLETEST1234567890',
            viewers: 201500,
            risk: 'unknown'
          },
          'youtube:vegetta777': {
            live: true,
            playingGtaVi: true,
            gameName: 'Grand Theft Auto VI',
            title: 'GTA 6 en Vice City #2',
            viewers: 33100,
            risk: 'story'
          }
        }
      })
    })
  )

  await page.goto('/?country=es')
  await expect(page.locator('header img')).toHaveAttribute(
    'src',
    /full-logo\.webp$/
  )
  await expect(page.locator('header')).toContainText('Launch tracker')

  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 820]
  ]) {
    await page.setViewportSize({ width, height })
    await expect(page.locator('#radar-global-wrap')).toBeVisible()

    const normalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )

    expect(normalOverflow, `Normal overflow at ${width}x${height}`).toBe(false)

    await page.locator('#region-trigger').click()
    await expect(page.locator('#region-panel')).toBeVisible()

    const geometry = await page.evaluate(() => {
      const header = document.querySelector('header')!.getBoundingClientRect()
      const panel = document
        .querySelector('#region-panel')!
        .getBoundingClientRect()

      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        panelTop: panel.top,
        panelBottom: panel.bottom,
        headerBottom: header.bottom,
        viewportHeight: window.innerHeight
      }
    })

    expect(geometry.overflow, `Picker overflow at ${width}x${height}`).toBe(
      false
    )

    if (width >= 640) {
      expect(
        geometry.panelTop,
        `Picker overlaps header at ${width}x${height}`
      ).toBeGreaterThanOrEqual(geometry.headerBottom)
    }

    await page.keyboard.press('Escape')
    await expect(page.locator('#region-panel')).toBeHidden()
  }
})

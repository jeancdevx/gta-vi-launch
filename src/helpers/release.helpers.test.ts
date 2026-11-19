import assert from 'node:assert/strict'
import { test } from 'node:test'

import { alternateZones, regions } from '../constants.ts'

import {
  clockState,
  coarseDurationLabel,
  compactDurationLabel,
  detailedClockState,
  durationLabel,
  getLaunchPhase,
  releaseInstant,
  solarDeclination,
  solarMidnightLongitude
} from './release.helpers.ts'

test('launch instants use regional DST, half-hour and quarter-hour offsets', () => {
  const examples = [
    ['Pacific/Auckland', '2026-11-18T11:00:00Z'],
    ['Pacific/Chatham', '2026-11-18T10:15:00Z'],
    ['Australia/Sydney', '2026-11-18T13:00:00Z'],
    ['Australia/Adelaide', '2026-11-18T13:30:00Z'],
    ['Asia/Kolkata', '2026-11-18T18:30:00Z'],
    ['Europe/Madrid', '2026-11-18T23:00:00Z'],
    ['America/Lima', '2026-11-19T05:00:00Z'],
    ['America/New_York', '2026-11-19T05:00:00Z'],
    ['America/Los_Angeles', '2026-11-19T08:00:00Z']
  ]

  for (const [zone, expected] of examples)
    assert.equal(releaseInstant(zone), Date.parse(expected), zone)
})

test('transition is exact and elapsed time counts upward after release', () => {
  const instant = Date.parse('2026-11-19T05:00:00Z')

  assert.deepEqual(clockState(instant, instant - 1), {
    available: false,
    hours: 0,
    minutes: 0,
    seconds: 1
  })
  assert.deepEqual(clockState(instant, instant), {
    available: true,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  assert.deepEqual(clockState(instant, instant + 3661000), {
    available: true,
    hours: 1,
    minutes: 1,
    seconds: 1
  })
  assert.equal(
    durationLabel(instant, instant - 3661000),
    'Faltan 01 h 01 m 01 s'
  )
  assert.equal(
    durationLabel(instant, instant + 90000000),
    'Hace 25 h 00 m 00 s'
  )
})

test('all countries and additional zones have valid unique definitions', () => {
  assert.equal(new Set(regions.map(r => r.id)).size, regions.length)

  for (const region of regions) {
    assert.ok(Number.isFinite(releaseInstant(region.zone)))

    for (const extra of alternateZones[region.id] ?? [])
      assert.ok(Number.isFinite(releaseInstant(extra.zone)))
  }
})

test('launch phase transitions across countdown, wave and live eras', () => {
  const instants = regions.map(region => releaseInstant(region.zone))

  assert.equal(
    getLaunchPhase(instants, Date.parse('2026-11-18T10:00:00Z')),
    'countdown'
  )
  assert.equal(
    getLaunchPhase(instants, Date.parse('2026-11-18T16:00:00Z')),
    'wave'
  )
  assert.equal(
    getLaunchPhase(instants, Date.parse('2026-11-19T12:00:00Z')),
    'live'
  )

  const afterTenDays = detailedClockState(
    Date.parse('2026-11-19T05:00:00Z'),
    Date.parse('2026-11-29T08:15:30Z')
  )

  assert.deepEqual(afterTenDays, {
    available: true,
    days: 10,
    hours: 3,
    totalHours: 243,
    minutes: 15,
    seconds: 30
  })
  assert.equal(
    compactDurationLabel(
      Date.parse('2026-11-19T05:00:00Z'),
      Date.parse('2026-11-29T08:15:30Z')
    ),
    'Hace 10 d 03 h 15 m'
  )
  assert.equal(
    coarseDurationLabel(
      Date.parse('2026-11-19T05:00:00Z'),
      Date.parse('2026-11-19T23:04:41Z')
    ),
    'Hace 18 h 04 m'
  )
  assert.equal(
    coarseDurationLabel(
      Date.parse('2026-11-19T05:00:00Z'),
      Date.parse('2026-11-19T05:00:21Z')
    ),
    'Hace 00 m 21 s'
  )

  const midnightLon = solarMidnightLongitude(Date.parse('2026-11-19T00:00:00Z'))

  assert.equal(midnightLon, 0)
  assert.ok(
    Math.abs(solarDeclination(Date.parse('2026-11-19T00:00:00Z'))) <= 23.5
  )
})

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { alternateZones, regions } from '../constants.ts'

import { clockState, durationLabel, releaseInstant } from './release.helpers.ts'

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

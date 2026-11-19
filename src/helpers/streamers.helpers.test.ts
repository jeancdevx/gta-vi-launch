import assert from 'node:assert/strict'
import { test } from 'node:test'

import { regions } from '../constants.ts'

import {
  classifySpoilerRisk,
  formatViewers,
  getAllTrackedHandles,
  getStreamersForRegion,
  isGtaViGame,
  shouldMaskStream,
  streamLookupKey
} from './streamers.helpers.ts'

test('every tracked region resolves five real streamers with valid links', () => {
  for (const region of regions) {
    const selection = getStreamersForRegion(region.id)

    assert.equal(selection.streamers.length, 5, region.id)

    for (const creator of selection.streamers) {
      assert.ok(creator.name.length > 0)
      assert.ok(creator.handle.length > 0)
      assert.ok(creator.url.startsWith('https://'))

      if (creator.platform === 'youtube') {
        assert.match(
          creator.youtubeChannelId ?? '',
          /^UC[A-Za-z0-9_-]{22}$/,
          creator.name
        )
      }
    }
  }

  assert.equal(getStreamersForRegion('es').scope, 'country')
  assert.equal(getStreamersForRegion('pe').scope, 'country')
  assert.equal(getStreamersForRegion('uy').scope, 'regional')
})

test('detects GTA VI streams and spoiler risk accurately', () => {
  assert.equal(isGtaViGame('Grand Theft Auto VI'), true)
  assert.equal(isGtaViGame('Grand Theft Auto VI (GTA)'), true)
  assert.equal(isGtaViGame('Grand Theft Auto V'), false)
  assert.equal(isGtaViGame('', 'Jugando GTA VI en Vice City'), true)
  assert.equal(isGtaViGame('Just Chatting', 'Hablando de GTA VI'), false)

  assert.equal(
    classifySpoilerRisk('GTA VI SIN SPOILERS explorando Vice Beach'),
    'spoiler-free'
  )
  assert.equal(
    classifySpoilerRisk('Caos con 5 estrellas de policía en Leonida'),
    'freeroam'
  )
  assert.equal(
    classifySpoilerRisk('Misión final de la historia de Jason y Lucia'),
    'story'
  )
  assert.equal(classifySpoilerRisk('Directo nocturno'), 'unknown')

  assert.equal(shouldMaskStream('story', true), true)
  assert.equal(shouldMaskStream('unknown', true), true)
  assert.equal(shouldMaskStream('spoiler-free', true), false)
  assert.equal(shouldMaskStream('freeroam', true), false)
  assert.equal(shouldMaskStream('story', false), false)
})

test('formats viewer counts and lookup keys consistently', () => {
  assert.equal(formatViewers(845), '845')
  assert.equal(formatViewers(12_400), '12,4 mil')
  assert.equal(formatViewers(185_200), '185 mil')
  assert.equal(streamLookupKey('twitch', 'IlloJuan'), 'twitch:illojuan')

  const handles = getAllTrackedHandles()

  assert.ok(handles.twitch.includes('illojuan'))
  assert.ok(handles.twitch.includes('elglogloking'))
  assert.ok(handles.twitch.includes('coringa'))
  assert.ok(handles.twitch.includes('izakooo'))
  assert.ok(handles.youtube.includes('vegetta777'))
  assert.ok(handles.kick.includes('elzeein'))
})

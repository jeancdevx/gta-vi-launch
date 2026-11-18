import assert from 'node:assert/strict'
import { test } from 'node:test'

import { matchesSearch } from './search.helpers.ts'

test('search ignores accents, case, whitespace and accepts country or city', () => {
  assert.ok(matchesSearch('  peru ', 'Perú', 'Lima'))
  assert.ok(matchesSearch('MEXICO', 'México', 'Ciudad de México'))
  assert.ok(matchesSearch('nueva zelanda', 'Nueva Zelanda', 'Auckland'))
  assert.equal(matchesSearch('Argentina', 'Perú', 'Lima'), false)
})

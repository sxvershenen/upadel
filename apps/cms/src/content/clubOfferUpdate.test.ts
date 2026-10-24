import assert from 'node:assert/strict'
import test from 'node:test'
import { clubOfferPriceUpdates, clubOpeningPromo, updateCeilingStats } from './clubOfferUpdate'

test('opening offer uses the requested two-line copy', () => {
  assert.deepEqual(clubOpeningPromo, { title: '2 недели с открытия', caption: 'Аренда со скидкой 50%' })
})

test('only the three requested coaches receive the new price', () => {
  assert.deepEqual(clubOfferPriceUpdates, {
    'anastasia-sekamova': 7500,
    'maksim-skapenko': 7500,
    'roman-bardin': 7500,
  })
})

test('ceiling update changes old values without disturbing other metrics', () => {
  const stats = [{ value: '11.5 м', label: 'Высота потолка' }, { value: '+21°C', label: 'Температура' }]
  assert.deepEqual(updateCeilingStats(stats), [{ value: '13 м', label: 'Высота потолка' }, stats[1]])
})

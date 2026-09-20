import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatTournamentLevel,
  formatTournamentSchedule,
  resolveTournamentFormatLabel,
  validateTournamentEnd,
  validateTournamentLevelTo,
} from '../tournaments/model'
import { Tournaments } from './Tournaments'

test('tournament date label is derived from start and end in Moscow time', () => {
  assert.equal(
    formatTournamentSchedule('2026-09-20T16:30:00.000Z', '2026-09-20T19:30:00.000Z'),
    'Воскресенье, 20 сентября · 19:30–22:30',
  )
  assert.match(
    formatTournamentSchedule('2026-09-20T19:30:00.000Z', '2026-09-21T08:00:00.000Z'),
    /Воскресенье, 20 сентября, 22:30 — 21 сентября 2026 г., 11:00/,
  )
})

test('tournament level range and validation use one source of truth', () => {
  assert.equal(formatTournamentLevel('2.0', '2.0'), '2.0')
  assert.equal(formatTournamentLevel('2.5', '4.5'), '2.5–4.5')
  assert.equal(validateTournamentLevelTo('2.0', { siblingData: { levelFrom: '3.0' } }), 'Максимальный уровень не может быть ниже минимального.')
  assert.equal(validateTournamentLevelTo('4.0', { siblingData: { levelFrom: '3.0' } }), true)
})

test('tournament end and custom format validation preserve editor intent', () => {
  assert.equal(validateTournamentEnd('2026-09-20T19:30:00.000Z', { siblingData: { startsAt: '2026-09-20T16:30:00.000Z' } }), true)
  assert.equal(validateTournamentEnd('2026-09-20T15:30:00.000Z', { siblingData: { startsAt: '2026-09-20T16:30:00.000Z' } }), 'Окончание должно быть позже начала.')
  assert.equal(resolveTournamentFormatLabel('americano', null), 'Americano (смена напарников каждый сет)')
  assert.equal(resolveTournamentFormatLabel('other', 'Командный кубок'), 'Командный кубок')
})

test('tournament editor exposes the requested tabs and removes legacy duplicate fields', () => {
  const tabsField = Tournaments.fields.find((field) => field.type === 'tabs')
  assert.ok(tabsField && tabsField.type === 'tabs')
  assert.deepEqual(tabsField.tabs.map(({ label }) => label), [
    'Основное', 'Карточка', 'Участники', 'Итоги', 'Призы и взносы', 'FAQ', 'Регламент и правила', 'SEO',
  ])
  const serialized = JSON.stringify(Tournaments.fields)
  assert.doesNotMatch(serialized, /scheduleLabel|levelKey|formatKey|categoryKey/)
  assert.match(serialized, /external-link/)
})

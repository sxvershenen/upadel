import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { TournamentCard } from './TournamentCard'

test('TournamentCard shows format in the top badge and player level in metadata', () => {
  const html = renderToStaticMarkup(<TournamentCard tournament={{
    id: 'tournament-1',
    slug: 'americano',
    visualStyle: 'mesh',
    image: null,
    imageOverlay: null,
    meshStyle: 'deep-blue',
    levelFrom: 2,
    levelTo: 4,
    levelLabel: '2.0–4.0',
    icon: 'Trophy',
    title: 'Game Party',
    scheduleLabel: 'Каждую пятницу',
    startsAt: '2026-09-20T16:30:00.000Z',
    endsAt: '2026-09-20T19:30:00.000Z',
    format: 'americano',
    formatLabel: 'Americano',
    entryFee: '2 500 ₽',
    description: 'Описание турнира',
    prizeLabel: 'Призы',
    prize: 'Кубки',
  }} />)

  assert.ok(html.indexOf('Americano') < html.indexOf('Game Party'))
  assert.match(html, /Уровень 2\.0–4\.0/)
})

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
    level: '2.0',
    icon: 'Trophy',
    title: 'Game Party',
    scheduleLabel: 'Каждую пятницу',
    format: 'Americano',
    entryFee: '2 500 ₽',
    description: 'Описание турнира',
    prizeLabel: 'Призы',
    prize: 'Кубки',
  }} />)

  assert.ok(html.indexOf('Americano') < html.indexOf('Game Party'))
  assert.match(html, /Уровень 2\.0/)
})

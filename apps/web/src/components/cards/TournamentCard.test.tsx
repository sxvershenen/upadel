import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { TournamentCard, tournamentCardHref, type Tournament } from './TournamentCard'

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


const informational = { id: 'regular', slug: 'regular-tournaments', title: 'Регулярные турниры', description: 'Необычные форматы', formatLabel: 'Необычные форматы', entryFee: 'от 4 000 ₽', visualStyle: 'mesh', meshStyle: 'deep-blue', icon: 'Trophy', scheduleLabel: '', levelLabel: '', prize: '', prizeLabel: 'Призовой фонд', cardLinkEnabled: false } as Tournament

test('informational tournament has one fee, no link, arrow, fake date or level', () => {
  const html = renderToStaticMarkup(<TournamentCard tournament={informational} />)
  assert.doesNotMatch(html, /<a |arrow-action|Уровень|lucide-calendar-days/)
  assert.equal((html.match(/4 000/g) ?? []).length, 1)
  assert.match(html, /Регулярные турниры/)
  assert.match(html, /data-card-hoverable="true"/)
  assert.doesNotMatch(html, /cursor-pointer/)
})

test('tournament links respect disable switch, custom HTTPS URL and internal fallback', () => {
  assert.equal(tournamentCardHref({ ...informational, cardURL: 'https://vk.com/post' }), null)
  assert.equal(tournamentCardHref({ ...informational, cardLinkEnabled: true }), '/tournaments/regular-tournaments')
  assert.equal(tournamentCardHref({ ...informational, cardLinkEnabled: true, cardURL: 'javascript:alert(1)' }), null)
  assert.equal(tournamentCardHref({ ...informational, cardLinkEnabled: true, cardURL: 'broken url' }), null)
  const html = renderToStaticMarkup(<TournamentCard tournament={{ ...informational, cardLinkEnabled: true, cardURL: 'https://vk.com/post' }} />)
  assert.match(html, /href="https:\/\/vk.com\/post" target="_blank" rel="noreferrer"/)
})

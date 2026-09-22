import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CourtCard } from './CourtCards'

const court = {
  id: 'court',
  slug: 'court',
  eyebrow: 'Технология',
  title: 'Инженерная деталь',
  description: 'Описание решения.',
}

test('only the JUBO panoramic court card remains linked and interactive', () => {
  const panoramic = renderToStaticMarkup(<CourtCard court={{ ...court, cardVariant: 'panoramic' } as any} />)
  assert.match(panoramic, /href="\/padel-court-zakaz"/)
  assert.match(panoramic, /cursor-pointer/)
  assert.match(panoramic, /card-spring/)

  for (const cardVariant of ['damping', 'surface'] as const) {
    const html = renderToStaticMarkup(<CourtCard court={{ ...court, cardVariant } as any} />)
    assert.doesNotMatch(html, /<a\b/)
    assert.doesNotMatch(html, /cursor-pointer/)
    assert.doesNotMatch(html, /card-spring/)
  }

  const metrics = renderToStaticMarkup(<CourtCard court={{
    ...court,
    cardVariant: 'metrics',
    metrics: [{ value: '11,5 м', label: 'Высота', icon: 'Layers3' }],
  } as any} />)
  assert.doesNotMatch(metrics, /<a\b/)
  assert.doesNotMatch(metrics, /cursor-pointer/)
  assert.doesNotMatch(metrics, /card-spring/)
})

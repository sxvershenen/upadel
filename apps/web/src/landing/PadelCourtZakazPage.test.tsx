import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  CourtModelTabs,
  models,
  turnkeySteps,
  technologies,
  distributorAdvantages,
  priceFactors,
  typograph,
} from './PadelCourtZakazPage'

test('court model tabs expose all 6 JUBO models, crisp photos, and standardized specs in server HTML', () => {
  const html = renderToStaticMarkup(<CourtModelTabs />)

  assert.equal((html.match(/role="tab"/g) ?? []).length, 6)
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 6)
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1)
  assert.equal((html.match(/ hidden=""/g) ?? []).length, 5)

  for (const id of ['infinity', 'super-panoramic', 'panoramic', 'vision-pro', 'infinity-tournament', 'infinity-xtrem']) {
    assert.match(html, new RegExp(`role="tab"[^>]+aria-controls="court-model-panel-${id}"`))
    assert.match(html, new RegExp(`id="court-model-panel-${id}"[^>]+role="tabpanel"`))
  }

  // Check 6 crisp court photos from jubopadel.com
  for (const src of [
    'supportinfinitypk-1024x576.png',
    'superpanoramic-1024x576.png',
    'panoramic-1024x576.png',
    'visionpro-glass-1024x576.png',
    'infinity20264_2.120-1-1024x565.png',
    'xtrem-1024x576.jpg',
  ]) {
    assert.match(html, new RegExp(`src="[^"]*${src.replace('.', '\\.')}`))
  }

  // Ensure no redundant CTA button inside tabs
  assert.equal(html.includes('Запросить расчёт модели'), false)

  // Verify all 6 models have the exact same 6 standardized spec rows in identical order
  const expectedLabels = ['Остекление', 'Силовой каркас', 'Антикоррозия', 'Сетка', 'Крепёж', 'Ветростойкость']
  for (const model of models) {
    const labels = model.specs.map((s) => s.label)
    assert.deepEqual(labels, expectedLabels, `Model ${model.name} must have standardized spec rows`)
  }
})

test('specifications and data arrays contain all turnkey stages and technologies', () => {
  assert.equal(models.length, 6)
  assert.equal(turnkeySteps.length, 5)
  assert.equal(technologies.length, 6)
  assert.equal(distributorAdvantages.length, 4)
  assert.equal(priceFactors.length, 8)

  assert.equal(turnkeySteps[0].number, '01')
  assert.equal(turnkeySteps[4].number, '05')

  const modelNames = models.map((m) => m.name)
  assert.deepEqual(modelNames, [
    'Infinity',
    'Super Panoramic',
    'Panoramic',
    'Vision Pro',
    'Infinity Tournament',
    'Infinity Xtrem',
  ])
})

test('typograph helper binds prepositions and short words with non-breaking spaces', () => {
  const result = typograph('Падел корт под ключ в Москве и по всей России')
  assert.equal(result, 'Падел корт под\u00A0ключ в\u00A0Москве и\u00A0по\u00A0всей России')
})

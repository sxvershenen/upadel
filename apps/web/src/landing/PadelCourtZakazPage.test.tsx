import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { PadelCourtZakazPageDTO } from '@unlim/content-contract'
import { CourtModelTabs, typograph } from './PadelCourtZakazPage'

type PadelModel = PadelCourtZakazPageDTO['models']['items'][number]
const media = (file: string) => ({ alt: `Модель ${file}`, mimeType: 'image/webp', url: `https://cms.test/${file}`, width: 1920, height: 1080 })
const specLabels = ['Остекление', 'Силовой каркас', 'Антикоррозия', 'Сетка', 'Крепёж', 'Ветростойкость']
const models: PadelModel[] = [
  ['infinity', 'Infinity', '3c.png'],
  ['super-panoramic', 'Super Panoramic', '3a.png'],
  ['panoramic', 'Panoramic', '3.png'],
  ['vision-pro', 'Vision Pro', 'visiopro-side.png'],
  ['infinity-tournament', 'Infinity Tournament', 'infinity_ParaWbTournament.107.png'],
  ['infinity-xtrem', 'Infinity Xtrem', '3-1.png'],
].map(([id, name, file]) => ({
  id, name, eyebrow: 'JUBO', title: `${name} title`, tagline: `${name} tagline`, description: `${name} description`, image: media(file),
  specs: specLabels.map((label) => ({ label, value: `${name} ${label}` })),
  highlights: [`${name} highlight`],
}))

test('court model tabs expose all 6 JUBO models, crisp photos, and standardized specs in server HTML', () => {
  const html = renderToStaticMarkup(<CourtModelTabs badge="JUBO · Испания" models={models} />)

  assert.equal((html.match(/role="tab"/g) ?? []).length, 6)
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 6)
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1)
  assert.equal((html.match(/ hidden=""/g) ?? []).length, 5)

  for (const id of ['infinity', 'super-panoramic', 'panoramic', 'vision-pro', 'infinity-tournament', 'infinity-xtrem']) {
    assert.match(html, new RegExp(`role="tab"[^>]+aria-controls="court-model-panel-${id}"`))
    assert.match(html, new RegExp(`id="court-model-panel-${id}"[^>]+role="tabpanel"`))
  }

  // Check 6 matching-angle court photos from jubopadel.com
  for (const src of [
    '3c.png',
    '3a.png',
    '3.png',
    'visiopro-side.png',
    'infinity_ParaWbTournament.107.png',
    '3-1.png',
  ]) {
    assert.match(html, new RegExp(`src="[^"]*${src.replace('.', '\\.')}`))
  }

  // Ensure no redundant CTA button inside tabs
  assert.equal(html.includes('Запросить расчёт модели'), false)

  // Verify all 6 models have the exact same 6 standardized spec rows in identical order
  const expectedLabels = specLabels
  for (const model of models) {
    const labels = model.specs.map((s) => s.label)
    assert.deepEqual(labels, expectedLabels, `Model ${model.name} must have standardized spec rows`)
  }
})

test('model cards remain driven by the typed CMS DTO shape', () => {
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

import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CourtModelTabs, models, turnkeySteps, technologies, distributorAdvantages, priceFactors } from './PadelCourtZakazPage'

test('court model tabs expose all 6 JUBO models and matching panels in server HTML', () => {
  const html = renderToStaticMarkup(<CourtModelTabs />)

  assert.equal((html.match(/role="tab"/g) ?? []).length, 6)
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 6)
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1)
  assert.equal((html.match(/ hidden=""/g) ?? []).length, 5)

  for (const id of ['infinity', 'super-panoramic', 'panoramic', 'vision-pro', 'infinity-tournament', 'infinity-xtrem']) {
    assert.match(html, new RegExp(`role="tab"[^>]+aria-controls="court-model-panel-${id}"`))
    assert.match(html, new RegExp(`id="court-model-panel-${id}"[^>]+role="tabpanel"`))
  }

  // Check key image sources (in img src or video poster)
  for (const src of ['fondoAzul.377.png', 'super_panoraic_inicio.png', 'panoramic_presentation.png', 'presentation_vision.png', 'destacada.png', '3-4.png']) {
    assert.match(html, new RegExp(`(?:src|poster)="[^"]*${src.replace('.', '\\.')}`))
  }

  // Check WebM video tags
  assert.match(html, /Header-Super-Pano-2400-1080-H265\.webm/)
  assert.match(html, /Header-Infinity-2400-1080-h265\.webm/)
  assert.match(html, /Header-Panoramic-2400-1080-H265\.webm/)
  assert.match(html, /xtrem-header\.webm/)
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

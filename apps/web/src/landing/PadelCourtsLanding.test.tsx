import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CourtModelTabs } from './PadelCourtsLanding'

test('court model tabs expose all tabs and matching panels in server HTML', () => {
  const html = renderToStaticMarkup(<CourtModelTabs />)

  assert.equal((html.match(/role="tab"/g) ?? []).length, 6)
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 6)
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1)
  assert.equal((html.match(/ hidden=""/g) ?? []).length, 5)
  assert.equal((html.match(/<img /g) ?? []).length, 6)
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 6)
  assert.equal((html.match(/decoding="async"/g) ?? []).length, 6)

  for (const id of ['infinity', 'super-panoramic', 'panoramic', 'vision-pro', 'infinity-tournament', 'infinity-xtrem']) {
    assert.match(html, new RegExp(`role="tab"[^>]+aria-controls="court-model-panel-${id}"`))
    assert.match(html, new RegExp(`id="court-model-panel-${id}"[^>]+role="tabpanel"[^>]+aria-label=`))
  }

  for (const src of ['fondoAzul.377.png', 'super_panoraic_inicio.png', 'panoramic_presentation.png', 'presentation_vision.png', 'destacada.png', '3-4.png']) {
    assert.match(html, new RegExp(`src="[^"]*${src.replace('.', '\\.')}`))
  }
})

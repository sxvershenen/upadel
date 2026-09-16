import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PageHeader } from './PageHeader'

test('page header renders one heading without an extra back-link wrapper or spacer', () => {
  const html = renderToStaticMarkup(<PageHeader page={{
    eyebrow: 'Раздел',
    title: 'Заголовок страницы',
    intro: 'Короткое описание страницы',
    hero: { grayscale: false, media: { url: '/hero.webp', alt: 'Фон', mimeType: 'image/webp' } },
  }} />)

  assert.equal((html.match(/<h1/g) ?? []).length, 1)
  assert.doesNotMatch(html, /Назад/)
  assert.doesNotMatch(html, /h-\[60px\]/)
  assert.doesNotMatch(html, /min-h-\[760px\]/)
})

import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PageHeader } from './PageHeader'

test('compact page header renders one heading and a sticky back bar outside content', () => {
  const html = renderToStaticMarkup(<PageHeader page={{
    eyebrow: 'Раздел',
    title: 'Заголовок страницы',
    intro: 'Короткое описание страницы',
    hero: { grayscale: false, media: { url: '/hero.webp', alt: 'Фон', mimeType: 'image/webp' } },
  }} />)

  assert.equal((html.match(/<h1/g) ?? []).length, 1)
  assert.match(html, /class="[^"]*sticky top-0[^"]*md:top-\[60px\]/)
  assert.match(html, /href="\/"[^>]*>[\s\S]*Назад/)
  assert.doesNotMatch(html, /min-h-\[760px\]/)
})

import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PageHeader } from './PageHeader'

test('compact page header renders one heading and a floating back link', () => {
  const html = renderToStaticMarkup(<PageHeader page={{
    eyebrow: 'Раздел',
    title: 'Заголовок страницы',
    intro: 'Короткое описание страницы',
    hero: { grayscale: false, media: { url: '/hero.webp', alt: 'Фон', mimeType: 'image/webp' } },
  }} />)

  assert.equal((html.match(/<h1/g) ?? []).length, 1)
  assert.match(html, /<a href="\/" class="[^"]*fixed[^\"]*right-4[^\"]*top-4[^\"]*md:top-\[30px\][^\"]*">[\s\S]*Назад/)
  assert.doesNotMatch(html, /sticky top-0/)
  assert.doesNotMatch(html, /border-b border-ink\/5/)
  assert.doesNotMatch(html, /min-h-\[760px\]/)
})

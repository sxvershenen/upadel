import assert from 'node:assert/strict'
import test from 'node:test'

import { articleContentHTML } from './articleContent'

const payload = {
  findByID: async ({ id }: { id: string }) => id === '7' ? {
    id: 7,
    alt: 'Корт <лето>',
    caption: 'Фото & клуб',
    height: 800,
    mimeType: 'image/webp',
    sizes: { card: { height: 600, mimeType: 'image/webp', url: '/media/court-card.webp', width: 1200 } },
    url: '/media/court.webp?x=1&y=2',
    width: 1600,
  } : null,
}

test('renders semantic article nodes, UI-kit headings and safely resolved Media uploads', async () => {
  const html = await articleContentHTML({ root: { type: 'root', children: [
    { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Раздел' }] },
    { type: 'heading', tag: 'h3', children: [{ type: 'text', text: 'Подраздел' }] },
    { type: 'heading', tag: 'h4', children: [{ type: 'text', text: 'Деталь' }] },
    { type: 'quote', children: [{ type: 'text', text: 'Цитата' }] },
    { type: 'horizontalrule' },
    { type: 'list', listType: 'number', start: 3, children: [
      { type: 'listitem', children: [{ type: 'text', text: 'Первый' }, { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [{ type: 'text', text: 'Вложенный' }] }] }] },
    ] },
    { type: 'list', listType: 'check', children: [{ type: 'listitem', checked: true, children: [{ type: 'text', text: 'Готово' }] }] },
    { type: 'upload', relationTo: 'media', value: 7, fields: {} },
  ] } }, { origin: 'https://cms.example.test', payload: payload as never })

  assert.match(html, /<h2 class="type-title-large">Раздел<\/h2>/)
  assert.match(html, /<h3 class="type-title-card">Подраздел<\/h3>/)
  assert.match(html, /<h4 class="type-title-compact">Деталь<\/h4>/)
  assert.match(html, /<blockquote>Цитата<\/blockquote><hr>/)
  assert.match(html, /<ol start="3"><li>Первый<ul><li>Вложенный<\/li><\/ul><\/li><\/ol>/)
  assert.match(html, /role="checkbox" aria-readonly="true" aria-checked="true"/)
  assert.match(html, /<figure class="article-prose__media">/)
  assert.match(html, /src="https:\/\/cms\.example\.test\/media\/court\.webp\?x=1&amp;y=2"/)
  assert.match(html, /width="1600" height="800" loading="lazy" decoding="async"/)
  assert.match(html, /alt="Корт &lt;лето&gt;"/)
  assert.match(html, /<figcaption class="type-body-sm">Фото &amp; клуб<\/figcaption>/)
})

test('escapes text and attributes, rejects unsafe links and omits missing or unsupported uploads', async () => {
  const html = await articleContentHTML({ root: { type: 'root', children: [
    { type: 'paragraph', children: [{ type: 'text', text: '<script>alert(1)</script>' }] },
    { type: 'link', fields: { url: 'javascript:alert(1)', newTab: true }, children: [{ type: 'text', text: 'bad' }] },
    { type: 'link', fields: { url: '//evil.example.test/path' }, children: [{ type: 'text', text: 'protocol-relative' }] },
    { type: 'link', fields: { url: 'https://example.test/?q="x"', newTab: true }, children: [{ type: 'text', text: 'safe' }] },
    { type: 'heading', tag: 'h1', children: [{ type: 'text', text: 'Not H1' }] },
    { type: 'upload', relationTo: 'media', value: 404 },
    { type: 'upload', relationTo: 'media', value: { id: 8, mimeType: 'application/pdf', url: '/file.pdf' } },
  ] } }, { origin: 'https://cms.example.test', payload: payload as never })

  assert.doesNotMatch(html, /<script|javascript:|evil\.example|<h1|file\.pdf/)
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(html, />badprotocol-relative<a href="https:\/\/example\.test\/\?q=&quot;x&quot;" target="_blank" rel="noopener noreferrer">safe<\/a>/)
  assert.match(html, /<p>Not H1<\/p>/)
})

test('renders supported Media videos instead of exposing an editor option that disappears publicly', async () => {
  const html = await articleContentHTML({ root: { type: 'root', children: [{
    type: 'upload', relationTo: 'media', value: { id: 8, caption: 'Матч', mimeType: 'video/mp4', url: '/match.mp4' },
  }] } }, { origin: 'https://cms.example.test', payload: payload as never })

  assert.match(html, /<figure class="article-prose__media article-prose__media--video">/)
  assert.match(html, /<video controls preload="metadata"><source src="https:\/\/cms\.example\.test\/match\.mp4" type="video\/mp4">/)
  assert.match(html, /<figcaption class="type-body-sm">Матч<\/figcaption>/)
})

test('uses an already populated Media relation without an extra query', async () => {
  let queried = false
  const html = await articleContentHTML({ root: { type: 'root', children: [{
    type: 'upload', relationTo: 'media', value: { id: 'populated', alt: 'Alt', height: 10, mimeType: 'image/webp', url: '/populated.webp', width: 20 },
  }] } }, {
    origin: 'https://cms.example.test',
    payload: { findByID: async () => { queried = true; return null } } as never,
  })
  assert.equal(queried, false)
  assert.match(html, /src="https:\/\/cms\.example\.test\/populated\.webp"/)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { cookieNoticeParts } from './cookieNoticeText'

test('marks the CMS-delimited cookie consent as the privacy-policy link', () => {
  assert.deepEqual(cookieNoticeParts('Продолжая использовать наш сайт, вы даёте *согласие на использование собираемых данных (cookie)*. Если не хотите обработки, измените настройки браузера.'), {
    before: 'Продолжая использовать наш сайт, вы даёте ',
    linked: 'согласие на использование собираемых данных (cookie)',
    after: '. Если не хотите обработки, измените настройки браузера.',
  })
})

test('keeps CMS copy readable when no link markers are provided', () => {
  assert.deepEqual(cookieNoticeParts('Текст без выделения.'), { before: 'Текст без выделения.', linked: '', after: '' })
})

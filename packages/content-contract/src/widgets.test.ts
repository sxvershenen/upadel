import assert from 'node:assert/strict'
import test from 'node:test'
import { widgetURL } from './widgets'

const script = 'https://supadb.vivacrm.ru/storage/v1/object/public/widgets/3ffc4681-890e-4d27-9676-1a5a7c246b17.js'

test('installation snippets project only validated URLs, never markup or attributes', () => {
  assert.equal(widgetURL(`<script src="${script}"></script>`, 'vivacrm-script'), script)
  assert.equal(widgetURL('<iframe src="https://booking.example/form" onload="evil()" srcdoc="evil"></iframe>', 'iframe'), 'https://booking.example/form')
  assert.equal(widgetURL(`<script src="${script}">evil()</script>`, 'vivacrm-script'), null)
  assert.equal(widgetURL('<iframe src="https://booking.example"></iframe><script>evil()</script>', 'iframe'), null)
})

test('script URLs are limited to public VivaCRM installation scripts', () => {
  assert.equal(widgetURL(script, 'vivacrm-script'), script)
  for (const value of [script.replace('supadb.vivacrm.ru', 'evil.example'), script.replace('https:', 'http:'), `${script}?code=evil`, script.replace('widgets/', 'other/'), script.replace('https://', 'https://user:password@'), 'javascript:alert(1)', 'data:text/html,evil']) {
    assert.equal(widgetURL(value, 'vivacrm-script'), null, value)
  }
  assert.equal(widgetURL(script, 'unknown' as any), null)
})

test('iframes require public HTTPS destinations without credentials', () => {
  assert.equal(widgetURL('https://booking.example/widget?coach=1', 'iframe'), 'https://booking.example/widget?coach=1')
  for (const value of ['http://booking.example', 'javascript:alert(1)', 'https://localhost/widget', 'https://127.0.0.1', 'https://192.168.1.1', 'https://user:secret@booking.example']) assert.equal(widgetURL(value, 'iframe'), null)
})

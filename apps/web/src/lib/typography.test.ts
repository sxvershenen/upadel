import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { typographTextValue } from './typography'

test('typographTextValue binds Russian short words and numbers to following words or units', () => {
  assert.equal(
    typographTextValue('Открыто с 7 часов до 23 часов, ответим за 30 сек'),
    'Открыто с\u00a07\u00a0часов до\u00a023\u00a0часов, ответим за\u00a030\u00a0сек',
  )
  assert.equal(
    typographTextValue('Корт 20 м × 10 м · скорость 12 км/ч · 2 500 ₽ · 4 корта · 10 000 игроков'),
    'Корт 20\u00a0м × 10\u00a0м · скорость 12\u00a0км/ч · 2\u00a0500\u00a0₽ · 4\u00a0корта · 10\u00a0000\u00a0игроков',
  )
})

test('typographTextValue is stable and binds plural counts as well as measurements', () => {
  const once = typographTextValue('30\u00a0сек и 4\u00a0корта')
  assert.equal(once, '30\u00a0сек и\u00a04\u00a0корта')
  assert.equal(typographTextValue(once), once)
})

test('site layout applies typography to SSR and later text nodes with explicit opt-outs', () => {
  const source = readFileSync(new URL('../layouts/SiteLayout.astro', import.meta.url), 'utf8')

  assert.match(source, /typograph\(document\.body\)/)
  assert.match(source, /createTreeWalker\(root, NodeFilter\.SHOW_TEXT\)/)
  assert.match(source, /mutation\.type === 'characterData'/)
  assert.match(source, /astro-island\[ssr\],script,style,noscript,textarea,input,select,option,code,pre,\[contenteditable="true"\],\[data-no-typography\]/)
  assert.match(source, /mutation\.type === 'attributes'/)
  assert.match(source, /attributeFilter: \['ssr'\]/)
  assert.match(source, /formatted !== node\.nodeValue/)
})

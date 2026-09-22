import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('homepage sections and footer hydrate without empty deferred wrappers', () => {
  const source = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8')

  assert.doesNotMatch(source, /waitUntilSectionIsNear|DeferredFooter|deferredSection/)
  assert.doesNotMatch(source, /data-home-section=\{key\}[\s\S]{0,160}<Suspense/)
  assert.match(source, /data-home-section="footer"><Footer \/>/)
})

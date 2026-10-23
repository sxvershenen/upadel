import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { parseClubRules } from './clubLaunchUpdate'

test('rules import preserves all ten sections and the original words, including same-day cancellation', () => {
  const lines = JSON.parse(readFileSync(new URL('../../seed-media/club-update-20261023/documents.json', import.meta.url), 'utf8')).rules as string[]
  const parsed = parseClubRules(lines)
  assert.equal(parsed.sections.length, 10)
  assert.match(JSON.stringify(parsed.sections[1]), /3 часа/)
  const reconstructed = parsed.sections.map(({ title, content }) => title + content.root.children.map((node) => node.children[0].text).join('')).join('') + parsed.closingText
  const normalize = (text: string) => text.replace(/[\s🎾]/gu, '')
  assert.equal(normalize(reconstructed), normalize(lines.slice(2).join('')))
})

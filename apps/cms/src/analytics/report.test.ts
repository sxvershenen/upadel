import assert from 'node:assert/strict'
import test from 'node:test'

import { changePercent, comparisonPeriod, withPageLeadCounts, type AnalyticsGroup } from './report'

test('previous comparison has equal inclusive length', () => {
  assert.deepEqual(comparisonPeriod({ from: '2026-03-01', to: '2026-03-30' }, 'previous'), { from: '2026-01-30', to: '2026-02-28' })
})

test('year comparison preserves dates and zero-base is explicit', () => {
  assert.deepEqual(comparisonPeriod({ from: '2026-03-01', to: '2026-03-30' }, 'year'), { from: '2025-03-01', to: '2025-03-30' })
  assert.equal(changePercent(0, 0), 0); assert.equal(changePercent(10, 0), null); assert.equal(changePercent(15, 10), 50)
})

const page = (name: string): AnalyticsGroup => ({ name, browsers: 10, sessions: 12, targetSessions: 2, actions: 4, leads: 0, activeMs: 100 })

test('popular pages attribute saved leads to the originating page', () => {
  const result = withPageLeadCounts(
    [page('/'), page('/training')],
    [{ sourcePage: '/', exactLeadCount: 2 }, { sourcePage: '/training', exactLeadCount: 1 }, { path: '/', exactLeadCount: 1 }],
  )
  assert.equal(result.find((row) => row.name === '/')?.leads, 3)
  assert.equal(result.find((row) => row.name === '/training')?.leads, 1)
})

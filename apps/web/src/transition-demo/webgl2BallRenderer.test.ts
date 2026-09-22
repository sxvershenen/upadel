import assert from 'node:assert/strict'
import test from 'node:test'

import { generateWebGL2SeamPoints } from './webgl2BallRenderer'

test('WebGL2 tennis seam stays on the unit sphere and matches the shader point count', () => {
  const points = generateWebGL2SeamPoints()
  assert.equal(points.length, 48 * 3)
  for (let index = 0; index < points.length; index += 3) {
    const length = Math.hypot(points[index], points[index + 1], points[index + 2])
    assert.ok(Math.abs(length - 1) < 1e-6)
  }
})

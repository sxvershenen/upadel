import assert from 'node:assert/strict'
import test from 'node:test'

import { mat4RotateEuler } from './webgl2BallMath'

test('allocation-free Euler rotation preserves the previous matrix product in-place and out-of-place', () => {
  for (const angles of [[0, 0, 0], [0.1, -0.7, 2.2], [90, -80, 70], [Math.PI / 2, Math.PI, -Math.PI / 2]]) {
    const [x, y, z] = angles
    const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z)
    const rotation = new Float32Array([
      cy * cz, cy * sz, -sy, 0,
      sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy, 0,
      cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy, 0,
      0, 0, 0, 1,
    ])
    // Non-identity, non-affine input also exercises the fourth row and translation.
    const input = new Float32Array([1, 2, 3, 0.2, 4, 5, 6, 0.3, 7, 8, 9, 0.4, 10, 11, 12, 1])
    const originalInput = new Float32Array(input)
    const expected = new Float32Array(16)
    for (let col = 0; col < 4; col += 1) for (let row = 0; row < 4; row += 1) {
      expected[col * 4 + row] = rotation[col * 4] * input[row] + rotation[col * 4 + 1] * input[row + 4]
        + rotation[col * 4 + 2] * input[row + 8] + rotation[col * 4 + 3] * input[row + 12]
    }
    const separate = new Float32Array(16)
    assert.equal(mat4RotateEuler(separate, input, x, y, z), separate)
    assert.deepEqual(separate, expected)
    const inplace = new Float32Array(input)
    mat4RotateEuler(inplace, inplace, x, y, z)
    assert.deepEqual(inplace, expected)
    assert.deepEqual(input, originalInput)
  }
})

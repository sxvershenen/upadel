import assert from 'node:assert/strict'
import test from 'node:test'

import { adaptReferenceTrajectory, computeReferenceTrajectory, evaluateReferenceTrajectory, type ReferencePoint, type ReferenceTrajectory } from './referenceTrajectories'

const desktop: ReferenceTrajectory = {
  preset: 'crosscourt_tl_br',
  start: { x: -14, y: 8, z: -20 },
  control: { x: -3, y: 4, z: -6 },
  peak: { x: 0.5, y: -0.2, z: 2.8 },
  end: { x: 16, y: -9, z: 4.5 },
  spinVector: { x: 1.2, y: 0.8, z: 0.5, speed: 28 },
}

test('portrait ball trajectory rotates the desktop flight into the vertical axis', () => {
  const portrait = adaptReferenceTrajectory(desktop, true)

  assert.equal(portrait.start.x, desktop.start.y * 0.48)
  assert.equal(portrait.start.y, -desktop.start.x * 0.72)
  assert.equal(portrait.end.x, desktop.end.y * 0.48)
  assert.equal(portrait.end.y, -desktop.end.x * 0.72)
  assert.equal(portrait.start.z, desktop.start.z)
  assert.equal(portrait.spinVector.speed, desktop.spinVector.speed)
  assert.match(portrait.preset, /_portrait$/)
})

test('desktop ball trajectory is preserved without portrait adaptation', () => {
  assert.equal(adaptReferenceTrajectory(desktop, false), desktop)
})

// Frozen evaluator from 9706315 and the supplied WebGL2 reference. Keep this
// independent of production smoothing to protect the original flight shape.
function originalPosition(traj: ReferenceTrajectory, t: number): ReferencePoint {
  const u = t <= 0.5 ? t * 2 : (t - 0.5) * 2
  const start = t <= 0.5 ? traj.start : traj.peak
  const end = t <= 0.5 ? traj.peak : traj.end
  const control = t <= 0.5 ? traj.control : {
    x: traj.peak.x + (traj.peak.x - traj.control.x) * 0.6,
    y: traj.peak.y + (traj.peak.y - traj.control.y) * 0.6,
    z: traj.peak.z + 1.2,
  }
  return {
    x: (1 - u) ** 2 * start.x + 2 * (1 - u) * u * control.x + u ** 2 * end.x,
    y: (1 - u) ** 2 * start.y + 2 * (1 - u) * u * control.y + u ** 2 * end.y,
    z: (1 - u) ** 2 * start.z + 2 * (1 - u) * u * control.z + u ** 2 * end.z,
  }
}

const axes = ['x', 'y', 'z'] as const

function assertNear(actual: ReferencePoint, expected: ReferencePoint, tolerance: number, message: string) {
  for (const axis of axes) assert.ok(Math.abs(actual[axis] - expected[axis]) < tolerance, `${message}: ${axis} ${actual[axis]} vs ${expected[axis]}`)
}

function velocity(a: ReferencePoint, b: ReferencePoint, step: number): ReferencePoint {
  return { x: (b.x - a.x) / step, y: (b.y - a.y) / step, z: (b.z - a.z) / step }
}

// Screen-space centre and apparent radius, with the renderer camera at z=5.
function projected(point: ReferencePoint): ReferencePoint {
  return { x: point.x / (5 - point.z), y: point.y / (5 - point.z), z: 1.1 / (5 - point.z) }
}

test('all presets retain anchors, shape and depth direction with continuous world/screen velocity', (context) => {
  let randomValues: number[] = []
  context.mock.method(Math, 'random', () => {
    assert.ok(randomValues.length, 'unexpected random input')
    return randomValues.shift()!
  })
  for (let preset = 0; preset < 7; preset += 1) {
    for (const jitterX of [0, 0.5, 0.999999]) for (const jitterY of [0, 0.5, 0.999999]) {
      for (const endX of preset === 4 ? [0, 1] : [0]) for (const endY of preset === 4 ? [0, 1] : [0]) {
        for (const portrait of [false, true]) {
          randomValues = [(preset + 0.5) / 7, jitterX, jitterY, endX, endY]
          const traj = computeReferenceTrajectory({ portrait })
          const label = `${traj.preset} jitter=${jitterX},${jitterY} end=${endX},${endY}`
          assert.deepEqual(evaluateReferenceTrajectory(traj, 0), traj.start)
          assert.deepEqual(evaluateReferenceTrajectory(traj, 0.5), traj.peak)
          assert.deepEqual(evaluateReferenceTrajectory(traj, 1), traj.end)
          assert.deepEqual(evaluateReferenceTrajectory(traj, -1), traj.start)
          assert.deepEqual(evaluateReferenceTrajectory(traj, 2), traj.end)

          let previous = traj.start
          let previousOriginal = traj.start
          for (let index = 0; index <= 1000; index += 1) {
            const t = index / 1000
            const point = evaluateReferenceTrajectory(traj, t)
            const original = originalPosition(traj, t)
            assert.ok(axes.every((axis) => Number.isFinite(point[axis])), label)
            // tr_bl already reverses depth near 0.9 in the reference. Preserve
            // that exit, while forbidding any newly introduced depth reversal.
            assert.ok((point.z - previous.z) * (original.z - previousOriginal.z) >= 0, `${label}: new depth reversal at ${t}`)
            const deviation = Math.hypot(...axes.map((axis) => point[axis] - original[axis]))
            assert.ok(deviation < 0.7, `${label}: changed flight character at ${t}`)
            if (t <= 0.4 || t >= 0.6) assertNear(point, original, 1e-12, label)
            previous = point
            previousOriginal = original
          }

          const step = 1e-6
          for (const join of [0.4, 0.5, 0.6]) {
            const before = evaluateReferenceTrajectory(traj, join - step)
            const at = evaluateReferenceTrajectory(traj, join)
            const after = evaluateReferenceTrajectory(traj, join + step)
            assertNear(before, at, 1e-3, `${label}: left position at ${join}`)
            assertNear(after, at, 1e-3, `${label}: right position at ${join}`)
            const left = velocity(before, at, step)
            const right = velocity(at, after, step)
            assertNear(left, right, 0.01, `${label}: world velocity at ${join}`)
            assert.ok(Math.hypot(left.x, left.y, left.z) > 1, `${label}: stalled at ${join}`)
            assertNear(velocity(projected(before), projected(at), step), velocity(projected(at), projected(after), step), 0.05, `${label}: screen velocity at ${join}`)
          }
        }
      }
    }
  }
})

test('zero or opposing midpoint tangents remain finite and continuous', () => {
  for (const control of [desktop.peak, { x: desktop.peak.x, y: desktop.peak.y, z: 4 }]) {
    const traj = { ...desktop, control }
    const step = 1e-6
    const at = evaluateReferenceTrajectory(traj, 0.5)
    assert.deepEqual(at, traj.peak)
    assertNear(
      velocity(evaluateReferenceTrajectory(traj, 0.5 - step), at, step),
      velocity(at, evaluateReferenceTrajectory(traj, 0.5 + step), step),
      0.01,
      'degenerate midpoint velocity',
    )
  }
})

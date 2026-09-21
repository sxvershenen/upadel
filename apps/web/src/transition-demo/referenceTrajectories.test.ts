import assert from 'node:assert/strict'
import test from 'node:test'

import { adaptReferenceTrajectory, type ReferenceTrajectory } from './referenceTrajectories'

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

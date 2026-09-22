import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'

import { generateWebGL2SeamPoints, WebGL2BallRenderer } from './webgl2BallRenderer'
import { evaluateReferenceTrajectory, type ReferenceTrajectory } from './referenceTrajectories'

const trajectory: ReferenceTrajectory = {
  preset: 'crosscourt_tl_br',
  start: { x: -14, y: 8, z: -20 },
  control: { x: -3, y: 4, z: -6 },
  peak: { x: 0.5, y: -0.2, z: 2.8 },
  end: { x: 16, y: -9, z: 4.5 },
  spinVector: { x: 1.2, y: 0.8, z: 0.5, speed: 28 },
}

function rendererHarness(context: TestContext, compact = false, inactiveUniform = 'uSheenIntensity') {
  let renderer: WebGL2BallRenderer
  // node:test runs after hooks in registration order; dispose before globals.
  context.after(() => renderer?.destroy())
  const calls: { name: string; args: unknown[] }[] = []
  const uniforms = new Map<WebGLProgram, Map<string, number | number[]>>()
  const draws: { kind: string; count: number; uniforms: Map<string, number | number[]> }[] = []
  let activeProgram: WebGLProgram | null = null
  let nextObject = 0
  const record = (name: string, args: unknown[]) => { calls.push({ name, args }) }
  const allocate = () => ({ id: ++nextObject })
  type Location = { program: WebGLProgram; name: string }
  function upload(method: string, location: Location | null, value: number | ArrayLike<number>) {
    record(method, [location, value])
    if (!location) return
    assert.equal(location.program, activeProgram, 'uniform must be uploaded to its own active program')
    const state = uniforms.get(location.program) ?? new Map()
    state.set(location.name, typeof value === 'number' ? value : Array.from(value))
    uniforms.set(location.program, state)
  }
  function draw(kind: string, count: number) {
    assert.ok(activeProgram)
    draws.push({ kind, count, uniforms: new Map(uniforms.get(activeProgram)) })
  }
  const gl = {
    ...Object.fromEntries(['STATIC_DRAW', 'DYNAMIC_DRAW', 'ARRAY_BUFFER', 'ELEMENT_ARRAY_BUFFER', 'FLOAT', 'DEPTH_TEST', 'LEQUAL', 'TRIANGLES', 'UNSIGNED_SHORT', 'BLEND', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'POINTS', 'COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'VERTEX_SHADER', 'FRAGMENT_SHADER', 'COMPILE_STATUS', 'LINK_STATUS'].map((name, index) => [name, index + 1])),
    ...Object.fromEntries(['bindVertexArray', 'bindBuffer', 'bufferData', 'bufferSubData', 'enableVertexAttribArray', 'vertexAttribPointer', 'viewport', 'clearColor', 'clear', 'enable', 'disable', 'depthFunc', 'depthMask', 'blendFunc', 'deleteBuffer', 'deleteVertexArray', 'deleteProgram', 'deleteShader', 'shaderSource', 'compileShader', 'attachShader', 'linkProgram'].map((name) => [name, (...args: unknown[]) => record(name, args)])),
    createShader: allocate,
    createProgram: allocate,
    createVertexArray: allocate,
    createBuffer: allocate,
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    useProgram(program: WebGLProgram) { activeProgram = program },
    getUniformLocation(program: WebGLProgram, name: string) {
      record('getUniformLocation', [program, name])
      return name === inactiveUniform ? null : { program, name }
    },
    uniform1f(location: Location | null, value: number) { upload('uniform1f', location, value) },
    uniform3fv(location: Location | null, value: ArrayLike<number>) { upload('uniform3fv', location, value) },
    uniformMatrix3fv(location: Location | null, transpose: boolean, value: ArrayLike<number>) {
      assert.equal(transpose, false)
      upload('uniformMatrix3fv', location, value)
    },
    uniformMatrix4fv(location: Location | null, transpose: boolean, value: ArrayLike<number>) {
      assert.equal(transpose, false)
      upload('uniformMatrix4fv', location, value)
    },
    drawElements(_mode: number, count: number) { draw('ball', count) },
    drawArrays(_mode: number, _first: number, count: number) { draw('trail', count) },
  }
  let frameId = 0
  const frames = new Map<number, FrameRequestCallback>()
  function globalValue(name: string, value: unknown) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    context.after(() => {
      if (original) Object.defineProperty(globalThis, name, original)
      else Reflect.deleteProperty(globalThis, name)
    })
  }
  globalValue('window', { innerWidth: 800, innerHeight: 600, devicePixelRatio: 2 })
  globalValue('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  globalValue('cancelAnimationFrame', (id: number) => frames.delete(id))
  context.mock.method(performance, 'now', () => 0)
  const canvas = { clientWidth: 800, clientHeight: 600, width: 0, height: 0, getContext: () => gl }
  renderer = new WebGL2BallRenderer(canvas as unknown as HTMLCanvasElement, compact)
  function step(now: number) {
    assert.equal(frames.size, 1, 'exactly one animation frame should be scheduled')
    const [id, callback] = [...frames][0]
    frames.delete(id)
    callback(now)
  }
  return { renderer, canvas, frames, calls, draws, step }
}

test('WebGL2 tennis seam stays on the unit sphere and matches the shader point count', () => {
  const points = generateWebGL2SeamPoints()
  assert.equal(points.length, 48 * 3)
  for (let index = 0; index < points.length; index += 3) {
    const length = Math.hypot(points[index], points[index + 1], points[index + 2])
    assert.ok(Math.abs(length - 1) < 1e-6)
  }
})

test('steady-state frames only upload model/normal matrices and keep program-specific uniforms', (context) => {
  const { renderer, canvas, calls, draws, step } = rendererHarness(context)
  const lookups = () => calls.filter((call) => call.name === 'getUniformLocation')
  const initializedLookups = lookups().length
  renderer.startFlight(trajectory, 1000)
  const beforeFrames = calls.length
  step(400)
  step(500)
  step(600)
  assert.equal(lookups().length, initializedLookups, 'no lookups during flights, even for inactive uniforms')
  const uploads = calls.slice(beforeFrames).filter((call) => call.name.startsWith('uniform'))
  assert.deepEqual(uploads.map((call) => call.name), Array.from({ length: 3 }, () => ['uniformMatrix4fv', 'uniformMatrix3fv']).flat())
  assert.deepEqual([canvas.width, canvas.height], [1400, 1050])
  const balls = draws.filter((draw) => draw.kind === 'ball')
  for (let index = 0; index < balls.length; index += 1) {
    const state = balls[index].uniforms
    const model = state.get('uModelMatrix') as number[]
    const point = evaluateReferenceTrajectory(trajectory, [0.4, 0.5, 0.6][index])
    assert.deepEqual(model.slice(12, 15), Array.from(new Float32Array([point.x, point.y, point.z])))
    assert.equal(state.get('uNoiseScale'), 2.2)
    assert.equal(state.get('uFuzzStrength'), 1.2)
    assert.deepEqual(state.get('uSeamPoints'), Array.from(generateWebGL2SeamPoints()))
    assert.equal(state.has('uSheenIntensity'), false, 'compiler-removed uniforms may have null locations')
    assert.equal((state.get('uViewMatrix') as number[])[14], -5)
  }
  const trail = draws.find((draw) => draw.kind === 'trail')!
  assert.equal(trail.uniforms.get('uTrailIntensity'), 1.2)
  assert.equal(trail.uniforms.get('uPointSize'), 16)
  assert.deepEqual(trail.uniforms.get('uProjectionMatrix'), balls[0].uniforms.get('uProjectionMatrix'))
  assert.notDeepEqual(lookups().find((call) => call.args[1] === 'uViewMatrix')?.args[0], lookups().findLast((call) => call.args[1] === 'uViewMatrix')?.args[0])

  const projection = balls[0].uniforms.get('uProjectionMatrix')
  canvas.clientWidth = 600
  canvas.clientHeight = 800
  renderer.resize()
  step(650)
  const resizedBall = draws.findLast((draw) => draw.kind === 'ball')!
  const resizedTrail = draws.findLast((draw) => draw.kind === 'trail')!
  assert.notDeepEqual(resizedBall.uniforms.get('uProjectionMatrix'), projection)
  assert.deepEqual(resizedBall.uniforms.get('uProjectionMatrix'), resizedTrail.uniforms.get('uProjectionMatrix'))
  assert.equal(lookups().length, initializedLookups, 'resize uses cached program-specific locations')
})

test('compact renderer caches null dynamic locations and preserves its DPR and point size', (context) => {
  const { renderer, canvas, calls, draws, step } = rendererHarness(context, true, 'uNormalMatrix')
  renderer.startFlight(trajectory)
  step(100)
  step(200)
  assert.equal(calls.filter((call) => call.name === 'getUniformLocation' && call.args[1] === 'uNormalMatrix').length, 1)
  assert.deepEqual([canvas.width, canvas.height], [1000, 750])
  assert.equal(draws.find((draw) => draw.kind === 'trail')!.uniforms.get('uPointSize'), 12)
})

test('idle, cancellation, replacement, completion and disposal do not retain a render loop or old trail', (context) => {
  const { renderer, frames, calls, draws, step } = rendererHarness(context)
  const progress: number[] = []
  let completions = 0
  renderer.onProgress = (value) => progress.push(value)
  renderer.onComplete = () => { completions += 1 }
  assert.equal(frames.size, 0)
  assert.equal(draws.length, 0)
  renderer.startFlight(trajectory, 1000)
  step(100)
  step(200)
  renderer.startFlight(trajectory, 1000)
  const beforeReplacement = draws.length
  step(300)
  assert.deepEqual(draws.slice(beforeReplacement).map((draw) => draw.kind), ['ball'])
  renderer.cancelFlight()
  assert.equal(frames.size, 0)
  assert.equal(completions, 0)
  renderer.startFlight(trajectory, 1000)
  const beforeRestart = draws.length
  step(400)
  assert.deepEqual(draws.slice(beforeRestart).map((draw) => draw.kind), ['ball'])
  step(1000)
  assert.equal(frames.size, 0)
  assert.equal(completions, 1)
  assert.equal(progress.at(-1), 1)
  const completedDraws = draws.length
  renderer.startFlight(trajectory)
  renderer.destroy()
  assert.equal(frames.size, 0)
  const afterDestroy = calls.length
  renderer.destroy()
  renderer.startFlight(trajectory)
  assert.equal(calls.length, afterDestroy)
  assert.equal(frames.size, 0)
  assert.equal(draws.length, completedDraws)
  assert.equal(calls.filter((call) => call.name === 'deleteBuffer').length, 5)
  assert.equal(calls.filter((call) => call.name === 'deleteVertexArray').length, 2)
  assert.equal(calls.filter((call) => call.name === 'deleteProgram').length, 2)
})

test('missing WebGL2 fails before starting an animation', () => {
  const canvas = { getContext: () => null } as unknown as HTMLCanvasElement
  assert.throws(() => new WebGL2BallRenderer(canvas, false), /WebGL2 is unavailable/)
})

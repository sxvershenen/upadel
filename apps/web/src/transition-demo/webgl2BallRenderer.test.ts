import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'

import { generateWebGL2SeamPoints, WebGL2BallRenderer } from './webgl2BallRenderer'
import { evaluateReferenceTrajectory, type ReferenceTrajectory } from './referenceTrajectories'
import { ballFragmentShaderSource, compactBallFragmentShaderSource, materialFragmentShaderSource } from './webgl2BallShaders'

const trajectory: ReferenceTrajectory = {
  preset: 'crosscourt_tl_br',
  start: { x: -14, y: 8, z: -20 },
  control: { x: -3, y: 4, z: -6 },
  peak: { x: 0.5, y: -0.2, z: 2.8 },
  end: { x: 16, y: -9, z: 4.5 },
  spinVector: { x: 1.2, y: 0.8, z: 0.5, speed: 28 },
}

function rendererHarness(context: TestContext, compact = false, inactiveUniform = 'uSheenIntensity', failure?: 'framebuffer' | 'texture' | 'bake-compile' | 'bake-link') {
  let renderer: WebGL2BallRenderer
  // node:test runs after hooks in registration order; dispose before globals.
  context.after(() => renderer?.destroy())
  const calls: { name: string; args: unknown[] }[] = []
  const uniforms = new Map<WebGLProgram, Map<string, number | number[]>>()
  const draws: { kind: string; count: number; uniforms: Map<string, number | number[]> }[] = []
  let activeProgram: WebGLProgram | null = null
  let nextObject = 0
  let boundFramebuffer: unknown = null
  let shaderCount = 0
  let programCount = 0
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
  const constants = Object.fromEntries(['STATIC_DRAW', 'DYNAMIC_DRAW', 'ARRAY_BUFFER', 'ELEMENT_ARRAY_BUFFER', 'FLOAT', 'DEPTH_TEST', 'LEQUAL', 'TRIANGLES', 'UNSIGNED_SHORT', 'BLEND', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'POINTS', 'COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'VERTEX_SHADER', 'FRAGMENT_SHADER', 'COMPILE_STATUS', 'LINK_STATUS', 'CULL_FACE', 'BACK', 'TEXTURE0', 'TEXTURE_2D', 'RGBA8', 'RGBA', 'UNSIGNED_BYTE', 'TEXTURE_MIN_FILTER', 'TEXTURE_MAG_FILTER', 'LINEAR', 'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T', 'REPEAT', 'CLAMP_TO_EDGE', 'FRAMEBUFFER', 'COLOR_ATTACHMENT0', 'FRAMEBUFFER_COMPLETE'].map((name, index) => [name, index + 1]))
  const gl = {
    ...constants,
    ...Object.fromEntries(['bindVertexArray', 'bindBuffer', 'bufferData', 'bufferSubData', 'enableVertexAttribArray', 'vertexAttribPointer', 'viewport', 'clearColor', 'clear', 'enable', 'disable', 'depthFunc', 'depthMask', 'blendFunc', 'deleteBuffer', 'deleteVertexArray', 'deleteProgram', 'deleteShader', 'shaderSource', 'compileShader', 'attachShader', 'linkProgram', 'cullFace', 'activeTexture', 'bindTexture', 'texImage2D', 'texParameteri', 'framebufferTexture2D', 'deleteTexture', 'deleteFramebuffer'].map((name) => [name, (...args: unknown[]) => record(name, args)])),
    createShader() { shaderCount += 1; return allocate() },
    createProgram() { programCount += 1; return allocate() },
    createVertexArray: allocate,
    createBuffer: allocate,
    createTexture: () => failure === 'texture' ? null : allocate(),
    createFramebuffer: allocate,
    bindFramebuffer(target: number, framebuffer: unknown) { boundFramebuffer = framebuffer; record('bindFramebuffer', [target, framebuffer]) },
    checkFramebufferStatus: () => failure === 'framebuffer' ? -1 : constants.FRAMEBUFFER_COMPLETE,
    getShaderParameter: () => !(failure === 'bake-compile' && shaderCount === 6),
    getShaderInfoLog: () => 'test bake compile failure',
    getProgramParameter: () => !(failure === 'bake-link' && programCount === 3),
    getProgramInfoLog: () => 'test bake link failure',
    useProgram(program: WebGLProgram) { activeProgram = program },
    getUniformLocation(program: WebGLProgram, name: string) {
      record('getUniformLocation', [program, name])
      return name === inactiveUniform ? null : { program, name }
    },
    uniform1f(location: Location | null, value: number) { upload('uniform1f', location, value) },
    uniform1i(location: Location | null, value: number) { upload('uniform1i', location, value) },
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
    drawArrays(_mode: number, _first: number, count: number) { draw(boundFramebuffer ? 'material' : 'trail', count) },
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
  if (failure) assert.throws(() => new WebGL2BallRenderer(canvas as unknown as HTMLCanvasElement, compact), /ball material|test bake/)
  else renderer = new WebGL2BallRenderer(canvas as unknown as HTMLCanvasElement, compact)
  function step(now: number) {
    assert.equal(frames.size, 1, 'exactly one animation frame should be scheduled')
    const [id, callback] = [...frames][0]
    frames.delete(id)
    callback(now)
  }
  return { renderer: renderer!, canvas, frames, calls, draws, step, gl: constants }
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
  const normalLookups = calls.filter((call) => call.name === 'getUniformLocation' && call.args[1] === 'uNormalMatrix')
  assert.equal(normalLookups.length, 2, 'one lookup in the flight program and one in the one-time bake program')
  assert.equal(new Set(normalLookups.map((call) => call.args[0])).size, 2, 'null locations are cached per program')
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

test('compact material is baked once, sampled in flight, and freed on disposal', (context) => {
  const { renderer, calls, draws, step, gl } = rendererHarness(context, true)
  const sources = calls.filter((call) => call.name === 'shaderSource').map((call) => call.args[1])
  assert.ok(sources.includes(compactBallFragmentShaderSource))
  assert.ok(sources.includes(materialFragmentShaderSource))
  assert.ok(!sources.includes(ballFragmentShaderSource))
  assert.doesNotMatch(compactBallFragmentShaderSource, /snoise\(|for \(int i/)
  const bake = draws.filter((draw) => draw.kind === 'material')
  assert.equal(bake.length, 1)
  assert.equal(bake[0].count, 3)
  assert.deepEqual(bake[0].uniforms.get('uSeamPoints'), Array.from(generateWebGL2SeamPoints()))
  assert.equal(bake[0].uniforms.get('uNoiseScale'), 2.2)
  assert.equal(bake[0].uniforms.get('uSeed'), 1)
  assert.deepEqual(calls.find((call) => call.name === 'texImage2D')!.args.slice(2, 5), [gl.RGBA8, 512, 256])
  const params = calls.filter((call) => call.name === 'texParameteri').map((call) => call.args.slice(1))
  assert.deepEqual(params, [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.REPEAT], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
  assert.equal(calls.findLast((call) => call.name === 'bindFramebuffer')!.args[1], null)
  assert.equal(calls.filter((call) => call.name === 'deleteFramebuffer').length, 1)
  renderer.startFlight(trajectory)
  const beforeFrames = calls.length
  for (const now of [16, 32, 48]) step(now)
  const uploads = calls.slice(beforeFrames).filter((call) => call.name.startsWith('uniform'))
  assert.deepEqual(uploads.map((call) => call.name), Array.from({ length: 3 }, () => ['uniformMatrix4fv', 'uniformMatrix3fv']).flat())
  for (const ball of draws.filter((draw) => draw.kind === 'ball')) {
    assert.equal(ball.uniforms.get('uMaterial'), 0)
    assert.equal(ball.count, 40 * 28 * 6)
  }
  assert.ok(calls.some((call) => call.name === 'cullFace' && call.args[0] === gl.BACK))
  renderer.cancelFlight()
  renderer.resize()
  renderer.startFlight(trajectory)
  step(16)
  assert.equal(draws.filter((draw) => draw.kind === 'material').length, 1, 'resize and new flights reuse the material')
  renderer.destroy()
  renderer.destroy()
  assert.equal(calls.filter((call) => call.name === 'deleteTexture').length, 1)
  assert.equal(calls.filter((call) => call.name === 'deleteProgram').length, 3)
  assert.equal(calls.filter((call) => call.name === 'deleteBuffer').length, 5)
})

test('slow mobile frames reduce fill rate without changing trajectory, projection, trail size on screen, or completion', (context) => {
  const { renderer, canvas, draws, step, frames } = rendererHarness(context, true)
  let completions = 0
  const progress: number[] = []
  renderer.onComplete = () => { completions += 1 }
  renderer.onProgress = (value) => progress.push(value)
  renderer.startFlight(trajectory, 1000)
  step(10)
  const initialProjection = draws.find((draw) => draw.kind === 'ball')!.uniforms.get('uProjectionMatrix')
  for (const now of [40, 70]) step(now)
  assert.equal(canvas.width, 1000, 'wait for sustained missed frames')
  step(100)
  assert.deepEqual([canvas.width, canvas.height], [800, 600])
  assert.equal(draws.findLast((draw) => draw.kind === 'trail')!.uniforms.get('uPointSize'), 12 * 0.8)
  for (const now of [130, 160, 190]) step(now)
  assert.deepEqual([canvas.width, canvas.height], [600, 450])
  for (const now of [220, 250, 280, 310, 340, 370]) step(now)
  assert.deepEqual([canvas.width, canvas.height], [400, 300], 'quality has a bounded floor')
  const balls = draws.filter((draw) => draw.kind === 'ball')
  balls.forEach((ball, index) => {
    const point = evaluateReferenceTrajectory(trajectory, progress[index])
    assert.deepEqual((ball.uniforms.get('uModelMatrix') as number[]).slice(12, 15), Array.from(new Float32Array([point.x, point.y, point.z])))
    assert.deepEqual(ball.uniforms.get('uProjectionMatrix'), initialProjection)
  })
  step(1000)
  assert.equal(completions, 1)
  assert.equal(progress.at(-1), 1)
  assert.equal(frames.size, 0)
  renderer.startFlight(trajectory)
  assert.equal(canvas.width, 400, 'next flight keeps learned quality')
  canvas.clientWidth = 1
  canvas.clientHeight = 1
  renderer.resize()
  assert.deepEqual([canvas.width, canvas.height], [1, 1], 'tiny viewports never allocate zero-size buffers')
})

test('mobile adaptation ignores idle gaps, isolated stutters and background pauses, and resets sampling on replacement', (context) => {
  const { renderer, canvas, step } = rendererHarness(context, true)
  renderer.startFlight(trajectory, 10000)
  for (const now of [1000, 1016, 1048, 1064, 1080, 1500, 1516]) step(now)
  assert.equal(canvas.width, 1000)
  step(1580) // one severe missed frame, insufficient on its own
  renderer.startFlight(trajectory, 10000)
  step(1700)
  assert.equal(canvas.width, 1000, 'replacement resets the timing window')
  step(1800)
  assert.equal(canvas.width, 1000)
  step(1900)
  assert.equal(canvas.width, 800, 'two severe missed frames lower resolution')
  renderer.cancelFlight()
  renderer.startFlight(trajectory, 10000)
  for (const now of [2500, 2516, 2532, 2548]) step(now)
  assert.equal(canvas.width, 800, 'fast frames do not oscillate quality')
})

test('desktop keeps the procedural material and original resolution during slow frames', (context) => {
  const { renderer, canvas, calls, draws, step } = rendererHarness(context)
  renderer.startFlight(trajectory, 2000)
  for (const now of [100, 200, 300, 400, 500, 600, 700]) step(now)
  assert.deepEqual([canvas.width, canvas.height], [1400, 1050])
  assert.equal(draws.filter((draw) => draw.kind === 'material').length, 0)
  assert.equal(calls.filter((call) => call.name === 'texImage2D').length, 0)
  assert.ok(calls.some((call) => call.name === 'shaderSource' && call.args[1] === ballFragmentShaderSource))
})

for (const failure of ['texture', 'framebuffer', 'bake-compile', 'bake-link'] as const) {
  test(`material ${failure} failure frees allocated resources without scheduling a flight`, (context) => {
    const { calls, frames, draws } = rendererHarness(context, true, 'uSheenIntensity', failure)
    assert.equal(frames.size, 0)
    assert.equal(draws.length, 0)
    assert.equal(calls.filter((call) => call.name === 'deleteFramebuffer').length, 1)
    assert.equal(calls.filter((call) => call.name === 'deleteTexture').length, failure === 'texture' ? 0 : 1)
    assert.equal(calls.filter((call) => call.name === 'deleteBuffer').length, 5)
    assert.equal(calls.filter((call) => call.name === 'deleteVertexArray').length, 2)
    assert.equal(calls.filter((call) => call.name === 'deleteShader').length, failure === 'texture' ? 4 : 6)
    assert.equal(calls.filter((call) => call.name === 'deleteProgram').length, failure === 'texture' || failure === 'bake-compile' ? 2 : 3)
    assert.equal(calls.findLast((call) => call.name === 'bindFramebuffer')!.args[1], null)
  })
}

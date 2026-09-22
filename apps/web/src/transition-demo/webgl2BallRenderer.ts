import { createSphereGeometry } from './webgl2BallGeometry'
import {
  mat3NormalFromMat4,
  mat4Create,
  mat4Identity,
  mat4LookAt,
  mat4Perspective,
  mat4RotateEuler,
  mat4Scale,
  mat4Translate,
  type Vec3,
} from './webgl2BallMath'
import {
  ballFragmentShaderSource,
  ballVertexShaderSource,
  trailFragmentShaderSource,
  trailVertexShaderSource,
} from './webgl2BallShaders'
import { evaluateReferenceTrajectory, type ReferenceTrajectory } from './referenceTrajectories'

const ballConfig = {
  ambient: 0.95,
  baseColor: [0.83, 0.93, 0.13] as Vec3,
  ballSize: 1.1,
  bumpCount: 2,
  cavityDepth: 0,
  contrast: 0.2,
  fiberCurl: 0.35,
  fuzzStrength: 1.2,
  fuzzWrap: 1,
  lightAzimuth: 70,
  lightElevation: 76,
  lightIntensity: 0.9,
  lineWidth: 0.084,
  noiseDetail: 1,
  noiseScale: 2.2,
  normalIntensity: 2,
  rimAzimuth: 200,
  rimColor: [0.91, 1, 0.27] as Vec3,
  rimElevation: 22,
  rimIntensity: 1.6,
  rimSpread: 3.7,
  roughness: 1,
  seamColor: [0.96, 0.96, 0.93] as Vec3,
  seed: 1,
  sheenIntensity: 0,
  smoothing: 0.014,
  specular: 0.35,
  spinMultiplier: 0.2,
  trailIntensity: 1.2,
}

const maxTrailPoints = 48

export function generateWebGL2SeamPoints(count = 48, position = 0.465): Float32Array {
  const points = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const t = (index / count) * Math.PI * 4
    const theta = Math.PI / 2 - (Math.PI / 2 - position) * Math.cos(t)
    const phi = t / 2 + position * Math.sin(2 * t)
    points[index * 3] = Math.sin(theta) * Math.cos(phi)
    points[index * 3 + 1] = Math.sin(theta) * Math.sin(phi)
    points[index * 3 + 2] = Math.cos(theta)
  }
  return points
}

export class WebGL2BallRenderer {
  onComplete?: () => void
  onProgress?: (progress: number) => void

  private activeFlight: { duration: number; startedAt: number; trajectory: ReferenceTrajectory } | null = null
  private animationFrame: number | null = null
  private readonly ballIndexCount: number
  private readonly ballProgram: WebGLProgram
  private readonly ballVAO: WebGLVertexArrayObject
  private readonly buffers: WebGLBuffer[] = []
  private destroyed = false
  private readonly gl: WebGL2RenderingContext
  private readonly modelMatrix = mat4Create()
  private readonly normalMatrix = new Float32Array(9)
  private readonly projectionMatrix = mat4Create()
  private readonly seamPoints = generateWebGL2SeamPoints()
  private readonly trailAlphas = new Float32Array(maxTrailPoints)
  private readonly trailAlphaVBO: WebGLBuffer
  private readonly trailHistory: Vec3[] = []
  private readonly trailPositions = new Float32Array(maxTrailPoints * 3)
  private readonly trailProgram: WebGLProgram
  private readonly trailVAO: WebGLVertexArrayObject
  private readonly trailVBO: WebGLBuffer
  private readonly uniformLocations = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>()
  private readonly viewMatrix = mat4Create()

  constructor(private readonly canvas: HTMLCanvasElement, private readonly compact: boolean) {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: !compact,
      depth: true,
      powerPreference: 'high-performance',
    })
    if (!gl) throw new Error('WebGL2 is unavailable')
    this.gl = gl
    this.ballProgram = this.createProgram(ballVertexShaderSource, ballFragmentShaderSource)
    this.trailProgram = this.createProgram(trailVertexShaderSource, trailFragmentShaderSource)

    const sphere = createSphereGeometry(1, compact ? 40 : 64, compact ? 28 : 48)
    this.ballIndexCount = sphere.indices.length
    this.ballVAO = this.createVAO()
    gl.bindVertexArray(this.ballVAO)
    this.bindAttribute(0, sphere.positions, 3, gl.STATIC_DRAW)
    this.bindAttribute(1, sphere.normals, 3, gl.STATIC_DRAW)
    const indexBuffer = this.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW)

    this.trailVAO = this.createVAO()
    gl.bindVertexArray(this.trailVAO)
    this.trailVBO = this.bindAttribute(0, this.trailPositions, 3, gl.DYNAMIC_DRAW)
    this.trailAlphaVBO = this.bindAttribute(1, this.trailAlphas, 1, gl.DYNAMIC_DRAW)
    gl.bindVertexArray(null)
    mat4LookAt(this.viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0])
    this.initializeUniforms()
    this.resize()
    this.clear()
  }

  startFlight(trajectory: ReferenceTrajectory, duration = 980) {
    if (this.destroyed) return
    this.activeFlight = { duration, startedAt: performance.now(), trajectory }
    this.trailHistory.length = 0
    this.resize()
    if (this.animationFrame === null) this.animationFrame = requestAnimationFrame(this.tick)
  }

  cancelFlight() {
    this.activeFlight = null
    this.trailHistory.length = 0
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
    this.clear()
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth || window.innerWidth)
    const height = Math.max(1, this.canvas.clientHeight || window.innerHeight)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, this.compact ? 1.25 : 1.75)
    const renderWidth = Math.floor(width * pixelRatio)
    const renderHeight = Math.floor(height * pixelRatio)
    if (this.canvas.width !== renderWidth || this.canvas.height !== renderHeight) {
      this.canvas.width = renderWidth
      this.canvas.height = renderHeight
    }
    this.gl.viewport(0, 0, renderWidth, renderHeight)
    mat4Perspective(this.projectionMatrix, Math.PI / 4, renderWidth / renderHeight, 0.1, 100)
    for (const program of [this.ballProgram, this.trailProgram]) {
      this.gl.useProgram(program)
      this.uniformMatrix4(program, 'uProjectionMatrix', this.projectionMatrix)
    }
  }

  destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.cancelFlight()
    const gl = this.gl
    this.buffers.forEach((buffer) => gl.deleteBuffer(buffer))
    gl.deleteVertexArray(this.ballVAO)
    gl.deleteVertexArray(this.trailVAO)
    gl.deleteProgram(this.ballProgram)
    gl.deleteProgram(this.trailProgram)
    this.uniformLocations.clear()
  }

  private readonly tick = (now: number) => {
    this.animationFrame = null
    const flight = this.activeFlight
    if (!flight || this.destroyed) return
    const progress = Math.min(1, (now - flight.startedAt) / flight.duration)
    if (progress >= 1) {
      this.activeFlight = null
      this.trailHistory.length = 0
      this.clear()
      this.onProgress?.(1)
      this.onComplete?.()
      return
    }
    this.renderFlight(flight.trajectory, progress)
    this.onProgress?.(progress)
    this.animationFrame = requestAnimationFrame(this.tick)
  }

  private renderFlight(trajectory: ReferenceTrajectory, progress: number) {
    const gl = this.gl
    const point = evaluateReferenceTrajectory(trajectory, progress)
    const position: Vec3 = [point.x, point.y, point.z]
    this.trailHistory.unshift(position)
    if (this.trailHistory.length > maxTrailPoints) this.trailHistory.pop()

    this.clear()
    this.renderTrail()
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    mat4Identity(this.modelMatrix)
    mat4Translate(this.modelMatrix, this.modelMatrix, position)
    const spin = trajectory.spinVector
    const angle = progress * Math.PI * spin.speed * ballConfig.spinMultiplier
    mat4RotateEuler(this.modelMatrix, this.modelMatrix, spin.x * angle, spin.y * angle, spin.z * angle)
    mat4Scale(this.modelMatrix, this.modelMatrix, [ballConfig.ballSize, ballConfig.ballSize, ballConfig.ballSize])
    mat3NormalFromMat4(this.normalMatrix, this.modelMatrix)

    gl.useProgram(this.ballProgram)
    gl.bindVertexArray(this.ballVAO)
    this.uniformMatrix4(this.ballProgram, 'uModelMatrix', this.modelMatrix)
    gl.uniformMatrix3fv(this.uniformLocation(this.ballProgram, 'uNormalMatrix'), false, this.normalMatrix)
    gl.drawElements(gl.TRIANGLES, this.ballIndexCount, gl.UNSIGNED_SHORT, 0)
  }

  private initializeUniforms() {
    const gl = this.gl
    gl.useProgram(this.ballProgram)
    this.uniformLocation(this.ballProgram, 'uModelMatrix')
    this.uniformLocation(this.ballProgram, 'uNormalMatrix')
    this.uniformMatrix4(this.ballProgram, 'uViewMatrix', this.viewMatrix)
    this.uniform1(this.ballProgram, 'uNoiseScale', ballConfig.noiseScale)
    this.uniform1(this.ballProgram, 'uNoiseDetail', ballConfig.noiseDetail)
    this.uniform1(this.ballProgram, 'uFuzzStrength', ballConfig.fuzzStrength)
    this.uniform1(this.ballProgram, 'uBumpCount', ballConfig.bumpCount)
    this.uniform1(this.ballProgram, 'uFiberCurl', ballConfig.fiberCurl)
    this.uniform1(this.ballProgram, 'uCavityDepth', ballConfig.cavityDepth)
    this.uniform1(this.ballProgram, 'uSeed', ballConfig.seed)
    this.uniform1(this.ballProgram, 'uLineWidth', ballConfig.lineWidth)
    this.uniform1(this.ballProgram, 'uContrast', ballConfig.contrast)
    this.uniform1(this.ballProgram, 'uSmoothing', ballConfig.smoothing)
    gl.uniform3fv(this.uniformLocation(this.ballProgram, 'uSeamPoints'), this.seamPoints)
    this.uniform3(this.ballProgram, 'uBaseColor', ballConfig.baseColor)
    this.uniform3(this.ballProgram, 'uRimColor', ballConfig.rimColor)
    this.uniform3(this.ballProgram, 'uSeamColor', ballConfig.seamColor)
    this.uniform1(this.ballProgram, 'uRoughness', ballConfig.roughness)
    this.uniform1(this.ballProgram, 'uSpecularIntensity', ballConfig.specular)
    this.uniform1(this.ballProgram, 'uNormalIntensity', ballConfig.normalIntensity)
    this.uniform1(this.ballProgram, 'uFuzzWrap', ballConfig.fuzzWrap)
    this.uniform1(this.ballProgram, 'uSheenIntensity', ballConfig.sheenIntensity)
    this.uniformLighting()

    gl.useProgram(this.trailProgram)
    this.uniformMatrix4(this.trailProgram, 'uViewMatrix', this.viewMatrix)
    this.uniform3(this.trailProgram, 'uTrailColor', ballConfig.rimColor)
    this.uniform1(this.trailProgram, 'uTrailIntensity', ballConfig.trailIntensity)
    this.uniform1(this.trailProgram, 'uPointSize', this.compact ? 12 : 16)
  }

  private renderTrail() {
    if (this.trailHistory.length < 2) return
    const gl = this.gl
    for (let index = 0; index < maxTrailPoints; index += 1) {
      if (index < this.trailHistory.length) {
        const point = this.trailHistory[index]
        const spread = index * 0.018
        this.trailPositions[index * 3] = point[0] + Math.sin(index * 1.5) * spread
        this.trailPositions[index * 3 + 1] = point[1] + Math.cos(index * 1.5) * spread
        this.trailPositions[index * 3 + 2] = point[2] - spread * 0.5
        this.trailAlphas[index] = Math.pow(1 - index / this.trailHistory.length, 1.3)
      } else {
        this.trailPositions[index * 3 + 2] = -999
        this.trailAlphas[index] = 0
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trailVBO)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.trailPositions)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trailAlphaVBO)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.trailAlphas)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(false)
    gl.useProgram(this.trailProgram)
    gl.bindVertexArray(this.trailVAO)
    gl.drawArrays(gl.POINTS, 0, this.trailHistory.length)
    gl.depthMask(true)
    gl.disable(gl.BLEND)
  }

  private uniformLighting() {
    const keyAzimuth = ballConfig.lightAzimuth * Math.PI / 180
    const keyElevation = ballConfig.lightElevation * Math.PI / 180
    const rimAzimuth = ballConfig.rimAzimuth * Math.PI / 180
    const rimElevation = ballConfig.rimElevation * Math.PI / 180
    const key: Vec3 = [Math.cos(keyElevation) * Math.sin(keyAzimuth), Math.sin(keyElevation), Math.cos(keyElevation) * Math.cos(keyAzimuth)]
    const rim: Vec3 = [Math.cos(rimElevation) * Math.sin(rimAzimuth), Math.sin(rimElevation), Math.cos(rimElevation) * Math.cos(rimAzimuth)]
    this.uniform3(this.ballProgram, 'uLightDir', key)
    this.uniform1(this.ballProgram, 'uLightIntensity', ballConfig.lightIntensity)
    this.uniform3(this.ballProgram, 'uRimLightDir', rim)
    this.uniform1(this.ballProgram, 'uRimIntensity', ballConfig.rimIntensity)
    this.uniform1(this.ballProgram, 'uRimSpread', ballConfig.rimSpread)
    this.uniform1(this.ballProgram, 'uAmbientIntensity', ballConfig.ambient)
  }

  private clear() {
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  private createShader(type: number, source: string) {
    const shader = this.gl.createShader(type)
    if (!shader) throw new Error('Unable to allocate a WebGL2 shader')
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const message = this.gl.getShaderInfoLog(shader) ?? 'Unknown shader compilation error'
      this.gl.deleteShader(shader)
      throw new Error(message)
    }
    return shader
  }

  private createProgram(vertexSource: string, fragmentSource: string) {
    const vertex = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragment = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)
    const program = this.gl.createProgram()
    if (!program) throw new Error('Unable to allocate a WebGL2 program')
    this.gl.attachShader(program, vertex)
    this.gl.attachShader(program, fragment)
    this.gl.linkProgram(program)
    this.gl.deleteShader(vertex)
    this.gl.deleteShader(fragment)
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const message = this.gl.getProgramInfoLog(program) ?? 'Unknown WebGL2 program link error'
      this.gl.deleteProgram(program)
      throw new Error(message)
    }
    return program
  }

  private createVAO() {
    const vao = this.gl.createVertexArray()
    if (!vao) throw new Error('Unable to allocate a WebGL2 vertex array')
    return vao
  }

  private createBuffer() {
    const buffer = this.gl.createBuffer()
    if (!buffer) throw new Error('Unable to allocate a WebGL2 buffer')
    this.buffers.push(buffer)
    return buffer
  }

  private bindAttribute(location: number, data: Float32Array, size: number, usage: number) {
    const buffer = this.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data as Float32Array<ArrayBuffer>, usage)
    this.gl.enableVertexAttribArray(location)
    this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0)
    return buffer
  }

  private uniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation | null {
    let locations = this.uniformLocations.get(program)
    if (!locations) {
      locations = new Map()
      this.uniformLocations.set(program, locations)
    }
    // Null is a valid cached result for uniforms removed by the shader compiler.
    if (!locations.has(name)) locations.set(name, this.gl.getUniformLocation(program, name))
    return locations.get(name) ?? null
  }

  private uniform1(program: WebGLProgram, name: string, value: number) {
    this.gl.uniform1f(this.uniformLocation(program, name), value)
  }

  private uniform3(program: WebGLProgram, name: string, value: Vec3) {
    this.gl.uniform3fv(this.uniformLocation(program, name), value)
  }

  private uniformMatrix4(program: WebGLProgram, name: string, value: Float32Array) {
    this.gl.uniformMatrix4fv(this.uniformLocation(program, name), false, value)
  }
}

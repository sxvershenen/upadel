import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

import { createTennisBallTextures, TENNIS_STYLES } from './referenceTennisTexture'
import { evaluateReferenceTrajectory, type ReferenceTrajectory } from './referenceTrajectories'

export interface ReferenceBallSceneHandle {
  startFlight: (trajectory: ReferenceTrajectory, duration: number) => void
  cancel: () => void
}

interface ActiveFlight {
  trajectory: ReferenceTrajectory
  startedAt: number
  duration: number
}

export const ReferenceBallScene = forwardRef<ReferenceBallSceneHandle>(function ReferenceBallScene(_props, ref) {
  const mountRef = useRef<HTMLDivElement>(null)
  const ballGroupRef = useRef<THREE.Group | null>(null)
  const ballMeshRef = useRef<THREE.Mesh | null>(null)
  const fuzzShellRef = useRef<THREE.Mesh | null>(null)
  const trailRef = useRef<THREE.Points | null>(null)
  const activeFlightRef = useRef<ActiveFlight | null>(null)
  const historyRef = useRef<THREE.Vector3[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const renderRef = useRef<(() => void) | null>(null)
  const tickRef = useRef<(() => void) | null>(null)

  useImperativeHandle(ref, () => ({
    startFlight: (trajectory, duration) => {
      activeFlightRef.current = { trajectory, duration, startedAt: performance.now() }
      if (mountRef.current) mountRef.current.dataset.flightActive = 'true'
      if (animationFrameRef.current === null) animationFrameRef.current = window.requestAnimationFrame(() => tickRef.current?.())
    },
    cancel: () => {
      activeFlightRef.current = null
      historyRef.current = []
      if (ballGroupRef.current) ballGroupRef.current.visible = false
      if (trailRef.current) trailRef.current.visible = false
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
      if (mountRef.current) {
        delete mountRef.current.dataset.flightActive
        delete mountRef.current.dataset.flightProgress
      }
      renderRef.current?.()
    },
  }), [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    const compact = window.matchMedia('(max-width: 767px), (max-height: 560px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
    const trailCount = compact ? 24 : 48
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 5)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !compact, powerPreference: 'high-performance' })
    } catch {
      // Page navigation must remain available when WebGL is unavailable or denied.
      return
    }
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.domElement.style.pointerEvents = 'none'
    container.appendChild(renderer.domElement)

    const ballGroup = new THREE.Group()
    ballGroup.position.set(0, 0, -99)
    ballGroup.visible = false
    scene.add(ballGroup)
    ballGroupRef.current = ballGroup

    scene.add(new THREE.AmbientLight(0xffffff, 0.95))
    const keyLight = new THREE.DirectionalLight(0xfffae8, 3.2)
    keyLight.position.set(5, 7, 6)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xddff33, 2.8)
    rimLight.position.set(-6, -4, -3)
    scene.add(rimLight)
    const bounceLight = new THREE.DirectionalLight(0xd97736, 0.9)
    bounceLight.position.set(0, -6, 2)
    scene.add(bounceLight)
    const fillLight = new THREE.DirectionalLight(0x70d6ff, 0.8)
    fillLight.position.set(-4, 6, 2)
    scene.add(fillLight)

    const style = TENNIS_STYLES.wimbledon
    const geom = new THREE.SphereGeometry(1, compact ? 40 : 72, compact ? 28 : 48)
    const { diffuseMap, bumpMap, roughnessMap } = createTennisBallTextures(style, compact
      ? { width: 256, height: 128, seamPoints: 180 }
      : { width: 512, height: 256, seamPoints: 360 })
    const mat = new THREE.MeshPhysicalMaterial({
      map: diffuseMap,
      bumpMap,
      bumpScale: 0.038,
      roughnessMap,
      roughness: 0.86,
      metalness: 0.02,
      sheen: 1,
      sheenColor: new THREE.Color(style.rimColor),
      sheenRoughness: 0.65,
      clearcoat: 0,
    })
    const ballMesh = new THREE.Mesh(geom, mat)
    ballGroup.add(ballMesh)
    ballMeshRef.current = ballMesh

    const fuzzGeom = new THREE.SphereGeometry(1.025, compact ? 24 : 40, compact ? 18 : 28)
    const fuzzMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(style.rimColor) }, uIntensity: { value: 0.65 } },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec3 vViewDir;',
        'void main() {',
        '  vNormal = normalize(normalMatrix * normal);',
        '  vec4 worldPos = modelViewMatrix * vec4(position, 1.0);',
        '  vViewDir = normalize(-worldPos.xyz);',
        '  gl_Position = projectionMatrix * worldPos;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uIntensity;',
        'varying vec3 vNormal;',
        'varying vec3 vViewDir;',
        'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }',
        'void main() {',
        '  float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));',
        '  float fuzzNoise = hash(gl_FragCoord.xy * 0.35);',
        '  float alpha = pow(rim, 2.6) * uIntensity * (0.65 + fuzzNoise * 0.45);',
        '  gl_FragColor = vec4(uColor, alpha);',
        '}',
      ].join('\n'),
    })
    const fuzzShell = new THREE.Mesh(fuzzGeom, fuzzMat)
    ballGroup.add(fuzzShell)
    fuzzShellRef.current = fuzzShell

    const trailPositions = new Float32Array(trailCount * 3)
    for (let index = 0; index < trailCount; index += 1) trailPositions[index * 3 + 2] = -999
    const trailGeom = new THREE.BufferGeometry()
    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3).setUsage(THREE.DynamicDrawUsage))
    const trailMat = new THREE.PointsMaterial({
      color: new THREE.Color(style.rimColor),
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const trailPoints = new THREE.Points(trailGeom, trailMat)
    trailPoints.visible = false
    scene.add(trailPoints)
    trailRef.current = trailPoints

    const render = () => renderer.render(scene, camera)
    renderRef.current = render
    const animate = () => {
      animationFrameRef.current = null
      const now = performance.now()
      const activeFlight = activeFlightRef.current

      if (activeFlight && ballMeshRef.current) {
        const progress = (now - activeFlight.startedAt) / activeFlight.duration
        if (progress >= 1) {
          activeFlightRef.current = null
          historyRef.current = []
          ballGroup.visible = false
          trailPoints.visible = false
          delete container.dataset.flightActive
          delete container.dataset.flightProgress
        } else {
          container.dataset.flightProgress = progress.toFixed(3)
          ballGroup.visible = true
          trailPoints.visible = true
          const position = evaluateReferenceTrajectory(activeFlight.trajectory, progress)
          ballGroup.position.set(position.x, position.y, position.z)
          const spin = activeFlight.trajectory.spinVector
          const angle = progress * Math.PI * spin.speed
          ballMeshRef.current.rotation.set(spin.x * angle, spin.y * angle, spin.z * angle)
          fuzzShell.rotation.copy(ballMeshRef.current.rotation)

          const historyPoint = historyRef.current.length >= trailCount
            ? historyRef.current.pop()!
            : new THREE.Vector3()
          historyPoint.set(position.x, position.y, position.z)
          historyRef.current.unshift(historyPoint)
          for (let index = 0; index < trailCount; index += 1) {
            if (index < historyRef.current.length) {
              const point = historyRef.current[index]
              const spread = index * 0.015
              trailPositions[index * 3] = point.x + Math.sin(index * 1.5) * spread
              trailPositions[index * 3 + 1] = point.y + Math.cos(index * 1.5) * spread
              trailPositions[index * 3 + 2] = point.z - spread * 0.5
            } else {
              trailPositions[index * 3 + 2] = -999
            }
          }
          trailGeom.attributes.position.needsUpdate = true
        }
      }

      render()
      if (activeFlightRef.current) animationFrameRef.current = window.requestAnimationFrame(animate)
    }
    tickRef.current = animate
    if (activeFlightRef.current && animationFrameRef.current === null) animationFrameRef.current = window.requestAnimationFrame(animate)

    const handleResize = () => {
      const nextWidth = Math.max(1, container.clientWidth)
      const nextHeight = Math.max(1, container.clientHeight)
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
      tickRef.current = null
      renderRef.current = null
      activeFlightRef.current = null
      ballGroupRef.current = null
      ballMeshRef.current = null
      fuzzShellRef.current = null
      trailRef.current = null
      renderer.dispose()
      diffuseMap.dispose()
      bumpMap.dispose()
      roughnessMap.dispose()
      geom.dispose()
      mat.dispose()
      fuzzGeom.dispose()
      fuzzMat.dispose()
      trailGeom.dispose()
      trailMat.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="transition-demo-reference-ball" aria-hidden="true" />
})

ReferenceBallScene.displayName = 'ReferenceBallScene'

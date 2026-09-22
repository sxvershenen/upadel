import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import type { ReferenceTrajectory } from './referenceTrajectories'
import { WebGL2BallRenderer } from './webgl2BallRenderer'

export interface ReferenceBallSceneHandle {
  startFlight: (trajectory: ReferenceTrajectory, duration: number) => void
  cancel: () => void
}

export const ReferenceBallScene = forwardRef<ReferenceBallSceneHandle>(function ReferenceBallScene(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<WebGL2BallRenderer | null>(null)

  useImperativeHandle(ref, () => ({
    startFlight: (trajectory, duration) => {
      const renderer = rendererRef.current
      if (!renderer) return
      renderer.startFlight(trajectory, duration)
      if (mountRef.current) mountRef.current.dataset.flightActive = 'true'
    },
    cancel: () => {
      rendererRef.current?.cancelFlight()
      if (mountRef.current) {
        delete mountRef.current.dataset.flightActive
        delete mountRef.current.dataset.flightProgress
      }
    },
  }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const mount = mountRef.current
    if (!canvas || !mount) return
    const compact = window.matchMedia('(max-width: 767px), (max-height: 560px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
    let renderer: WebGL2BallRenderer
    try {
      renderer = new WebGL2BallRenderer(canvas, compact)
    } catch {
      // Navigation remains fully functional when WebGL2 is unavailable or denied.
      mount.dataset.webgl2Unavailable = 'true'
      return
    }
    rendererRef.current = renderer
    renderer.onProgress = (progress) => { mount.dataset.flightProgress = progress.toFixed(3) }
    renderer.onComplete = () => {
      delete mount.dataset.flightActive
      delete mount.dataset.flightProgress
    }
    const handleResize = () => renderer.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.destroy()
      rendererRef.current = null
      delete mount.dataset.flightActive
      delete mount.dataset.flightProgress
    }
  }, [])

  return <div ref={mountRef} className="transition-demo-reference-ball" aria-hidden="true"><canvas ref={canvasRef} /></div>
})

ReferenceBallScene.displayName = 'ReferenceBallScene'

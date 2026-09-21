export interface ReferencePoint {
  x: number
  y: number
  z: number
}

export interface ReferenceTrajectory {
  preset: string
  start: ReferencePoint
  peak: ReferencePoint
  end: ReferencePoint
  control: ReferencePoint
  spinVector: { x: number; y: number; z: number; speed: number }
}

const presets = [
  'crosscourt_tl_br',
  'crosscourt_bl_tr',
  'crosscourt_tr_bl',
  'crosscourt_br_tl',
  'direct_smash',
  'magnus_slice',
  'court_bounce',
] as const

function computeDesktopReferenceTrajectory(): ReferenceTrajectory {
  const preset = presets[Math.floor(Math.random() * presets.length)]
  const jitterX = (Math.random() - 0.5) * 1.5
  const jitterY = (Math.random() - 0.5) * 1

  switch (preset) {
    case 'crosscourt_tl_br':
      return {
        preset,
        start: { x: -14 + jitterX, y: 8 + jitterY, z: -20 },
        peak: { x: 0.5, y: -0.2, z: 2.8 },
        control: { x: -3, y: 4, z: -6 },
        end: { x: 16 + jitterX, y: -9 + jitterY, z: 4.5 },
        spinVector: { x: 1.2, y: 0.8, z: 0.5, speed: 28 },
      }
    case 'crosscourt_bl_tr':
      return {
        preset,
        start: { x: -15 + jitterX, y: -8 + jitterY, z: -22 },
        peak: { x: -0.2, y: 0.6, z: 2.9 },
        control: { x: -4, y: -2, z: -7 },
        end: { x: 15 + jitterX, y: 9 + jitterY, z: 4.2 },
        spinVector: { x: -1, y: 1.2, z: -0.4, speed: 32 },
      }
    case 'crosscourt_tr_bl':
      return {
        preset,
        start: { x: 14 + jitterX, y: 8 + jitterY, z: -20 },
        peak: { x: -0.8, y: -0.4, z: 3.1 },
        control: { x: 4, y: 3, z: -5 },
        end: { x: -16 + jitterX, y: -9 + jitterY, z: 4 },
        spinVector: { x: 0.9, y: -1.1, z: 0.8, speed: 25 },
      }
    case 'crosscourt_br_tl':
      return {
        preset,
        start: { x: 15 + jitterX, y: -8 + jitterY, z: -21 },
        peak: { x: 0.2, y: 0.5, z: 2.7 },
        control: { x: 5, y: -1, z: -8 },
        end: { x: -15 + jitterX, y: 8 + jitterY, z: 4.5 },
        spinVector: { x: -1.4, y: -0.6, z: 0.7, speed: 30 },
      }
    case 'direct_smash':
      return {
        preset,
        start: { x: jitterX * 0.5, y: 1.5 + jitterY * 0.5, z: -28 },
        peak: { x: jitterX * 0.3, y: jitterY * 0.3, z: 3.5 },
        control: { x: 0, y: 2, z: -10 },
        end: { x: Math.random() > 0.5 ? 12 : -12, y: Math.random() > 0.5 ? 8 : -8, z: 6 },
        spinVector: { x: 2.5, y: 0.1, z: 0.2, speed: 45 },
      }
    case 'magnus_slice':
      return {
        preset,
        start: { x: -16 + jitterX, y: 2 + jitterY, z: -18 },
        peak: { x: 2, y: -0.5, z: 2.8 },
        control: { x: 8, y: 6, z: -5 },
        end: { x: 15 + jitterX, y: -7 + jitterY, z: 5 },
        spinVector: { x: 0.2, y: 2.5, z: -1.2, speed: 35 },
      }
    case 'court_bounce':
    default:
      return {
        preset,
        start: { x: -14 + jitterX, y: 9 + jitterY, z: -22 },
        peak: { x: -1.5, y: -2.5, z: 2.4 },
        control: { x: -6, y: -6, z: -8 },
        end: { x: 14 + jitterX, y: 7 + jitterY, z: 4.8 },
        spinVector: { x: 1.8, y: 0.5, z: 1, speed: 38 },
      }
  }
}

function rotatePointForPortrait(point: ReferencePoint): ReferencePoint {
  return { x: point.y * 0.48, y: -point.x * 0.72, z: point.z }
}

export function adaptReferenceTrajectory(trajectory: ReferenceTrajectory, portrait: boolean): ReferenceTrajectory {
  if (!portrait) return trajectory
  return {
    ...trajectory,
    preset: `${trajectory.preset}_portrait`,
    start: rotatePointForPortrait(trajectory.start),
    peak: rotatePointForPortrait(trajectory.peak),
    control: rotatePointForPortrait(trajectory.control),
    end: rotatePointForPortrait(trajectory.end),
    spinVector: {
      ...trajectory.spinVector,
      x: trajectory.spinVector.y,
      y: -trajectory.spinVector.x,
    },
  }
}

export function computeReferenceTrajectory(options: { portrait?: boolean } = {}): ReferenceTrajectory {
  return adaptReferenceTrajectory(computeDesktopReferenceTrajectory(), options.portrait === true)
}

export function evaluateReferenceTrajectory(traj: ReferenceTrajectory, progress: number): ReferencePoint {
  const t = Math.max(0, Math.min(1, progress))
  const s = traj.start
  const p = traj.peak
  const e = traj.end

  if (t <= 0.5) {
    const localT = t / 0.5
    const inverse = 1 - localT
    return {
      x: inverse * inverse * s.x + 2 * inverse * localT * traj.control.x + localT * localT * p.x,
      y: inverse * inverse * s.y + 2 * inverse * localT * traj.control.y + localT * localT * p.y,
      z: inverse * inverse * s.z + 2 * inverse * localT * traj.control.z + localT * localT * p.z,
    }
  }

  const localT = (t - 0.5) / 0.5
  const inverse = 1 - localT
  const controlX = p.x + (p.x - traj.control.x) * 0.6
  const controlY = p.y + (p.y - traj.control.y) * 0.6
  const controlZ = p.z + 1.2
  return {
    x: inverse * inverse * p.x + 2 * inverse * localT * controlX + localT * localT * e.x,
    y: inverse * inverse * p.y + 2 * inverse * localT * controlY + localT * localT * e.y,
    z: inverse * inverse * p.z + 2 * inverse * localT * controlZ + localT * localT * e.z,
  }
}

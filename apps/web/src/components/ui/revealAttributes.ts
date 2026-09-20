import type { CSSProperties } from 'react'
import type { MotionStyle } from 'framer-motion'

export type RevealConfig = boolean | { delay?: number; y?: number; fade?: boolean }
type RevealStyle = CSSProperties | MotionStyle

type RevealAttributeResult<T> = {
  'data-gsap-reveal'?: string
  'data-gsap-reveal-boundary'?: string
  'data-gsap-reveal-delay-explicit'?: string
  'data-gsap-reveal-fade'?: string
  'data-gsap-reveal-y'?: number
  style?: T
}

export function revealAttributes(reveal: RevealConfig | undefined, style?: CSSProperties, boundary?: boolean): RevealAttributeResult<CSSProperties>
export function revealAttributes(reveal: RevealConfig | undefined, style?: MotionStyle, boundary?: boolean): RevealAttributeResult<MotionStyle>
export function revealAttributes(reveal: RevealConfig | undefined, style?: RevealStyle, boundary = false): RevealAttributeResult<CSSProperties> | RevealAttributeResult<MotionStyle> {
  if (reveal !== true && typeof reveal !== 'object') return { style }
  const settings = typeof reveal === 'object' ? reveal : {}
  return {
    'data-gsap-reveal': 'true',
    'data-gsap-reveal-boundary': boundary ? 'true' : undefined,
    'data-gsap-reveal-delay-explicit': typeof reveal === 'object' && settings.delay !== undefined ? 'true' : undefined,
    'data-gsap-reveal-fade': settings.fade === false ? 'false' : undefined,
    'data-gsap-reveal-y': settings.y ?? 24,
    style: {
      ...style,
      '--gsap-reveal-delay': `${settings.delay ?? 0}s`,
      '--gsap-reveal-y': `${settings.y ?? 24}px`,
    } as unknown as typeof style,
  }
}

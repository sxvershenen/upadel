import type { CSSProperties } from 'react'

export function splitPhoneSuffix(display: string) {
  const digits = Array.from(display).flatMap((char, index) => /\d/.test(char) ? [index] : [])
  const split = digits[Math.max(0, digits.length - 4)] ?? display.length
  return { prefix: display.slice(0, split), suffix: display.slice(split) }
}

/** Same pixel pattern as the approved playground; the suffix stays hidden in SSR. */
export function PixelPhoneNumber({ display, revealed }: { display: string; revealed: boolean }) {
  const { prefix, suffix } = splitPhoneSuffix(display)
  return <span className="pixel-phone-number" aria-hidden="true">{prefix}<span className="pixel-phone-number__suffix">
    <span hidden={!revealed} className="pixel-phone-number__digits">{suffix}</span>
    <span hidden={revealed} className="pixel-phone-number__art">{Array.from({ length: 30 }, (_, i) => <i key={i} style={{
      '--x': `${4 + (i % 8) * 12 + ((i * 7) % 4)}%`,
      '--y': `${7 + Math.floor(i / 8) * 23}%`,
      '--alpha': .22 + ((i * 11) % 7) * .1,
    } as CSSProperties} />)}</span>
  </span></span>
}

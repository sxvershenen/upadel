import type { SVGProps } from 'react'

type ContactIconProps = SVGProps<SVGSVGElement> & { size?: number }

export function TelegramIcon({ size = 16, ...props }: ContactIconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M21.7 3.3 18.5 20c-.2 1.1-.8 1.4-1.7.9l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.7-7.9c.4-.4-.1-.6-.6-.2L6.5 14.1l-4.6-1.4c-1-.3-1-1 .2-1.5L20.2 3c.8-.3 1.6.1 1.5.3Z" /></svg>
}

export function PhoneIcon({ size = 16, ...props }: ContactIconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M6.3 2.6c.7-.4 1.6-.1 2 .6l2.1 3.9c.3.6.2 1.3-.3 1.7l-1.7 1.4c1.2 2.6 3.3 4.7 5.9 5.9l1.4-1.7c.4-.5 1.1-.6 1.7-.3l3.9 2.1c.7.4 1 1.3.6 2l-1 1.9c-.4.8-1.3 1.3-2.2 1.2C10.9 21.1 2.9 13.1 1.8 5.5c-.1-.9.4-1.8 1.2-2.2l1.9-1c.4-.2 1-.1 1.4.3Z" /></svg>
}

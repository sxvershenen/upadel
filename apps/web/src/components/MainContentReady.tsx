import { useEffect, useRef } from 'react'

export function MainContentReady() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const surface = ref.current?.closest<HTMLElement>('#swup')
    if (!surface?.isConnected) return

    surface.dataset.mainReady = 'true'
    document.dispatchEvent(new Event('unlim:main-ready'))
  }, [])

  return <span ref={ref} hidden aria-hidden="true" />
}

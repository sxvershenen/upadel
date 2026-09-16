import { useEffect, useRef, useState, type RefObject } from 'react'

export function isAdminFieldVisible({ display, hasLayout, visibility }: { display: string; hasLayout: boolean; visibility: string }): boolean {
  return hasLayout && display !== 'none' && visibility !== 'hidden'
}

export function useAdminFieldVisibility<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let frame: number | null = null
    const update = () => {
      frame = null
      const style = window.getComputedStyle(node)
      const next = isAdminFieldVisible({ display: style.display, hasLayout: node.getClientRects().length > 0, visibility: style.visibility })
      setVisible((current) => current === next ? current : next)
    }
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update)
    }
    const tabsField = node.closest('.tabs-field') ?? node.parentElement ?? document.body
    const mutations = new MutationObserver(schedule)
    mutations.observe(tabsField, { attributes: true, attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'], childList: true, subtree: true })
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    resize?.observe(node)
    update()

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      mutations.disconnect()
      resize?.disconnect()
    }
  }, [])

  return [ref, visible]
}

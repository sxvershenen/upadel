import assert from 'node:assert/strict'
import test from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Window } from 'happy-dom'

import { useMobileSwipeHint } from './useMobileSwipeHint'
import type { Swiper as SwiperType } from 'swiper'

test('swipe hint completes after a touch and only clears when its animation ends', async () => {
  const browserWindow = new Window()
  Object.defineProperty(browserWindow, 'matchMedia', {
    value: (query: string) => ({ matches: query.includes('max-width'), media: query }),
  })
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    IntersectionObserver: globalThis.IntersectionObserver,
    IS_REACT_ACT_ENVIRONMENT: (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT,
  }
  let show = () => {}

  class VisibilityObserver {
    constructor(callback: IntersectionObserverCallback) {
      show = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    observe() {}
    disconnect() {}
  }

  Object.assign(globalThis, {
    window: browserWindow,
    document: browserWindow.document,
    IntersectionObserver: VisibilityObserver,
    IS_REACT_ACT_ENVIRONMENT: true,
  })

  const swiperRef = { current: { initialized: true, slides: [{}, {}] } as SwiperType }
  function Fixture() {
    const ref = useMobileSwipeHint(swiperRef, 'test-hint')
    return <div ref={ref}><div className="swiper"><div className="swiper-wrapper"><div className="swiper-slide">Card</div></div></div></div>
  }

  const mount = browserWindow.document.createElement('div')
  browserWindow.document.body.append(mount)
  const root = createRoot(mount as unknown as Element)
  try {
    await act(async () => root.render(<Fixture />))
    const container = mount.firstElementChild as unknown as HTMLElement
    const wrapper = container.querySelector('.swiper-wrapper') as HTMLElement
    const card = container.querySelector('.swiper-slide') as HTMLElement

    show()
    assert.equal(container.classList.contains('swiper-hint-playing'), true)
    card.dispatchEvent(new browserWindow.Event('pointerdown', { bubbles: true }) as unknown as Event)
    assert.equal(container.classList.contains('swiper-hint-playing'), true)

    const unrelatedEnd = new browserWindow.Event('animationend', { bubbles: true })
    Object.defineProperty(unrelatedEnd, 'animationName', { value: 'other-animation' })
    wrapper.dispatchEvent(unrelatedEnd as unknown as Event)
    assert.equal(container.classList.contains('swiper-hint-playing'), true)

    const hintEnd = new browserWindow.Event('animationend', { bubbles: true })
    Object.defineProperty(hintEnd, 'animationName', { value: 'swiper-swipe-hint' })
    wrapper.dispatchEvent(hintEnd as unknown as Event)
    assert.equal(container.classList.contains('swiper-hint-playing'), false)
    show()
    assert.equal(container.classList.contains('swiper-hint-playing'), false)
  } finally {
    await act(async () => root.unmount())
    browserWindow.close()
    Object.assign(globalThis, previous)
  }
})

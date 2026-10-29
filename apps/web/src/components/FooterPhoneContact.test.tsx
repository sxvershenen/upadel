import assert from 'node:assert/strict'
import test from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
import { FooterPhoneContact } from './FooterPhoneContact'
import { splitPhoneSuffix } from './ui/PixelPhoneNumber'
import { initializeMetricaGoals, trackDesktopPhoneClick } from '../analytics/metrica'
import { ANALYTICS_CONSENT_KEY } from '../analytics/identity'

const props = { label: 'Телефон', display: '+7 985 835-00-55', value: '+79858350055', onContact: () => {} }
test('SSR masks exactly four trailing digits and retains an ordinary mobile contact link', () => {
  assert.deepEqual(splitPhoneSuffix(props.display), { prefix: '+7 985 835-', suffix: '00-55' })
  assert.deepEqual(splitPhoneSuffix('+44 (20) 1234 5678'), { prefix: '+44 (20) 1234 ', suffix: '5678' })
  const html = renderToStaticMarkup(<FooterPhoneContact {...props} />)
  assert.match(html, /<button[^>]*aria-expanded="false"/)
  assert.match(html, /<span hidden="" class="pixel-phone-number__digits">00-55/)
  assert.match(html, /href="tel:\+79858350055"[^>]*data-contact-confirmed/)
  assert.equal((html.match(/<i style=/g) ?? []).length, 30)
})

test('whole desktop card toggles digits, counts reveals only, and leaves mobile popup opening uncounted', async () => {
  const browser = new Window({ url: 'https://unlimpadel.ru/' })
  const keys = ['window', 'document', 'Element', 'localStorage', 'sessionStorage', 'location', 'IS_REACT_ACT_ENVIRONMENT']
  const old = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === 'IS_REACT_ACT_ENVIRONMENT' ? true : (browser as any)[key] })
  let mobile = false, opened = 0
  browser.matchMedia = (() => ({ matches: mobile })) as any
  const calls: unknown[][] = []
  ;(browser as any).__unlimYandexMetricaInitialized = '113700320'
  ;(browser as any).ym = (...args: unknown[]) => calls.push(args)
  browser.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({ siteAnalytics: true, yandexMetrica: true, ga4: false }))
  const cleanup = initializeMetricaGoals({ mode: 'consent-required', endpoint: '', schemaVersion: 1, vendors: { yandexMetrica: { enabled: true, counterId: '113700320', webvisor: false }, ga4: { enabled: false } } })
  const mount = browser.document.createElement('div'); browser.document.body.append(mount)
  const root = createRoot(mount as unknown as Element)
  const count = () => calls.filter(call => call[1] === 'reachGoal' && call[2] === 'call_button_click').length
  try {
    await act(async () => root.render(<FooterPhoneContact {...props} onContact={() => { opened++; trackDesktopPhoneClick() }} />))
    const button = mount.querySelector('button')!
    button.dispatchEvent(new browser.MouseEvent('mouseover', { bubbles: true })); button.focus()
    assert.equal(count(), 0)
    assert.equal(button.getAttribute('aria-expanded'), 'false')
    await act(async () => button.dispatchEvent(new browser.MouseEvent('click', { bubbles: true })))
    assert.equal(button.getAttribute('aria-expanded'), 'true'); assert.equal(count(), 1)
    assert.equal((mount.querySelector('.pixel-phone-number__digits') as any).hidden, false)
    assert.equal(opened, 0, 'desktop disclosure must not open the phone popup')
    await act(async () => mount.querySelector('button svg')!.dispatchEvent(new browser.MouseEvent('click', { bubbles: true })))
    assert.equal(button.getAttribute('aria-expanded'), 'false'); assert.equal(count(), 1, 'hiding does not count')
    await act(async () => mount.querySelector('.pixel-phone-number')!.dispatchEvent(new browser.MouseEvent('click', { bubbles: true })))
    assert.equal(button.getAttribute('aria-expanded'), 'true'); assert.equal(count(), 2, 'the number itself is part of the click area')
    mobile = true
    await act(async () => mount.querySelector('a')!.dispatchEvent(new browser.MouseEvent('click', { bubbles: true, cancelable: true })))
    assert.equal(opened, 1); assert.equal(count(), 2)
  } finally {
    await act(async () => root.unmount()); cleanup(); browser.close()
    for (const key of keys) { const value = old.get(key); if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key) }
  }
})

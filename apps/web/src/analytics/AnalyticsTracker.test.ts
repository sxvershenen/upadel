import assert from 'node:assert/strict'
import test from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Window } from 'happy-dom'
import { AnalyticsTracker } from './AnalyticsTracker'
import { ANALYTICS_CONSENT_KEY, ANALYTICS_QUEUE_KEY } from './identity'

test('internal analytics records without consent and survives refusal of external counters', async () => {
  const browser = new Window({ url: 'https://unlimpadel.ru/prices' })
  const keys = ['window', 'document', 'location', 'localStorage', 'navigator', 'Element', 'addEventListener', 'removeEventListener', 'IS_REACT_ACT_ENVIRONMENT']
  const previous = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const key of keys) {
    const value = key === 'IS_REACT_ACT_ENVIRONMENT' ? true : key === 'addEventListener' || key === 'removeEventListener' ? browser[key].bind(browser) : browser[key as keyof Window]
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
  }
  const mount = browser.document.createElement('div'); browser.document.body.append(mount)
  const root = createRoot(mount as unknown as Element)
  try {
    assert.equal(localStorage.getItem(ANALYTICS_CONSENT_KEY), null)
    await act(async () => root.render(React.createElement(AnalyticsTracker, { analytics: { mode: 'consent-required', endpoint: '/analytics', schemaVersion: 1, vendors: { yandexMetrica: { enabled: false, webvisor: false }, ga4: { enabled: false } } } })))
    const events = () => JSON.parse(localStorage.getItem(ANALYTICS_QUEUE_KEY) ?? '[]')
    assert.ok(events().some((event: any) => event.name === 'page_view' && event.consentState === 'not-required'))
    browser.dispatchEvent(new browser.CustomEvent('unlim:analytics-consent', { detail: { siteAnalytics: false, yandexMetrica: false, ga4: false } }))
    assert.ok(window.unlimAnalytics?.serverContext()?.anonymousId)
    window.unlimAnalytics?.track({ name: 'form_view', formType: 'consultation' })
    assert.ok(events().some((event: any) => event.name === 'form_view'))
  } finally {
    await act(async () => root.unmount())
    browser.close()
    for (const key of keys) { const descriptor = previous.get(key); if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key) }
  }
})

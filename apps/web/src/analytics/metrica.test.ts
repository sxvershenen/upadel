import assert from 'node:assert/strict'
import test from 'node:test'
import { Window } from 'happy-dom'
import { ANALYTICS_CONSENT_KEY } from './identity'
import { initializeMetricaGoals, metricaLeadContext, reachMetricaGoal, trackBookingOpen, trackDesktopPhoneClick } from './metrica'

const policy = { mode: 'consent-required', endpoint: '', schemaVersion: 1, vendors: { yandexMetrica: { enabled: true, counterId: '113700320', webvisor: false }, ga4: { enabled: false } } } as const

test('Metrica respects consent, distinct visit actions, success deduplication and ClientID failure', async () => {
  const browser = new Window({ url: 'https://unlimpadel.ru/' })
  const keys = ['window', 'document', 'Element', 'localStorage', 'sessionStorage', 'location', 'innerHeight', 'scrollY']
  const old = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: (browser as any)[key] })
  let mobile = false
  browser.matchMedia = (() => ({ matches: mobile })) as any
  const calls: unknown[][] = []
  ;(browser as any).__unlimYandexMetricaInitialized = '113700320'
  ;(browser as any).ym = (...args: unknown[]) => { calls.push(args); if (args[1] === 'getClientID') (args[2] as Function)('1761630000123456789') }
  browser.document.body.innerHTML = '<a href="/prices">Цены</a><a href="tel:+79990000000" data-analytics-ignore>Позвонить</a><button data-analytics-action="phone">Телефон</button><a data-metrica-call-confirm href="tel:+79990000000">Позвонить в попапе</a>'
  browser.document.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', e => e.preventDefault()))
  const prices = browser.document.querySelector('a')!, phone = browser.document.querySelectorAll('a')[1]!
  const goals = () => calls.filter(call => call[1] === 'reachGoal').map(call => call[2])
  let cleanup = initializeMetricaGoals(policy)
  try {
    prices.click(); trackBookingOpen(); phone.click(); reachMetricaGoal('waitlist_form_start', true)
    assert.deepEqual(goals(), [])
    assert.deepEqual(await metricaLeadContext(), {})
    browser.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({ siteAnalytics: false, yandexMetrica: true, ga4: false }))
    // Earlier actions do not replay after consent.
    prices.click(); prices.click()
    assert.deepEqual(goals(), [])
    trackBookingOpen()
    assert.deepEqual(goals(), ['booking_open', 'two_interactions'])
    trackBookingOpen()
    assert.equal(goals().filter(goal => goal === 'two_interactions').length, 1)
    Object.defineProperty(browser.document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    Object.defineProperty(globalThis, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(globalThis, 'scrollY', { value: 899, configurable: true })
    browser.dispatchEvent(new browser.Event('scroll')); assert.ok(!goals().includes('scroll_75'))
    Object.defineProperty(globalThis, 'scrollY', { value: 900, configurable: true })
    browser.dispatchEvent(new browser.Event('scroll')); browser.dispatchEvent(new browser.Event('scroll'))
    assert.equal(goals().filter(goal => goal === 'scroll_75').length, 1)
    assert.equal(goals().filter(goal => goal === 'engaged_visitor').length, 1)
    const callCount = () => goals().filter(goal => goal === 'call_button_click').length
    const confirmation = browser.document.querySelector('[data-metrica-call-confirm]') as any
    phone.click(); browser.document.querySelector('button')!.click()
    assert.equal(callCount(), 0, 'unmarked phone links do not count as popup confirmation')
    confirmation.dispatchEvent(new browser.MouseEvent('mouseover', { bubbles: true })); confirmation.focus()
    assert.equal(callCount(), 0, 'hover and focus never count')
    trackDesktopPhoneClick()
    assert.equal(callCount(), 1, 'desktop popup opening or number disclosure counts')
    confirmation.click()
    assert.equal(callCount(), 1, 'desktop final call button must not double-count the popup opening')
    mobile = true
    trackDesktopPhoneClick(); phone.click(); browser.document.querySelector('button')!.click()
    assert.equal(callCount(), 1, 'mobile popup opening does not count')
    confirmation.dispatchEvent(new browser.MouseEvent('pointerdown', { bubbles: true }))
    assert.equal(callCount(), 1, 'pointer press does not duplicate click')
    confirmation.click()
    assert.equal(callCount(), 2, 'mobile final call confirmation counts')
    reachMetricaGoal('waitlist_form_start', true); reachMetricaGoal('waitlist_form_start', true)
    reachMetricaGoal('waitlist_submit_success', true); reachMetricaGoal('waitlist_submit_success', true)
    assert.equal(goals().filter(goal => goal === 'waitlist_form_start').length, 1)
    assert.equal(goals().filter(goal => goal === 'waitlist_submit_success').length, 1)
    assert.deepEqual(await metricaLeadContext(), { yandexClientID: '1761630000123456789', yandexMetricaConsent: true })
    // Simulated remount/full navigation retains once-per-visit state.
    cleanup(); cleanup = initializeMetricaGoals(policy)
    reachMetricaGoal('waitlist_submit_success', true)
    assert.equal(goals().filter(goal => goal === 'waitlist_submit_success').length, 1)
    ;(browser as any).ym = () => {}
    const before = Date.now()
    assert.deepEqual(await metricaLeadContext(), {})
    assert.ok(Date.now() - before < 1000)
    browser.localStorage.removeItem(ANALYTICS_CONSENT_KEY)
    assert.equal(reachMetricaGoal('booking_open'), false)
    const beforeRefusal = callCount()
    confirmation.click(); mobile = false; trackDesktopPhoneClick()
    assert.equal(callCount(), beforeRefusal, 'phone goals remain consent-gated')
    assert.deepEqual(await metricaLeadContext(), {})
  } finally {
    cleanup(); browser.close()
    for (const key of keys) { const value = old.get(key); if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key) }
  }
})

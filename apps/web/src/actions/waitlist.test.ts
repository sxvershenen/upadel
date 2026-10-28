import assert from 'node:assert/strict'
import test from 'node:test'
import { Window } from 'happy-dom'
import { initializeWaitlist } from './waitlist'

test('waitlist validates consent, retries with the same key, and dismisses outside only on mobile', async () => {
  const browser = new Window({ url: 'https://unlimpadel.ru/rules' })
  const keys = ['window', 'document', 'HTMLDialogElement', 'FormData', 'fetch']
  const previous = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const key of keys.filter((key) => key !== 'fetch')) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: (browser as any)[key] })
  const requests: any[] = []
  Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: async (_url: string, options: RequestInit) => {
    requests.push(JSON.parse(String(options.body)))
    return new Response(JSON.stringify(requests.length === 1 ? { error: 'Сбой' } : { ok: true }), { status: requests.length === 1 ? 503 : 200 })
  } })
  const autoClose: Array<() => void> = []
  const originalTimeout = browser.setTimeout.bind(browser)
  browser.setTimeout = ((callback: () => void, delay?: number) => { if (delay === 7_000) { autoClose.push(callback); return 0 } return originalTimeout(callback, delay) }) as any
  let mobile = false
  browser.matchMedia = (() => ({ matches: mobile })) as any
  browser.document.body.innerHTML = `<button data-waitlist-reopen>Вернуть скидку</button><dialog data-endpoint="/api/public/leads" data-success-title="Готово" data-success-text="Заявка сохранена"><h2 id="waitlist-title">Лист ожидания</h2><p id="waitlist-description">Описание</p><form data-waitlist-close-form method="dialog"><button>Закрыть</button></form><form data-waitlist-form><input name="name"><input name="phone"><input name="consent" type="checkbox"><p data-waitlist-error hidden></p><button type="submit">Сохранить</button></form><p data-waitlist-success hidden></p></dialog>`
  const dialog = browser.document.querySelector('dialog')!
  const form = dialog.querySelector('[data-waitlist-form]') as any
  const submit = async () => { form.dispatchEvent(new browser.Event('submit', { bubbles: true, cancelable: true })); await new Promise((resolve) => setTimeout(resolve, 0)) }
  try {
    const tracked: string[] = []
    ;(browser as any).unlimAnalytics = { track: (event: any) => tracked.push(event.name), serverContext: () => null }
    dialog.showModal()
    initializeWaitlist(dialog as unknown as HTMLElement)
    initializeWaitlist(dialog as unknown as HTMLElement)
    form.dispatchEvent(new browser.Event('focusin', { bubbles: true }))
    assert.equal(tracked.includes('form_start'), false)
    ;(form.querySelector('[name="name"]') as any).value = 'Иван'
    form.querySelector('[name="name"]').dispatchEvent(new browser.Event('input', { bubbles: true }))
    form.querySelector('[name="name"]').dispatchEvent(new browser.Event('input', { bubbles: true }))
    assert.equal(tracked.filter(name => name === 'form_start').length, 1)
    ;(form.querySelector('[name="phone"]') as any).value = '+7 999 123-45-67'
    await submit(); assert.equal(requests.length, 0)
    ;(form.querySelector('[name="consent"]') as any).checked = true
    await submit(); assert.equal(autoClose.length, 0); assert.equal(requests.length, 1); assert.equal((dialog.querySelector('[data-waitlist-error]') as any).hidden, false)
    await submit(); assert.equal(requests.length, 2)
    assert.equal(requests[0].idempotencyKey, requests[1].idempotencyKey)
    assert.equal(requests[1].sourcePage, '/rules'); assert.equal(requests[1].consent, true)
    assert.equal(form.hidden, true); assert.equal(dialog.querySelector('#waitlist-title')?.textContent, 'Готово')
    dialog.getBoundingClientRect = (() => ({ left: 400, right: 840, top: 100, bottom: 600 })) as any
    dialog.dispatchEvent(new browser.MouseEvent('click', { clientX: 10, clientY: 10 }))
    assert.equal(dialog.hasAttribute('data-closing'), false)
    const cancel = new browser.Event('cancel', { cancelable: true }); dialog.dispatchEvent(cancel); assert.equal(cancel.defaultPrevented, true)
    assert.equal(autoClose.length, 1); autoClose[0](); assert.equal(dialog.hasAttribute('data-closing'), true)
    dialog.dispatchEvent(new browser.Event('animationend')); assert.equal(dialog.open, false)
    ;(browser.document.querySelector('[data-waitlist-reopen]') as any).click()
    assert.equal(dialog.open, true)
    assert.equal(form.hidden, true)
    assert.equal(dialog.querySelector('#waitlist-title')?.textContent, 'Готово')
    mobile = true; dialog.dispatchEvent(new browser.MouseEvent('click', { clientX: 10, clientY: 10 }))
    assert.equal(dialog.hasAttribute('data-closing'), true)
    dialog.dispatchEvent(new browser.Event('animationend')); assert.equal(dialog.open, false)
    ;(browser.document.querySelector('[data-waitlist-reopen]') as any).click()
    dialog.querySelector('[data-waitlist-close-form]')!.dispatchEvent(new browser.Event('submit', { bubbles: true, cancelable: true }))
    await new Promise(resolve => setTimeout(resolve, 300))
    assert.equal(dialog.open, false)
    ;(browser.document.querySelector('[data-waitlist-reopen]') as any).click()
    dialog.dispatchEvent(new browser.Event('animationend'))
    assert.equal(dialog.open, true, 'opening animation must not run an old fallback close handler')
  } finally {
    browser.close()
    for (const key of keys) { const descriptor = previous.get(key); if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key) }
  }
})

test('separate consent step blocks form submission and refusal only closes the drawer', async () => {
  const browser = new Window({ url: 'https://unlimpadel.ru/' })
  const keys = ['window', 'document', 'HTMLDialogElement', 'FormData', 'localStorage', 'fetch']
  const old = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const key of keys.filter(key => key !== 'fetch')) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: (browser as any)[key] })
  let requests = 0
  Object.defineProperty(globalThis, 'fetch', { configurable: true, value: async () => { requests++; return new Response('{"ok":true}') } })
  browser.document.body.innerHTML = `<dialog data-endpoint="/api/public/leads"><h2 id="waitlist-title">Лист</h2><p id="waitlist-description">Описание</p><div data-waitlist-analytics-gate><button data-waitlist-decline>Я передумал</button></div><form data-waitlist-form><input name="name" value="Иван"><input name="phone" value="+79991234567"><input name="consent" type="checkbox" checked><p data-waitlist-error hidden></p><button type="submit">Сохранить</button></form><p data-waitlist-success hidden></p></dialog>`
  const dialog = browser.document.querySelector('dialog')!, form = browser.document.querySelector('[data-waitlist-form]') as any
  try {
    dialog.showModal(); initializeWaitlist(dialog as unknown as HTMLElement)
    assert.equal(form.hidden, true)
    form.dispatchEvent(new browser.Event('submit', { bubbles: true, cancelable: true }))
    await new Promise(resolve => setTimeout(resolve, 0)); assert.equal(requests, 0)
    ;(dialog.querySelector('[data-waitlist-decline]') as any).click()
    dialog.dispatchEvent(new browser.Event('animationend')); assert.equal(dialog.open, false)
    assert.equal(localStorage.getItem('unlim-analytics-consent-v2'), null)
    dialog.showModal()
    localStorage.setItem('unlim-analytics-consent-v2', JSON.stringify({ siteAnalytics: true, yandexMetrica: true, ga4: false }))
    browser.dispatchEvent(new browser.CustomEvent('unlim:analytics-consent', { detail: { yandexMetrica: true } }))
    assert.equal(form.hidden, false)
    assert.equal((dialog.querySelector('[data-waitlist-analytics-gate]') as any).hidden, true)
  } finally {
    browser.close()
    for (const key of keys) { const value = old.get(key); if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key) }
  }
})

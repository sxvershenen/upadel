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
  browser.document.body.innerHTML = `<dialog data-endpoint="/api/public/leads" data-success-title="Готово" data-success-text="Заявка сохранена"><h2 id="waitlist-title">Лист ожидания</h2><p id="waitlist-description">Описание</p><form data-waitlist-close-form method="dialog"><button>Закрыть</button></form><form data-waitlist-form><input name="name"><input name="phone"><input name="consent" type="checkbox"><p data-waitlist-error hidden></p><button type="submit">Сохранить</button></form><p data-waitlist-success hidden></p></dialog>`
  const dialog = browser.document.querySelector('dialog')!
  const form = dialog.querySelector('[data-waitlist-form]') as any
  const submit = async () => { form.dispatchEvent(new browser.Event('submit', { bubbles: true, cancelable: true })); await new Promise((resolve) => setTimeout(resolve, 0)) }
  try {
    dialog.showModal()
    initializeWaitlist(dialog as unknown as HTMLElement)
    initializeWaitlist(dialog as unknown as HTMLElement)
    ;(form.querySelector('[name="name"]') as any).value = 'Иван'
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
    dialog.showModal()
    mobile = true; dialog.dispatchEvent(new browser.MouseEvent('click', { clientX: 10, clientY: 10 }))
    assert.equal(dialog.hasAttribute('data-closing'), true)
    dialog.dispatchEvent(new browser.Event('animationend')); assert.equal(dialog.open, false)
  } finally {
    browser.close()
    for (const key of keys) { const descriptor = previous.get(key); if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key) }
  }
})

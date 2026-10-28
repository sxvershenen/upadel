import assert from 'node:assert/strict'
import test from 'node:test'
import { Window } from 'happy-dom'
import { openLundaWidget } from './lundaWidget'

test('Lunda validates configuration, retries failed loads and shares one provider installation', async () => {
  const browser = new Window({ url: 'https://unlimpadel.ru/', settings: { disableIframePageLoading: true } })
  const create = browser.document.createElement.bind(browser.document)
  browser.document.createElement = ((tag: string, options?: any) => { const node = create(tag, options); if (tag === 'script') node.setAttribute('type', 'application/x-unlim-test'); return node }) as any
  const keys = ['window', 'document']
  const old = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: (browser as any)[key] })
  const clubId = '25591c97-c7c7-48ef-9244-20d82dcca967'
  let clicks = 0
  browser.document.addEventListener('click', event => {
    if (!(event.target as any)?.closest('.booking-button-PADEL')) return
    clicks++
    const iframe = browser.document.createElement('iframe'); iframe.src = 'https://app.lundapadel.ru/create-booking-web?preferredClubs=' + clubId
    browser.document.body.appendChild(iframe)
  })
  try {
    await assert.rejects(openLundaWidget('https://evil.example'), /не настроен/)
    const failure = openLundaWidget(clubId)
    browser.document.querySelector('script')!.dispatchEvent(new browser.Event('error'))
    await assert.rejects(failure, /загрузить/)
    assert.equal(browser.document.querySelectorAll('script').length, 0)
    const first = openLundaWidget(clubId), duplicate = openLundaWidget(clubId)
    assert.equal(first, duplicate)
    assert.deepEqual((browser as any)['params_5a3b8f2e-d47c-41e6-9f2a-7b8d34e1c0a9'], { sportTypes: 'PADEL', preferredClubs: [clubId] })
    browser.document.querySelector('script')!.dispatchEvent(new browser.Event('load'))
    await first
    assert.equal(clicks, 1)
    assert.equal(browser.document.querySelectorAll('script').length, 1)
    assert.equal(browser.document.querySelectorAll('.booking-button-PADEL').length, 0)
    await openLundaWidget(clubId); assert.equal(clicks, 1)
    browser.document.querySelector('iframe')!.remove()
    await openLundaWidget(clubId); assert.equal(clicks, 2)
    assert.equal(browser.document.querySelectorAll('script').length, 1)
    browser.document.querySelector('iframe')!.remove()
    browser.document.documentElement.dataset.routeTransition = 'loading'
    const duringNavigation = openLundaWidget(clubId)
    await new Promise(resolve => setTimeout(resolve, 0))
    assert.equal(clicks, 2, 'provider must not push history during an unfinished page visit')
    browser.document.documentElement.dataset.routeTransition = 'done'
    await duringNavigation
    assert.equal(clicks, 3)
  } finally {
    browser.close()
    for (const key of keys) { const value = old.get(key); if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key) }
  }
})

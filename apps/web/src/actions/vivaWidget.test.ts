import assert from 'node:assert/strict'
import test from 'node:test'
import { openVivaWidget } from './vivaWidget'

function browser() {
  class Script extends EventTarget {
    src = ''; id = ''; removed = false
    onload?: () => void; onerror?: () => void
    remove() { this.removed = true }
    getAttribute() { return null }
  }
  const doc = new EventTarget() as any
  const scripts: Script[] = []
  const win: any = { setTimeout, clearTimeout, __vcWidgetInstallScripts: {}, __vcCabinetInstallScripts: {} }
  const opened: string[] = []
  let failInstall = false, failBundle = false
  doc.createElement = (tag: string) => {
    if (tag === 'script') return new Script()
    const anchor = new EventTarget() as any
    anchor.setAttribute = () => {}; anchor.remove = () => {}
    anchor.dispatchEvent = () => {
      const key = anchor.href.slice(1)
      if (win[`loaded-${key}`]) return true
      const script = new Script(); script.id = key; scripts.push(script)
      queueMicrotask(() => {
        if (!failBundle) win[`loaded-${key}`] = true
        const event = new Event(failBundle ? 'error' : 'load')
        Object.defineProperty(event, 'target', { value: script })
        doc.dispatchEvent(event)
      })
      return true
    }
    return anchor
  }
  doc.body = { appendChild: (element: any) => {
    if (!(element instanceof Script)) return
    scripts.push(element)
    queueMicrotask(() => {
      if (failInstall) { element.onerror?.(); return }
      const key = `widget${scripts.length}`
      const registry = element.src.includes('8e5e55da') ? win.__vcCabinetInstallScripts : win.__vcWidgetInstallScripts
      registry[key] = element
      win[key] = (method: string, event: string) => { if (method === 'event' && event === 'open') opened.push(key) }
      element.onload?.()
    })
  } }
  doc.getElementById = (id: string) => scripts.find(script => script.id === id && !script.removed)
  const originals = new Map<string, PropertyDescriptor | undefined>()
  for (const [key, value] of Object.entries({ window: win, document: doc, HTMLScriptElement: Script, MouseEvent: Event, requestAnimationFrame: (fn: () => void) => setTimeout(fn, 0) })) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  }
  return { scripts, opened, failInstall: (value: boolean) => { failInstall = value }, failBundle: (value: boolean) => { failBundle = value }, restore: () => { for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key) } } }
}

const url = (id: string) => `https://supadb.vivacrm.ru/storage/v1/object/public/widgets/${id}.js`

test('widget installation is deduplicated, opens on first click and works for separate booking/cabinet registries', async () => {
  const mock = browser()
  try {
    const booking = url('3ffc4681-890e-4d27-9676-1a5a7c246b10')
    await openVivaWidget(booking)
    await openVivaWidget(booking)
    await openVivaWidget(url('8e5e55da-bb08-4d93-9572-047f3d99b3b0'))
    assert.equal(mock.scripts.filter(script => script.src === booking).length, 1)
    assert.equal(mock.opened.length, 3)
    assert.equal(mock.opened[0], mock.opened[1])
    assert.notEqual(mock.opened[1], mock.opened[2])
  } finally { mock.restore() }
})

test('failed installation can be retried without caching the rejected promise', async () => {
  const mock = browser()
  const scriptURL = url('3ffc4681-890e-4d27-9676-1a5a7c246b11')
  try {
    mock.failInstall(true)
    await assert.rejects(openVivaWidget(scriptURL), /Не удалось загрузить/)
    assert.equal(mock.scripts[0].removed, true)
    mock.failInstall(false)
    await openVivaWidget(scriptURL)
    assert.equal(mock.opened.length, 1)
  } finally { mock.restore() }
})

test('failed provider bundle is removed and the retained installation can retry', async () => {
  const mock = browser()
  const scriptURL = url('3ffc4681-890e-4d27-9676-1a5a7c246b12')
  try {
    mock.failBundle(true)
    await assert.rejects(openVivaWidget(scriptURL), /временно недоступен/)
    assert.equal(mock.scripts[1].removed, true)
    mock.failBundle(false)
    await openVivaWidget(scriptURL)
    assert.equal(mock.scripts.filter(script => script.src === scriptURL).length, 1)
    assert.equal(mock.opened.length, 1)
  } finally { mock.restore() }
})

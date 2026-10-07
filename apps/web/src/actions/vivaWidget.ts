import { widgetURL } from '@unlim/content-contract'

type VivaWindow = Window & { __vcWidgetInstallScripts?: Record<string, HTMLScriptElement>; __vcCabinetInstallScripts?: Record<string, HTMLScriptElement> }
const installations = new Map<string, Promise<string>>()

function install(url: string): Promise<string> {
  const cached = installations.get(url)
  if (cached) return cached
  const promise = new Promise<string>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    const timeout = window.setTimeout(() => fail(), 15_000)
    const fail = () => { window.clearTimeout(timeout); script.remove(); reject(new Error('Не удалось загрузить виджет. Попробуйте ещё раз.')) }
    script.onerror = fail
    script.onload = () => {
      window.clearTimeout(timeout)
      const key = Object.entries({ ...(window as VivaWindow).__vcWidgetInstallScripts, ...(window as VivaWindow).__vcCabinetInstallScripts }).find(([, element]) => element.src === url)?.[0]
      if (key) resolve(key)
      else fail()
    }
    document.body.appendChild(script)
  })
  installations.set(url, promise)
  void promise.catch(() => installations.delete(url))
  return promise
}

/** Provider captures the anchor click and lazily loads its own popup bundle. */
export async function openVivaWidget(value: string): Promise<void> {
  const url = widgetURL(value, 'vivacrm-script')
  if (!url) throw new Error('Адрес виджета не настроен.')
  const key = await install(url)
  await new Promise<void>((resolve, reject) => {
    let timer: number
    let settled = false
    const cleanup = () => { window.clearTimeout(timer); document.removeEventListener('load', onLoad, true); document.removeEventListener('error', onError, true) }
    const finish = () => {
      if (settled) return
      settled = true
      cleanup()
      // VivaCRM marks the bundle ready before React registers its popup listener.
      // Open after the first paint so the initial click is not lost.
      requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(() => {
        const open = (window as unknown as Record<string, unknown>)[key]
        if (typeof open === 'function') { open('event', 'open'); resolve() }
        else reject(new Error('Не удалось открыть виджет. Попробуйте ещё раз.'))
      }, 100)))
    }
    const onLoad = (event: Event) => { if (event.target instanceof HTMLScriptElement && event.target.id === key) finish() }
    const onError = (event: Event) => {
      if (!settled && event.target instanceof HTMLScriptElement && event.target.id === key) {
        settled = true
        event.target.remove(); cleanup(); reject(new Error('Виджет временно недоступен. Повторите попытку или свяжитесь с клубом.'))
      }
    }
    document.addEventListener('load', onLoad, true)
    document.addEventListener('error', onError, true)
    timer = window.setTimeout(() => { settled = true; cleanup(); reject(new Error('Виджет не ответил. Повторите попытку или свяжитесь с клубом.')) }, 30_000)
    const anchor = document.createElement('a')
    anchor.href = `#${key}`
    anchor.hidden = true
    anchor.setAttribute('data-no-swup', '')
    anchor.addEventListener('click', (event) => event.preventDefault())
    document.body.appendChild(anchor)
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    anchor.remove()
    // On subsequent opens, or a shared booking bundle, the provider is already ready.
    if ((window as unknown as Record<string, unknown>)[`loaded-${key}`] || document.getElementById(key)?.getAttribute('data-vc-widget-ready') === '1' || document.getElementById(key)?.getAttribute('data-vc-cabinet-ready') === '1') { finish() }
  })
}

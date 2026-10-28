const scriptURL = 'https://app.lundapadel.ru/booking-widget.js'
const paramsKey = 'params_5a3b8f2e-d47c-41e6-9f2a-7b8d34e1c0a9'
let installed: Promise<void> | null = null
let installedClub = ''
let opening: Promise<void> | null = null
const frame = () => document.querySelector<HTMLIFrameElement>('iframe[src^="https://app.lundapadel.ru/create-booking-web"]')

/** The provider pushes browser history; let an in-flight page visit finish first. */
function waitForSiteNavigation(): Promise<void> {
  return new Promise((resolve, reject) => {
    const observer = new window.MutationObserver(() => {
      if (document.documentElement.dataset.routeTransition === 'loading') return
      observer.disconnect(); window.clearTimeout(timer); resolve()
    })
    const timer = window.setTimeout(() => {
      observer.disconnect()
      reject(new Error('Страница ещё загружается. Повторите бронирование через несколько секунд.'))
    }, 8_000)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-route-transition'] })
  })
}

function install(clubId: string): Promise<void> {
  if (installed && installedClub !== clubId) return Promise.reject(new Error('Настройки бронирования обновились. Обновите страницу.'))
  if (installed) return installed
  installedClub = clubId
  ;(window as unknown as Record<string, unknown>)[paramsKey] = { sportTypes: 'PADEL', preferredClubs: [clubId] }
  installed = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = scriptURL; script.async = true; script.setAttribute('charset', 'UTF-8')
    const timer = window.setTimeout(fail, 15_000)
    function fail() { window.clearTimeout(timer); script.remove(); installed = null; reject(new Error('Не удалось загрузить бронирование. Повторите попытку или позвоните в клуб.')) }
    script.onerror = fail
    script.onload = () => { window.clearTimeout(timer); resolve() }
    document.body.appendChild(script)
  })
  return installed
}

/** One installation across all islands and Swup pages. Provider owns its drawer/history. */
export function openLundaWidget(clubId: string): Promise<void> {
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(clubId)) return Promise.reject(new Error('Клуб для бронирования не настроен.'))
  if (opening) return opening
  opening = (async () => {
    if (frame()) return
    if (document.documentElement.dataset.routeTransition === 'loading') await waitForSiteNavigation()
    await install(clubId)
    const trigger = document.createElement('button')
    trigger.type = 'button'; trigger.className = 'booking-button-PADEL'; trigger.hidden = true
    document.body.appendChild(trigger)
    try { trigger.click() } finally { trigger.remove() }
    if (!frame()) throw new Error('Бронирование не открылось. Попробуйте ещё раз.')
  })().finally(() => { opening = null })
  return opening
}

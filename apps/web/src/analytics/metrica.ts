import type { SiteDTO } from '@unlim/content-contract'
import { readAnalyticsPreferences } from './consent'

export const metricaGoals = ['call_button_click', 'scroll_75', 'two_interactions', 'engaged_visitor', 'waitlist_form_start', 'waitlist_submit_success', 'booking_open'] as const
type Goal = typeof metricaGoals[number]
type Visit = { prices: boolean; booking: boolean; scroll: boolean; sent: Goal[]; expires: number }
const storageKey = 'unlim-metrica-goals-v1'
let policy: SiteDTO['analytics'] | null = null
let memory: Visit | null = null

function counter(): number | null {
  try {
    const vendor = policy?.vendors.yandexMetrica
    return policy?.mode !== 'disabled' && vendor?.enabled && vendor.counterId && window.__unlimYandexMetricaInitialized === vendor.counterId && readAnalyticsPreferences(localStorage)?.yandexMetrica && window.ym ? Number(vendor.counterId) : null
  } catch { return null }
}
function visit(): Visit {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as Visit | null
    if (saved && saved.expires > Date.now() && Array.isArray(saved.sent)) memory = saved
  } catch { /* Storage restrictions must not affect the form. */ }
  if (!memory || memory.expires <= Date.now()) memory = { prices: false, booking: false, scroll: false, sent: [], expires: 0 }
  memory.expires = Date.now() + 30 * 60_000
  return memory
}
function save(state: Visit) { try { sessionStorage.setItem(storageKey, JSON.stringify(state)) } catch { /* Memory deduplication remains available. */ } }
export function reachMetricaGoal(goal: Goal, once = false): boolean {
  const id = counter()
  if (!id) return false
  const state = visit()
  if (once && state.sent.includes(goal)) return false
  try { window.ym!(id, 'reachGoal', goal) } catch { return false }
  if (once) state.sent.push(goal)
  save(state)
  return true
}
function engagement(kind: 'prices' | 'booking' | 'scroll') {
  if (!counter()) return
  const state = visit()
  state[kind] = true
  save(state)
  if (state.prices && state.booking) reachMetricaGoal('two_interactions', true)
  if (state.prices && state.booking && state.scroll) reachMetricaGoal('engaged_visitor', true)
}
export function trackDesktopPhoneClick() {
  if (!window.matchMedia('(max-width: 767px)').matches) reachMetricaGoal('call_button_click')
}
export function trackBookingOpen() {
  reachMetricaGoal('booking_open')
  engagement('booking')
}
export function initializeMetricaGoals(analytics: SiteDTO['analytics']): () => void {
  policy = analytics
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return
    const target = event.target.closest<HTMLElement>('a[href], [data-analytics-action]')
    if (!target) return
    const href = target.getAttribute('href') ?? ''
    if (window.matchMedia('(max-width: 767px)').matches && event.target.closest('[data-metrica-call-confirm]')) reachMetricaGoal('call_button_click')
    if (href) {
      try {
        const url = new URL(href, location.href)
        if (url.origin === location.origin && url.pathname.replace(/\/+$/, '') === '/prices') engagement('prices')
      } catch { /* Non-URL controls are ignored. */ }
    }
    // External booking has no local provider callback.
    if (target.dataset.analyticsAction === 'booking' && /^https:\/\//.test(href)) trackBookingOpen()
  }
  const scroll = () => {
    const distance = document.documentElement.scrollHeight - innerHeight
    if (distance > 0 && scrollY > 0 && scrollY / distance >= 0.75) {
      reachMetricaGoal('scroll_75', true)
      engagement('scroll')
    }
  }
  document.addEventListener('click', click, true)
  window.addEventListener('scroll', scroll, { passive: true })
  return () => { document.removeEventListener('click', click, true); window.removeEventListener('scroll', scroll) }
}

/** Official API only; a blocked counter never prevents saving the lead. */
export async function metricaLeadContext(): Promise<{ yandexClientID: string; yandexMetricaConsent: true } | Record<string, never>> {
  const id = counter()
  if (!id) return {}
  const clientID = await new Promise<string | null>((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 500)
    try {
      window.ym!(id, 'getClientID', (value: unknown) => {
        window.clearTimeout(timer)
        resolve(typeof value === 'string' && /^\d{1,32}$/.test(value) ? value : null)
      })
    } catch { window.clearTimeout(timer); resolve(null) }
  })
  return clientID && counter() ? { yandexClientID: clientID, yandexMetricaConsent: true } : {}
}

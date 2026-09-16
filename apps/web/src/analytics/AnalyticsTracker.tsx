import type { SiteDTO } from '@unlim/content-contract'
import { useEffect } from 'react'

import { ANALYTICS_CONSENT_KEY, ANALYTICS_QUEUE_KEY, browserIdentity, firstSource, sessionIdentity, sourceFromLocation, type Source } from './identity'
import { calculateINP, type InteractionTiming } from './vitals'

type CustomEventData = { name: string; objectType?: string; objectId?: string; actionKind?: string; formType?: string; step?: number; value?: number; metricName?: string }
type QueuedEvent = Record<string, unknown> & { eventId: string }
declare global { interface Window { unlimAnalytics?: { track: (event: CustomEventData) => void; serverContext: () => Record<string, unknown> | null } } }

const pageViewId = () => globalThis.crypto?.randomUUID?.().replaceAll('-', '') ?? `${Date.now()}${Math.random().toString(36).slice(2)}`
let currentPageView = ''

export function trackAnalytics(event: CustomEventData): void { window.unlimAnalytics?.track(event) }
export function analyticsServerContext(): Record<string, unknown> | null { return window.unlimAnalytics?.serverContext() ?? null }

function objectContext(): { objectType?: string; objectId?: string } {
  const match = location.pathname.match(/^\/(coaches|tournaments|blog)\/([^/?#]+)/)
  if (!match) return {}
  return { objectType: match[1] === 'coaches' ? 'coach' : match[1] === 'tournaments' ? 'tournament' : 'article', objectId: decodeURIComponent(match[2]).slice(0, 160) }
}

export function AnalyticsTracker({ analytics }: { analytics: SiteDTO['analytics'] }) {
  useEffect(() => {
    if (analytics.mode === 'disabled') return
    let enabled = analytics.mode === 'first-party' || localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'
    let queue: QueuedEvent[] = []
    let current = sourceFromLocation(new URL(location.href), document.referrer)
    let first: Source | null = null
    let flushTimer = 0
    let activeTimer = 0
    let lastActive = Date.now()
    const readMarks = new Set<number>()
    currentPageView = pageViewId()
    try { queue = JSON.parse(localStorage.getItem(ANALYTICS_QUEUE_KEY) ?? '[]').slice(-50) as QueuedEvent[] } catch { queue = [] }
    const saveQueue = () => { try { localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(queue.slice(-50))) } catch { /* quota/private mode */ } }
    const track = (data: CustomEventData) => {
      if (!enabled) return
      const now = Date.now(); const browser = browserIdentity(localStorage, now); const session = sessionIdentity(localStorage, now)
      first ??= firstSource(localStorage, current, now)
      queue.push({ eventId: pageViewId(), schemaVersion: analytics.schemaVersion, occurredAt: new Date(now).toISOString(), anonymousId: browser.id, sessionId: session.id, pageViewId: currentPageView, path: location.pathname, title: document.title.slice(0, 180), language: document.documentElement.lang || 'ru', consentState: analytics.mode === 'first-party' ? 'not-required' : 'accepted', currentSource: current, firstSource: first, ...data })
      saveQueue()
      if (queue.length >= 10) void flush(false)
    }
    const flush = async (unloading: boolean) => {
      if (!enabled || !queue.length) return
      const batch = queue.slice(0, 25); const body = JSON.stringify({ events: batch })
      if (unloading && navigator.sendBeacon) {
        const sent = navigator.sendBeacon(analytics.endpoint, new Blob([body], { type: 'text/plain' }))
        if (sent) { queue.splice(0, batch.length); saveQueue() }
        return
      }
      try {
        const response = await fetch(analytics.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, credentials: 'omit', keepalive: true })
        if (response.ok) { queue.splice(0, batch.length); saveQueue() }
      } catch { /* retry from persisted queue */ }
    }
    const serverContext = () => {
      if (!enabled) return null
      const now = Date.now(); const browser = browserIdentity(localStorage, now); const session = sessionIdentity(localStorage, now)
      first ??= firstSource(localStorage, current, now)
      return { eventId: pageViewId(), schemaVersion: analytics.schemaVersion, occurredAt: new Date(now).toISOString(), anonymousId: browser.id, sessionId: session.id, pageViewId: currentPageView, path: location.pathname, title: document.title.slice(0, 180), language: document.documentElement.lang || 'ru', consentState: analytics.mode === 'first-party' ? 'not-required' : 'accepted', currentSource: current, firstSource: first }
    }
    window.unlimAnalytics = { track, serverContext }
    const start = () => {
      if (!enabled) return
      currentPageView = pageViewId(); current = sourceFromLocation(new URL(location.href), document.referrer); first = null
      const context = objectContext()
      track({ name: 'page_view', ...context })
      if (context.objectType) track({ name: 'object_view', ...context })
      flushTimer = window.setInterval(() => void flush(false), 10_000)
      activeTimer = window.setInterval(() => {
        if (document.visibilityState === 'visible' && Date.now() - lastActive <= 30_000) track({ name: 'active_time', value: 15_000 })
      }, 15_000)
    }
    const stop = () => { window.clearInterval(flushTimer); window.clearInterval(activeTimer); flushTimer = 0; activeTimer = 0 }
    const consent = (event: Event) => {
      const choice = (event as CustomEvent<'accepted' | 'rejected'>).detail
      const wasEnabled = enabled; enabled = analytics.mode === 'first-party' || choice === 'accepted'
      if (!wasEnabled && enabled) start()
      if (!enabled) { stop(); queue = []; saveQueue() }
    }
    const activity = () => { lastActive = Date.now() }
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const target = event.target.closest<HTMLElement>('[data-analytics-action]')
      if (!target || target.hasAttribute('data-analytics-ignore')) return
      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') ?? '' : ''
      const explicit = target.dataset.analyticsAction
      let actionKind = explicit ?? (href.startsWith('tel:') ? 'phone' : href.startsWith('mailto:') ? 'email' : href.startsWith('http') ? 'external' : href ? 'internal' : '')
      if (!actionKind) return
      const contact = ['phone', 'email', 'telegram', 'vk'].includes(actionKind)
      track({ name: contact ? 'contact_click' : 'cta_click', actionKind, objectType: target.dataset.analyticsObjectType, objectId: target.dataset.analyticsObjectId })
    }
    const scroll = () => {
      if (objectContext().objectType !== 'article') return
      const available = document.documentElement.scrollHeight - innerHeight
      if (available <= 0) return
      const percent = Math.round((scrollY / available) * 100)
      for (const mark of [25, 50, 90]) if (percent >= mark && !readMarks.has(mark)) { readMarks.add(mark); track({ name: 'article_read', value: mark, ...objectContext() }) }
    }
    let lcp: number | null = null; let fcp: number | null = null; const interactionTimings: InteractionTiming[] = []; let cls = 0; let clsWindow = 0; let clsWindowStart = 0; let clsLast = 0
    const emittedVitals = new Set<string>()
    const emitVital = (metricName: 'LCP' | 'INP' | 'CLS' | 'TTFB' | 'FCP', value: number | null) => {
      if (value === null || !Number.isFinite(value) || value < 0 || emittedVitals.has(metricName)) return
      emittedVitals.add(metricName); track({ name: 'web_vital', metricName, value })
    }
    const emitFinalVitals = () => { emitVital('LCP', lcp); emitVital('FCP', fcp); emitVital('INP', calculateINP(interactionTimings, Number((performance as Performance & { interactionCount?: number }).interactionCount ?? interactionTimings.length))); emitVital('CLS', cls) }
    const visibility = () => { if (document.visibilityState === 'hidden') { emitFinalVitals(); void flush(true) } }
    const pagehide = () => { emitFinalVitals(); void flush(true) }
    const observers: PerformanceObserver[] = []
    try {
      const largestPaint = new PerformanceObserver((list) => { const entries = list.getEntries(); const last = entries.at(-1); if (last) lcp = last.startTime }); largestPaint.observe({ type: 'largest-contentful-paint', buffered: true }); observers.push(largestPaint)
      const paint = new PerformanceObserver((list) => { const entry = list.getEntriesByName('first-contentful-paint')[0]; if (entry) fcp = entry.startTime }); paint.observe({ type: 'paint', buffered: true }); observers.push(paint)
      const interactions = new PerformanceObserver((list) => { for (const entry of list.getEntries() as Array<PerformanceEntry & { duration: number; interactionId?: number }>) if ((entry.interactionId ?? 0) > 0) interactionTimings.push({ interactionId: entry.interactionId!, duration: entry.duration }) }); interactions.observe({ type: 'event', buffered: true, durationThreshold: 40 } as PerformanceObserverInit); observers.push(interactions)
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (navigation) emitVital('TTFB', navigation.responseStart)
      const layout = new PerformanceObserver((list) => { for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) { if (entry.hadRecentInput) continue; if (!clsWindowStart || entry.startTime - clsLast > 1000 || entry.startTime - clsWindowStart > 5000) { clsWindowStart = entry.startTime; clsWindow = 0 } clsWindow += entry.value ?? 0; clsLast = entry.startTime; cls = Math.max(cls, clsWindow) } }); layout.observe({ type: 'layout-shift', buffered: true }); observers.push(layout)
    } catch { /* unsupported observer type */ }
    addEventListener('unlim:analytics-consent', consent); addEventListener('click', click, true); addEventListener('scroll', scroll, { passive: true }); addEventListener('pointerdown', activity, { passive: true }); addEventListener('keydown', activity); addEventListener('pagehide', pagehide); document.addEventListener('visibilitychange', visibility)
    if (enabled) start()
    return () => { emitFinalVitals(); void flush(true); stop(); delete window.unlimAnalytics; observers.forEach((observer) => observer.disconnect()); removeEventListener('unlim:analytics-consent', consent); removeEventListener('click', click, true); removeEventListener('scroll', scroll); removeEventListener('pointerdown', activity); removeEventListener('keydown', activity); removeEventListener('pagehide', pagehide); document.removeEventListener('visibilitychange', visibility) }
  }, [analytics.endpoint, analytics.mode, analytics.schemaVersion])
  return null
}

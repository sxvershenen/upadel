import type { SiteDTO } from '@unlim/content-contract'
import { useEffect } from 'react'

import { ANALYTICS_CONSENT_KEY, ANALYTICS_QUEUE_KEY, browserIdentity, firstSource, sessionIdentity, sourceFromLocation, type Source } from './identity'
import { createAnalyticsDeliveryQueue, type AnalyticsDeliveryQueue } from './deliveryQueue'
import { createDeferredVitalDelivery, ensureDocumentVitals, type VitalEvent } from './documentVitals'

type CustomEventData = { name: string; objectType?: string; objectId?: string; actionKind?: string; formType?: string; step?: number; value?: number; metricName?: string }
declare global { interface Window { unlimAnalytics?: { track: (event: CustomEventData) => void; serverContext: () => Record<string, unknown> | null } } }

const pageViewId = () => globalThis.crypto?.randomUUID?.().replaceAll('-', '') ?? `${Date.now()}${Math.random().toString(36).slice(2)}`
type DocumentAnalyticsContext = { pageViewId?: string; path: string; title: string; language: string; currentSource: Source }
let analyticsDeliveryQueue: AnalyticsDeliveryQueue | null = null
let liveAnalyticsPolicy: SiteDTO['analytics'] | null = null
let initialDocumentContext: DocumentAnalyticsContext | null = null
let documentVitalDelivery: ReturnType<typeof createDeferredVitalDelivery<DocumentAnalyticsContext, VitalEvent>> | null = null

function deliveryQueue() {
  return analyticsDeliveryQueue ??= createAnalyticsDeliveryQueue(localStorage, ANALYTICS_QUEUE_KEY)
}

function configureDocumentVitals(analytics: SiteDTO['analytics']) {
  liveAnalyticsPolicy = analytics
  let created = false
  if (!documentVitalDelivery) {
    created = true
    initialDocumentContext = {
      path: location.pathname,
      title: document.title.slice(0, 180),
      language: document.documentElement.lang || 'ru',
      currentSource: sourceFromLocation(new URL(location.href), document.referrer),
    }
    documentVitalDelivery = createDeferredVitalDelivery(initialDocumentContext, (context, events) => {
      const policy = liveAnalyticsPolicy
      if (!policy || policy.mode === 'disabled') return true
      if (policy.mode !== 'first-party' && localStorage.getItem(ANALYTICS_CONSENT_KEY) !== 'accepted') return false
      const now = Date.now()
      const browser = browserIdentity(localStorage, now)
      const session = sessionIdentity(localStorage, now)
      const initialSource = firstSource(localStorage, context.currentSource, now)
      context.pageViewId ??= pageViewId()
      const queue = deliveryQueue()
      for (const event of events) queue.enqueue({
        eventId: pageViewId(), schemaVersion: policy.schemaVersion, occurredAt: new Date(now).toISOString(), anonymousId: browser.id, sessionId: session.id,
        pageViewId: context.pageViewId, path: context.path, title: context.title, language: context.language,
        consentState: policy.mode === 'first-party' ? 'not-required' : 'accepted', currentSource: context.currentSource, firstSource: initialSource, ...event,
      })
      void queue.flush({ endpoint: policy.endpoint, unloading: document.visibilityState === 'hidden', fetcher: fetch, sendBeacon: navigator.sendBeacon?.bind(navigator) })
      return true
    })
    ensureDocumentVitals(
      (event) => documentVitalDelivery?.add(event),
      () => { documentVitalDelivery?.finish() },
    )
  }
  documentVitalDelivery.policyChanged()
  return created
}

export function trackAnalytics(event: CustomEventData): void { window.unlimAnalytics?.track(event) }
export function analyticsServerContext(): Record<string, unknown> | null { return window.unlimAnalytics?.serverContext() ?? null }

function objectContext(): { objectType?: string; objectId?: string } {
  const match = location.pathname.match(/^\/(coaches|tournaments|blog)\/([^/?#]+)/)
  if (!match) return {}
  return { objectType: match[1] === 'coaches' ? 'coach' : match[1] === 'tournaments' ? 'tournament' : 'article', objectId: decodeURIComponent(match[2]).slice(0, 160) }
}

export function AnalyticsTracker({ analytics }: { analytics: SiteDTO['analytics'] }) {
  useEffect(() => {
    const ownsInitialDocumentContext = configureDocumentVitals(analytics)
    if (analytics.mode === 'disabled') return
    let enabled = analytics.mode === 'first-party' || localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'
    const queue = deliveryQueue()
    let current = sourceFromLocation(new URL(location.href), document.referrer)
    let first: Source | null = null
    let currentPageView = ''
    let flushTimer = 0
    let activeTimer = 0
    let lastActive = Date.now()
    const readMarks = new Set<number>()
    const track = (data: CustomEventData, eventContext?: { pageViewId: string; path: string; title: string; currentSource: Source; firstSource: Source | null }) => {
      if (!enabled) return
      const now = Date.now(); const browser = browserIdentity(localStorage, now); const session = sessionIdentity(localStorage, now)
      first ??= firstSource(localStorage, current, now)
      queue.enqueue({ eventId: pageViewId(), schemaVersion: analytics.schemaVersion, occurredAt: new Date(now).toISOString(), anonymousId: browser.id, sessionId: session.id, pageViewId: eventContext?.pageViewId ?? currentPageView, path: eventContext?.path ?? location.pathname, title: eventContext?.title ?? document.title.slice(0, 180), language: document.documentElement.lang || 'ru', consentState: analytics.mode === 'first-party' ? 'not-required' : 'accepted', currentSource: eventContext?.currentSource ?? current, firstSource: eventContext?.firstSource ?? first, ...data })
      if (queue.size() >= 10) void flush(false)
    }
    const flush = async (unloading: boolean) => {
      if (!enabled) return
      await queue.flush({ endpoint: analytics.endpoint, unloading, fetcher: fetch, sendBeacon: navigator.sendBeacon?.bind(navigator) })
    }
    const serverContext = () => {
      if (!enabled) return null
      const now = Date.now(); const browser = browserIdentity(localStorage, now); const session = sessionIdentity(localStorage, now)
      first ??= firstSource(localStorage, current, now)
      return { eventId: pageViewId(), schemaVersion: analytics.schemaVersion, occurredAt: new Date(now).toISOString(), anonymousId: browser.id, sessionId: session.id, pageViewId: currentPageView, path: location.pathname, title: document.title.slice(0, 180), language: document.documentElement.lang || 'ru', consentState: analytics.mode === 'first-party' ? 'not-required' : 'accepted', currentSource: current, firstSource: first }
    }
    const analyticsBridge = { track, serverContext }
    window.unlimAnalytics = analyticsBridge
    const start = () => {
      if (!enabled) return
      currentPageView = pageViewId(); current = sourceFromLocation(new URL(location.href), document.referrer); first = null
      if (ownsInitialDocumentContext && initialDocumentContext) initialDocumentContext.pageViewId = currentPageView
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
      if (!wasEnabled && enabled) documentVitalDelivery?.policyChanged()
      if (!enabled) { stop(); queue.clear() }
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
    addEventListener('unlim:analytics-consent', consent); addEventListener('click', click, true); addEventListener('scroll', scroll, { passive: true }); addEventListener('pointerdown', activity, { passive: true }); addEventListener('keydown', activity)
    if (enabled) start()
    return () => { void flush(true); stop(); if (window.unlimAnalytics === analyticsBridge) delete window.unlimAnalytics; removeEventListener('unlim:analytics-consent', consent); removeEventListener('click', click, true); removeEventListener('scroll', scroll); removeEventListener('pointerdown', activity); removeEventListener('keydown', activity) }
  }, [analytics.endpoint, analytics.mode, analytics.schemaVersion])
  return null
}

import { calculateINP, type InteractionTiming } from './vitals'

export type VitalEvent = { name: 'web_vital'; metricName: 'LCP' | 'INP' | 'CLS' | 'TTFB' | 'FCP'; value: number }

export function createDeferredVitalDelivery<TContext, TEvent>(
  context: TContext,
  deliver: (context: TContext, events: TEvent[]) => boolean,
) {
  const pending: TEvent[] = []
  let finalized = false
  const flush = () => {
    if (!finalized || !pending.length) return false
    if (!deliver(context, [...pending])) return false
    pending.length = 0
    return true
  }
  return {
    add(event: TEvent) { pending.push(event) },
    finish() { finalized = true; return flush() },
    policyChanged() { return flush() },
    pendingCount() { return pending.length },
  }
}

export function createSingleOwnerGate() {
  let claimed = false
  return (start: () => void) => {
    if (claimed) return false
    claimed = true
    start()
    return true
  }
}

const claimDocumentVitals = createSingleOwnerGate()

export function ensureDocumentVitals(track: (event: VitalEvent) => void, afterFinal?: () => void) {
  claimDocumentVitals(() => {
    let lcp: number | null = null
    let fcp: number | null = null
    const interactionTimings: InteractionTiming[] = []
    let cls = 0
    let clsWindow = 0
    let clsWindowStart = 0
    let clsLast = 0
    const emitted = new Set<string>()
    const observers: PerformanceObserver[] = []
    const emit = (metricName: VitalEvent['metricName'], value: number | null) => {
      if (value === null || !Number.isFinite(value) || value < 0 || emitted.has(metricName)) return
      emitted.add(metricName)
      track({ name: 'web_vital', metricName, value })
    }
    const emitFinal = () => {
      emit('LCP', lcp)
      emit('FCP', fcp)
      emit('INP', calculateINP(interactionTimings, Number((performance as Performance & { interactionCount?: number }).interactionCount ?? interactionTimings.length)))
      emit('CLS', cls)
    }
    const finish = () => {
      emitFinal()
      afterFinal?.()
      observers.forEach((observer) => observer.disconnect())
      removeEventListener('pagehide', finish)
      document.removeEventListener('visibilitychange', visibility)
    }
    const visibility = () => { if (document.visibilityState === 'hidden') finish() }

    try {
      const largestPaint = new PerformanceObserver((list) => { const last = list.getEntries().at(-1); if (last) lcp = last.startTime }); largestPaint.observe({ type: 'largest-contentful-paint', buffered: true }); observers.push(largestPaint)
      const paint = new PerformanceObserver((list) => { const entry = list.getEntriesByName('first-contentful-paint')[0]; if (entry) fcp = entry.startTime }); paint.observe({ type: 'paint', buffered: true }); observers.push(paint)
      const interactions = new PerformanceObserver((list) => { for (const entry of list.getEntries() as Array<PerformanceEntry & { duration: number; interactionId?: number }>) if ((entry.interactionId ?? 0) > 0) interactionTimings.push({ interactionId: entry.interactionId!, duration: entry.duration }) }); interactions.observe({ type: 'event', buffered: true, durationThreshold: 40 } as PerformanceObserverInit); observers.push(interactions)
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (navigation) emit('TTFB', navigation.responseStart)
      const layout = new PerformanceObserver((list) => { for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) { if (entry.hadRecentInput) continue; if (!clsWindowStart || entry.startTime - clsLast > 1000 || entry.startTime - clsWindowStart > 5000) { clsWindowStart = entry.startTime; clsWindow = 0 } clsWindow += entry.value ?? 0; clsLast = entry.startTime; cls = Math.max(cls, clsWindow) } }); layout.observe({ type: 'layout-shift', buffered: true }); observers.push(layout)
    } catch { /* unsupported observer type */ }
    addEventListener('pagehide', finish)
    document.addEventListener('visibilitychange', visibility)
  })
}

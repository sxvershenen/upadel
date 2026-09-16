import { createAdminRequestCache } from './adminRequestCache'

export type AnalyticsReportQuery = {
  channel: string
  compare: 'previous' | 'year'
  device: string
  from: string
  to: string
}

const reportCache = createAdminRequestCache<unknown>({ maxEntries: 32, ttlMs: 60_000 })

export function analyticsReportCacheKey(query: AnalyticsReportQuery): string {
  return JSON.stringify({
    compare: query.compare,
    filters: { channel: query.channel, device: query.device },
    period: { from: query.from, to: query.to },
  })
}

export function readAnalyticsReport<T>(query: AnalyticsReportQuery) {
  return reportCache.read(analyticsReportCacheKey(query)) as { expiresAt: number; fresh: boolean; value: T } | null
}

export function requestAnalyticsReport<T>(query: AnalyticsReportQuery): Promise<T> {
  const key = analyticsReportCacheKey(query)
  const params = new URLSearchParams(query)
  return reportCache.request(key, async () => {
    const response = await fetch(`/api/admin/analytics/report?${params}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json() as Promise<T>
  }) as Promise<T>
}

export function clearAnalyticsReportCache(): void {
  reportCache.clear()
}

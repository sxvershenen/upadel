import config from '@payload-config'
import { getPayload } from 'payload'

import { analyticsReport, type Period } from '@/analytics/report'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const REPORT_CACHE_TTL_MS = 60_000
const REPORT_CACHE_MAX_ENTRIES = 32
type CachedReport = { expiresAt: number; value: Awaited<ReturnType<typeof analyticsReport>> }
const reportCache = new Map<string, CachedReport>()
const pendingReports = new Map<string, Promise<Awaited<ReturnType<typeof analyticsReport>>>>()

function pruneReportCache(now: number): void {
  for (const [key, cached] of reportCache) if (cached.expiresAt <= now) reportCache.delete(key)
  while (reportCache.size > REPORT_CACHE_MAX_ENTRIES) {
    const oldest = reportCache.keys().next().value
    if (oldest === undefined) return
    reportCache.delete(oldest)
  }
}

function reportHeaders(cache: 'hit' | 'miss'): HeadersInit {
  return { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=60', 'X-Analytics-Cache': cache }
}

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const denied = await requireAdmin(payload, request.headers)
  if (denied) return denied
  const url = new URL(request.url)
  const toDefault = new Date(Date.now() + 3 * 60 * 60_000 - 86_400_000).toISOString().slice(0, 10)
  const fromDefault = new Date(Date.parse(`${toDefault}T00:00:00Z`) - 29 * 86_400_000).toISOString().slice(0, 10)
  const period: Period = { from: url.searchParams.get('from') ?? fromDefault, to: url.searchParams.get('to') ?? toDefault }
  if (!datePattern.test(period.from) || !datePattern.test(period.to) || period.from > period.to || Date.parse(`${period.to}T00:00:00Z`) - Date.parse(`${period.from}T00:00:00Z`) > 36 * 31 * 86_400_000) {
    return Response.json({ error: 'Invalid period.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  const compare = url.searchParams.get('compare') === 'year' ? 'year' : 'previous'
  const filters = { channel: url.searchParams.get('channel') ?? undefined, device: url.searchParams.get('device') ?? undefined, language: url.searchParams.get('language') ?? undefined }
  const cacheKey = JSON.stringify({ period, compare, filters })
  const now = Date.now()
  pruneReportCache(now)
  const cached = reportCache.get(cacheKey)
  if (cached && cached.expiresAt > now) return Response.json(cached.value, { headers: reportHeaders('hit') })
  try {
    let pending = pendingReports.get(cacheKey)
    if (!pending) {
      pending = analyticsReport(payload, period, compare, filters)
      pendingReports.set(cacheKey, pending)
    }
    const value = await pending
    reportCache.set(cacheKey, { expiresAt: Date.now() + REPORT_CACHE_TTL_MS, value })
    pruneReportCache(Date.now())
    return Response.json(value, { headers: reportHeaders('miss') })
  } catch {
    return Response.json({ error: 'Analytics report is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  } finally {
    pendingReports.delete(cacheKey)
  }
}

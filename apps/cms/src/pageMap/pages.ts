import { codeDefinedRouteRegistry, dynamicRouteRegistry, publicRouteRegistry } from '@unlim/content-contract'
import type { Payload } from 'payload'

const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const pathPattern = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/

export function normalizePagePath(value: unknown): string {
  if (typeof value !== 'string') return ''
  const path = value.trim().replace(/\/{2,}/g, '/')
  if (!path.startsWith('/') || path.includes('?') || path.includes('#')) return ''
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path
  return pathPattern.test(normalized) ? normalized : ''
}

export function normalizePageSegment(value: unknown): string {
  if (typeof value !== 'string') return ''
  const segment = value.trim()
  return segmentPattern.test(segment) ? segment : ''
}

export function buildPagePath(parentPath: unknown, slug: unknown): string {
  const parent = normalizePagePath(parentPath)
  const segment = normalizePageSegment(slug)
  if (!parent || !segment) return ''
  return parent === '/' ? `/${segment}` : `${parent}/${segment}`
}

export function isSystemPagePath(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/') || path === '/api' || path.startsWith('/api/')
}

export async function pagePathExists(payload: Payload, path: string, excludePageID?: number | string): Promise<boolean> {
  if (publicRouteRegistry.some((route) => route.path === path) || codeDefinedRouteRegistry.some((route) => route.path === path)) return true

  for (const route of dynamicRouteRegistry) {
    const prefix = `${route.parent}/`
    if (!path.startsWith(prefix) || path.slice(prefix.length).includes('/')) continue
    const slug = decodeURIComponent(path.slice(prefix.length))
    const result = await payload.find({
      collection: route.collection,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    } as never) as unknown as { docs: Array<{ id: number | string }> }
    if (result.docs.length > 0) return true
  }

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    where: { path: { equals: path } },
  } as never) as unknown as { docs: Array<{ id: number | string }> }
  return result.docs.some((doc) => String(doc.id) !== String(excludePageID ?? ''))
}

export async function pageParentExists(payload: Payload, parentPath: string): Promise<boolean> {
  return pagePathExists(payload, parentPath)
}

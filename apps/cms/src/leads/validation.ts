import { codeDefinedRouteRegistry, dynamicRouteRegistry, publicRouteRegistry } from '@unlim/content-contract'

const leadTypes = new Set(['membership', 'gift', 'trial', 'consultation', 'other'])
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const legacySourcePages = new Set(['/contacts'])

const text = (value: unknown, max: number): string => typeof value === 'string' ? value.trim().slice(0, max) : ''

export type ValidLeadSubmission = {
  name: string
  phone: string
  email: string
  telegram: string
  vk: string
  comment: string
  type: string
  sourcePage: string
  sourceEntity: string
  idempotencyKey: string
}

export function normalizeLeadSourcePage(value: unknown): string {
  const raw = text(value, 120)
  if (!raw.startsWith('/') || raw.includes('?') || raw.includes('#')) return ''
  return raw.length > 1 ? raw.replace(/\/+$/, '') : raw
}

export function isAllowedLeadSourcePage(value: unknown): boolean {
  const path = normalizeLeadSourcePage(value)
  if (!path) return false
  if (legacySourcePages.has(path)) return true
  if (publicRouteRegistry.some((route) => route.path === path)) return true
  if (codeDefinedRouteRegistry.some((route) => route.path === path)) return true
  return dynamicRouteRegistry.some((route) => {
    const prefix = `${route.parent}/`
    return path.startsWith(prefix) && slugPattern.test(path.slice(prefix.length))
  })
}

export function isLeadHoneypotTriggered(input: Record<string, unknown>): boolean {
  return Boolean(text(input.company, 200) || text(input.website, 200))
}

export function parseLeadSubmission(input: Record<string, unknown>): ValidLeadSubmission | null {
  const name = text(input.name, 120)
  const phone = text(input.phone, 40)
  const email = text(input.email, 160).toLowerCase()
  const telegram = text(input.telegram, 80)
  const vk = text(input.vk, 80)
  const comment = text(input.comment, 2000)
  const type = text(input.type, 20)
  const sourcePage = normalizeLeadSourcePage(input.sourcePage)
  const sourceEntity = text(input.sourceEntity, 160)
  const idempotencyKey = text(input.idempotencyKey, 100)
  const valid = name.length >= 2 && leadTypes.has(type) && isAllowedLeadSourcePage(sourcePage) && /^[a-zA-Z0-9:_-]{8,100}$/.test(idempotencyKey) && input.consent === true && !isLeadHoneypotTriggered(input) &&
    Boolean(phone || email || telegram || vk) && (!email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && (!phone || /^[+\d\s()-]{6,40}$/.test(phone)) && (!telegram || /^@?[\p{L}\p{N}_.-]{3,80}$/u.test(telegram)) && (!vk || /^@?[\p{L}\p{N}_.-]{3,80}$/u.test(vk)) &&
    (!sourceEntity || /^[\p{L}\p{N}\s._:/+()№#&'’«»–—₽-]{1,160}$/u.test(sourceEntity))
  return valid ? { name, phone, email, telegram, vk, comment, type, sourcePage, sourceEntity, idempotencyKey } : null
}

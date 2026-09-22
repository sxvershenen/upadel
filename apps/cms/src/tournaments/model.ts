import { catalogTournamentFormats } from '@unlim/content-contract'

export const tournamentLevelValues = Array.from({ length: 13 }, (_, index) => (1 + index * 0.5).toFixed(1))

export const tournamentLevelOptions = tournamentLevelValues.map((value) => ({ label: value, value }))

export const tournamentFormatOptions = catalogTournamentFormats

const tournamentFormatLabels = Object.fromEntries(
  tournamentFormatOptions.map(({ label, value }) => [value, label]),
) as Record<string, string>

export function resolveTournamentFormatLabel(format: unknown, customFormat: unknown): string {
  if (format === 'other' && typeof customFormat === 'string' && customFormat.trim()) return customFormat.trim()
  return typeof format === 'string' ? tournamentFormatLabels[format] ?? format : ''
}

export function formatTournamentLevel(levelFrom: unknown, levelTo: unknown): string {
  const from = Number(levelFrom)
  const to = Number(levelTo)
  if (!Number.isFinite(from) || !Number.isFinite(to)) return ''
  const fromLabel = from.toFixed(1)
  const toLabel = to.toFixed(1)
  return from === to ? fromLabel : `${fromLabel}–${toLabel}`
}

export function validateTournamentLevelTo(value: unknown, options: unknown): string | true {
  const siblingData = (options as { siblingData?: { levelFrom?: unknown } }).siblingData
  const from = Number(siblingData?.levelFrom)
  const to = Number(value)
  if (!Number.isFinite(from) || !Number.isFinite(to)) return true
  return to >= from ? true : 'Максимальный уровень не может быть ниже минимального.'
}

export function validateTournamentEnd(value: unknown, options: unknown): string | true {
  const siblingData = (options as { siblingData?: { startsAt?: unknown } }).siblingData
  if (typeof value !== 'string' || typeof siblingData?.startsAt !== 'string') return true
  return new Date(value).getTime() > new Date(siblingData.startsAt).getTime()
    ? true
    : 'Окончание должно быть позже начала.'
}

export function formatTournamentSchedule(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''

  const zone = 'Europe/Moscow'
  const yearFormatter = new Intl.DateTimeFormat('ru-RU', { timeZone: zone, year: 'numeric' })
  const date = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: zone,
    weekday: 'long',
    ...(yearFormatter.format(start) !== yearFormatter.format(end) ? { year: 'numeric' } : {}),
  }).format(start)
  const startTime = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', hour12: false, minute: '2-digit', timeZone: zone }).format(start)
  const endTime = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', hour12: false, minute: '2-digit', timeZone: zone }).format(end)
  const sameDay = new Intl.DateTimeFormat('en-CA', { day: '2-digit', month: '2-digit', timeZone: zone, year: 'numeric' }).format(start)
    === new Intl.DateTimeFormat('en-CA', { day: '2-digit', month: '2-digit', timeZone: zone, year: 'numeric' }).format(end)

  if (sameDay) return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${startTime}–${endTime}`
  const endDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: zone, year: 'numeric' }).format(end)
  return `${date.charAt(0).toUpperCase()}${date.slice(1)}, ${startTime} — ${endDate}, ${endTime}`
}

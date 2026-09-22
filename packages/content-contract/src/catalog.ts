export type CatalogKind = 'blog' | 'coaches' | 'tournaments'
export type CatalogQuery = {
  page: number
  category?: string
  sort?: 'popular'
  level?: string
  focus?: string
  lifecycle?: 'upcoming' | 'active' | 'finished' | 'cancelled'
  format?: string
}
export type CatalogPagination = { page: number; limit: number; totalDocs: number; totalPages: number }
export const catalogPageSize = 12
export const coachLevelOptions = [
  { label: 'Новички', value: 'beginner' }, { label: 'Продолжающие', value: 'intermediate' },
  { label: 'Средний уровень', value: 'medium' }, { label: 'Турнирный уровень', value: 'tournament' },
  { label: 'Дети', value: 'kids' }, { label: 'Любой уровень', value: 'all' },
] as const
export const coachFocusOptions = [
  { label: 'Техника', value: 'technique' }, { label: 'Тактика пары', value: 'pair-tactics' },
  { label: 'Турнирная подготовка', value: 'tournament-prep' }, { label: 'Детские группы', value: 'kids' },
  { label: 'Физическая подготовка', value: 'fitness' }, { label: 'Старт с нуля', value: 'beginner-start' },
  { label: 'Групповые тренировки', value: 'groups' }, { label: 'Женские группы', value: 'women' },
] as const
export const catalogTournamentFormats = [
  { label: 'Americano (смена напарников каждый сет)', value: 'americano' },
  { label: 'Групповой этап + олимпийская сетка', value: 'groups-knockout' },
  { label: 'Round Robin + финальный плей-офф', value: 'round-robin-playoff' },
  { label: 'Другой формат', value: 'other' },
] as const

/** Only code-defined filters reach Payload; arbitrary query operators are ignored. */
export function parseCatalogQuery(kind: CatalogKind, params: URLSearchParams): CatalogQuery {
  const requested = Number(params.get('page') ?? 1)
  const query: CatalogQuery = { page: Number.isSafeInteger(requested) && requested >= 1 && requested <= 10_000 ? requested : 1 }
  const level = params.get('level')
  if (kind === 'blog') {
    const category = params.get('category')
    if (category && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) && category.length <= 160) query.category = category
    if (params.get('sort') === 'popular') query.sort = 'popular'
  } else if (kind === 'coaches') {
    if (coachLevelOptions.some((option) => option.value === level)) query.level = level!
    const focus = params.get('focus')
    if (coachFocusOptions.some((option) => option.value === focus)) query.focus = focus!
  } else {
    if (level && /^(?:[1-6]\.[05]|7\.0)$/.test(level)) query.level = level
    const lifecycle = params.get('lifecycle')
    if (lifecycle === 'upcoming' || lifecycle === 'active' || lifecycle === 'finished' || lifecycle === 'cancelled') query.lifecycle = lifecycle
    const format = params.get('format')
    if (catalogTournamentFormats.some((option) => option.value === format)) query.format = format!
  }
  return query
}

export function catalogQueryParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of ['category', 'sort', 'level', 'focus', 'lifecycle', 'format'] as const) {
    if (query[key]) params.set(key, query[key])
  }
  if (query.page > 1) params.set('page', String(query.page))
  return params
}

export function catalogPath(kind: CatalogKind, query: CatalogQuery): string {
  const search = catalogQueryParams(query).toString()
  return `/${kind}/${search ? `?${search}` : ''}`
}

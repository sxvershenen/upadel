import { catalogPath, catalogQueryParams, coachLevelOptions, coachFocusOptions, catalogTournamentFormats, type CatalogQuery, type BlogCatalogDTO, type CatalogDTO, type CoachesCatalogDTO, type TournamentsCatalogDTO } from '@unlim/content-contract'
import { type CSSProperties, type ReactNode } from 'react'
import { CatalogPagination } from './CatalogPagination'

import { ArticleCard } from '../components/cards/ArticleCard'
import { CoachCard } from '../components/cards/CoachCard'
import { TournamentCard } from '../components/cards/TournamentCard'
import { Select } from '../components/ui/Select'
import { SiteFrame } from '../components/SiteFrame'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'

function entranceDelay(milliseconds: number) {
  return { '--page-enter-delay': `${milliseconds}ms` } as CSSProperties
}

function Header({ page }: { page: CatalogDTO['page'] }) {
  return <header className="page-hero relative overflow-hidden pb-6 pt-12 text-white md:pb-12 md:pt-24"><ProgressiveImage media={page.hero.media} loading="eager" fetchPriority="high" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${page.hero.grayscale ? 'grayscale' : ''}`} /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,.48)_0%,rgba(3,5,8,.78)_70%,rgba(3,5,8,.96)_100%)]" /><div className="container-page relative z-10"><h1 data-page-enter="title" className="type-section max-w-[900px] text-white">{page.title}</h1><p data-page-enter="intro" className="type-editorial mt-4 max-w-[820px] text-white/65">{page.intro}</p></div></header>
}

const selectClass = 'ui-select se-2 h-[var(--control-md)] bg-white px-4 type-ui text-ink focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2'
function FilterLabel({ label, children }: { label: string; children: ReactNode }) { return <label className="type-caption flex min-w-0 flex-col gap-2"><span className="sr-only">{label}</span>{children}</label> }
function navigateCatalog(dto: CatalogDTO, patch: Partial<CatalogQuery>) {
  const query = { ...dto.query, ...patch }
  let href = catalogPath(dto.kind, query)
  if (dto.preview) {
    const url = new URL(window.location.href)
    for (const key of ['page', 'category', 'sort', 'level', 'focus', 'lifecycle', 'format']) url.searchParams.delete(key)
    catalogQueryParams(query).forEach((value, key) => url.searchParams.set(key, value))
    href = url.pathname + url.search
  }
  const request = new CustomEvent('unlim:navigate', { detail: { href }, cancelable: true })
  if (dto.preview || window.dispatchEvent(request)) window.location.assign(href)
}

function BlogCatalog({ dto }: { dto: BlogCatalogDTO }) {
  const category = dto.query.category ?? '__all'
  const sort = dto.query.sort ?? 'newest'
  const items = dto.items
  const setCategory = (value: string) => navigateCatalog(dto, { page: 1, category: value === '__all' ? undefined : value })
  const setSort = (value: string) => navigateCatalog(dto, { page: 1, sort: value === 'popular' ? 'popular' : undefined })
  return <><Header page={dto.page} /><section className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div data-page-enter="content" style={entranceDelay(160)} className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"><FilterLabel label="Категория"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={category} onChange={setCategory} options={[{ value: '__all', label: 'Все категории' }, ...dto.categories.map(({ slug, title }) => ({ value: slug, label: title }))]} aria-label="Категория" /></FilterLabel><FilterLabel label="Сортировка"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={sort} onChange={(value: string) => setSort(value as typeof sort)} options={[{ value: 'newest', label: 'Сначала новые' }, { value: 'popular', label: 'Популярные' }]} aria-label="Сортировка" /></FilterLabel></div><div className="grid gap-y-10 md:gap-x-8 md:gap-y-12 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <div key={item.id} data-page-enter="content" style={entranceDelay(220 + Math.min(index, 5) * 60)}><ArticleCard post={item} loading={index < 3 ? 'eager' : 'lazy'} /></div>)}</div>{items.length === 0 && <p role="status">Материалов с такими параметрами нет.</p>}<CatalogPagination dto={dto} onPreviewNavigate={(page) => navigateCatalog(dto, { page })} /></section></>
}

function CoachesCatalog({ dto }: { dto: CoachesCatalogDTO }) {
  const level = dto.query.level ?? '__all'
  const focus = dto.query.focus ?? '__all'
  const items = dto.items
  const setLevel = (value: string) => navigateCatalog(dto, { page: 1, level: value === '__all' ? undefined : value })
  const setFocus = (value: string) => navigateCatalog(dto, { page: 1, focus: value === '__all' ? undefined : value })
  return <><Header page={dto.page} /><section className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div data-page-enter="content" style={entranceDelay(160)} className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"><FilterLabel label="Уровень"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={level} onChange={setLevel} options={[{ value: '__all', label: 'Уровень' }, ...coachLevelOptions]} aria-label="Уровень" /></FilterLabel><FilterLabel label="Направление"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={focus} onChange={setFocus} options={[{ value: '__all', label: 'Направление' }, ...coachFocusOptions]} aria-label="Направление" /></FilterLabel></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">{items.map((item, index) => <div key={item.id} data-page-enter="content" style={entranceDelay(220 + Math.min(index, 5) * 60)} className="h-full"><CoachCard coach={item} loading="lazy" /></div>)}</div>{items.length === 0 && <p role="status">Тренеров с такими параметрами нет.</p>}<CatalogPagination dto={dto} onPreviewNavigate={(page) => navigateCatalog(dto, { page })} /></section></>
}

function TournamentsCatalog({ dto }: { dto: TournamentsCatalogDTO }) {
  const lifecycle = dto.query.lifecycle ?? '__all'
  const level = dto.query.level ?? '__all'
  const format = dto.query.format ?? '__all'
  const items = dto.items
  const setLifecycle = (value: string) => navigateCatalog(dto, { page: 1, lifecycle: value === '__all' ? undefined : value as CatalogQuery['lifecycle'] })
  const setLevel = (value: string) => navigateCatalog(dto, { page: 1, level: value === '__all' ? undefined : value })
  const setFormat = (value: string) => navigateCatalog(dto, { page: 1, format: value === '__all' ? undefined : value })
  const levels = Array.from({ length: 13 }, (_, index) => (1 + index * .5).toFixed(1))
  return <><Header page={dto.page} /><section className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div data-page-enter="content" style={entranceDelay(160)} className="mb-8 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3"><FilterLabel label="Состояние"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={lifecycle} onChange={setLifecycle} options={[{ value: '__all', label: 'Все' }, { value: 'upcoming', label: 'Предстоящие' }, { value: 'active', label: 'Идут сейчас' }, { value: 'finished', label: 'Завершённые' }, { value: 'cancelled', label: 'Отменённые' }]} aria-label="Состояние" /></FilterLabel><FilterLabel label="Уровень"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={level} onChange={setLevel} options={[{ value: '__all', label: 'Уровень' }, ...levels.map((value) => ({ value, label: value }))]} aria-label="Уровень" /></FilterLabel><FilterLabel label="Формат"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={format} onChange={setFormat} options={[{ value: '__all', label: 'Формат' }, ...catalogTournamentFormats]} aria-label="Формат" /></FilterLabel></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <div key={item.id} data-page-enter="content" style={entranceDelay(220 + Math.min(index, 5) * 60)} className="h-full"><div className={`h-full ${item.lifecycle === 'finished' || item.lifecycle === 'cancelled' ? 'grayscale opacity-55' : ''}`}><TournamentCard tournament={item} loading="lazy" /></div></div>)}</div>{items.length === 0 && <p role="status">Турниров с такими параметрами нет.</p>}<CatalogPagination dto={dto} onPreviewNavigate={(page) => navigateCatalog(dto, { page })} /></section></>
}

export function CatalogPage({ dto }: { dto: CatalogDTO }) {
  return <SiteFrame site={dto.site}>{dto.kind === 'blog' ? <BlogCatalog dto={dto} /> : dto.kind === 'coaches' ? <CoachesCatalog dto={dto} /> : <TournamentsCatalog dto={dto} />}</SiteFrame>
}

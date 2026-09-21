import type { BlogCatalogDTO, CatalogDTO, CoachesCatalogDTO, TournamentsCatalogDTO } from '@unlim/content-contract'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'

import { ArticleCard } from '../components/cards/ArticleCard'
import { CoachCard } from '../components/cards/CoachCard'
import { TournamentCard } from '../components/cards/TournamentCard'
import { Select } from '../components/ui/Select'
import { SiteFrame } from '../components/SiteFrame'

function entranceDelay(milliseconds: number) {
  return { '--page-enter-delay': `${milliseconds}ms` } as CSSProperties
}

function Header({ page }: { page: CatalogDTO['page'] }) {
  return <header className="page-hero relative overflow-hidden pb-8 pt-12 text-white md:pb-12 md:pt-24"><div className={`absolute inset-0 bg-cover bg-center ${page.hero.grayscale ? 'grayscale' : ''}`} style={{ backgroundImage: `url(${page.hero.media.url})` }} /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,.48)_0%,rgba(3,5,8,.78)_70%,rgba(3,5,8,.96)_100%)]" /><div className="container-page relative z-10"><h1 data-page-enter="title" className="type-section max-w-[900px] text-white">{page.title}</h1><p data-page-enter="intro" className="type-editorial mt-4 max-w-[820px] text-white/65">{page.intro}</p></div></header>
}

const selectClass = 'ui-select se-2 h-[var(--control-md)] bg-white px-4 type-ui text-ink focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2'
function FilterLabel({ label, children }: { label: string; children: ReactNode }) { return <label className="type-caption flex min-w-0 flex-col gap-2"><span className="sr-only">{label}</span>{children}</label> }
const levelLabels: Record<string, string> = { beginner: 'Новички', intermediate: 'Продолжающие', medium: 'Средний уровень', tournament: 'Турнирный уровень', kids: 'Дети', all: 'Любой уровень' }
const focusLabels: Record<string, string> = { technique: 'Техника', 'pair-tactics': 'Тактика пары', 'tournament-prep': 'Турнирная подготовка', kids: 'Детские группы', fitness: 'Физическая подготовка', 'beginner-start': 'Старт с нуля', groups: 'Групповые тренировки', women: 'Женские группы' }
function BlogCatalog({ dto }: { dto: BlogCatalogDTO }) {
  const [category, setCategory] = useState('__all')
  const [sort, setSort] = useState<'newest' | 'popular'>('newest')
  const items = useMemo(() => dto.items.filter((item) => category === '__all' || item.category.slug === category).sort((a, b) => sort === 'popular' ? b.popularityScore - a.popularityScore : Date.parse(b.publishedAt) - Date.parse(a.publishedAt)), [dto.items, category, sort])
  return <><Header page={dto.page} /><section className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div className="mx-auto max-w-[1280px]"><div data-page-enter="content" style={entranceDelay(160)} className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"><FilterLabel label="Категория"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={category} onChange={setCategory} options={[{ value: '__all', label: 'Все категории' }, ...dto.categories.map(({ slug, title }) => ({ value: slug, label: title }))]} aria-label="Категория" /></FilterLabel><FilterLabel label="Сортировка"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={sort} onChange={(value: string) => setSort(value as typeof sort)} options={[{ value: 'newest', label: 'Сначала новые' }, { value: 'popular', label: 'Популярные' }]} aria-label="Сортировка" /></FilterLabel></div><div className="grid gap-y-10 md:gap-x-8 md:gap-y-12 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <div key={item.id} data-page-enter="content" style={entranceDelay(220 + Math.min(index, 5) * 60)}><ArticleCard post={item} /></div>)}</div>{items.length === 0 && <p role="status">Материалов с такими параметрами нет.</p>}</div></section></>
}

function CoachesCatalog({ dto }: { dto: CoachesCatalogDTO }) {
  const [level, setLevel] = useState('__all')
  const [focus, setFocus] = useState('__all')
  const items = dto.items.filter((item) => (level === '__all' || item.levels.includes(level)) && (focus === '__all' || item.focusAreas.includes(focus)))
  const levelOptions = [...new Set(dto.items.flatMap((item) => item.levels))]
  const focusOptions = [...new Set(dto.items.flatMap((item) => item.focusAreas))]
  return <><Header page={dto.page} /><section className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div data-page-enter="content" style={entranceDelay(160)} className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"><FilterLabel label="Уровень"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={level} onChange={setLevel} options={[{ value: '__all', label: 'Уровень' }, ...levelOptions.map((value) => ({ value, label: levelLabels[value] ?? value }))]} aria-label="Уровень" /></FilterLabel><FilterLabel label="Направление"><Select className={`${selectClass} w-full min-w-0 sm:w-auto`} value={focus} onChange={setFocus} options={[{ value: '__all', label: 'Направление' }, ...focusOptions.map((value) => ({ value, label: focusLabels[value] ?? value }))]} aria-label="Направление" /></FilterLabel></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">{items.map((item, index) => <div key={item.id} data-page-enter="content" style={entranceDelay(220 + Math.min(index, 5) * 60)} className="h-full"><CoachCard coach={item} /></div>)}</div>{items.length === 0 && <p role="status">Тренеров с такими параметрами нет.</p>}</section></>
}

function TournamentsCatalog({ dto }: { dto: TournamentsCatalogDTO }) {
  const [lifecycle, setLifecycle] = useState('__all')
  const [level, setLevel] = useState('__all')
  const [format, setFormat] = useState('__all')
  const items = dto.items.filter((item) => {
    const selectedLevel = Number(level)
    return (lifecycle === '__all' || item.lifecycle === lifecycle)
      && (level === '__all' || selectedLevel >= item.levelFrom && selectedLevel <= item.levelTo)
      && (format === '__all' || item.format === format)
  })
  const levels = [...new Set(dto.items.flatMap((item) => {
    const values: string[] = []
    for (let value = item.levelFrom; value <= item.levelTo; value += 0.5) values.push(value.toFixed(1))
    return values
  }))].sort((a, b) => Number(a) - Number(b))
  const formats = [...new Map(dto.items.map((item) => [item.format, item.formatLabel])).entries()]
  return <><Header page={dto.page} /><section className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div data-page-enter="content" style={entranceDelay(160)} className="mb-8 grid grid-cols-3 gap-2 sm:gap-3"><FilterLabel label="Состояние"><Select className={`${selectClass} w-full min-w-0`} value={lifecycle} onChange={setLifecycle} options={[{ value: '__all', label: 'Все' }, { value: 'upcoming', label: 'Предстоящие' }, { value: 'active', label: 'Идут сейчас' }, { value: 'finished', label: 'Завершённые' }, { value: 'cancelled', label: 'Отменённые' }]} aria-label="Состояние" /></FilterLabel><FilterLabel label="Уровень"><Select className={`${selectClass} w-full min-w-0`} value={level} onChange={setLevel} options={[{ value: '__all', label: 'Уровень' }, ...levels.map((value) => ({ value, label: value }))]} aria-label="Уровень" /></FilterLabel><FilterLabel label="Формат"><Select className={`${selectClass} w-full min-w-0`} value={format} onChange={setFormat} options={[{ value: '__all', label: 'Формат' }, ...formats.map(([value, label]) => ({ value, label }))]} aria-label="Формат" /></FilterLabel></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <div key={item.id} data-page-enter="content" style={entranceDelay(220 + Math.min(index, 5) * 60)} className="h-full"><div className={`h-full ${item.lifecycle === 'finished' || item.lifecycle === 'cancelled' ? 'grayscale opacity-55' : ''}`}><TournamentCard tournament={item} /></div></div>)}</div>{items.length === 0 && <p role="status">Турниров с такими параметрами нет.</p>}</section></>
}

export function CatalogPage({ dto }: { dto: CatalogDTO }) {
  return <SiteFrame site={dto.site}>{dto.kind === 'blog' ? <BlogCatalog dto={dto} /> : dto.kind === 'coaches' ? <CoachesCatalog dto={dto} /> : <TournamentsCatalog dto={dto} />}</SiteFrame>
}

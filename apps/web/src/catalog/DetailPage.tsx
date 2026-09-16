import type { DetailDTO } from '@unlim/content-contract'
import { CalendarDays, Check, CheckCircle2, ClipboardCheck, ClipboardList, Medal, Wallet } from 'lucide-react'

import { ArticleCard } from '../components/cards/ArticleCard'
import { CoachCard } from '../components/cards/CoachCard'
import { TournamentCard } from '../components/cards/TournamentCard'
import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { Badge } from '../components/ui/Badge'
import { Price } from '../components/ui/Price'
import { PageHeader } from '../thematic/PageHeader'

function Breadcrumb({ section, sectionURL, title }: { section: string; sectionURL: string; title: string }) {
  return <nav aria-label="Хлебные крошки" className="type-caption mb-8 flex flex-wrap gap-2 text-ink-soft"><a href="/">Главная</a><span>/</span><a href={sectionURL}>{section}</a><span>/</span><span aria-current="page">{title}</span></nav>
}

function TournamentFacts({ item }: { item: Extract<DetailDTO, { kind: 'tournaments' }>['item'] }) {
  const hasDistinctPrize = Boolean(item.prize.trim()) && !item.entryFee.includes(item.prize.trim())
  return <dl className="grid gap-3 sm:grid-cols-3">
    <div className="se-3 flex items-start gap-3 bg-white p-5"><CalendarDays aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-ink-muted" /><div><dt className="type-micro text-ink-muted">Дата и время</dt><dd className="type-body-sm mt-1 font-semibold text-ink">{item.scheduleLabel}</dd></div></div>
    <div className="se-3 flex items-start gap-3 bg-white p-5"><Medal aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-ink-muted" /><div><dt className="type-micro text-ink-muted">Формат</dt><dd className="type-body-sm mt-1 font-semibold text-ink">{item.format}</dd></div></div>
    <div className="se-3 flex items-start gap-3 bg-white p-5"><Wallet aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-ink-muted" /><div><dt className="type-micro text-ink-muted">Взнос</dt><dd className="type-body-sm mt-1 font-semibold text-ink">{item.entryFee}</dd>{hasDistinctPrize && <><dt className="type-micro mt-3 border-t border-ink/10 pt-3 text-ink-muted">{item.prizeLabel}</dt><dd className="type-title-compact mt-1 text-ink">{item.prize}</dd></>}</div></div>
  </dl>
}

function ChecklistItem({ children }: { children: string }) {
  return <li className="type-body-sm flex items-center gap-3 leading-snug text-ink-soft"><span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-[#f1f1f1] text-ink"><Check aria-hidden="true" size={15} strokeWidth={2.4} /></span><span>{children}</span></li>
}

export function DetailPage({ dto }: { dto: DetailDTO }) {
  if (dto.kind === 'blog') return <SiteFrame site={dto.site} backLink={{ href: '/blog' }}><article className="container-page pb-8 pt-8 md:pb-12"><div className="mx-auto max-w-[960px]"><Breadcrumb section="Блог" sectionURL="/blog" title={dto.item.title} /><div className="flex items-center justify-between gap-4 type-caption text-ink-soft"><span>{dto.item.readingTimeMinutes} мин · {new Date(dto.item.publishedAt).toLocaleDateString('ru-RU')}</span><span className="text-right">{dto.item.category.title}</span></div><h1 className="type-section mt-5">{dto.item.title}</h1><p className="type-editorial mt-6 text-ink-soft">{dto.item.excerpt}</p><img src={dto.item.image.url} alt={dto.item.image.alt} className="se-4 mt-10 aspect-[16/9] w-full object-cover" /><div className="article-content mx-auto mt-12 max-w-[760px]" dangerouslySetInnerHTML={{ __html: dto.item.contentHTML }} /></div>{dto.related.length > 0 && <section className="mx-auto mt-16 max-w-[1280px]"><h2 className="type-title-large mb-8">Читайте также</h2><div className="grid gap-8 md:grid-cols-3">{dto.related.map((item) => <ArticleCard key={item.id} post={item} />)}</div></section>}</article></SiteFrame>

  if (dto.kind === 'coaches') {
    const sourcePage = `/coaches/${dto.item.slug}`
    return <SiteFrame site={dto.site} backLink={{ href: '/coaches' }}><article className="container-page pb-8 pt-8 md:pb-12"><div><Breadcrumb section="Тренеры" sectionURL="/coaches" title={dto.item.name} /></div><div className="grid gap-10 lg:grid-cols-[minmax(320px,480px)_1fr]"><img src={dto.item.photo.url} alt={dto.item.photo.alt} className="se-4 aspect-[4/5] w-full object-cover" /><div className="flex flex-col justify-center"><Badge tone="lime">{dto.item.specialization}</Badge><h1 className="type-section mt-5">{dto.item.name}</h1><p className="type-editorial mt-6 text-ink-soft">{dto.item.bio}</p><dl className="type-body-sm mt-8 grid gap-3 border-y border-ink/10 py-6"><div className="flex justify-between"><dt>Уровень</dt><dd>{dto.item.level}</dd></div><div className="flex justify-between"><dt>Опыт</dt><dd>{dto.item.experience}</dd></div><div className="flex justify-between"><dt>Языки</dt><dd>{dto.item.languages}</dd></div></dl><div className="mt-6 flex flex-wrap gap-2">{dto.item.certificates.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div><div className="mt-8 flex items-end justify-between gap-4"><Price label="тренировка от" value={dto.item.priceFrom} /><ContentAction action={dto.item.action} sourcePage={sourcePage} sourceEntity={dto.item.name} size="lg" /></div></div></div>{dto.related.length > 0 && <section className="mt-16"><h2 className="type-title-large mb-8">Другие тренеры</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{dto.related.map((item) => <CoachCard key={item.id} coach={item} />)}</div></section>}</article></SiteFrame>
  }

  const completed = dto.item.lifecycle === 'finished' || dto.item.lifecycle === 'cancelled'
  const sourcePage = `/tournaments/${dto.item.slug}`
  const heroMedia = dto.item.visualStyle === 'image' && dto.item.image ? dto.item.image : dto.page.hero.media
  const checklist = [
    'Приезжайте за 15–30 минут до начала.',
    'Возьмите спортивную обувь без чёрной подошвы.',
    completed ? 'Итоги турнира доступны в архиве клуба.' : 'После регистрации дождитесь подтверждения участия.',
  ]
  return <SiteFrame site={dto.site} backLink={{ href: '/tournaments' }}>
    <PageHeader
      page={{ eyebrow: dto.item.category, title: dto.item.title, intro: dto.item.description, hero: { media: heroMedia, grayscale: completed } }}
      actions={<div className="flex flex-wrap items-center gap-3">{completed && <Badge tone="glass" icon={<CheckCircle2 size={14} />}>Завершено</Badge>}<ContentAction action={dto.item.action} sourcePage={sourcePage} sourceEntity={dto.item.title} size="lg" /></div>}
    />
    <article className="container-page pb-12 pt-8 md:pb-16 md:pt-10">
      <Breadcrumb section="Турниры" sectionURL="/tournaments" title={dto.item.title} />
      <TournamentFacts item={dto.item} />
      <section className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
        <article className="se-3 bg-white p-6 md:p-8"><div className="flex items-center gap-3"><span className="se-2 flex h-10 w-10 items-center justify-center bg-surface-muted text-ink"><ClipboardList size={19} /></span><h2 className="type-title-card text-ink">Регламент турнира</h2></div>{dto.item.regulationHTML ? <div className="article-content mt-5 text-ink-soft [&>*:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: dto.item.regulationHTML }} /> : <p className="type-body-sm mt-5 text-ink-soft">Регламент будет опубликован организаторами.</p>}</article>
        <aside className="se-3 bg-white p-6 md:p-8"><div className="flex items-center gap-3"><span className="se-2 flex h-10 w-10 items-center justify-center bg-surface-muted text-ink"><ClipboardCheck size={19} /></span><h2 className="type-title-card text-ink">Перед стартом</h2></div><ul className="mt-6 grid gap-3">{checklist.map((item) => <ChecklistItem key={item}>{item}</ChecklistItem>)}</ul></aside>
      </section>
      {dto.related.length > 0 && <section className="mt-16"><h2 className="type-title-large mb-8">Другие турниры</h2><div className="grid gap-5 md:grid-cols-3">{dto.related.map((item) => <TournamentCard key={item.id} tournament={item} />)}</div></section>}
    </article>
  </SiteFrame>
}

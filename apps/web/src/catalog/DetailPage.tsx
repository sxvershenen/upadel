import type { DetailDTO } from '@unlim/content-contract'

import { ArticleCard } from '../components/cards/ArticleCard'
import { CoachCard } from '../components/cards/CoachCard'
import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'
import { Badge } from '../components/ui/Badge'
import { Price } from '../components/ui/Price'
import { Reveal } from '../components/ui/Reveal'
import { TournamentDetailPage } from './TournamentDetailPage'

function Breadcrumb({ section, sectionURL, title }: { section: string; sectionURL: string; title: string }) {
  return <nav aria-label="Хлебные крошки" className="type-caption mb-8 flex flex-wrap gap-2 text-ink-soft"><a href="/">Главная</a><span>/</span><a href={sectionURL}>{section}</a><span>/</span><span aria-current="page">{title}</span></nav>
}

export function DetailPage({ dto }: { dto: DetailDTO }) {
  if (dto.kind === 'tournaments') {
    return <TournamentDetailPage dto={dto} />
  }

  if (dto.kind === 'blog') return <SiteFrame site={dto.site} backLink={{ href: '/blog' }}><article data-page-enter="surface" className="container-page pb-8 pt-8 md:pb-12"><div className="mx-auto max-w-[960px]"><Breadcrumb section="Блог" sectionURL="/blog" title={dto.item.title} /><div className="flex items-center justify-between gap-4 type-caption text-ink-soft"><span>{dto.item.readingTimeMinutes} мин · {new Date(dto.item.publishedAt).toLocaleDateString('ru-RU')}</span><span className="text-right">{dto.item.category.title}</span></div><h1 className="type-section mt-5">{dto.item.title}</h1><p className="type-editorial mt-6 text-ink-soft">{dto.item.excerpt}</p><ProgressiveImage media={dto.item.image} sizes="(min-width: 1024px) 960px, 100vw" className="se-4 mt-10 aspect-[16/9] w-full object-cover" /><div className="article-content article-prose type-body mx-auto mt-12 max-w-[760px]" dangerouslySetInnerHTML={{ __html: dto.item.contentHTML }} /></div>{dto.related.length > 0 && <section className="mx-auto mt-16 max-w-[1280px]"><h2 className="type-title-large mb-8">Читайте также</h2><div className="grid gap-8 md:grid-cols-3">{dto.related.map((item) => <ArticleCard key={item.id} post={item} loading="lazy" />)}</div></section>}</article></SiteFrame>

  if (dto.kind === 'coaches') {
    const sourcePage = `/coaches/${dto.item.slug}`
    return <SiteFrame site={dto.site} backLink={{ href: '/coaches' }}><article className="container-page pb-8 pt-8 md:pb-12"><div><Breadcrumb section="Тренеры" sectionURL="/coaches" title={dto.item.name} /></div><Reveal><div className="grid gap-10 lg:grid-cols-[minmax(320px,480px)_1fr]"><ProgressiveImage media={dto.item.photo} sizes="(min-width: 1024px) 40vw, 100vw" className="se-4 aspect-[4/5] w-full object-cover" /><div className="flex flex-col justify-center"><Badge tone="lime">{dto.item.specialization}</Badge><h1 className="type-section mt-5">{dto.item.name}</h1><p className="type-editorial mt-6 text-ink-soft">{dto.item.bio}</p><dl className="type-body-sm mt-8 grid gap-3 border-y border-ink/10 py-6"><div className="flex justify-between"><dt>Уровень</dt><dd>{dto.item.level}</dd></div><div className="flex justify-between"><dt>Опыт</dt><dd>{dto.item.experience}</dd></div><div className="flex justify-between"><dt>Языки</dt><dd>{dto.item.languages}</dd></div></dl><div className="mt-6 flex flex-wrap gap-2">{dto.item.certificates.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div><div className="mt-8 flex items-end justify-between gap-4"><Price label="тренировка от" value={dto.item.priceFrom} /><ContentAction action={dto.item.action} sourcePage={sourcePage} sourceEntity={dto.item.name} size="lg" /></div></div></div></Reveal>{dto.related.length > 0 && <Reveal><section className="mt-16"><h2 className="type-title-large mb-8">Другие тренеры</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{dto.related.map((item) => <CoachCard key={item.id} coach={item} />)}</div></section></Reveal>}</article></SiteFrame>
  }

  return null
}

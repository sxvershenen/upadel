import type { PricesPageDTO, ThematicPageDTO, TrainingPageDTO } from '@unlim/content-contract'
import { Calendar, CalendarCheck, Car, Clock, Layers3, Lightbulb, MapPin, PanelTop, RefreshCw, Target, Thermometer, Train, TrendingUp, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

import { MembershipCard } from '../components/cards/MembershipCards'
import { RentalRateCard } from '../components/cards/RentPricingCards'
import { TrainingCard } from '../components/cards/TrainingCard'
import { CourtCard } from '../components/cards/CourtCards'
import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { MobileSwiperNav } from '../components/ui/MobileSwiperNav'
import { horizontalSwiperProps } from '../lib/swiper'
import { springLayout } from '../lib/motion'
import { useMobileSwipeHint } from '../lib/useMobileSwipeHint'
import { GalleryExperience } from './GalleryExperience'
import { PageHeader } from './PageHeader'

function Prices({ dto }: { dto: PricesPageDTO }) {
  const tabs = [{ key: 'rent', label: dto.tabs.rent }, { key: 'training', label: dto.tabs.training }, { key: 'memberships', label: dto.tabs.memberships }] as const
  const standardRates = dto.rentalRates.filter(({ cardVariant }) => cardVariant !== 'trial')
  const trial = dto.rentalRates.find(({ cardVariant }) => cardVariant === 'trial')
  const [active, setActive] = useState<(typeof tabs)[number]['key']>('rent')
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault(); setActive(tabs[next].key); refs.current[next]?.focus()
  }
  return <>
    <div aria-hidden="true" className="h-8 md:hidden" />
    <div className="container-page sticky top-[var(--page-gutter)] z-30 pb-8 md:static md:pb-12 md:pt-8"><div role="tablist" aria-label="Разделы цен" className="grid grid-cols-3 gap-1 rounded-2xl bg-ink p-1 md:mx-auto md:max-w-[760px] md:gap-2 md:p-2">
      {tabs.map((tab, index) => <button key={tab.key} ref={(node) => { refs.current[index] = node }} id={`price-tab-${tab.key}`} role="tab" aria-selected={active === tab.key} aria-controls={`price-panel-${tab.key}`} tabIndex={active === tab.key ? 0 : -1} onKeyDown={(event) => onKeyDown(event, index)} onClick={() => setActive(tab.key)} className={`relative min-h-12 rounded-xl px-2 py-3 type-ui font-semibold transition-colors md:min-h-14 md:px-6 ${active === tab.key ? 'text-lime-ink' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>{active === tab.key && <motion.span layoutId="prices-tab-indicator" className="absolute inset-0 rounded-xl bg-lime" transition={springLayout} />}<span className="relative z-10">{tab.label}</span></button>)}
    </div></div>
    <div className="container-page pb-8 md:pb-12">
      <section id="price-panel-rent" role="tabpanel" aria-labelledby="price-tab-rent" hidden={active !== 'rent'}><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{standardRates.map((item) => <RentalRateCard key={item.id} rate={item} />)}</div></section>
      <section id="price-panel-training" role="tabpanel" aria-labelledby="price-tab-training" hidden={active !== 'training'}><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{dto.trainingPrograms.map((item) => <TrainingCard key={item.id} training={item} />)}{trial && <RentalRateCard rate={trial} />}</div></section>
      <section id="price-panel-memberships" role="tabpanel" aria-labelledby="price-tab-memberships" hidden={active !== 'memberships'}><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{dto.memberships.map((item) => <MembershipCard key={item.id} membership={item} />)}</div></section>
      <section className="mt-12 grid gap-4 md:grid-cols-2">{dto.rules.map((rule) => { const Icon = rule.title.toLowerCase().includes('отмен') || rule.title.toLowerCase().includes('перенос') ? RefreshCw : CalendarCheck; return <article key={rule.title} className="se-3 bg-white p-5 md:p-6"><span className="se-2 flex h-9 w-9 items-center justify-center bg-surface-muted text-ink"><Icon size={17} /></span><h2 className="type-title-card mt-4 text-ink">{rule.title}</h2><div className="article-content mt-3 text-ink-soft" dangerouslySetInnerHTML={{ __html: rule.contentHTML }} /></article> })}</section>
    </div>
  </>
}

const trainingIcons = { Target, Calendar, TrendingUp, Users }
const metricIcons = { Layers3, PanelTop, Lightbulb, Thermometer }
const arrivalIcons = { Car, Train, Clock, MapPin }

function TrainingFormats({ dto }: { dto: TrainingPageDTO }) {
  const items = [...dto.programs.map((program) => ({ kind: 'program' as const, item: program })), ...(dto.trial ? [{ kind: 'trial' as const, item: dto.trial }] : [])]
  const swiperRef = useRef<SwiperType | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const swipeHintRef = useMobileSwipeHint(swiperRef)
  const card = (entry: (typeof items)[number]) => entry.kind === 'program'
    ? <TrainingCard training={entry.item} />
    : <RentalRateCard rate={entry.item} sourcePage="/training" sourceEntity={entry.item.title} />

  return <section className="mt-14" aria-labelledby="training-programs-title">
    <div className="mb-7 flex items-end justify-between gap-5">
      <h2 id="training-programs-title" className="type-section text-ink">{dto.programsTitle}</h2>
      <MobileSwiperNav className="lg:hidden" atStart={atStart} atEnd={atEnd} onPrev={() => swiperRef.current?.slidePrev()} onNext={() => swiperRef.current?.slideNext()} />
    </div>
    <div className="hidden gap-4 lg:grid lg:grid-cols-4">{items.map((entry) => <div key={`${entry.kind}-${entry.item.id}`} className="h-full">{card(entry)}</div>)}</div>
    <div ref={swipeHintRef} className="-mx-5 lg:hidden">
      <Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd) }} onSlideChange={(swiper) => { setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd) }} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">
        {items.map((entry) => <SwiperSlide key={`${entry.kind}-${entry.item.id}`} className="!h-auto"><div className="h-full min-h-[500px]">{card(entry)}</div></SwiperSlide>)}
      </Swiper>
    </div>
  </section>
}

function EditorialArticle({ html, eyebrow, title, label }: { html: string; eyebrow: string; title: string; label: string }) {
  if (!html) return null
  const headingId = `${label}-editorial-title`
  return <section className="mt-16 grid gap-6 lg:grid-cols-[.42fr_1.58fr] lg:gap-10" aria-labelledby={headingId}>
    <div className="lg:pt-3"><p className="type-eyebrow text-ink-muted">{eyebrow}</p><h2 id={headingId} className="type-title-large mt-3 text-ink">{title}</h2><div className="mt-6 h-px w-16 bg-ink/20" /></div>
    <div className="article-content se-4 bg-white p-6 text-ink-soft md:p-9 [&_h2]:border-t [&_h2]:border-ink/10 [&_h2]:pt-8 [&_h2:first-child]:border-0 [&_h2:first-child]:pt-0 [&_h3]:text-ink [&_li]:marker:text-ink-muted [&>*:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: html }} />
  </section>
}

function TrainingPage({ dto }: { dto: TrainingPageDTO }) {
  return <article className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
    <section className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start" aria-labelledby="training-infographic-title">
      <div className="se-4 bg-white p-6 md:p-8"><span className="type-eyebrow text-ink-muted">{dto.infographicEyebrow}</span><h2 id="training-infographic-title" className="type-section mt-3 text-ink">{dto.infographicTitle}</h2><p className="type-body mt-4 max-w-[560px] text-ink-soft">{dto.infographicCopy}</p><div className="mt-7"><ContentAction action={dto.action} sourcePage="/training" sourceEntity={dto.infographicTitle} /></div></div>
      <ol className="grid gap-3 sm:grid-cols-2">{dto.blocks.map((block, index) => { const Icon = trainingIcons[block.icon]; return <li key={block.title} className="se-3 bg-white p-5 md:p-6"><div className="flex items-center justify-between"><span className="se-2 flex h-10 w-10 items-center justify-center bg-surface-muted text-ink-soft"><Icon aria-hidden="true" size={19} /></span><span className="type-caption text-ink-muted">0{index + 1}</span></div><h3 className="type-title-card mt-5 text-ink">{block.title}</h3><p className="type-body-sm mt-2 text-ink-soft">{block.body}</p></li> })}</ol>
    </section>
    <TrainingFormats dto={dto} />
    <EditorialArticle html={dto.articleHTML} eyebrow="Методика" title="Как устроены тренировки" label="training" />
  </article>
}

import { GiftLandingPage } from '../landing/GiftLandingPage'

function PageBody({ dto }: { dto: Exclude<ThematicPageDTO, PricesPageDTO> }) {
  if (dto.kind === 'training') return <TrainingPage dto={dto} />
  if (dto.kind === 'gift') return <GiftLandingPage dto={dto} />
  if (dto.kind === 'courts') return <><section className="mesh-dark text-white"><div className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><h2 className="type-section text-white">{dto.infographicTitle}</h2><p className="type-body mt-5 max-w-[520px] text-white/60">{dto.infographicCopy}</p></div><dl className="grid grid-cols-2 gap-3">{dto.metrics.map((metric) => { const Icon = metricIcons[metric.icon]; return <div key={metric.label} className="se-3 bg-white/8 p-5"><Icon size={20} className="text-lime" /><dt className="type-price mt-5 text-white">{metric.value}</dt><dd className="type-caption mt-1 text-white/55">{metric.label}</dd></div> })}</dl></div><div className="mt-12 grid gap-4 md:grid-cols-2">{dto.courts.map((item) => <CourtCard key={item.id} court={item} />)}</div></div></section><section className="container-page overflow-hidden pb-8 pt-8 md:pb-12 md:pt-8"><h2 className="type-section mb-8 text-ink">Корты и пространство клуба</h2><GalleryExperience items={dto.gallery} /></section></>
  if (dto.kind === 'gallery') return <section className="container-page overflow-hidden pb-8 pt-8 md:pb-12 md:pt-8"><GalleryExperience items={dto.gallery} /></section>
  if (dto.kind === 'about') return <div className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><section className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]"><div className="article-content text-ink" dangerouslySetInnerHTML={{ __html: dto.storyHTML }} /><dl className="grid grid-cols-2 gap-3">{dto.stats.map((stat) => <div key={stat.label} className="se-3 bg-white p-5"><dt className="type-price text-ink">{stat.value}</dt><dd className="type-caption mt-1 text-ink-soft">{stat.label}</dd></div>)}</dl></section><section className="mt-12 overflow-hidden"><h2 className="type-section mb-8 text-ink">Инфраструктура клуба</h2><GalleryExperience items={dto.gallery} /></section></div>
  if (dto.kind === 'contacts') { const contact = dto.site.contacts; const mapURL = `https://yandex.ru/map-widget/v1/?ll=${contact.map.longitude}%2C${contact.map.latitude}&z=${contact.map.zoom}&pt=${contact.map.longitude},${contact.map.latitude},pm2rdl`; return <div className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><a href={contact.directionsURL ?? '#'} className="se-3 bg-white p-6"><span className="type-caption text-ink-soft">{contact.labels.address}</span><strong className="type-title-card mt-2 block text-ink">{contact.address}</strong></a><a href={`tel:${contact.phoneValue}`} className="se-3 bg-white p-6"><span className="type-caption text-ink-soft">{contact.labels.phone}</span><strong className="type-title-card mt-2 block text-ink">{contact.phoneDisplay}</strong></a><a href={`mailto:${contact.email}`} className="se-3 bg-white p-6"><span className="type-caption text-ink-soft">{contact.labels.email}</span><strong className="type-title-card mt-2 block text-ink">{contact.email}</strong></a></section><section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><iframe title="Карта клуба" src={mapURL} className="se-3 h-[420px] w-full grayscale" loading="lazy" /><div><h2 className="type-section text-ink">{dto.directionsTitle}</h2><p className="type-body mt-4 text-ink-soft">{dto.directionsText}</p><div className="mt-6 grid gap-3">{dto.arrivalNotes.map((note) => { const Icon = arrivalIcons[note.icon]; return <article key={note.title} className="se-2 flex gap-4 bg-white p-5"><Icon className="shrink-0 text-ink-soft" size={20} /><div><h3 className="type-ui font-semibold">{note.title}</h3><p className="type-body-sm mt-1 text-ink-soft">{note.text}</p></div></article> })}</div></div></section></div> }
  return <article className="container-page pb-8 pt-8 md:pb-12 md:pt-8"><div className="mx-auto max-w-[860px]">{!dto.approved && <div role="status" className="se-2 bg-lime-soft p-5 type-body-sm text-ink"><strong className="block">Документ ожидает согласования</strong><span>{dto.notice}</span></div>}<div className={`article-content text-ink ${dto.approved ? '' : 'mt-10'}`} dangerouslySetInnerHTML={{ __html: dto.contentHTML }} /></div></article>
}

export function ThematicPage({ dto, publicOrigin }: { dto: ThematicPageDTO; publicOrigin?: string }) {
  if (dto.kind === 'gift') {
    return (
      <SiteFrame site={dto.site}>
        <GiftLandingPage dto={dto} publicOrigin={publicOrigin} />
      </SiteFrame>
    )
  }
  const ownsPageEntrance = dto.kind === 'prices' || dto.kind === 'training'
  return <SiteFrame site={dto.site}><PageHeader page={dto.page} /><div data-page-enter="content" data-page-enter-owner={ownsPageEntrance ? 'true' : undefined} style={{ '--page-enter-delay': '160ms' } as CSSProperties}>{dto.kind === 'prices' ? <Prices dto={dto} /> : <PageBody dto={dto} />}</div></SiteFrame>
}

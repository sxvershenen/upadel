import { TermsList } from '../components/TermsList'
import type { PricesPageDTO, ThematicPageDTO } from '@unlim/content-contract'
import { CalendarCheck, ClipboardCheck, CreditCard, PackageCheck, RefreshCw, ShowerHead, Car, Clock, Layers3, Lightbulb, MapPin, PanelTop, Thermometer, Train } from 'lucide-react'
import { useRef, useState, type CSSProperties } from 'react'

import { MembershipCard } from '../components/cards/MembershipCards'
import { RentalRateCard } from '../components/cards/RentPricingCards'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { CourtCard } from '../components/cards/CourtCards'
import { SiteFrame } from '../components/SiteFrame'
import { Accordion } from '../components/ui/Accordion'
import { Typography } from '../components/ui/Typography'
import { Tabs } from '../components/ui/Tabs'
import { horizontalSwiperProps } from '../lib/swiper'
import { useMobileSwipeHint } from '../lib/useMobileSwipeHint'
import { GalleryExperience } from './GalleryExperience'
import { PageHeader } from './PageHeader'

export function Prices({ dto }: { dto: PricesPageDTO }) {
  const tabs = [
    { id: 'rent' as const, label: dto.tabs.rent, panelId: 'price-panel-rent' },
    ...(dto.memberships.length ? [{ id: 'memberships' as const, label: dto.tabs.memberships, panelId: 'price-panel-memberships' }] : []),
  ]
  const offers = dto.membershipOffer.enabled ? [{ id: 'membership-offer', title: dto.membershipOffer.title, eyebrow: dto.membershipOffer.eyebrow, description: dto.membershipOffer.description, priceLabel: dto.membershipOffer.priceLabel, price: null, priceSuffix: null, timeLabel: null, badge: null, badgeTone: null, meshTone: dto.membershipOffer.meshTone, includedItems: [], action: dto.membershipOffer.action, cardVariant: 'membership-offer' as const }] : []
  const standards = dto.rentalStandards.enabled ? { id: 'rental-standards', title: dto.rentalStandards.title, eyebrow: dto.rentalStandards.eyebrow, description: dto.rentalStandards.description, priceLabel: null, price: null, priceSuffix: null, timeLabel: dto.rentalStandards.timeLabel, badge: null, badgeTone: null, meshTone: dto.rentalStandards.meshTone, includedItems: dto.rentalStandards.includedItems, action: { mode: 'none' as const }, cardVariant: 'standards' as const } : undefined
  const rentSwiperRef = useRef<SwiperType | null>(null)
  const membershipsSwiperRef = useRef<SwiperType | null>(null)
  const rentSwipeHintRef = useMobileSwipeHint(rentSwiperRef, 'prices-rent')
  const membershipsSwipeHintRef = useMobileSwipeHint(membershipsSwiperRef, 'prices-memberships')
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('rent')
  const visibleActive = dto.memberships.length ? active : 'rent'
  return <>
    {tabs.length > 1 && <><div aria-hidden="true" className="h-8 md:hidden" />
    <div className="container-page sticky top-[var(--page-gutter)] z-30 pb-8 md:static md:pb-12 md:pt-8">
      <Tabs reveal={false} layoutId="prices-tabs" aria-label="Разделы цен" tabs={tabs} value={visibleActive} onChange={setActive} className="w-full [&>button]:flex-1 md:w-auto md:[&>button]:flex-none" />
    </div></>}
    <div className="container-page pt-8 pb-8 md:pb-12">
      <section id="price-panel-rent" role={tabs.length > 1 ? 'tabpanel' : undefined} aria-label={dto.tabs.rent} hidden={visibleActive !== 'rent'}>
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(320px,1fr)_auto]">
          {dto.rentalRates.map((rate) => <div key={rate.id} className="hidden lg:col-span-4 lg:row-start-1 lg:block"><RentalRateCard rate={rate} sourcePage="/prices" /></div>)}
          <div ref={rentSwipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { rentSwiperRef.current = swiper }} slidesPerView={1} spaceBetween={12} className="swiper-breathe pricing-rent-swiper !px-5">{dto.rentalRates.map((rate) => <SwiperSlide key={rate.id} className="!h-auto"><RentalRateCard rate={rate} sourcePage="/prices" layout="compact" /></SwiperSlide>)}</Swiper></div>
          {offers.map((offer) => <div key={offer.id} className="lg:col-span-8 lg:row-start-2"><RentalRateCard rate={{ ...offer, action: dto.membershipOffer.action }} sourcePage="/prices" layout="strip" /></div>)}
          {standards && <div className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1"><RentalRateCard rate={standards} sourcePage="/prices" /></div>}
        </div>
      </section>
      <section id="price-panel-memberships" role={tabs.length > 1 ? 'tabpanel' : undefined} aria-label={dto.tabs.memberships} hidden={visibleActive !== 'memberships'}>
        <div className="hidden gap-4 lg:grid lg:grid-cols-4">{dto.memberships.map((item) => <MembershipCard key={item.id} membership={item} />)}</div>
        <div ref={membershipsSwipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { membershipsSwiperRef.current = swiper }} slidesPerView={1} spaceBetween={12} className="swiper-breathe pricing-memberships-swiper !px-5">{dto.memberships.map((item) => <SwiperSlide key={item.id} className="!h-auto"><MembershipCard membership={item} /></SwiperSlide>)}</Swiper></div>
      </section>
      <section className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-ink/10" aria-label={dto.termsTitle}>
        <div className="lg:pr-16">
          <Typography as="h2" role="section" className="font-semibold text-ink">{dto.termsTitle}</Typography>
          <TermsList items={dto.rules.map((rule) => ({ ...rule, icon: ({ CreditCard, CalendarCheck, RefreshCw, PackageCheck, ShowerHead, ClipboardCheck } as Record<string, typeof CreditCard>)[rule.icon ?? ''] ?? ClipboardCheck }))} />
        </div>
        <div className="lg:pl-16"><Typography as="h2" role="section" className="font-semibold text-ink">{dto.faqTitle}</Typography><div className="mt-8"><Accordion items={(dto.faq ?? []).map(({ question, answer }) => ({ q: question, a: answer }))} /></div></div>
      </section>
    </div>
  </>
}

import { GiftLandingPage } from '../landing/GiftLandingPage'
import { TrainingPage } from './TrainingPage'

const metricIcons = { Layers3, PanelTop, Lightbulb, Thermometer }
const arrivalIcons = { Car, Train, Clock, MapPin }

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

import type { PricesPageDTO, ThematicPageDTO } from '@unlim/content-contract'
import { CalendarCheck, Car, Clock, Layers3, Lightbulb, MapPin, PanelTop, RefreshCw, Thermometer, Train } from 'lucide-react'
import { useState, type CSSProperties } from 'react'

import { MembershipCard } from '../components/cards/MembershipCards'
import { RentalRateCard } from '../components/cards/RentPricingCards'
import { CourtCard } from '../components/cards/CourtCards'
import { SiteFrame } from '../components/SiteFrame'
import { Tabs } from '../components/ui/Tabs'
import { GalleryExperience } from './GalleryExperience'
import { PageHeader } from './PageHeader'

export function Prices({ dto }: { dto: PricesPageDTO }) {
  const tabs = [
    { id: 'rent' as const, label: dto.tabs.rent, panelId: 'price-panel-rent' },
    { id: 'memberships' as const, label: dto.tabs.memberships, panelId: 'price-panel-memberships' },
  ]
  const standardRates = dto.rentalRates.filter(({ cardVariant }) => cardVariant !== 'trial')
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('rent')
  return <>
    <div aria-hidden="true" className="h-8 md:hidden" />
    <div className="container-page sticky top-[var(--page-gutter)] z-30 pb-8 md:static md:pb-12 md:pt-8">
      <Tabs fullWidth reveal={false} layoutId="prices-tabs" aria-label="Разделы цен" tabs={tabs} value={active} onChange={setActive} />
    </div>
    <div className="container-page pb-8 md:pb-12">
      <section id="price-panel-rent" role="tabpanel" aria-label={dto.tabs.rent} hidden={active !== 'rent'}><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{standardRates.map((item) => <RentalRateCard key={item.id} rate={item} />)}</div></section>
      <section id="price-panel-memberships" role="tabpanel" aria-label={dto.tabs.memberships} hidden={active !== 'memberships'}><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{dto.memberships.map((item) => <MembershipCard key={item.id} membership={item} />)}</div></section>
      <section className="mt-12 grid gap-4 md:grid-cols-2">{dto.rules.map((rule) => { const Icon = rule.title.toLowerCase().includes('отмен') || rule.title.toLowerCase().includes('перенос') ? RefreshCw : CalendarCheck; return <article key={rule.title} className="se-3 bg-white p-5 md:p-6"><span className="se-2 flex h-9 w-9 items-center justify-center bg-surface-muted text-ink"><Icon size={17} /></span><h2 className="type-title-card mt-4 text-ink">{rule.title}</h2><div className="article-content mt-3 text-ink-soft" dangerouslySetInnerHTML={{ __html: rule.contentHTML }} /></article> })}</section>
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

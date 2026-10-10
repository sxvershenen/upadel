import { CalendarDays, CheckCircle2, Gauge, Medal, PartyPopper, Trophy } from 'lucide-react'
import type { HomepageDTO, TournamentCatalogItem } from '@unlim/content-contract'
import { ArrowAction } from '../ui/ArrowAction'
import { Badge } from '../ui/Badge'
import { ImageCard, MeshCard, type ImageOverlay, type MeshTone } from '../ui/Card'
import { Price } from '../ui/Price'
import type { RevealConfig } from '../ui/revealAttributes'

export type Tournament = HomepageDTO['entities']['tournaments'][number] & Partial<Pick<TournamentCatalogItem, 'lifecycle'>>
const icons = { PartyPopper, Trophy, Medal } as const

function MetaRow({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="type-caption flex items-center gap-2 text-white/75"><span className="shrink-0">{icon}</span><span>{text}</span></div> }

export function tournamentCardHref(tournament: Tournament): string | null {
  if (tournament.cardLinkEnabled === false) return null
  if (tournament.cardURL) {
    try { return new URL(tournament.cardURL).protocol === 'https:' ? tournament.cardURL : null } catch { return null }
  }
  return tournament.slug ? `/tournaments/${tournament.slug}` : null
}

function TournamentBody({ tournament, linked }: { tournament: Tournament; linked: boolean }) {
  const Icon = icons[tournament.icon] ?? Trophy
  const completed = tournament.lifecycle === 'finished' || tournament.lifecycle === 'cancelled'
  return <div className="relative flex h-full flex-col p-6 md:p-7">
    <div className="flex items-start justify-between gap-3">{tournament.formatLabel && <Badge tone="glass" icon={<Icon size={14} />}>{tournament.formatLabel}</Badge>}{completed && <Badge tone="glass" icon={<CheckCircle2 size={14} />}>Завершено</Badge>}</div>
    <div className="mt-auto"><h3 className="type-title-large text-white">{tournament.title}</h3>
      {(tournament.scheduleLabel || tournament.levelLabel) && <div className="mt-5 flex flex-col gap-2">{tournament.scheduleLabel && <MetaRow icon={<CalendarDays size={14} />} text={tournament.scheduleLabel} />}{tournament.levelLabel && <MetaRow icon={<Gauge size={14} />} text={`Уровень ${tournament.levelLabel}`} />}</div>}
      <p className="type-body-sm mt-5 text-white/80">{tournament.description}</p>
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-4"><div>{tournament.entryFee && <Price value={tournament.entryFee} tone="light" />}{tournament.prize && <p className="type-caption mt-2 text-white/70">{tournament.prizeLabel}: {tournament.prize}</p>}</div>{linked && <ArrowAction tone="glass" size="sm" cardHover />}</div>
    </div>
  </div>
}

export function TournamentCard({ tournament, loading = 'eager', reveal = true }: { tournament: Tournament; loading?: 'eager' | 'lazy'; reveal?: RevealConfig }) {
  const href = tournamentCardHref(tournament)
  const body = <TournamentBody tournament={tournament} linked={Boolean(href)} />
  const card = tournament.visualStyle === 'image' && tournament.image
    ? <ImageCard interactive={Boolean(href)} parallax loading={loading} reveal={reveal} media={tournament.image} src={tournament.image.url} alt={tournament.image.alt} overlay={(tournament.imageOverlay ?? 'overlay-dark') as ImageOverlay} className="aspect-[3/4] h-full">{body}</ImageCard>
    : <MeshCard interactive={Boolean(href)} reveal={reveal} tone={(tournament.meshStyle ?? 'deep-blue') as MeshTone} className="aspect-[3/4] h-full">{body}</MeshCard>
  return href ? <a href={href} target={href.startsWith('https:') ? '_blank' : undefined} rel={href.startsWith('https:') ? 'noreferrer' : undefined} className="block h-full">{card}</a> : <div className="h-full">{card}</div>
}

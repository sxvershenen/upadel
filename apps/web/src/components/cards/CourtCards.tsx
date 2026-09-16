import type { HomepageDTO } from '@unlim/content-contract'
import { Activity, Layers3, Lightbulb, PanelTop, ShieldCheck } from 'lucide-react'

import { cn } from '../../utils/cn'
import { ArrowAction } from '../ui/ArrowAction'
import { GlassCard } from '../ui/Card'

type Court = HomepageDTO['entities']['courts'][number]
const icons = { Activity, Layers3, Lightbulb, PanelTop }

function CourtIcon({ children }: { children: React.ReactNode }) {
  return <span className="se-2 flex h-10 w-10 items-center justify-center bg-white/10 text-white/75">{children}</span>
}

export function CourtCard({ court }: { court: Court }) {
  if (court.cardVariant === 'metrics') return <GlassCard className="grid h-full grid-cols-2 p-2">{(court.metrics ?? []).map((metric, index) => { const Icon = icons[metric.icon]; return <div key={metric.label} className={cn("flex flex-col justify-center gap-1 p-6", index % 2 === 0 && "border-r border-white/10", index < 2 && "border-b border-white/10")}><span className="se-2 mb-3 flex h-8 w-8 items-center justify-center bg-white/10 text-white/70"><Icon size={17} /></span><span className="type-price font-semibold text-white/90">{metric.value}</span><span className="type-caption text-white/50">{metric.label}</span></div> })}</GlassCard>
  const Icon = court.cardVariant === 'damping' ? Activity : court.cardVariant === 'surface' ? ShieldCheck : PanelTop
  const linked = court.cardVariant === 'panoramic'
  return <GlassCard className="relative flex h-full flex-col justify-between gap-8 p-7 md:p-9">{linked && <a href="/padel-court-zakaz" data-analytics-action="internal" data-analytics-object-type="court" data-analytics-object-id={court.slug} className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-[-3px]"><span className="sr-only">Подробнее о кортах JUBO и монтаже под ключ</span></a>}<div className="relative z-0 flex items-start justify-between gap-4"><CourtIcon><Icon size={18} /></CourtIcon><span className="type-eyebrow pt-2 text-white/45">{court.eyebrow}</span></div><div className={cn('relative z-0', linked && 'pr-12')}><h3 className={court.cardVariant === 'panoramic' ? 'type-title-large max-w-[420px] text-white/90' : 'type-title-dense font-semibold text-white/90'}>{court.title}</h3><p className="type-body-sm mt-3 max-w-[440px] text-white/55">{court.description}</p></div>{linked && <span className="pointer-events-none absolute bottom-6 right-6 z-20 md:bottom-7 md:right-7"><ArrowAction tone="glass" size="sm" className="!bg-white/10 !text-white !backdrop-blur-md group-hover/card:!bg-white group-hover/card:!text-ink" /></span>}</GlassCard>
}

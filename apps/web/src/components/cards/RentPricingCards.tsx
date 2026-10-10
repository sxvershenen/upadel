import type { HomepageDTO } from '@unlim/content-contract'
import { Check } from 'lucide-react'
import { ArrowAction } from '../ui/ArrowAction'
import { Badge, type BadgeTone } from '../ui/Badge'
import { MeshCard, WhiteCard, type MeshTone } from '../ui/Card'
import { Price } from '../ui/Price'
import { Typography } from '../ui/Typography'
import { CardAction } from './CardAction'

export type RentalRate = HomepageDTO['entities']['rentalRates'][number]

export function RentalRateCard({ rate, sourcePage, layout = 'compact' }: { rate: RentalRate; sourceEntity?: string; sourcePage?: string; layout?: 'wide' | 'compact' }) {
  let card
  if (rate.cardVariant === 'trial') {
    card = <MeshCard interactive={false} reveal={false} tone={(rate.meshTone ?? 'deep-blue') as MeshTone} className={`relative flex h-full flex-col justify-between overflow-hidden p-6 text-white md:p-7 ${layout === 'wide' ? 'min-h-[270px]' : 'min-h-[500px]'}`}>
      <Typography reveal={false} role="eyebrow" className="text-white/65">{rate.eyebrow}</Typography>
      <div className="mt-7"><Typography reveal={false} as="h3" role="title-card" className="text-white">{rate.title}</Typography><Typography reveal={false} role="body-small" className="mt-3 text-white/75">{rate.description}</Typography></div>
      <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/15 pt-5">
        {rate.price != null ? <Price label={rate.priceLabel ?? ''} value={rate.price} suffix={rate.priceSuffix ?? undefined} tone="light" /> : <Typography reveal={false} role="title-card" className="text-white">{rate.priceLabel}</Typography>}
        <ArrowAction tone="glass" size="sm" cardHover />
      </div>
    </MeshCard>
  } else if (rate.cardVariant === 'standards') {
    card = <MeshCard interactive={false} reveal={false} tone={(rate.meshTone ?? 'dark') as MeshTone} className="flex h-full min-h-[570px] flex-col p-7 md:p-8"><span className="type-eyebrow text-white/50">{rate.eyebrow}</span><h3 className="type-title-large mt-5 text-white">{rate.title}</h3><span className="type-ui mt-2 block text-white/60">{rate.timeLabel}</span><p className="type-body-sm mt-5 text-white/65">{rate.description}</p><ul className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-7">{rate.includedItems.map((item) => <li key={item} className="type-body-sm flex items-start gap-3 text-white/80"><span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-white/10 text-white/75"><Check size={15} /></span>{item}</li>)}</ul><div className="mt-auto flex justify-end pt-6"><ArrowAction tone="glass" /></div></MeshCard>
  } else {
    card = <WhiteCard interactive={false} reveal={false} className={`flex h-full ${layout === 'wide' ? 'min-h-[270px]' : 'min-h-[360px]'} flex-col justify-between p-7 md:p-8`}><div className="flex items-start justify-between gap-3"><span className="type-eyebrow text-ink-soft">{rate.eyebrow}</span>{rate.badge && <Badge tone={rate.badgeTone as BadgeTone}>{rate.badge}</Badge>}</div><div className="mt-6"><h3 className="type-title-large text-ink">{rate.title}</h3><span className="type-ui mt-2 block text-ink-soft">{rate.timeLabel}</span><p className="type-body-sm mt-4 max-w-[410px] text-ink-soft">{rate.description}</p></div><div className="mt-8 flex items-end justify-between border-t border-ink/10 pt-5">{rate.price != null ? <Price label={rate.priceLabel ?? ''} value={rate.price} suffix={rate.priceSuffix ?? undefined} /> : rate.priceLabel && <Price value={rate.priceLabel} />}<ArrowAction tone="light" cardHover className="bg-surface-muted text-ink" /></div></WhiteCard>
  }
  return <CardAction action={rate.action} title={rate.title} sourcePage={sourcePage}>{card}</CardAction>
}

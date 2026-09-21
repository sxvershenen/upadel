import type { HomepageDTO } from '@unlim/content-contract'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'

import { springSoft } from '../../lib/motion'
import { ArrowAction } from '../ui/ArrowAction'
import { Badge, type BadgeTone } from '../ui/Badge'
import { ContentAction } from '../ContentAction'
import { Button } from '../ui/Button'
import { MeshCard, WhiteCard, type MeshTone } from '../ui/Card'
import { Price } from '../ui/Price'

export type RentalRate = HomepageDTO['entities']['rentalRates'][number]

export function RentalRateCard({ rate, sourceEntity, sourcePage }: { rate: RentalRate; sourceEntity?: string; sourcePage?: string }) {
  if (rate.cardVariant === 'trial') return <MeshCard reveal={false} tone={(rate.meshTone ?? 'deep-blue') as MeshTone} className="relative flex h-full min-h-[240px] flex-col overflow-hidden p-7 text-white md:p-8"><motion.img src="/padel-racket.webp" alt="" aria-hidden="true" variants={{ rest: { scale: 1, rotate: 7, y: 0 }, hover: { scale: 1.05, rotate: 3, y: -6 } }} transition={springSoft} className="pointer-events-none absolute -bottom-28 right-[9%] z-0 h-[300px] w-auto opacity-95" /><motion.img src="/padel-ball.webp" alt="" aria-hidden="true" variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.08, y: -5 } }} transition={springSoft} className="pointer-events-none absolute -bottom-20 -right-6 z-0 h-[190px] w-auto opacity-95" /><div className="relative z-10 max-w-[82%] md:max-w-[60%]"><span className="type-eyebrow text-white/65">{rate.eyebrow}</span><h3 className="type-title-large mt-4 text-white">{rate.title}</h3><p className="type-body-sm mt-2 text-white/75">{rate.description}</p><ContentAction action={rate.action} sourcePage={sourcePage} sourceEntity={sourceEntity ?? rate.title} variant="primary" size="md" icon={<ArrowRight size={17} />} className="mt-5">Записаться на пробную</ContentAction></div></MeshCard>

  if (rate.cardVariant === 'standards') return <MeshCard reveal={false} tone={(rate.meshTone ?? 'dark') as MeshTone} className="flex h-full min-h-[570px] flex-col p-7 md:p-8"><span className="type-eyebrow text-white/50">{rate.eyebrow}</span><h3 className="type-title-large mt-5 text-white">{rate.title}</h3><span className="type-ui mt-2 text-white/60">{rate.timeLabel}</span><p className="type-body-sm mt-5 text-white/65">{rate.description}</p><ul className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-7">{rate.includedItems.map((item) => <li key={item} className="type-body-sm flex items-center gap-3 text-white/80"><span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-white/10 text-white/75"><Check size={15} /></span>{item}</li>)}</ul><Button variant="secondary" size="md" fullWidth icon={<ArrowRight size={17} />} iconDivider={false} className="mt-auto hover:!bg-lime hover:!text-ink">{rate.action.label}</Button></MeshCard>

  return <WhiteCard reveal={false} className="flex h-full min-h-[360px] flex-col justify-between p-7 md:p-8"><div className="flex items-start justify-between gap-3"><span className="type-eyebrow text-ink-soft">{rate.eyebrow}</span>{rate.badge && <Badge tone={rate.badgeTone as BadgeTone}>{rate.badge}</Badge>}</div><div className="mt-6"><h3 className="type-title-large text-ink">{rate.title}</h3><span className="type-ui mt-2 block text-ink-soft">{rate.timeLabel}</span><p className="type-body-sm mt-4 max-w-[410px] text-ink-soft">{rate.description}</p></div><div className="mt-8 flex items-end justify-between border-t border-ink/10 pt-5">{rate.price != null && <Price label={rate.priceLabel ?? ''} value={rate.price} suffix={rate.priceSuffix ?? undefined} />}<ArrowAction tone="light" cardHover className="bg-surface-muted text-ink" /></div></WhiteCard>
}

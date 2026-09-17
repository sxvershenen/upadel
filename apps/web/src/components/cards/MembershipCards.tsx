import type { HomepageDTO } from '@unlim/content-contract'
import { ArrowUpRight, Check, CreditCard, Crown, Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

import { cn } from '../../utils/cn'
import { springSoft } from '../../lib/motion'
import { ContentAction } from '../ContentAction'
import { Badge, type BadgeTone } from '../ui/Badge'
import { MeshCard, WhiteCard, type MeshTone } from '../ui/Card'
import { Field } from '../ui/Field'
import { Price } from '../ui/Price'

type Membership = HomepageDTO['entities']['memberships'][number]

function CheckItem({ children, featured, inverse }: { children: React.ReactNode; featured?: boolean; inverse?: boolean }) {
  return <li className={cn("type-body-sm flex items-center gap-3 leading-snug", inverse ? "text-white/80" : "text-ink-soft")}><span className={cn("se-1 flex h-7 w-7 shrink-0 items-center justify-center", inverse ? "bg-gold text-gold-ink" : featured ? "bg-lime text-[#244500]" : "bg-[#f1f1f1] text-ink")}><Check size={15} strokeWidth={2.4} /></span><span>{children}</span></li>
}

function MembershipFooter({ membership, resident }: { membership: Membership; resident?: boolean }) {
  if (membership.price == null) return null
  return <div className={cn("mt-auto flex items-end justify-between gap-3 border-t pt-5", resident ? "border-white/10" : "border-ink/10")}><Price label={membership.priceLabel ?? "месяц за"} value={membership.price} oldValue={membership.oldPrice ?? undefined} tone={resident ? "light" : "dark"} /><ContentAction action={membership.action} sourceEntity={membership.title} icon={<ArrowUpRight size={18} />} iconOnly aria-label={membership.action.label ?? membership.title} variant={resident ? "glass" : "neutral"} size="sm" className={cn("!h-[var(--control-sm)] !w-[var(--control-sm)] !p-0 hover:!bg-lime hover:!text-ink group-hover/card:!bg-lime group-hover/card:!text-ink", resident ? "!bg-white !text-ink hover:!bg-gold hover:!text-gold-ink group-hover/card:!bg-gold group-hover/card:!text-gold-ink" : "!bg-control !text-ink")} /></div>
}

export function MembershipCard({ membership }: { membership: Membership }) {
  const [amount, setAmount] = useState("5000")
  if (membership.cardVariant === 'gift') {
    const numeric = Number(amount || 0)
    const minimum = membership.giftAmountLimits?.minimum ?? 1000
    const maximum = membership.giftAmountLimits?.maximum ?? 100000
    const invalid = numeric > 0 && (numeric < minimum || numeric > maximum)
    return <MeshCard tone={(membership.meshTone ?? 'lavender') as MeshTone} className="flex h-[500px] min-h-[500px] flex-col justify-between p-6 text-white md:p-7"><div className="flex items-start justify-between"><span className="se-2 flex h-11 w-11 items-center justify-center bg-white/15 text-white"><Gift size={20} /></span></div><div className="mt-7"><h3 className="type-title-card text-white">{membership.title}</h3><p className="type-body-sm mt-2 max-w-[300px] text-white/75">{membership.description}</p></div><div className="mt-6"><Field label="Введите сумму" tone="dark" inputMode="numeric" pattern="[0-9]*" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="0" suffix="₽" error={invalid ? `Сумма от ${minimum.toLocaleString('ru-RU')} до ${maximum.toLocaleString('ru-RU')} ₽` : undefined} /><ContentAction action={membership.action} sourceEntity={`${membership.title}: ${amount || 0} ₽`} variant="secondary" size="md" fullWidth className="mt-4" disabled={invalid}>{membership.action.label}</ContentAction></div></MeshCard>
  }

  const resident = membership.cardVariant === 'resident'
  const featured = membership.cardVariant === 'featured-package'
  const body = <><div className="flex items-start justify-between gap-4"><span className={cn("se-2 flex h-11 w-11 items-center justify-center", resident ? "bg-[#6e5416] text-gold" : featured ? "bg-lime-soft text-lime-soft-ink" : "bg-[#f1f1f1] text-ink")}>{resident ? <Crown size={20} strokeWidth={1.8} /> : <CreditCard size={20} strokeWidth={1.8} />}</span>{membership.badge && <Badge tone={membership.badgeTone as BadgeTone}>{membership.badge}</Badge>}</div><div className="mt-7 flex-1"><h3 className={cn("type-title-card", resident ? "text-white" : "text-ink")}>{membership.title}</h3><p className={cn("type-body-sm mt-2", resident ? "text-white/60" : "text-ink-soft")}>{membership.description}</p><ul className="mt-7 flex flex-col gap-2">{membership.benefits.map((benefit) => <CheckItem key={benefit} featured={featured} inverse={resident}>{benefit}</CheckItem>)}</ul></div><MembershipFooter membership={membership} resident={resident} /></>
  if (resident) return <MeshCard tone="dark" className="flex h-[500px] min-h-[500px] flex-col p-6 md:p-7">{body}</MeshCard>
  const card = <WhiteCard interactive={!featured} className="flex h-full min-h-[500px] flex-col p-6 md:p-7">{body}</WhiteCard>
  return featured ? <motion.div initial="rest" whileHover="hover" variants={{ rest: { y: 0, scale: 1 }, hover: { y: -5, scale: 1.012 } }} transition={springSoft} className="group/card card-spring relative h-[500px] min-h-[500px] pt-1"><Badge tone="lime" className="se-full absolute -top-2 left-1/2 z-20 -translate-x-1/2 px-4">Хит сезона</Badge>{card}</motion.div> : <div className="h-[500px] min-h-[500px]">{card}</div>
}

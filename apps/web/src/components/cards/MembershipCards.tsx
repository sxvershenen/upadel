import type { HomepageDTO } from '@unlim/content-contract'
import { Check, CreditCard, Crown, Gift } from 'lucide-react'
import { useState } from 'react'

import { cn } from '../../utils/cn'
import { CardAction } from './CardAction'
import { ArrowAction } from '../ui/ArrowAction'
import { ContentAction } from '../ContentAction'
import { Badge, type BadgeTone } from '../ui/Badge'
import { MeshCard, WhiteCard, type MeshTone } from '../ui/Card'
import { Field } from '../ui/Field'
import { formatRub, Price } from '../ui/Price'

type Membership = HomepageDTO['entities']['memberships'][number]

export function membershipAmountSource(title: string, amount: number) {
  return `${title} — сумма ${formatRub(amount)}`
}

function CheckItem({ children, featured, inverse }: { children: React.ReactNode; featured?: boolean; inverse?: boolean }) {
  return <li className={cn("type-body-sm flex items-center gap-3 leading-snug", inverse ? "text-white/80" : "text-ink-soft")}><span className={cn("se-1 flex h-7 w-7 shrink-0 items-center justify-center", inverse ? "bg-gold text-gold-ink" : featured ? "bg-lime text-[#244500]" : "bg-[#f1f1f1] text-ink")}><Check size={15} strokeWidth={2.4} /></span><span>{children}</span></li>
}

function MembershipFooter({ membership, resident }: { membership: Membership; resident?: boolean }) {
  if (membership.price == null && !membership.priceLabel) return null
  const value = membership.price == null
    ? <div className="flex flex-col gap-0.5"><strong className={cn("type-price font-semibold", resident ? "text-white" : "text-ink")}>{membership.priceLabel}</strong></div>
    : <Price label={membership.priceLabel ?? "месяц за"} value={membership.price} oldValue={membership.oldPrice ?? undefined} tone={resident ? "light" : "dark"} />
  return <div className={cn("mt-auto flex items-end justify-between gap-3 border-t pt-5", resident ? "border-white/10" : "border-ink/10")}>{value}<ArrowAction tone={resident ? "glass" : "light"} size="sm" cardHover /></div>
}

export function MembershipCard({ membership }: { membership: Membership }) {
  const [amount, setAmount] = useState("5000")
  if (membership.cardVariant === 'gift') {
    const numeric = Number(amount || 0)
    const minimum = membership.giftAmountLimits?.minimum ?? 1000
    const maximum = membership.giftAmountLimits?.maximum ?? 100000
    const invalid = numeric > 0 && (numeric < minimum || numeric > maximum)
    return <MeshCard reveal={false} tone={(membership.meshTone ?? 'lavender') as MeshTone} className="flex h-[500px] min-h-[500px] flex-col justify-between p-6 text-white md:p-7"><div className="flex items-start justify-between"><span className="se-2 flex h-11 w-11 items-center justify-center bg-white/15 text-white"><Gift size={20} /></span></div><div className="mt-7"><h3 className="type-title-card text-white">{membership.title}</h3><p className="type-body-sm mt-2 max-w-[300px] text-white/75">{membership.description}</p></div><div className="mt-6"><Field label="Введите сумму" labelVisibility="sr-only" tone="dark" inputMode="numeric" pattern="[0-9]*" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="0" suffix="₽" error={invalid ? `Сумма от ${minimum.toLocaleString('ru-RU')} до ${maximum.toLocaleString('ru-RU')} ₽` : undefined} /><ContentAction action={membership.action} sourceEntity={membershipAmountSource(membership.title, numeric || 0)} variant="secondary" size="md" fullWidth className="mt-4" disabled={invalid}>{membership.action.label}</ContentAction></div></MeshCard>
  }

  const resident = membership.cardVariant === 'resident'
  const featured = membership.cardVariant === 'featured-package'
  const body = <><div className="flex items-start justify-between gap-4"><span className={cn("se-2 flex h-11 w-11 items-center justify-center", resident ? "bg-gold text-gold-ink" : featured ? "bg-lime-soft text-lime-soft-ink" : "bg-[#f1f1f1] text-ink")}>{resident ? <Crown size={20} strokeWidth={1.8} /> : <CreditCard size={20} strokeWidth={1.8} />}</span>{membership.badge && <Badge tone={membership.badgeTone as BadgeTone}>{membership.badge}</Badge>}</div><div className="mt-7 flex-1"><h3 className={cn("type-title-card", resident ? "text-white" : "text-ink")}>{membership.title}</h3><p className={cn("type-body-sm mt-2", resident ? "text-white/60" : "text-ink-soft")}>{membership.description}</p><ul className="mt-7 flex flex-col gap-2">{membership.benefits.map((benefit) => <CheckItem key={benefit} featured={featured} inverse={resident}>{benefit}</CheckItem>)}</ul></div><MembershipFooter membership={membership} resident={resident} /></>
  if (resident) return <CardAction action={membership.action} title={membership.title}><MeshCard interactive={false} reveal={false} tone="dark" className="flex h-[500px] min-h-[500px] flex-col p-6 md:p-7">{body}</MeshCard></CardAction>
  const card = <WhiteCard reveal={false} interactive={false} className="flex h-full min-h-[500px] flex-col p-6 md:p-7">{body}</WhiteCard>
  const content = featured ? <div data-gsap-reveal-boundary="true" className="group/card card-spring relative h-[500px] min-h-[500px] pt-1"><span className="pointer-events-none absolute inset-x-0 -top-2 z-20 flex justify-center"><Badge tone="lime" className="se-full px-4">Хит сезона</Badge></span>{card}</div> : <div className="h-[500px] min-h-[500px]">{card}</div>
  return <CardAction action={membership.action} title={membership.title}>{content}</CardAction>
}

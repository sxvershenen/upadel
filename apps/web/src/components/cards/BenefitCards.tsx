import type { HomepageDTO } from '@unlim/content-contract'
import { motion } from 'framer-motion'
import { Coffee, CircleParking, ShieldCheck, ShowerHead, Smartphone, Smile, Sparkles } from 'lucide-react'

import { springSoft } from '../../lib/motion'
import { useActionLayer } from '../../actions/ActionLayer'
import { ArrowAction } from '../ui/ArrowAction'
import { Badge } from '../ui/Badge'
import { ImageCard, MeshCard, type ImageOverlay, type MeshTone } from '../ui/Card'

type Benefit = HomepageDTO['home']['benefits']['cards'][number]
const decorativeVariants = { rest: { scale: 1, rotate: 0, y: 0 }, hover: { scale: 1.06, rotate: -4, y: -7 } }
const iconMap = { parking: CircleParking, lockers: Sparkles, shower: ShowerHead, chill: Coffee, 'online-booking': Smartphone, 'coaches-metric': Sparkles, 'kids-wide': Smile }

function FeatureArrow({ color }: { color?: string } = {}) {
  return <ArrowAction tone="glass" size="sm" cardHover className={`!bg-[rgba(255,255,255,0.1)] !text-white !backdrop-blur-md group-hover/mesh:!bg-lime group-hover/mesh:!text-ink ${color ?? ''}`} />
}

function ExternalCardTarget({ href, label }: { href: string; label: string }) {
  const { requestExternal } = useActionLayer()
  return <button type="button" aria-label={`Открыть: ${label}`} data-analytics-action="external" data-analytics-object-type="benefit" data-analytics-object-id={label} onClick={() => requestExternal({ href, label })} className="absolute inset-0 z-20 cursor-pointer rounded-[inherit] bg-transparent focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-[-3px]" />
}

function InternalCardTarget({ href, label }: { href: string; label: string }) {
  return <a href={href} aria-label={`Открыть: ${label}`} data-analytics-action="internal" data-analytics-object-type="benefit" data-analytics-object-id={label} className="absolute inset-0 z-20 cursor-pointer rounded-[inherit] focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-[-3px]"><span className="sr-only">{label}</span></a>
}

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const Icon = iconMap[benefit.variant]
  if (benefit.variant === 'lockers' || benefit.variant === 'shower' || benefit.variant === 'chill') {
    if (!benefit.media) return null
    const objectPosition = benefit.variant === 'lockers' ? 'object-[68%_center]' : benefit.variant === 'shower' ? 'object-[68%_center]' : undefined
    const externalAction = benefit.action.mode === 'external-link' && benefit.action.href ? { href: benefit.action.href, label: benefit.title } : null
    return <ImageCard src={benefit.media.url} alt={benefit.media.alt} overlay={benefit.overlay as ImageOverlay} imgClassName={objectPosition} className="h-full min-h-[320px]">{externalAction && <><ExternalCardTarget {...externalAction} /><span className="pointer-events-none absolute bottom-6 right-6 z-20"><FeatureArrow /></span></>}<div className="flex h-full flex-col justify-between p-6 md:p-7"><Badge tone="outline-light" icon={<Icon size={13} />}>{benefit.eyebrow}</Badge><div className={benefit.variant === 'chill' ? 'max-w-[390px]' : externalAction ? 'max-w-[calc(100%-3.5rem)]' : undefined}><h3 className="type-title-card font-semibold text-white">{benefit.title}</h3><p className="type-body-sm mt-2 max-w-[360px] text-white">{benefit.description}</p></div></div></ImageCard>
  }

  const tone = (benefit.meshTone ?? 'sky') as MeshTone
  const color = benefit.variant === 'parking' ? 'text-[#244500]' : benefit.variant === 'coaches-metric' ? 'text-[#5c230f]' : 'text-[#0b3a5c]'
  const iconColor = benefit.variant === 'parking' ? '!text-[#244500]' : benefit.variant === 'coaches-metric' ? '!text-[#5c230f]' : '!text-[#0b3a5c]'
  const bodyColor = benefit.variant === 'parking' ? 'text-[#3f6212]' : benefit.variant === 'coaches-metric' ? 'text-[#7c3f14]' : 'text-[#18527c]'
  const mediaClass = benefit.variant === 'online-booking' ? 'booking-phone -bottom-16 -right-8 h-[240px]' : benefit.variant === 'coaches-metric' ? '-bottom-20 -right-10 h-[330px]' : benefit.variant === 'kids-wide' ? '-bottom-16 -right-8 h-[300px]' : '-bottom-20 -right-10 h-[300px]'
  const internalAction = benefit.variant === 'coaches-metric' && benefit.action.mode === 'internal-link' && benefit.action.href ? { href: benefit.action.href, label: benefit.title } : null
  return <MeshCard tone={tone} className="relative flex h-full min-h-[320px] p-6 md:p-7">{internalAction && <InternalCardTarget {...internalAction} />}{benefit.media && <motion.img src={benefit.media.url} alt="" aria-hidden="true" variants={decorativeVariants} transition={springSoft} className={`pointer-events-none absolute ${mediaClass} z-0 w-auto opacity-100`} />}<div className="relative z-10 flex h-full w-full flex-col"><div className="flex items-start justify-between gap-4"><span className={`type-eyebrow max-w-[70%] ${bodyColor}`}>{benefit.eyebrow}</span><span className={`se-2 flex h-12 w-12 items-center justify-center bg-white/15 ${iconColor}`}><Icon size={22} strokeWidth={1.8} /></span></div><div className={benefit.variant === 'kids-wide' ? 'my-8 max-w-[70%]' : 'absolute inset-x-0 bottom-0'}><div className={benefit.variant === 'parking' ? 'max-w-[62%]' : 'max-w-[68%]'}><h3 className={`type-title-card ${color}`}>{benefit.title}</h3><p className={`type-body-sm mt-2 ${bodyColor}`}>{benefit.description}</p></div></div>{benefit.variant === 'kids-wide' && <div className="mt-auto flex items-center justify-between border-t border-[#2563a3]/20 pt-4"><span className="type-ui flex max-w-[64%] items-center gap-2 font-semibold text-[#18527c]"><ShieldCheck className={iconColor} size={17} /> {benefit.supportingText}</span></div>}{benefit.variant === 'online-booking' && <span className="absolute bottom-0 right-0"><FeatureArrow color={iconColor} /></span>}{benefit.variant === 'coaches-metric' && <span className="absolute bottom-0 right-0"><FeatureArrow color={iconColor} /></span>}</div></MeshCard>
}

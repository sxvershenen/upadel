import type { HomepageDTO } from '@unlim/content-contract'
import { Coffee, CircleParking, ShieldCheck, ShowerHead, Smartphone, Smile, Sparkles, Users } from 'lucide-react'
import React from 'react'

import { springSoft } from '../../lib/motion'
import { useActionLayer } from '../../actions/ActionLayer'
import { ArrowAction } from '../ui/ArrowAction'
import { Badge } from '../ui/Badge'
import { ImageCard, MeshCard, type ImageOverlay, type MeshTone } from '../ui/Card'
import { ProgressiveImage } from '../ui/ProgressiveImage'

type Benefit = HomepageDTO['home']['benefits']['cards'][number]
const iconMap = { parking: CircleParking, lockers: Sparkles, shower: ShowerHead, chill: Coffee, 'online-booking': Smartphone, 'coaches-metric': Sparkles, 'kids-wide': Smile, community: Users }

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

export function BenefitCard({ benefit, mobile = false }: { benefit: Benefit; mobile?: boolean }) {
  const Icon = iconMap[benefit.variant]
  if (benefit.variant === 'lockers' || benefit.variant === 'shower' || benefit.variant === 'chill') {
    if (!benefit.media) return null
    const objectPosition = benefit.variant === 'lockers' ? 'object-[68%_center]' : benefit.variant === 'shower' ? 'object-[68%_center]' : undefined
    const externalAction = benefit.action.mode === 'external-link' && benefit.action.href ? { href: benefit.action.href, label: benefit.title } : null
    return <ImageCard data-linear-overlay="true" fadeImage parallax={mobile || Boolean(externalAction)} compositeOverlay={mobile} reveal={false} media={benefit.media} src={benefit.media.url} alt={benefit.media.alt} overlay={benefit.overlay as ImageOverlay} imgClassName={objectPosition} interactive={!mobile && Boolean(externalAction)} className="h-full min-h-[320px]">{externalAction && <><ExternalCardTarget {...externalAction} /><span className="pointer-events-none absolute bottom-6 right-6 z-20"><FeatureArrow /></span></>}<div className="flex h-full flex-col justify-between p-6 md:p-7"><Badge reveal={!mobile} tone="outline-light" icon={<Icon size={13} />}>{benefit.eyebrow}</Badge><div className={benefit.variant === 'chill' ? 'max-w-[390px]' : externalAction ? 'max-w-[calc(100%-3.5rem)]' : undefined}><h3 className="type-title-card font-semibold text-white">{benefit.title}</h3>{benefit.description && <p className="type-body-sm mt-2 max-w-[360px] text-white">{benefit.description}</p>}</div></div></ImageCard>
  }

  const tone = (benefit.meshTone ?? 'sky') as MeshTone
  const isLime = tone === 'lime' || tone === 'lime-soft'
  const isLight = isLime || tone === 'sky' || tone === 'sunset'
  const color = !isLight ? 'text-white' : isLime ? 'text-[#244500]' : tone === 'sunset' ? 'text-[#5c230f]' : 'text-[#0b3a5c]'
  const iconColor = !isLight ? '!text-[#18181b]' : isLime ? '!text-[#244500]' : tone === 'sunset' ? '!text-[#5c230f]' : '!text-[#0b3a5c]'
  const bodyColor = !isLight ? 'text-white' : isLime ? 'text-[#3f6212]' : tone === 'sunset' ? 'text-[#7c3f14]' : benefit.variant === 'community' ? 'text-[#0b3a5c]' : 'text-[#18527c]'
  const isPhone = benefit.variant === 'community' || benefit.variant === 'online-booking'
  const decorativeVariants = { rest: { scale: 1, rotate: benefit.variant === 'community' ? 8 : benefit.variant === 'online-booking' ? -4 : benefit.variant === 'coaches-metric' ? 6 : 0, y: 0 }, hover: { scale: isPhone ? 1.04 : 1.06, rotate: benefit.variant === 'community' ? 5 : benefit.variant === 'online-booking' ? -1 : benefit.variant === 'coaches-metric' ? 2 : -4, y: isPhone ? -5 : -7 } }
  const mediaClass = isPhone ? `benefit-phone origin-bottom ${benefit.variant === 'community' ? 'community-phone -bottom-6 -right-6 h-[92%]' : 'booking-phone -bottom-[32%] -right-[90px] h-[120%]'}` : benefit.variant === 'coaches-metric' ? '-bottom-20 -right-10 h-[340px] max-[1380px]:h-[270px]' : benefit.variant === 'kids-wide' ? '-bottom-16 -right-2 h-[300px] max-[1380px]:h-[240px]' : '-bottom-20 -right-10 h-[300px] max-[1380px]:h-[240px]'
  const internalAction = benefit.action.mode === 'internal-link' && benefit.action.href
    ? { href: benefit.variant === 'kids-wide' ? '/training' : benefit.action.href, label: benefit.title }
    : null
  const externalAction = benefit.action.mode === 'external-link' && benefit.action.href
    ? { href: benefit.action.href, label: benefit.title }
    : null
  return <MeshCard tone={tone} interactive={benefit.variant !== 'parking'} className="relative flex h-full min-h-[320px] p-6 md:p-7">{internalAction && <InternalCardTarget {...internalAction} />}{externalAction && <ExternalCardTarget {...externalAction} />}{benefit.media && <ProgressiveImage skeleton={false} media={benefit.media} alt="" aria-hidden="true" loading="eager" fetchPriority="low" decoding="async" variants={decorativeVariants} transition={springSoft} className={`pointer-events-none absolute ${mediaClass} z-0 w-auto ${benefit.variant === 'kids-wide' ? 'opacity-35' : 'opacity-100'}`} />}<div className="relative z-10 flex h-full w-full flex-col"><div className="flex items-start justify-between gap-4"><span className={`se-2 flex h-12 w-12 shrink-0 items-center justify-center bg-[color-mix(in_oklab,#ffffff_70%,transparent)] ${iconColor}`}><Icon size={22} strokeWidth={1.8} /></span><span className={`type-eyebrow max-w-[70%] text-right ${bodyColor}`}>{benefit.eyebrow}</span></div><div className={benefit.variant === 'kids-wide' ? 'my-8 max-w-full' : 'absolute inset-x-0 bottom-0'}><div className={benefit.variant === 'parking' ? 'max-w-[62%]' : benefit.variant === 'kids-wide' ? 'max-w-full' : isPhone ? 'max-w-[58%]' : 'max-w-[68%]'}><h3 className={`type-title-card ${color}`}>{benefit.title}</h3>{benefit.description && <p className={`type-body-sm mt-2 ${bodyColor} ${isPhone ? 'max-w-[180px]' : ''}`}>{benefit.description}</p>}</div></div>{benefit.variant === 'kids-wide' && <div className="mt-auto flex items-center justify-between border-t border-[#2563a3]/20 pt-4"><span className="type-ui flex max-w-[64%] items-center gap-2 font-semibold text-[#18527c]"><ShieldCheck className={iconColor} size={17} /> {benefit.supportingText}</span></div>}{isPhone && <span className="absolute bottom-0 right-0"><ArrowAction tone="dark" size="sm" cardHover /></span>}{benefit.variant === 'coaches-metric' && <span className="absolute bottom-0 right-0"><FeatureArrow color={isLight ? iconColor : '!text-white'} /></span>}</div></MeshCard>
}

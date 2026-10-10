import { useRef } from 'react'
import { Bot, Target, Zap } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { motion } from 'framer-motion'
import { useContent } from '../content/ContentContext'
import { useImageParallax } from '../lib/useImageParallax'
import { SurfaceCard, imageOverlayForMesh } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'
import { Typography } from '../components/ui/Typography'
import { Price } from '../components/ui/Price'

export function MethodistBanner() {
  const banner = useContent().home.methodistBanner
  const Icon = { Target, Bot, Zap }[banner.icon ?? 'Target']
  const backgroundRef = useRef<HTMLDivElement>(null)
  const backgroundY = useImageParallax(backgroundRef, 6)
  return <section className="container-page pb-20 md:pb-28" data-robot-banner>
    <Reveal><SurfaceCard interactive={false} reveal={false} className="relative isolate flex min-h-[480px] flex-col justify-between gap-32 overflow-hidden bg-ink p-6 text-white md:min-h-[560px] md:p-10 lg:p-12">
      <div ref={backgroundRef} data-parallax-viewport className="parallax-viewport absolute inset-0">
        <motion.div data-parallax-layer style={{ y: backgroundY, top: '-10%', height: '120%' }} className="parallax-layer overflow-hidden">
          {banner.decorativeMedia && <ProgressiveImage media={banner.decorativeMedia} loading="lazy" decoding="async" sizes="100vw" className="h-full w-full object-cover object-[35%_center] md:object-center" />}
        </motion.div>
      </div>
      <div aria-hidden="true" data-image-overlay={imageOverlayForMesh(banner.meshTone)} className="pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex items-start justify-between gap-4" data-robot-banner-top>
        <span aria-hidden="true" className="se-2 flex h-12 w-12 shrink-0 items-center justify-center glass-overlay text-white"><Icon size={24} strokeWidth={1.8} /></span>
        {banner.eyebrow && <Badge tone="glass" reveal={false}>{banner.eyebrow}</Badge>}
      </div>
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0 max-w-[760px]">
          <Typography as="h2" role="section" reveal={false} className="text-white">{banner.title}</Typography>
          <Typography role="body" reveal={false} className="mt-4 max-w-[580px] text-white">{banner.description}</Typography>
        </div>
        {banner.price != null && <Price data-robot-banner-price size="standard" value={banner.price} suffix="/ час" tone="light" className="shrink-0 self-end text-right [&>div]:justify-end" />}
      </div>
    </SurfaceCard></Reveal>
  </section>
}

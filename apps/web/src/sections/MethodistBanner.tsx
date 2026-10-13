import { useRef } from 'react'
import { Bot, Target, Zap } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { motion } from 'framer-motion'
import { useContent } from '../content/ContentContext'
import { useImageParallax } from '../lib/useImageParallax'
import { SurfaceCard, imageOverlayForMesh, imageTextTintForMesh } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'
import { Typography } from '../components/ui/Typography'
import { Price } from '../components/ui/Price'

export function MethodistBanner() {
  const banner = useContent().home.methodistBanner
  const Icon = { Target, Bot, Zap }[banner.icon ?? 'Target']
  const imageAspect = banner.decorativeMedia?.width && banner.decorativeMedia.height ? banner.decorativeMedia.width / banner.decorativeMedia.height : 2
  const imageSizes = `(min-width: 768px) max(100vw, ${Math.ceil(672 * imageAspect)}px), max(100vw, ${Math.ceil(600 * imageAspect)}px)`
  const backgroundRef = useRef<HTMLDivElement>(null)
  const backgroundY = useImageParallax(backgroundRef, 6)
  return <section className="container-page pb-20 md:pb-28" data-robot-banner>
    <Reveal><SurfaceCard interactive={false} hoverable reveal={false} className="relative isolate flex h-[500px] flex-col justify-between overflow-hidden bg-ink p-6 text-white md:h-[560px] md:p-8 lg:p-10">
      <div ref={backgroundRef} data-parallax-viewport className="parallax-viewport absolute inset-0">
        <motion.div data-parallax-layer style={{ y: backgroundY, top: '-10%', height: '120%' }} className="parallax-layer overflow-hidden">
          {banner.decorativeMedia && <ProgressiveImage media={banner.decorativeMedia} loading="lazy" decoding="async" sizes={imageSizes} className="h-full w-full object-cover object-[62%_center] md:object-[50%_15%]" />}
        </motion.div>
      </div>
      <div aria-hidden="true" data-image-overlay={imageOverlayForMesh(banner.meshTone)} className="pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex items-start justify-start gap-4" data-robot-banner-top>
        {banner.eyebrow && <Badge tone="outline-light" reveal={false} icon={<Icon size={13} className="shrink-0" />}>{banner.eyebrow}</Badge>}
      </div>
      <div className="relative z-10 flex min-h-0 flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0 max-w-[760px]">
          <Typography as="h2" role="section" reveal={false} className="text-white">{banner.title}</Typography>
          <Typography role="body" reveal={false} className="mt-3 max-w-[580px] whitespace-pre-line" style={{ color: imageTextTintForMesh(banner.meshTone) }}>{banner.description}</Typography>
        </div>
        {banner.price != null && <>
          <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/15 pt-4 md:hidden" data-robot-banner-mobile-price><span className="type-ui text-white/60">Стоимость аренды</span><Price data-robot-banner-price size="section" value={banner.price} suffix={<span style={{ color: imageTextTintForMesh(banner.meshTone) }}>/ час</span>} tone="light" className="shrink-0 text-right [&>div]:justify-end" /></div>
          <Price data-robot-banner-price-desktop size="section" value={banner.price} suffix={<span style={{ color: imageTextTintForMesh(banner.meshTone) }}>/ час</span>} tone="light" className="hidden shrink-0 text-right md:block [&>div]:justify-end" />
        </>}
      </div>
    </SurfaceCard></Reveal>
  </section>
}

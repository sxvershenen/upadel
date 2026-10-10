import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useContent } from '../content/ContentContext'
import { useImageParallax } from '../lib/useImageParallax'
import { SurfaceCard } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'
import { Typography } from '../components/ui/Typography'
import { Price } from '../components/ui/Price'

export function MethodistBanner() {
  const banner = useContent().home.methodistBanner
  const backgroundRef = useRef<HTMLDivElement>(null)
  const backgroundY = useImageParallax(backgroundRef, 17)
  return <section className="container-page pb-20 md:pb-28">
    <Reveal><SurfaceCard interactive={false} reveal={false} className="relative isolate flex min-h-[480px] flex-col justify-end overflow-hidden bg-ink p-7 text-white md:min-h-[560px] md:p-12">
      <div ref={backgroundRef} data-parallax-viewport className="parallax-viewport absolute inset-0">
        <motion.div data-parallax-layer style={{ y: backgroundY }} className="parallax-layer-wide overflow-hidden">
          {banner.decorativeMedia && <ProgressiveImage media={banner.decorativeMedia} loading="lazy" decoding="async" sizes="100vw" className="h-full w-full object-cover" />}
        </motion.div>
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,10,.35)_0%,rgba(4,6,10,.6)_45%,rgba(4,6,10,.88)_100%)]" />
      <div className="relative z-10 max-w-[720px]">
        <Typography as="h2" role="section" reveal={false} className="text-white">{banner.title}</Typography>
        <Typography role="body" reveal={false} className="mt-5 max-w-[580px] text-white/75">{banner.description}</Typography>
        {banner.price != null && <div className="mt-7"><Price value={banner.price} suffix="/ час" tone="light" /></div>}
      </div>
    </SurfaceCard></Reveal>
  </section>
}

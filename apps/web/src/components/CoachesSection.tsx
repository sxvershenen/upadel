import React, { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

import { CoachCard, type Coach } from './cards/CoachCard'
import { ButtonLink, IconButton } from './ui/Button'
import { Reveal } from './ui/Reveal'
import { SectionAction, SectionHeader } from './ui/SectionHeader'
import { horizontalSwiperProps } from '../lib/swiper'
import { useMobileSwipeHint } from '../lib/useMobileSwipeHint'

type CoachesSectionProps = {
  coaches: Coach[]
  eyebrow: string
  title: string
  sectionId?: string
  titleId?: string
  className?: string
  headerClassName?: string
  catalogAction?: {
    href: string
    desktopLabel: string
    mobileLabel: string
  }
}

export function CoachesSection({
  coaches,
  eyebrow,
  title,
  sectionId,
  titleId,
  className = 'py-12 md:py-20',
  headerClassName = 'mb-8',
  catalogAction,
}: CoachesSectionProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const swipeHintRef = useMobileSwipeHint(swiperRef, sectionId ?? 'training-coaches')

  if (coaches.length === 0) return null

  const updateEdges = (swiper: SwiperType) => {
    setAtStart(swiper.isBeginning)
    setAtEnd(swiper.isEnd)
  }

  return (
    <section id={sectionId} className={className} aria-labelledby={titleId}>
      <Reveal>
        <SectionHeader
          titleId={titleId}
          eyebrow={eyebrow}
          title={title}
          action={
            <div className="flex items-center gap-2">
              {catalogAction && (
                <SectionAction action={{ mode: 'internal-link', href: catalogAction.href, label: catalogAction.desktopLabel }} className="hidden sm:inline-flex">
                  {catalogAction.desktopLabel}
                </SectionAction>
              )}
              <IconButton variant="neutral" size="sm" aria-label="Предыдущие тренеры" disabled={atStart} onClick={() => swiperRef.current?.slidePrev()}>
                <ChevronLeft size={16} />
              </IconButton>
              <IconButton variant="neutral" size="sm" aria-label="Следующие тренеры" disabled={atEnd} onClick={() => swiperRef.current?.slideNext()}>
                <ChevronRight size={16} />
              </IconButton>
            </div>
          }
          className={headerClassName}
        />
      </Reveal>

      <div ref={swipeHintRef} className="swiper-page-gutter">
        <Swiper
          {...horizontalSwiperProps}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
            updateEdges(swiper)
          }}
          onSlideChange={updateEdges}
          onResize={updateEdges}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 4 },
          }}
          className="coaches-swiper swiper-breathe"
        >
          {coaches.map((coach) => (
            <SwiperSlide key={coach.id} className="!h-auto">
              <div>
                <CoachCard coach={coach} loading="lazy" reveal={false} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {catalogAction && (
        <div className="mt-5 sm:hidden">
          <ButtonLink href={catalogAction.href} variant="neutral" fullWidth size="md" icon={<ArrowRight size={16} />}>
            {catalogAction.mobileLabel}
          </ButtonLink>
        </div>
      )}
    </section>
  )
}

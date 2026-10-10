import React, { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

import type { Training } from './cards/TrainingCard'
import { TrainingCard } from './cards/TrainingCard'
import { horizontalSwiperProps } from '../lib/swiper'
import { useMobileSwipeHint } from '../lib/useMobileSwipeHint'

type TrainingFormatsProps = {
  programs: Training[]
  sourcePage?: string
  onSwiperChange?: (swiper: SwiperType) => void
}

export function TrainingFormats({ programs, sourcePage, onSwiperChange }: TrainingFormatsProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const swipeHintRef = useMobileSwipeHint(swiperRef, sourcePage === '/training' ? 'training-formats' : 'home-pricing-training')

  return (
    <div>
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {programs.map((program) => (
          <div key={program.id} className="h-full">
            <TrainingCard training={program} />
          </div>
        ))}
      </div>

      <div ref={swipeHintRef} className="swiper-page-gutter md:hidden">
        <Swiper
          {...horizontalSwiperProps}
          onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper) }}
          onSlideChange={onSwiperChange}
          onResize={onSwiperChange}
          slidesPerView={1}
          spaceBetween={12}
          className="training-formats-swiper swiper-breathe"
        >
          {programs.map((program) => (
            <SwiperSlide key={program.id} className="!h-auto">
              <div className="h-full min-h-[500px]">
                <TrainingCard training={program} interactive={false} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

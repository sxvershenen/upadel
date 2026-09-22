import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

import type { RentalRate } from './cards/RentPricingCards'
import { RentalRateCard } from './cards/RentPricingCards'
import type { Training } from './cards/TrainingCard'
import { TrainingCard } from './cards/TrainingCard'
import { horizontalSwiperProps } from '../lib/swiper'

type TrainingFormatsProps = {
  programs: Training[]
  trial?: RentalRate | null
  sourcePage?: string
  onSwiperChange?: (swiper: SwiperType) => void
}

export function TrainingFormats({ programs, trial, sourcePage, onSwiperChange }: TrainingFormatsProps) {
  const formats = [
    ...programs.map((program) => ({ kind: 'program' as const, item: program })),
    ...(trial ? [{ kind: 'trial' as const, item: trial }] : []),
  ]

  const renderCard = (entry: (typeof formats)[number], mobile: boolean) => entry.kind === 'program' ? (
    <TrainingCard training={entry.item} interactive={!mobile} />
  ) : (
    <RentalRateCard rate={entry.item} sourcePage={sourcePage} sourceEntity={entry.item.title} layout="compact" />
  )

  return (
    <div>
      <div className={`hidden gap-4 md:grid ${trial ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
        {formats.map((entry) => (
          <div key={`${entry.kind}-${entry.item.id}`} className="h-full">
            {renderCard(entry, false)}
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <Swiper
          {...horizontalSwiperProps}
          onSwiper={onSwiperChange}
          onSlideChange={onSwiperChange}
          onResize={onSwiperChange}
          slidesPerView={1}
          spaceBetween={12}
          className="training-formats-swiper swiper-breathe"
        >
          {formats.map((entry) => (
            <SwiperSlide key={`${entry.kind}-${entry.item.id}`} className="!h-auto">
              <div className="h-full min-h-[500px]">
                {renderCard(entry, true)}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

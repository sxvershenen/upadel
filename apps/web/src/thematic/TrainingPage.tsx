import React, { useRef, useState } from 'react'
import type { TrainingPageDTO } from '@unlim/content-contract'
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Footprints,
  ShowerHead,
  Target,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

import { CoachCard } from '../components/cards/CoachCard'
import { RentalRateCard } from '../components/cards/RentPricingCards'
import { TrainingCard } from '../components/cards/TrainingCard'
import { ContentAction } from '../components/ContentAction'
import { ButtonLink, IconButton } from '../components/ui/Button'
import { Accordion } from '../components/ui/Accordion'
import { SurfaceCard } from '../components/ui/Card'
import { SectionAction, SectionHeader } from '../components/ui/SectionHeader'
import { Typography } from '../components/ui/Typography'
import { horizontalSwiperProps } from '../lib/swiper'
import { useMobileSwipeHint } from '../lib/useMobileSwipeHint'

export function typograph(text: string): string {
  if (!text) return ''
  return text.replace(
    /(?<=^|\s)(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)[ \t]+/gi,
    '$1\u00A0'
  )
}

const methodIcons = { Target, Calendar, TrendingUp, Users }
export function TrainingPage({ dto }: { dto: TrainingPageDTO }) {
  const formats = [
    ...dto.programs.map((program) => ({ kind: 'program' as const, item: program })),
    ...(dto.trial ? [{ kind: 'trial' as const, item: dto.trial }] : []),
  ]

  const formatSwiperRef = useRef<SwiperType | null>(null)
  const formatSwipeHintRef = useMobileSwipeHint(formatSwiperRef, 'training-formats')

  const coachesSwiperRef = useRef<SwiperType | null>(null)
  const [coachesAtStart, setCoachesAtStart] = useState(true)
  const [coachesAtEnd, setCoachesAtEnd] = useState(false)
  const coachesSwipeHintRef = useMobileSwipeHint(coachesSwiperRef, 'training-coaches')

  const coaches = dto.coaches ?? []

  return (
    <article className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      {/* 1. Swiss Methodology Pillars */}
      <section aria-labelledby="methodology-title">
        <SectionHeader titleId="methodology-title" eyebrow={dto.infographicEyebrow} title={dto.infographicTitle} />

        <div data-mobile-compact-list className="mt-8 border-y border-ink/10 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-y-0">
          {dto.blocks.map((block) => {
            const Icon = methodIcons[block.icon] ?? Target
            return (
              <SurfaceCard
                interactive={false}
                reveal={false}
                key={block.title}
                className="flex items-start gap-4 border-b border-ink/10 bg-transparent px-0 py-5 last:border-b-0 sm:block sm:border-b-0 sm:bg-white sm:p-6"
              >
                <span className="se-2 flex h-9 w-9 shrink-0 items-center justify-center bg-surface-muted text-ink">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="type-title-card text-ink sm:mt-4">
                    {typograph(block.title)}
                  </h3>
                  <p className="type-body-sm mt-2 text-ink-soft">
                    {typograph(block.body)}
                  </p>
                </div>
              </SurfaceCard>
            )
          })}
        </div>
      </section>

      {/* 2. Training Formats */}
      <section className="mt-20 md:mt-24" aria-labelledby="training-formats-title">
        <SectionHeader
          titleId="training-formats-title"
          eyebrow={dto.programsEyebrow}
          title={dto.programsTitle}
          className="mb-8"
        />

        {/* Desktop 4-column grid */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-4">
          {formats.map((entry) => (
            <div key={`${entry.kind}-${entry.item.id}`} className="h-full">
              {entry.kind === 'program' ? (
                <TrainingCard training={entry.item} />
              ) : (
                <RentalRateCard
                  rate={entry.item}
                  sourcePage="/training"
                  sourceEntity={entry.item.title}
                  layout="compact"
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Swiper */}
        <div ref={formatSwipeHintRef} className="-mx-5 lg:hidden">
          <Swiper
            {...horizontalSwiperProps}
            onSwiper={(swiper) => {
              formatSwiperRef.current = swiper
            }}
            slidesPerView={1.08}
            spaceBetween={12}
            className="swiper-breathe !px-5"
          >
            {formats.map((entry) => (
              <SwiperSlide key={`${entry.kind}-${entry.item.id}`} className="!h-auto">
                <div className="h-full min-h-[500px]">
                  {entry.kind === 'program' ? (
                    <TrainingCard training={entry.item} interactive={false} />
                  ) : (
                    <RentalRateCard
                      rate={entry.item}
                      sourcePage="/training"
                      sourceEntity={entry.item.title}
                      layout="compact"
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 3. Coaches Section - Swiss Swiper matching homepage style */}
      {coaches.length > 0 && (
        <section className="mt-20 md:mt-24" aria-labelledby="coaches-title">
          <SectionHeader
            titleId="coaches-title"
            eyebrow={dto.coachesEyebrow}
            title={dto.coachesTitle}
            action={
              <div className="flex items-center gap-2">
                <SectionAction action={{ mode: 'internal-link', href: '/coaches', label: dto.coachesDesktopActionLabel }} className="hidden sm:inline-flex">
                  {dto.coachesDesktopActionLabel}
                </SectionAction>
                <IconButton
                  variant="neutral"
                  size="sm"
                  aria-label="Предыдущие тренеры"
                  disabled={coachesAtStart}
                  onClick={() => coachesSwiperRef.current?.slidePrev()}
                >
                  <ChevronLeft size={16} />
                </IconButton>
                <IconButton
                  variant="neutral"
                  size="sm"
                  aria-label="Следующие тренеры"
                  disabled={coachesAtEnd}
                  onClick={() => coachesSwiperRef.current?.slideNext()}
                >
                  <ChevronRight size={16} />
                </IconButton>
              </div>
            }
            className="mb-8"
          />

          <div ref={coachesSwipeHintRef} className="-mx-5 md:mx-0">
            <Swiper
              {...horizontalSwiperProps}
              onSwiper={(s) => (coachesSwiperRef.current = s)}
              onSlideChange={(s) => {
                setCoachesAtStart(s.isBeginning)
                setCoachesAtEnd(s.isEnd)
              }}
              onResize={(s) => {
                setCoachesAtStart(s.isBeginning)
                setCoachesAtEnd(s.isEnd)
              }}
              spaceBetween={16}
              slidesPerView={1.08}
              breakpoints={{
                640: { slidesPerView: 2.2 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 4 },
              }}
              className="coaches-swiper swiper-breathe !px-5 md:!px-0"
            >
              {coaches.map((coach) => (
                <SwiperSlide key={coach.id} className="!h-auto">
                  <CoachCard coach={coach} loading="lazy" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="mt-5 sm:hidden">
            <ButtonLink
              href="/coaches"
              variant="neutral"
              fullWidth
              size="md"
              icon={<ArrowRight size={16} />}
            >
              {dto.coachesMobileActionLabel}
            </ButtonLink>
          </div>
        </section>
      )}

      {/* 4. Knowledge base: first visit on the left, FAQ on the right */}
      <section className="mt-20 md:mt-24" aria-label={dto.knowledgeTitle}>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-ink/10">
          <div className="lg:pr-16">
            <Typography as="h2" role="section" className="font-semibold text-ink">{typograph(dto.firstVisitTitle)}</Typography>
            <Typography role="body" tone="subtle" className="mt-2.5">{typograph(dto.firstVisitCopy)}</Typography>
            <div className="mt-8 border-y border-ink/10">
              {dto.firstVisitItems.map((item) => {
                const Icon = { Dumbbell, Footprints, ShowerHead, Timer }[item.icon] ?? Dumbbell
                return <div key={item.title} className="flex items-start gap-3 border-b border-ink/10 py-5 last:border-b-0">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-ink-soft"><Icon size={18} strokeWidth={1.8} /></span>
                  <div><Typography as="h3" role="body" className="font-medium text-ink">{typograph(item.title)}</Typography><Typography role="body-small" tone="subtle" className="mt-1.5 leading-relaxed">{typograph(item.body)}</Typography></div>
                </div>
              })}
            </div>
            <ContentAction action={dto.action} sourcePage="/training" sourceEntity={dto.knowledgeTitle} variant="primary" size="md" fullWidth icon={<ArrowRight size={17} />} className="mt-6">{dto.action.label}</ContentAction>
          </div>
          <div className="lg:pl-16">
            <Typography as="h2" role="section" className="font-semibold text-ink">{typograph(dto.faqTitle)}</Typography>
            <Typography role="body" tone="subtle" className="mt-2.5">{typograph(dto.faqCopy)}</Typography>
            <div className="mt-8"><Accordion items={dto.faq.map((item) => ({ q: typograph(item.question), a: typograph(item.answer) }))} /></div>
          </div>
        </div>
      </section>
    </article>
  )
}

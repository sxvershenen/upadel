import React, { useId, useRef, useState } from 'react'
import type { TrainingPageDTO } from '@unlim/content-contract'
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Footprints,
  Layers,
  ShowerHead,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

import { CoachCard } from '../components/cards/CoachCard'
import { RentalRateCard } from '../components/cards/RentPricingCards'
import { TrainingCard } from '../components/cards/TrainingCard'
import { ContentAction } from '../components/ContentAction'
import { ButtonLink, IconButton } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { springSoft } from '../lib/motion'
import { horizontalSwiperProps } from '../lib/swiper'
import { useMobileSwipeHint } from '../lib/useMobileSwipeHint'
import { cn } from '../utils/cn'

export function typograph(text: string): string {
  if (!text) return ''
  return text.replace(
    /(?<=^|\s)(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)[ \t]+/gi,
    '$1\u00A0'
  )
}

const methodIcons = { Target, Calendar, TrendingUp, Users }
const articleIcons = [Layers, Target, TrendingUp, Dumbbell]

function parseArticleSections(html: string): Array<{ title: string; html: string }> {
  if (!html) return []
  const parts = html.split(/<h2[^>]*>(.*?)<\/h2>/gi)
  const sections: Array<{ title: string; html: string }> = []
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim()
    const content = parts[i + 1]?.trim() ?? ''
    if (title) {
      sections.push({ title, html: content })
    }
  }
  return sections
}

interface SwissAccordionItemProps {
  title: string
  icon?: React.ReactNode
  badge?: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function SwissAccordionItem({ title, icon, badge, isOpen, onToggle, children }: SwissAccordionItemProps) {
  const id = useId()
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel`

  return (
    <div className="border-b border-ink/10 first:border-t">
      <button
        id={triggerId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2"
      >
        <span className="flex items-center gap-3">
          {icon && (
            <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-surface-muted text-ink-soft transition-colors group-hover:bg-lime group-hover:text-ink">
              {icon}
            </span>
          )}
          <span className="type-title-compact text-ink transition-transform duration-200 group-hover:translate-x-0.5">
            {typograph(title)}
          </span>
          {badge && (
            <span className="hidden sm:inline-block rounded bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">
              {badge}
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springSoft}
          className={cn(
            'se-1 flex h-7 w-7 shrink-0 items-center justify-center transition-colors',
            isOpen ? 'bg-ink text-white' : 'bg-surface-muted text-ink group-hover:bg-lime group-hover:text-ink'
          )}
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSoft}
            className="overflow-hidden"
          >
            <div className="pb-5 pt-1 text-ink-soft">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TrainingPage({ dto }: { dto: TrainingPageDTO }) {
  const formats = [
    ...dto.programs.map((program) => ({ kind: 'program' as const, item: program })),
    ...(dto.trial ? [{ kind: 'trial' as const, item: dto.trial }] : []),
  ]

  const formatSwiperRef = useRef<SwiperType | null>(null)
  const formatSwipeHintRef = useMobileSwipeHint(formatSwiperRef)

  const coachesSwiperRef = useRef<SwiperType | null>(null)
  const [coachesAtStart, setCoachesAtStart] = useState(true)
  const [coachesAtEnd, setCoachesAtEnd] = useState(false)
  const coachesSwipeHintRef = useMobileSwipeHint(coachesSwiperRef)

  const articleSections = parseArticleSections(dto.articleHTML)
  const [openSection, setOpenSection] = useState<number | null>(0)

  const checklistItems = [
    {
      icon: Dumbbell,
      title: 'Ракетка и мячи',
      description: 'Премиальные испанские ракетки Varlion и мячи включены в каждый визит — приносить свои не обязательно.',
    },
    {
      icon: Footprints,
      title: 'Обувь для корта',
      description: 'Сменные чистые кроссовки с нескользящей подошвой. Подошва для падела или тенниса обеспечивает комфорт и безопасность.',
    },
    {
      icon: ShowerHead,
      title: 'Раздевалки и душ',
      description: 'Просторные индивидуальные шкафчики, полотенца, душевые и фены доступны каждому игроку без доплат.',
    },
    {
      icon: Timer,
      title: 'Время прибытия',
      description: 'Рекомендуем приехать за 10–15 минут до начала занятия, чтобы спокойно переодеться и выйти на корт вовремя.',
    },
  ]

  const coaches = dto.coaches ?? []

  return (
    <article className="container-page pb-16 pt-8 md:pb-24 md:pt-12">
      {/* 1. Swiss Methodology Pillars */}
      <section aria-labelledby="methodology-title">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <span className="type-eyebrow text-ink-muted">{dto.infographicEyebrow}</span>
            <h2 id="methodology-title" className="type-section mt-2 text-ink">
              {typograph(dto.infographicTitle)}
            </h2>
          </div>
          <p className="type-body max-w-[500px] text-ink-soft md:text-right">
            {typograph(dto.infographicCopy)}
          </p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {dto.blocks.map((block, index) => {
            const Icon = methodIcons[block.icon] ?? Target
            return (
              <li
                key={block.title}
                className="se-3 flex flex-col justify-between bg-white p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="se-2 flex h-9 w-9 items-center justify-center bg-surface-muted text-ink">
                      <Icon size={18} />
                    </span>
                    <span className="type-caption font-mono font-semibold text-ink-muted">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="type-title-card mt-4 text-ink">
                    {typograph(block.title)}
                  </h3>
                  <p className="type-body-sm mt-2 text-ink-soft">
                    {typograph(block.body)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* 2. Training Formats */}
      <section className="mt-16 md:mt-24" aria-labelledby="training-formats-title">
        <SectionHeader
          eyebrow="Программы"
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 3. Coaches Section - Swiss Swiper matching homepage style */}
      {coaches.length > 0 && (
        <section className="mt-16 md:mt-24" aria-labelledby="coaches-title">
          <SectionHeader
            eyebrow="Команда наставников"
            title="Тренеры клуба"
            action={
              <div className="flex items-center gap-2">
                <ButtonLink
                  href="/coaches"
                  variant="neutral"
                  size="sm"
                  icon={<ArrowRight size={15} />}
                  className="hidden sm:inline-flex"
                >
                  Все тренеры ({coaches.length})
                </ButtonLink>
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
              className="swiper-breathe !px-5 md:!px-0"
            >
              {coaches.map((coach) => (
                <SwiperSlide key={coach.id} className="!h-auto">
                  <CoachCard coach={coach} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="mt-5 px-5 sm:hidden">
            <ButtonLink
              href="/coaches"
              variant="neutral"
              fullWidth
              size="md"
              icon={<ArrowRight size={16} />}
            >
              Все тренеры ({coaches.length})
            </ButtonLink>
          </div>
        </section>
      )}

      {/* 4. Methodology Guide & Article (Mobile Accordion / Desktop Editorial Cards) */}
      <section className="mt-16 md:mt-24" aria-labelledby="training-guide-title">
        <SectionHeader
          eyebrow="База знаний"
          title="Как устроены тренировки"
          className="mb-8"
        />

        <div className="grid gap-8 lg:grid-cols-[.36fr_.64fr] lg:gap-10">
          {/* Left Column: Quick Advisor Card */}
          <div className="se-3 flex flex-col justify-between bg-white p-6 md:p-7">
            <div>
              <div className="flex items-center gap-2.5 text-ink font-semibold type-ui">
                <span className="se-1 flex h-8 w-8 items-center justify-center bg-lime text-lime-ink">
                  <Sparkles size={16} />
                </span>
                <span>Совет методиста</span>
              </div>
              <p className="type-body-sm mt-4 text-ink-soft">
                {typograph('Если вы сомневаетесь в выборе формата, начните с персонального пробного занятия — тренер сразу оценит уровень и сформирует индивидуальную траекторию.')}
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-ink/10">
              <ContentAction
                action={dto.action}
                sourcePage="/training"
                sourceEntity="База знаний"
                variant="primary"
                size="md"
                icon={<ArrowRight size={17} />}
              >
                {dto.action?.label || 'Подобрать тренировку'}
              </ContentAction>
            </div>
          </div>

          {/* Right Column: Accordion on Mobile, Clean Swiss Cards on Desktop */}
          <div>
            {articleSections.length > 0 ? (
              <>
                {/* Mobile: Sleek Accordions */}
                <div className="lg:hidden">
                  {articleSections.map((section, idx) => {
                    const Icon = articleIcons[idx % articleIcons.length]
                    return (
                      <SwissAccordionItem
                        key={section.title}
                        title={section.title}
                        icon={<Icon size={15} />}
                        isOpen={openSection === idx}
                        onToggle={() => setOpenSection(openSection === idx ? null : idx)}
                      >
                        <div
                          className="article-content text-ink-soft type-body-sm [&_p]:mb-3 [&_p:last-child]:mb-0"
                          dangerouslySetInnerHTML={{ __html: section.html }}
                        />
                      </SwissAccordionItem>
                    )
                  })}
                </div>

                {/* Desktop: Structured Swiss Cards */}
                <div className="hidden lg:grid gap-4">
                  {articleSections.map((section, idx) => {
                    const Icon = articleIcons[idx % articleIcons.length]
                    return (
                      <article key={section.title} className="se-3 bg-white p-6">
                        <div className="flex items-center gap-3">
                          <span className="se-2 flex h-8 w-8 shrink-0 items-center justify-center bg-surface-muted text-ink">
                            <Icon size={16} />
                          </span>
                          <h3 className="type-title-card text-ink">
                            {typograph(section.title)}
                          </h3>
                        </div>
                        <div
                          className="article-content mt-3 text-ink-soft type-body-sm [&_p]:mb-2 [&_p:last-child]:mb-0"
                          dangerouslySetInnerHTML={{ __html: section.html }}
                        />
                      </article>
                    )
                  })}
                </div>
              </>
            ) : (
              <div
                className="article-content se-3 bg-white p-6 text-ink-soft type-body"
                dangerouslySetInnerHTML={{ __html: dto.articleHTML }}
              />
            )}
          </div>
        </div>
      </section>

      {/* 5. First Visit Checklist */}
      <section className="mt-16 md:mt-24" aria-labelledby="checklist-title">
        <SectionHeader
          eyebrow="Подготовка"
          title="Что нужно для первого визита"
          className="mb-8"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {checklistItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="se-3 flex flex-col bg-white p-6">
                <span className="se-2 flex h-9 w-9 items-center justify-center bg-surface-muted text-ink">
                  <Icon size={18} />
                </span>
                <h3 className="type-title-card mt-4 text-ink">
                  {typograph(item.title)}
                </h3>
                <p className="type-body-sm mt-2 text-ink-soft">
                  {typograph(item.description)}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </article>
  )
}

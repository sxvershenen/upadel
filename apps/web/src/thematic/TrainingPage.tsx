import React from 'react'
import type { TrainingPageDTO } from '@unlim/content-contract'
import {
  ArrowRight,
  Calendar,
  Dumbbell,
  Footprints,
  ShowerHead,
  Target,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react'
import { CoachesSection } from '../components/CoachesSection'
import { TrainingFormats } from '../components/TrainingFormats'
import { ContentAction } from '../components/ContentAction'
import { Accordion } from '../components/ui/Accordion'
import { SurfaceCard } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Typography } from '../components/ui/Typography'

export function typograph(text: string): string {
  if (!text) return ''
  return text.replace(
    /(?<=^|\s)(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)[ \t]+/gi,
    '$1\u00A0'
  )
}

const methodIcons = { Target, Calendar, TrendingUp, Users }
export function TrainingPage({ dto }: { dto: TrainingPageDTO }) {
  const coaches = dto.coaches ?? []

  return (
    <article className="container-page">
      {/* 1. Swiss Methodology Pillars */}
      <section className="py-12 md:py-20" aria-labelledby="methodology-title">
        <SectionHeader titleId="methodology-title" eyebrow={dto.infographicEyebrow} title={dto.infographicTitle} />

        <div data-mobile-compact-list className="mt-8 border-y border-ink/10 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-y-0">
          {dto.blocks.map((block) => {
            const Icon = methodIcons[block.icon] ?? Target
            return (
              <SurfaceCard
                interactive={false}
                reveal={false}
                key={block.title}
                className="max-sm:!rounded-none flex items-start gap-3 border-b border-ink/10 bg-transparent px-0 py-5 last:border-b-0 sm:block sm:border-b-0 sm:bg-white sm:p-6"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-ink-soft sm:mt-0 sm:h-9 sm:w-9 sm:rounded-[var(--se-2)] sm:bg-surface-muted sm:text-ink">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="type-body font-medium text-ink sm:mt-4 sm:!text-[24px] sm:!leading-[1.15] sm:!font-semibold sm:!tracking-[-0.025em] md:!text-[26px]">
                    {typograph(block.title)}
                  </h3>
                  <p className="type-body-sm mt-1.5 leading-relaxed text-ink-soft sm:mt-2">
                    {typograph(block.body)}
                  </p>
                </div>
              </SurfaceCard>
            )
          })}
        </div>
      </section>

      {/* 2. Training Formats */}
      <section className="py-12 md:py-20" aria-labelledby="training-formats-title">
        <SectionHeader
          titleId="training-formats-title"
          eyebrow={dto.programsEyebrow}
          title={dto.programsTitle}
          className="mb-8"
        />

        <TrainingFormats programs={dto.programs} trial={dto.trial} sourcePage="/training" />
      </section>

      {/* 3. Coaches Section - Swiss Swiper matching homepage style */}
      <CoachesSection
        coaches={coaches}
        eyebrow={dto.coachesEyebrow}
        title={dto.coachesTitle}
        titleId="coaches-title"
        catalogAction={{ href: '/coaches', desktopLabel: dto.coachesDesktopActionLabel, mobileLabel: dto.coachesMobileActionLabel }}
      />

      {/* 4. Knowledge base: first visit on the left, FAQ on the right */}
      <section className="py-12 md:py-20" aria-label={dto.knowledgeTitle}>
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

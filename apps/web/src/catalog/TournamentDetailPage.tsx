import React, { useEffect, useRef, useState } from 'react'
import type { TournamentDetailDTO } from '@unlim/content-contract'
import { gsap } from 'gsap'
import {
  Award,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Droplets,
  FileText,
  Gauge,
  Medal,
  PartyPopper,
  Phone,
  Send,
  ShowerHead,
  Sparkles,
  Timer,
  Trophy,
  UserPlus,
  Wallet,
} from 'lucide-react'

import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { TournamentCard } from '../components/cards/TournamentCard'
import { Badge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/Button'
import { ImageCard, MeshCard, type ImageOverlay, type MeshTone } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Reveal } from '../components/ui/Reveal'
import { cn } from '../utils/cn'

export function AnimatedAccordionItem({
  title,
  icon,
  children,
  defaultOpen = false,
  ariaLabel,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  ariaLabel?: string
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    const details = detailsRef.current
    const content = contentRef.current
    if (!details || !content) return

    if (isOpen) {
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.28,
        ease: 'power2.inOut',
        onComplete: () => {
          details.removeAttribute('open')
          setIsOpen(false)
          gsap.set(content, { clearProps: 'all' })
        },
      })
    } else {
      details.setAttribute('open', 'true')
      setIsOpen(true)
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.32,
          ease: 'power2.out',
          clearProps: 'height,opacity',
        }
      )
    }
  }

  return (
    <details
      ref={detailsRef}
      open={defaultOpen}
      aria-label={ariaLabel}
      className="group/acc border-b border-ink/10 first:border-t"
    >
      <summary
        onClick={handleToggle}
        className="flex items-center justify-between gap-3 cursor-pointer list-none py-4 text-left type-body font-medium text-ink hover:text-ink/80 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2"
      >
        <span className="flex items-center gap-2.5">
          {icon}
          <span>{typograph(title)}</span>
        </span>
        <span
          className={cn(
            'se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-control text-ink transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        >
          <ChevronDown size={14} />
        </span>
      </summary>
      <div ref={contentRef} className="overflow-hidden">
        <div className="pb-5 pt-1">
          {children}
        </div>
      </div>
    </details>
  )
}

// Неразрывные пробелы для предлогов и союзов по правилам русской типографики
export function typograph(text: string): string {
  if (!text) return ''
  return text.replace(
    /(?<=^|\s)(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)[ \t]+/gi,
    '$1\u00A0'
  )
}

// Извлечение диапазона или одиночного значения уровня (1.0 - 7.0)
export function parseLevelRange(levelStr: string): { min: number; max: number; isRange: boolean } {
  const matches = levelStr.match(/\d+(\.\d+)?/g) || ['2.0']
  const nums = matches.map((n) => parseFloat(n)).filter((n) => !isNaN(n))
  if (nums.length === 0) return { min: 2.0, max: 2.0, isRange: false }
  if (nums.length === 1) return { min: nums[0], max: nums[0], isRange: false }
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return { min, max, isRange: min !== max }
}

const perkIcons = { Sparkles, Droplets, ShowerHead, Camera } as const

const tournamentIcons = {
  PartyPopper,
  Trophy,
  Medal,
} as const

// Шкала уровней 1.0 - 7.0
const allLevels = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0'] as const

function LevelGauge({ levelStr }: { levelStr: string }) {
  const { min, max, isRange } = parseLevelRange(levelStr)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs text-white/90">
        <span className="flex items-center gap-1.5 font-medium">
          <Gauge size={13} className="text-lime" />
          <span>Уровень игроков:</span>
          <span className="font-semibold text-white tracking-wide">{levelStr}</span>
        </span>
        <span className="text-[11px] text-white/60">Шкала 1.0–7.0</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {allLevels.map((lvl) => {
          const num = parseFloat(lvl)
          const isActive = isRange
            ? num >= Math.floor(min) && num <= Math.ceil(max)
            : Math.abs(num - min) < 0.35
          return (
            <div key={lvl} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-1.5 w-full rounded-full transition-all duration-300',
                  isActive ? 'bg-lime shadow-[0_0_8px_rgba(194,245,66,0.65)]' : 'bg-white/20'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-mono leading-none',
                  isActive ? 'font-bold text-lime' : 'text-white/40'
                )}
              >
                {lvl}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TournamentDetailPage({ dto }: { dto: TournamentDetailDTO }) {
  const completed = dto.item.lifecycle === 'finished' || dto.item.lifecycle === 'cancelled'
  const sourcePage = `/tournaments/${dto.item.slug}`

  const Icon = tournamentIcons[dto.item.icon as keyof typeof tournamentIcons] || Trophy

  const [activeTab, setActiveTab] = useState<'participants' | 'standings' | 'prizes'>(
    completed ? 'standings' : 'participants'
  )
  const [participantsExpanded, setParticipantsExpanded] = useState(false)
  const [standingsExpanded, setStandingsExpanded] = useState(false)

  const tabPanelsRef = useRef<HTMLDivElement>(null)
  const previousTabRef = useRef(activeTab)

  useEffect(() => {
    if (previousTabRef.current === activeTab) return
    previousTabRef.current = activeTab
    if (!tabPanelsRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        tabPanelsRef.current,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.32,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        }
      )
    }, tabPanelsRef)
    return () => ctx.revert()
  }, [activeTab])

  const checklist = dto.item.checklist.map(({ text }) => text)
  const faqItems = dto.item.faqs.map(({ question: q, answer: a }) => ({ q, a }))
  const prizes = dto.item.prizes.map(({ place, title, reward, description: desc }) => ({ place: `${place} МЕСТО`, title, reward, desc }))
  const participants = dto.item.participants.map((participant) => ({
    ...participant,
    isPair: dto.item.participantMode === 'pairs',
    player1: participant.name,
    player2: participant.partnerName,
    level: participant.level || dto.item.levelLabel,
  }))
  const standings = dto.item.standings.map((standing) => ({
    ...standing,
    isPair: dto.item.participantMode === 'pairs',
    player1: standing.name,
    player2: standing.partnerName,
    diff: standing.difference,
  }))
  const includedPerks = dto.item.perks
  const matchdaySteps = dto.item.matchday
  const totalSlots = dto.item.totalSlots
  const availableSlots = Math.max(0, totalSlots - participants.length)

  // Внутренний контент Hero Left визитки
  const heroCardContent = (
    <div className="relative z-10 flex min-h-[360px] sm:min-h-[400px] md:min-h-[440px] flex-col justify-between p-6 sm:p-7 md:p-8 h-full">
      {/* Верхний ряд Hero: Статус турнира слева, аккуратный прогресс-бар справа */}
      <div className="flex items-center justify-between gap-3">
        {completed ? (
          <Badge tone="glass" icon={<CheckCircle2 size={13} className="text-white/70" />}>
            Турнир завершён
          </Badge>
        ) : dto.item.lifecycle === 'active' ? (
          <Badge tone="lime" className="font-semibold shadow-xs">
            Идёт турнир
          </Badge>
        ) : (
          <Badge tone="lime" className="font-semibold shadow-xs">
            Регистрация открыта
          </Badge>
        )}

        {/* Прогресс-бар в правом верхнем углу Hero: полупрозрачная полоска 10% с блюром без паддингов */}
        {!completed && (
          <div
            className="h-1.5 w-20 sm:w-24 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden shrink-0"
            title={`Заполнено ${participants.length} из ${totalSlots} мест`}
            aria-label={`Заполнено ${participants.length} из ${totalSlots} мест`}
          >
            <div
              className="h-full bg-lime transition-all duration-500 rounded-full"
              style={{ width: `${(participants.length / totalSlots) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Нижняя часть Hero: Название турнира, прижатое к уровню игроков, кнопка справа и шкала уровня */}
      <div className="mt-auto pt-6 space-y-3 sm:space-y-4">
        <div className="flex items-end justify-between gap-3 sm:gap-4">
          <h1 className="type-section font-semibold text-white tracking-tight leading-tight flex-1 min-w-0">
            {typograph(dto.item.title)}
          </h1>
          <div className="shrink-0">
            {completed ? (
              <ButtonLink href="/tournaments" variant="secondary" size="sm" className="sm:size-md">
                Все турниры
              </ButtonLink>
            ) : (
              <ContentAction
                action={dto.item.action}
                sourcePage={sourcePage}
                sourceEntity={dto.item.title}
                size="md"
                icon={<UserPlus size={18} />}
                aria-label="Записаться на турнир"
                className="max-sm:h-[var(--control-md)] max-sm:w-[var(--control-md)] max-sm:!p-0 max-sm:!gap-0 max-sm:justify-center max-sm:[&>span:first-child]:hidden max-sm:[&_span.h-5]:hidden sm:gap-2.5 sm:px-5"
              >
                Записаться
              </ContentAction>
            )}
          </div>
        </div>

        <div className="se-2 bg-black/35 backdrop-blur-sm p-3 border-0">
          <LevelGauge levelStr={dto.item.levelLabel} />
        </div>
      </div>
    </div>
  )

  return (
    <SiteFrame site={dto.site} backLink={{ href: '/tournaments' }}>
      {/* На мобилке нет верхнего navbar, поэтому отступ сверху pt-4 (равен боковому --page-gutter), на десктопе pt-28 md:pt-32 */}
      <article className="container-page pb-24 pt-4 sm:pt-28 md:pt-32 space-y-16 sm:space-y-20 md:space-y-28">
        {/* 1. Первый экран: Равнозначный сплит 50/50: Hero Left (визитка) + Hero Right (инфо без карточки) */}
        <Reveal>
        <section aria-label="Визитка и паспорт турнира">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-stretch">
            {/* Hero Left: визитка турнира с мешем/фото, уровнем и кнопкой */}
            <div aria-label="Визитка турнира" className="flex flex-col">
              {dto.item.visualStyle === 'image' && dto.item.image ? (
                <ImageCard
                  src={dto.item.image.url}
                  alt={dto.item.image.alt}
                  overlay={(dto.item.imageOverlay as ImageOverlay) || 'overlay-dark'}
                  interactive={false}
                  className="w-full h-full border-0"
                >
                  {heroCardContent}
                </ImageCard>
              ) : (
                <MeshCard
                  tone={(dto.item.meshStyle as MeshTone) || 'deep-blue'}
                  interactive={false}
                  className="w-full h-full border-0"
                >
                  {heroCardContent}
                </MeshCard>
              )}
            </div>

            {/* Hero Right: Информация о турнире в швейцарском стиле без карточки-контейнера */}
            <div aria-label="Паспорт турнира" className="flex flex-col justify-between h-full py-1">
              <div>
                <h2 className="type-title-dense font-semibold text-ink">
                  {typograph('Информация о турнире')}
                </h2>
                {dto.item.description || dto.page?.intro ? (
                  <p className="type-body-sm text-ink-soft leading-relaxed mt-2.5">
                    {typograph(dto.item.description || dto.page?.intro || '')}
                  </p>
                ) : null}

                {/* 2x2 параметры турнира в швейцарском стиле: чистая сетка с тонкими линиями без серых плашек */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 pt-5 mt-5 border-t border-ink/10">
                  <div className="flex flex-col">
                    <dt className="type-micro font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-ink-muted" />
                      {typograph('Расписание')}
                    </dt>
                    <dd className="mt-1">
                      <span className="type-body-sm font-semibold text-ink block leading-snug">
                        {typograph(dto.item.scheduleLabel)}
                      </span>
                    </dd>
                  </div>

                  <div className="flex flex-col">
                    <dt className="type-micro font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <Icon size={14} className="text-ink-muted" />
                      {typograph('Формат')}
                    </dt>
                    <dd className="mt-1">
                      <span className="type-body-sm font-semibold text-ink block leading-snug">
                        {typograph(dto.item.formatLabel)}
                      </span>
                    </dd>
                  </div>

                  <div className="flex flex-col">
                    <dt className="type-micro font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <Wallet size={14} className="text-ink-muted" />
                      {typograph('Взнос')}
                    </dt>
                    <dd className="mt-1">
                      <span className="type-body-sm font-semibold text-ink block leading-snug">
                        {typograph(dto.item.entryFee)}
                      </span>
                    </dd>
                  </div>

                  <div className="flex flex-col">
                    <dt className="type-micro font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <Award size={14} className="text-ink-muted" />
                      {typograph(dto.item.prizeLabel)}
                    </dt>
                    <dd className="mt-1">
                      <span className="type-body-sm font-semibold text-ink block leading-snug">
                        {typograph(dto.item.prize)}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Быстрые контакты координатора */}
              <div className="pt-5 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3 text-ink-soft type-caption mt-6">
                <span className="text-ink-muted font-medium">Вопросы координатору:</span>
                <div className="flex items-center gap-4">
                  {dto.item.coordinator.telegramURL && (
                    <a
                      href={dto.item.coordinator.telegramURL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-ink/70 transition-colors"
                    >
                      <Send size={13} /> {dto.item.coordinator.telegramLabel || 'Telegram'}
                    </a>
                  )}
                  {dto.item.coordinator.phoneDisplay && dto.item.coordinator.phoneValue && (
                    <a
                      href={`tel:${dto.item.coordinator.phoneValue}`}
                      className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-ink/70 transition-colors"
                    >
                      <Phone size={13} /> {dto.item.coordinator.phoneDisplay}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        </Reveal>

        {/* 2. Соревновательный блок с лаконичными табами: Участники / Итоги / Призы */}
        <Reveal>
        <section aria-label="Участники и результаты">
          <SectionHeader
            title={
              <>
                <span className="sm:hidden">
                  Сетка и<br />участники
                </span>
                <span className="hidden sm:inline">
                  {typograph('Сетка и участники')}
                </span>
              </>
            }
            className="!flex-nowrap items-end justify-between gap-2 sm:gap-6 mb-6"
            titleClassName="type-section font-semibold text-ink leading-tight"
            actionClassName="ml-auto shrink-0"
            action={
              <div role="tablist" aria-label="Вкладки соревнования" className="se-2 inline-flex h-[36px] sm:h-[40px] items-center bg-control p-0.5 sm:p-1 gap-0.5 sm:gap-1 shrink-0">
                {(
                  [
                    { id: 'participants', label: 'Участники' },
                    { id: 'standings', label: 'Итоги' },
                    { id: 'prizes', label: 'Призы' },
                  ] as const
                ).map((tab) => {
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      type="button"
                      aria-selected={active}
                      aria-controls={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'se-1 px-2.5 sm:px-4 py-1 sm:py-2 type-ui font-medium transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm',
                        active
                          ? 'bg-ink text-white shadow-xs font-semibold'
                          : 'text-ink-soft hover:text-ink'
                      )}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            }
          />

          <div ref={tabPanelsRef}>
            {/* ТАБ 1: Участники */}
            <div id="tab-participants" className={activeTab === 'participants' ? 'block' : 'hidden'} role="tabpanel">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                {participants.map((player, idx) => (
                  <div
                    key={player.id}
                    className={cn(
                      'py-3 border-b border-ink/10 flex items-center justify-between gap-3',
                      !participantsExpanded && idx >= 4 && 'hidden sm:flex'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold text-ink bg-surface-muted tabular-nums">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        {player.isPair ? (
                          <div>
                            <div className="type-body-sm font-semibold text-ink leading-snug truncate">
                              {player.player1}
                            </div>
                            <div className="type-body-sm font-semibold text-ink leading-snug truncate">
                              {player.player2}
                            </div>
                            <p className="type-micro text-ink-soft mt-0.5">
                              Пара · Уровень {player.level}{player.status === 'waitlist' ? ' · Лист ожидания' : ''}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="type-body-sm font-semibold text-ink truncate leading-snug">
                              {typograph(player.name)}
                            </p>
                            <p className="type-micro text-ink-soft mt-0.5">
                              Игрок · Уровень {player.level}{player.status === 'waitlist' ? ' · Лист ожидания' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Свободные слоты */}
                {!completed &&
                  Array.from({ length: availableSlots }).map((_, i) => {
                    const slotIndex = participants.length + i
                    return (
                      <div
                        key={`empty-${i}`}
                        className={cn(
                          'py-3 border-b border-ink/10 flex items-center justify-between gap-3 text-ink-muted',
                          !participantsExpanded && slotIndex >= 4 && 'hidden sm:flex'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-medium text-ink-muted/60 bg-surface-muted/60 tabular-nums">
                            {(slotIndex + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="type-body-sm text-ink-soft">Свободный слот</span>
                        </div>
                        <ContentAction
                          action={dto.item.action}
                          sourcePage={sourcePage}
                          sourceEntity={dto.item.title}
                          variant="neutral"
                          size="sm"
                          className="shrink-0 text-xs px-3 h-8 font-normal"
                        >
                          Занять
                        </ContentAction>
                      </div>
                    )
                  })}
              </div>

              {!participantsExpanded && (participants.length + (!completed ? availableSlots : 0)) > 4 && (
                <div className="sm:hidden pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setParticipantsExpanded(true)}
                    className="inline-flex items-center gap-2 type-caption font-medium text-ink bg-control hover:bg-control-hover px-4 py-2 se-1 transition-colors cursor-pointer"
                  >
                    <span>{typograph('Развернуть')}</span>
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* ТАБ 2: Итоги (Топ-3 в одну строку на ПК [_][_][_] + список) */}
            <div id="tab-standings" className={activeTab === 'standings' ? 'block' : 'hidden'} role="tabpanel">
              {/* Топ-3 призёра крупно в одну строку [_][_][_] на ПК */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-6">
                {standings.slice(0, 3).map((st) => {
                  const isTop1 = st.rank === 1
                  const isTop2 = st.rank === 2

                  // 1: Золото / dark mesh / белое золото подложка
                  // 2: Серебро / silver mesh / серебряная подложка
                  // 3: Бронза / bronze mesh / бронзовая подложка
                  const cardBg = isTop1 ? 'mesh-dark shadow-xs' : isTop2 ? 'mesh-silver shadow-xs' : 'mesh-bronze shadow-xs'
                  const podlozhka = isTop1
                    ? 'bg-gold text-gold-ink shadow-2xs'
                    : isTop2
                      ? 'bg-white/80 text-[#334155] shadow-2xs'
                      : 'bg-[#fed7aa] text-[#7c2d12] shadow-2xs'
                  const labelColor = isTop1 ? 'text-white' : isTop2 ? 'text-[#1e293b]' : 'text-[#431407]'
                  const nameColor = isTop1 ? 'text-white' : isTop2 ? 'text-[#0f172a]' : 'text-[#431407]'
                  const pointsColor = isTop1 ? 'text-gold' : isTop2 ? 'text-[#0f172a]' : 'text-[#431407]'
                  const subtextColor = isTop1 ? 'text-white/60' : isTop2 ? 'text-[#64748b]' : 'text-[#7c2d12]'
                  const borderColor = isTop1 ? 'border-white/10' : isTop2 ? 'border-[#94a3b8]/35' : 'border-[#ea580c]/25'
                  const labelText = isTop1 ? 'Золото' : isTop2 ? 'Серебро' : 'Бронза'

                  return (
                    <div
                      key={`podium-${st.rank}`}
                      className={cn(
                        'se-3 p-5 sm:p-6 flex flex-col justify-between gap-3.5 transition-all border-0',
                        cardBg
                      )}
                    >
                      {/* Верхний ряд: Медаль с подложкой + статус слева, Очки справа (выровнены по верхней границе) */}
                      <div className="flex items-start justify-between gap-2">
                        <div className={cn('flex items-center gap-2 type-ui font-semibold', labelColor)}>
                          <span className={cn('se-1 flex h-7 w-7 items-center justify-center shrink-0', podlozhka)}>
                            <Medal size={15} />
                          </span>
                          <span>{labelText}</span>
                        </div>

                        <div className="text-right leading-none">
                          <span className={cn('type-title-card font-bold tabular-nums', pointsColor)}>
                            {st.points}
                          </span>
                          <span className={cn('type-micro block uppercase tracking-wider mt-0.5', subtextColor)}>
                            очков
                          </span>
                        </div>
                      </div>

                      {/* Имя участника: Dense Title */}
                      <div className="min-w-0">
                        {st.isPair ? (
                          <div className="space-y-0.5">
                            <p className={cn('type-title-dense font-bold truncate leading-tight', nameColor)}>
                              {st.player1}
                            </p>
                            <p className={cn('type-title-dense font-bold truncate leading-tight', nameColor)}>
                              {st.player2}
                            </p>
                          </div>
                        ) : (
                          <p className={cn('type-title-dense font-bold truncate leading-tight', nameColor)}>
                            {typograph(st.name)}
                          </p>
                        )}
                      </div>

                      {/* Нижний ряд: Матчи и Разница (идеально выровнены по одной горизонтали) */}
                      <div className={cn('pt-3 border-t flex items-center justify-between type-caption', borderColor)}>
                        <div className="flex items-center gap-1.5">
                          <span className={cn('type-micro uppercase tracking-wider', subtextColor)}>
                            Матчей:
                          </span>
                          <span className={cn('font-semibold tabular-nums', labelColor)}>
                            {st.matches}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn('type-micro uppercase tracking-wider', subtextColor)}>
                            Разница:
                          </span>
                          <span className={cn('font-semibold tabular-nums', labelColor)}>
                            {st.diff}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Список остальных мест (на ПК с 4-го места, на мобилке с 1-го) */}
              <div className="border-y border-ink/10 divide-y divide-ink/10">
                {standings.map((st, idx) => {
                  const isTopThree = idx < 3
                  const isTop1 = st.rank === 1
                  const isTop2 = st.rank === 2
                  const isTop3 = st.rank === 3
                  const statusLabel = isTop1 ? 'Золото' : isTop2 ? 'Серебро' : isTop3 ? 'Бронза' : st.award
                  return (
                    <div
                      key={st.rank}
                      className={cn(
                        'py-3 flex items-center justify-between gap-3 transition-colors',
                        // На ПК скрываем топ-3, т.к. они уже представлены карточками выше
                        isTopThree && 'sm:hidden',
                        // На мобилке скрываем всё после 4-го до раскрытия
                        !standingsExpanded && idx >= 4 && 'hidden sm:flex',
                        isTop1 && 'font-semibold'
                      )}
                    >
                      {/* Левая часть: Место и Участник / Пара */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span
                          className={cn(
                            'se-1 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold tabular-nums',
                            isTop1
                              ? 'bg-gold text-gold-ink'
                              : isTop2
                                ? 'bg-[#cbd5e1] text-[#1e293b]'
                                : isTop3
                                  ? 'bg-[#fed7aa] text-[#7c2d12]'
                                  : 'text-ink-soft bg-surface-muted'
                          )}
                        >
                          {st.rank.toString().padStart(2, '0')}
                        </span>

                        <div className="min-w-0">
                          {st.isPair ? (
                            <div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="type-body-sm font-semibold text-ink leading-tight">
                                  {st.player1}
                                </span>
                                <span className="text-ink-muted text-xs">/</span>
                                <span className="type-body-sm font-semibold text-ink leading-tight">
                                  {st.player2}
                                </span>
                              </div>
                              {statusLabel && (
                                <span className="type-micro font-medium text-ink-muted block mt-0.5">
                                  {statusLabel}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="type-body-sm font-semibold text-ink truncate block">
                                {typograph(st.name)}
                              </span>
                              {statusLabel && (
                                <span className="type-micro font-medium text-ink-muted block mt-0.5">
                                  {statusLabel}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Правая часть: Показатели (Матчи, Разница, Очки/Победы) */}
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                        <div className="hidden sm:block">
                          <span className="type-micro text-ink-muted block uppercase tracking-wider">
                            Матчей
                          </span>
                          <span className="type-body-sm text-ink-soft tabular-nums">{st.matches}</span>
                        </div>

                        <div className="hidden sm:block">
                          <span className="type-micro text-ink-muted block uppercase tracking-wider">
                            Разница
                          </span>
                          <span className="type-body-sm text-ink-soft tabular-nums">{st.diff}</span>
                        </div>

                        <div className="text-right min-w-[56px] sm:min-w-[68px]">
                          <div className="sm:hidden type-micro text-ink-muted leading-none mb-1 tabular-nums">
                            {st.matches}м · {st.diff}
                          </div>
                          <span className="type-micro text-ink-muted hidden sm:block uppercase tracking-wider">
                            Очки
                          </span>
                          <span className="type-title-dense font-bold text-ink leading-none tabular-nums">
                            {st.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {!standingsExpanded && standings.length > 4 && (
                <div className="sm:hidden pt-3 flex justify-center border-t border-ink/10">
                  <button
                    type="button"
                    onClick={() => setStandingsExpanded(true)}
                    className="inline-flex items-center gap-2 type-caption font-medium text-ink bg-control hover:bg-control-hover px-4 py-2 se-1 transition-colors cursor-pointer"
                  >
                    <span>{typograph('Развернуть')}</span>
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* ТАБ 3: Призы (Суперэллипс, mesh-lime-soft для 1 места, белые подложки без обводок для 2 и 3 мест) */}
            <div id="tab-prizes" className={activeTab === 'prizes' ? 'block' : 'hidden'} role="tabpanel" aria-label="Распределение призов">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {prizes.map((prize, idx) => {
                  const isFirst = idx === 0
                  const isSecond = idx === 1
                  const IconComp = isFirst ? Trophy : Medal

                  const cardBg = isFirst ? 'mesh-dark shadow-xs' : isSecond ? 'mesh-silver shadow-xs' : 'mesh-bronze shadow-xs'
                  const podlozhka = isFirst
                    ? 'bg-gold text-gold-ink shadow-2xs'
                    : isSecond
                      ? 'bg-white/80 text-[#334155] shadow-2xs'
                      : 'bg-[#fed7aa] text-[#7c2d12] shadow-2xs'
                  const labelColor = isFirst ? 'text-white' : isSecond ? 'text-[#1e293b]' : 'text-[#431407]'
                  const titleColor = isFirst ? 'text-white/60' : isSecond ? 'text-[#64748b]' : 'text-[#7c2d12]'
                  const rewardColor = isFirst ? 'text-white' : isSecond ? 'text-[#0f172a]' : 'text-[#431407]'
                  const descColor = isFirst ? 'text-white/70' : isSecond ? 'text-[#475569]' : 'text-[#7c2d12]'
                  const borderColor = isFirst ? 'border-white/10' : isSecond ? 'border-[#94a3b8]/35' : 'border-[#ea580c]/25'

                  return (
                    <div
                      key={prize.place}
                      className={cn(
                        'se-3 p-5 sm:p-6 border-0 flex flex-col justify-between gap-5 transition-all',
                        cardBg
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={cn('flex items-center gap-2 type-ui font-semibold', labelColor)}>
                            <span className={cn('se-1 flex h-7 w-7 items-center justify-center shrink-0', podlozhka)}>
                              <IconComp size={15} />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {prize.place}
                            </span>
                          </div>
                          <span className={cn('type-micro font-medium uppercase tracking-wider pt-1 text-right', titleColor)}>
                            {typograph(prize.title)}
                          </span>
                        </div>

                        <div className="pt-1">
                          <p className={cn('type-title-card font-bold tracking-tight', rewardColor)}>
                            {typograph(prize.reward)}
                          </p>
                        </div>
                      </div>

                      <div className={cn('pt-3.5 border-t', borderColor)}>
                        <p className={cn('type-body-sm leading-relaxed', descColor)}>
                          {typograph(prize.desc)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
        </Reveal>

        {/* 3. Нижний 2-колоночный блок: Регламент и правила (слева) + Частые вопросы (справа) с двумя отдельными заголовками */}
        <Reveal>
        <section aria-label="Игровой день и вопросы">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Левая колонка: 4 анимированных аккордеона с GSAP */}
            <div aria-label="Инфо перед игрой" className="space-y-6">
              <SectionHeader
                title={typograph('Регламент и правила')}
              />
              <div className="flex flex-col">
                {/* 1. Регламент турнира */}
                {dto.item.regulationHTML && (
                  <AnimatedAccordionItem
                    ariaLabel="Регламент турнира"
                    title="Регламент турнира"
                    icon={<FileText size={16} className="text-ink-muted shrink-0" />}
                  >
                    <div
                      className="type-body-sm text-ink-soft leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>*:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: typograph(dto.item.regulationHTML) }}
                    />
                  </AnimatedAccordionItem>
                )}

                {/* 2. Перед выходом на корт */}
                <AnimatedAccordionItem
                  title="Перед выходом на корт"
                  icon={<CheckCircle2 size={16} className="text-ink-muted shrink-0" />}
                >
                  <ul className="space-y-2.5">
                    {checklist.map((item) => (
                      <li key={item} className="type-body-sm flex items-start gap-2.5 text-ink-soft leading-snug">
                        <span className="se-1 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-lime text-lime-ink">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span>{typograph(item)}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedAccordionItem>

                {/* 3. Что включено для каждого игрока */}
                <AnimatedAccordionItem
                  title="Включено для каждого игрока"
                  icon={<Sparkles size={16} className="text-ink-muted shrink-0" />}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {includedPerks.map((perk) => {
                      const PerkIcon = perkIcons[perk.icon]
                      return (
                        <div key={perk.title} className="flex items-start gap-2.5">
                          <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-surface-muted text-ink mt-0.5">
                            <PerkIcon size={14} />
                          </span>
                          <div className="min-w-0">
                            <span className="type-body-sm font-semibold text-ink block leading-tight">
                              {typograph(perk.title)}
                            </span>
                            <span className="type-micro text-ink-soft mt-0.5 block leading-snug">
                              {typograph(perk.description)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </AnimatedAccordionItem>

                {/* 4. Как проходит игровой день */}
                <AnimatedAccordionItem
                  title="Как проходит игровой день"
                  icon={<Timer size={16} className="text-ink-muted shrink-0" />}
                >
                  <div className="divide-y divide-ink/10">
                    {matchdaySteps.map((step) => (
                      <div key={step.title} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <h4 className="type-body-sm font-semibold text-ink">{typograph(step.title)}</h4>
                          <span className="type-micro font-medium text-ink-muted shrink-0">
                            {typograph(step.timing)}
                          </span>
                        </div>
                        <p className="type-caption mt-0.5 text-ink-soft leading-relaxed">
                          {typograph(step.description)}
                        </p>
                      </div>
                    ))}
                  </div>
                </AnimatedAccordionItem>
              </div>
            </div>

            {/* Правая колонка: Частые вопросы — анимированные аккордеоны с GSAP */}
            <div aria-label="Частые вопросы" className="space-y-6">
              <SectionHeader
                title={typograph('Частые вопросы')}
              />
              <div className="flex flex-col">
                {faqItems.map((item, idx) => (
                  <AnimatedAccordionItem
                    key={item.q}
                    title={item.q}
                    defaultOpen={idx === 0}
                  >
                    <p className="type-body-sm text-ink-soft leading-relaxed">
                      {typograph(item.a)}
                    </p>
                  </AnimatedAccordionItem>
                ))}
              </div>
            </div>
          </div>
        </section>
        </Reveal>

        {/* 4. Секция: Другие турниры */}
        {dto.related.length > 0 && (
          <Reveal>
          <section aria-label="Другие турниры" className="pt-2">
            <SectionHeader
              title={typograph('Другие турниры и лиги')}
              action={
                <ButtonLink
                  href="/tournaments"
                  variant="neutral"
                  size="sm"
                  icon={<ChevronRight size={15} />}
                >
                  Все события
                </ButtonLink>
              }
              className="mb-5 sm:mb-6"
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {dto.related.map((item) => (
                <div key={item.id} className="h-full">
                  <TournamentCard tournament={item} />
                </div>
              ))}
            </div>
          </section>
          </Reveal>
        )}
      </article>
    </SiteFrame>
  )
}

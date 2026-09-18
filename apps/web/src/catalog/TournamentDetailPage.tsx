import React, { useState } from 'react'
import type { TournamentCatalogItem, TournamentDetailDTO } from '@unlim/content-contract'
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
  Wallet,
} from 'lucide-react'

import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { TournamentCard } from '../components/cards/TournamentCard'
import { Badge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/Button'
import { ImageCard, MeshCard, type ImageOverlay, type MeshTone } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { cn } from '../utils/cn'

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

export const matchdaySteps = [
  {
    timing: 'За 30 минут',
    title: 'Сбор и разминка',
    desc: 'Регистрация участников на ресепшн, переодевание и разминка на кортах.',
  },
  {
    timing: 'За 10 минут',
    title: 'Брифинг и жеребьёвка',
    desc: 'Судья озвучивает регламент, распределяет корты и даёт старт первому туру.',
  },
  {
    timing: 'Основное время',
    title: 'Турнирные матчи',
    desc: 'Серия динамичных встреч с ротацией и оперативным ведением счёта на табло.',
  },
  {
    timing: 'Финал турнира',
    title: 'Награждение и лаунж',
    desc: 'Финальные розыгрыши, вручение призов и неформальное общение.',
  },
]

export const includedPerks = [
  {
    icon: Sparkles,
    title: 'Турнирные мячи',
    desc: 'Профессиональные мячи Bullpadel на каждый сет.',
  },
  {
    icon: Droplets,
    title: 'Питьевая вода',
    desc: 'Бутилированная и фильтрованная вода для участников.',
  },
  {
    icon: ShowerHead,
    title: 'Раздевалки и сауна',
    desc: 'Просторные душевые, свежие полотенца и финская сауна.',
  },
  {
    icon: Camera,
    title: 'Судейство и фотоотчёт',
    desc: 'Координатор сеток, хронометраж и памятные фотографии.',
  },
]

export function getFaqItems(level: string, format: string) {
  const isAmericano = format.toLowerCase().includes('americano')
  return [
    {
      q: 'Нужен ли постоянный напарник для участия?',
      a: isAmericano
        ? 'Нет, в турнирах формата Americano напарник меняется каждый сет — вы играете в паре с разными участниками. В парных кубках вы можете заявиться готовой парой или мы поможем найти напарника вашего уровня.'
        : 'Вы можете заявиться готовой парой. Если у вас пока нет партнёра, оставьте заявку — администратор турнира подберёт вам напарника соответствующего уровня игры.',
    },
    {
      q: 'Какой уровень подготовки требуется?',
      a: `Турнир рассчитан на уровень ${level}. Если вы сомневаетесь в своём уровне подготовки, свяжитесь с нами — дежурный тренер проведёт быструю оценку и подскажет комфортную группу.`,
    },
    {
      q: 'Какая экипировка нужна для турнира?',
      a: 'Обязательна спортивная обувь для падела или тенниса с немаркой подошвой (non-marking). Ракетку можно принести свою или бесплатно взять на тест-драйв модель Varlion в клубном про-шопе.',
    },
    {
      q: 'Что делать, если планы изменились после регистрации?',
      a: 'Пожалуйста, предупредите координатора не позднее чем за 24 часа до старта турнира для переноса участия.',
    },
  ]
}

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

interface PrizeItem {
  place: string
  placeNum: string
  title: string
  reward: string
  desc: string
}

function getPrizeDistribution(item: TournamentCatalogItem): PrizeItem[] {
  const hasDistinctPrize =
    Boolean(item.prize?.trim()) &&
    !item.entryFee?.includes(item.prize.trim()) &&
    item.prize.trim() !== item.entryFee.trim()

  const isAmericano = item.format.toLowerCase().includes('americano')

  if (isAmericano) {
    return [
      {
        place: '1 МЕСТО',
        placeNum: '01',
        title: 'Победитель Americano',
        reward: hasDistinctPrize ? item.prize : 'Золотой кубок + 15 000 ₽',
        desc: 'Кубок клуба, памятная медаль и сертификат Bullpadel.',
      },
      {
        place: '2 МЕСТО',
        placeNum: '02',
        title: 'Серебряный призёр',
        reward: 'Серебряная медаль + 10 000 ₽',
        desc: 'Клубный мерч и комплект турнирных мячей Bullpadel Gold.',
      },
      {
        place: '3 МЕСТО',
        placeNum: '03',
        title: 'Бронзовый призёр',
        reward: 'Бронзовая медаль + 5 000 ₽',
        desc: 'Сертификат в клубное кафе и памятный сувенир турнира.',
      },
    ]
  }

  return [
    {
      place: '1 МЕСТО',
      placeNum: '01',
      title: 'Чемпионы турнира',
      reward: hasDistinctPrize ? item.prize : 'Кубок чемпионов + 50 000 ₽',
      desc: 'Главный кубок соревнований, золотые медали и ценные призы.',
    },
    {
      place: '2 МЕСТО',
      placeNum: '02',
      title: 'Финалисты кубка',
      reward: 'Серебряные медали + 25 000 ₽',
      desc: 'Серебряные медали и сертификаты на тренировки в клубе.',
    },
    {
      place: '3 МЕСТО',
      placeNum: '03',
      title: 'Призёры кубка',
      reward: 'Бронзовые медали + 15 000 ₽',
      desc: 'Бронзовые медали турнира и фирменные аксессуары.',
    },
  ]
}

interface ParticipantItem {
  id: string
  name: string
  isPair?: boolean
  player1?: string
  player2?: string
  level: string
  status: 'confirmed' | 'waitlist'
}

function getParticipants(item: TournamentCatalogItem): ParticipantItem[] {
  const isAmericano = item.format.toLowerCase().includes('americano')

  if (isAmericano) {
    return [
      { id: '1', name: 'Максим Воронов', level: item.level, status: 'confirmed' },
      { id: '2', name: 'Анна Кузнецова', level: item.level, status: 'confirmed' },
      { id: '3', name: 'Денис Соколов', level: item.level, status: 'confirmed' },
      { id: '4', name: 'Екатерина Морозова', level: item.level, status: 'confirmed' },
      { id: '5', name: 'Артём Лебедев', level: item.level, status: 'confirmed' },
      { id: '6', name: 'Полина Новикова', level: item.level, status: 'confirmed' },
      { id: '7', name: 'Михаил Белов', level: item.level, status: 'confirmed' },
      { id: '8', name: 'София Павлова', level: item.level, status: 'confirmed' },
      { id: '9', name: 'Роман Орлов', level: item.level, status: 'confirmed' },
      { id: '10', name: 'Дарья Смирнова', level: item.level, status: 'confirmed' },
      { id: '11', name: 'Кирилл Фёдоров', level: item.level, status: 'confirmed' },
      { id: '12', name: 'Елена Попова', level: item.level, status: 'confirmed' },
    ]
  }

  return [
    { id: '1', name: 'Воронов М. / Кузнецов А.', isPair: true, player1: 'М. Воронов', player2: 'А. Кузнецов', level: item.level, status: 'confirmed' },
    { id: '2', name: 'Соколов Д. / Васильев И.', isPair: true, player1: 'Д. Соколов', player2: 'И. Васильев', level: item.level, status: 'confirmed' },
    { id: '3', name: 'Лебедев А. / Фёдоров К.', isPair: true, player1: 'А. Лебедев', player2: 'К. Фёдоров', level: item.level, status: 'confirmed' },
    { id: '4', name: 'Орлов Р. / Медведев С.', isPair: true, player1: 'Р. Орлов', player2: 'С. Медведев', level: item.level, status: 'confirmed' },
    { id: '5', name: 'Белов М. / Новиков П.', isPair: true, player1: 'М. Белов', player2: 'П. Новиков', level: item.level, status: 'confirmed' },
    { id: '6', name: 'Морозов Е. / Ильин О.', isPair: true, player1: 'Е. Морозов', player2: 'О. Ильин', level: item.level, status: 'confirmed' },
  ]
}

interface StandingItem {
  rank: number
  name: string
  isPair?: boolean
  player1?: string
  player2?: string
  matches: number
  points: number
  diff: string
  award?: string
}

function getStandings(item: TournamentCatalogItem): StandingItem[] {
  const isAmericano = item.format.toLowerCase().includes('americano')

  if (isAmericano) {
    return [
      { rank: 1, name: 'Максим Воронов', matches: 7, points: 142, diff: '+38', award: 'Золотой кубок' },
      { rank: 2, name: 'Екатерина Морозова', matches: 7, points: 136, diff: '+26', award: 'Серебряный призёр' },
      { rank: 3, name: 'Артём Лебедев', matches: 7, points: 131, diff: '+18', award: 'Бронзовый призёр' },
      { rank: 4, name: 'Анна Кузнецова', matches: 7, points: 125, diff: '+12' },
      { rank: 5, name: 'Михаил Белов', matches: 7, points: 119, diff: '+4' },
      { rank: 6, name: 'Полина Новикова', matches: 7, points: 114, diff: '-2' },
      { rank: 7, name: 'Денис Соколов', matches: 7, points: 108, diff: '-14' },
      { rank: 8, name: 'София Павлова', matches: 7, points: 102, diff: '-22' },
      { rank: 9, name: 'Роман Орлов', matches: 7, points: 98, diff: '-28' },
      { rank: 10, name: 'Дарья Смирнова', matches: 7, points: 94, diff: '-32' },
    ]
  }

  return [
    { rank: 1, name: 'Воронов М. / Кузнецов А.', isPair: true, player1: 'М. Воронов', player2: 'А. Кузнецов', matches: 5, points: 15, diff: '+24', award: 'Чемпионы' },
    { rank: 2, name: 'Соколов Д. / Васильев И.', isPair: true, player1: 'Д. Соколов', player2: 'И. Васильев', matches: 5, points: 12, diff: '+16', award: 'Финалисты' },
    { rank: 3, name: 'Лебедев А. / Фёдоров К.', isPair: true, player1: 'А. Лебедев', player2: 'К. Фёдоров', matches: 5, points: 9, diff: '+8', award: '3-е место' },
    { rank: 4, name: 'Орлов Р. / Медведев С.', isPair: true, player1: 'Р. Орлов', player2: 'С. Медведев', matches: 5, points: 6, diff: '-4' },
    { rank: 5, name: 'Белов М. / Новиков П.', isPair: true, player1: 'М. Белов', player2: 'П. Новиков', matches: 5, points: 3, diff: '-18' },
  ]
}

export function TournamentDetailPage({ dto }: { dto: TournamentDetailDTO }) {
  const completed = dto.item.lifecycle === 'finished' || dto.item.lifecycle === 'cancelled'
  const sourcePage = `/tournaments/${dto.item.slug}`
  const isAmericano = dto.item.format.toLowerCase().includes('americano')

  const Icon = tournamentIcons[dto.item.icon as keyof typeof tournamentIcons] || Trophy

  const [activeTab, setActiveTab] = useState<'participants' | 'standings' | 'prizes'>(
    completed ? 'standings' : 'participants'
  )
  const [participantsExpanded, setParticipantsExpanded] = useState(false)
  const [standingsExpanded, setStandingsExpanded] = useState(false)

  const hasDistinctPrize =
    Boolean(dto.item.prize?.trim()) &&
    !dto.item.entryFee?.includes(dto.item.prize.trim()) &&
    dto.item.prize.trim() !== dto.item.entryFee.trim()

  const checklist = [
    'Приезжайте за 15–30 минут до начала для спокойной разминки и жеребьёвки.',
    'Возьмите спортивную обувь с немаркой подошвой (non-marking).',
    'Ракетку можно принести свою или взять на тест-драйв в про-шопе.',
  ]

  const faqItems = getFaqItems(dto.item.level, dto.item.format)
  const prizes = getPrizeDistribution(dto.item)
  const participants = getParticipants(dto.item)
  const standings = getStandings(dto.item)
  const totalSlots = isAmericano ? 16 : 8
  const availableSlots = Math.max(0, totalSlots - participants.length)

  // Внутренний контент Hero Left визитки
  const heroCardContent = (
    <div className="relative z-10 flex min-h-[360px] sm:min-h-[400px] md:min-h-[440px] flex-col justify-between p-6 sm:p-7 md:p-8 h-full">
      {/* Верхний ряд: статус */}
      <div className="flex items-center justify-between gap-2.5">
        {completed ? (
          <Badge tone="glass" icon={<CheckCircle2 size={13} className="text-white/70" />}>
            Турнир завершён
          </Badge>
        ) : dto.item.lifecycle === 'active' ? (
          <Badge tone="lime" className="font-semibold shadow-xs">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lime-ink" />
            Идёт турнир
          </Badge>
        ) : (
          <Badge tone="lime" className="font-semibold shadow-xs">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lime-ink animate-pulse" />
            Регистрация открыта
          </Badge>
        )}
      </div>

      {/* Нижняя часть Hero: Название турнира, прижатое к уровню игроков, кнопка справа и шкала уровня */}
      <div className="mt-auto pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="type-section font-semibold text-white tracking-tight leading-tight flex-1">
            {typograph(dto.item.title)}
          </h1>
          <div className="shrink-0">
            {completed ? (
              <ButtonLink href="/tournaments" variant="secondary" size="md">
                Все турниры
              </ButtonLink>
            ) : (
              <ContentAction
                action={dto.item.action}
                sourcePage={sourcePage}
                sourceEntity={dto.item.title}
                size="lg"
              />
            )}
          </div>
        </div>

        <div className="se-2 bg-black/35 backdrop-blur-sm p-3 border-0">
          <LevelGauge levelStr={dto.item.level} />
        </div>
      </div>
    </div>
  )

  return (
    <SiteFrame site={dto.site} backLink={{ href: '/tournaments' }}>
      {/* pt-24 md:pt-32 гарантирует, что фиксированный header не перекрывает hero, а space-y-16..28 дает чистое швейцарское пространство */}
      <article data-page-enter="content" className="container-page pb-24 pt-24 sm:pt-28 md:pt-32 space-y-16 sm:space-y-20 md:space-y-28">
        {/* 1. Первый экран: Равнозначный сплит 50/50: Hero Left (визитка) + Hero Right (инфо без карточки) */}
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
                        {typograph(dto.item.format)}
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
                      {typograph(hasDistinctPrize ? dto.item.prizeLabel : 'Призовой фонд')}
                    </dt>
                    <dd className="mt-1">
                      <span className="type-body-sm font-semibold text-ink block leading-snug">
                        {typograph(hasDistinctPrize ? dto.item.prize : 'Кубки и клубные призы')}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Быстрые контакты координатора */}
              <div className="pt-5 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3 text-ink-soft type-caption mt-6">
                <span className="text-ink-muted font-medium">Вопросы координатору:</span>
                <div className="flex items-center gap-4">
                  <a
                    href="https://t.me/unlimpadel"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-ink/70 transition-colors"
                  >
                    <Send size={13} /> Telegram
                  </a>
                  {dto.site.contacts?.phoneDisplay && (
                    <a
                      href={`tel:${dto.site.contacts.phoneValue}`}
                      className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-ink/70 transition-colors"
                    >
                      <Phone size={13} /> {dto.site.contacts.phoneDisplay}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Соревновательный блок с лаконичными табами: Участники / Итоги / Призы */}
        <section aria-label="Участники и результаты">
          <SectionHeader
            title={typograph('Сетка и участники')}
            action={
              <div className="se-2 inline-flex bg-surface-muted p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('participants')}
                  className={cn(
                    'se-1 px-4 py-2 type-ui font-medium transition-colors cursor-pointer whitespace-nowrap',
                    activeTab === 'participants'
                      ? 'bg-white text-ink shadow-xs font-semibold'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  Участники
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('standings')}
                  className={cn(
                    'se-1 px-4 py-2 type-ui font-medium transition-colors cursor-pointer whitespace-nowrap',
                    activeTab === 'standings'
                      ? 'bg-white text-ink shadow-xs font-semibold'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  Итоги
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prizes')}
                  className={cn(
                    'se-1 px-4 py-2 type-ui font-medium transition-colors cursor-pointer whitespace-nowrap',
                    activeTab === 'prizes'
                      ? 'bg-white text-ink shadow-xs font-semibold'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  Призы
                </button>
              </div>
            }
            className="mb-6"
          />

          {/* ТАБ 1: Участники */}
          <div className={activeTab === 'participants' ? 'block' : 'hidden'} role="tabpanel">
            <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-lime transition-all duration-300"
                style={{ width: `${(participants.length / totalSlots) * 100}%` }}
              />
            </div>

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
                    <span className="font-mono text-xs font-bold text-ink-muted w-5 shrink-0">
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
                            Пара · Уровень {player.level}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="type-body-sm font-semibold text-ink truncate leading-snug">
                            {typograph(player.name)}
                          </p>
                          <p className="type-micro text-ink-soft mt-0.5">
                            Игрок · Уровень {player.level}
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
                        <span className="font-mono text-xs font-medium text-ink-muted/50 w-5 shrink-0">
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

            {/* ТАБ 2: Итоги (Реструктурированный швейцарский список БЕЗ горизонтального скролла) */}
            <div className={activeTab === 'standings' ? 'block' : 'hidden'} role="tabpanel">
              <p className="type-caption text-ink-soft mb-4">
                {typograph(
                  isAmericano
                    ? 'Система Americano: начисление очков по сумме всех выигранных геймов в сыгранных турах.'
                    : 'Итоговые результаты турнира по сумме побед и разнице выигранных геймов.'
                )}
              </p>

              <div className="divide-y divide-ink/10">
                {standings.map((st, idx) => {
                  const isTop1 = st.rank === 1
                  const isTop2 = st.rank === 2
                  const isTop3 = st.rank === 3
                  return (
                    <div
                      key={st.rank}
                      className={cn(
                        'py-3 flex items-center justify-between gap-3 transition-colors',
                        !standingsExpanded && idx >= 4 && 'hidden sm:flex',
                        isTop1 && 'font-semibold'
                      )}
                    >
                      {/* Левая часть: Место и Участник / Пара */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span
                          className={cn(
                            'se-1 flex h-7 w-7 shrink-0 items-center justify-center font-mono text-xs font-bold',
                            isTop1
                              ? 'bg-lime text-lime-ink'
                              : isTop2 || isTop3
                                ? 'bg-control text-ink'
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
                                <span className="text-ink-muted text-xs font-mono">/</span>
                                <span className="type-body-sm font-semibold text-ink leading-tight">
                                  {st.player2}
                                </span>
                                {isTop1 && <Trophy size={14} className="text-[#eab308] shrink-0" />}
                              </div>
                              {st.award && (
                                <span className="type-micro font-medium text-ink-muted block mt-0.5">
                                  {st.award}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="type-body-sm font-semibold text-ink truncate">
                                  {typograph(st.name)}
                                </span>
                                {isTop1 && <Trophy size={14} className="text-[#eab308] shrink-0 ml-0.5" />}
                              </div>
                              {st.award && (
                                <span className="type-micro font-medium text-ink-muted block mt-0.5">
                                  {st.award}
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
                          <span className="type-body-sm font-mono text-ink-soft">{st.matches}</span>
                        </div>

                        <div className="hidden sm:block">
                          <span className="type-micro text-ink-muted block uppercase tracking-wider">
                            Разница
                          </span>
                          <span
                            className={cn(
                              'type-body-sm font-mono font-semibold',
                              st.diff.startsWith('+') ? 'text-green-600' : 'text-ink-soft'
                            )}
                          >
                            {st.diff}
                          </span>
                        </div>

                        <div className="text-right min-w-[56px] sm:min-w-[68px]">
                          <div className="sm:hidden type-micro text-ink-muted font-mono leading-none mb-1">
                            {st.matches}м · {st.diff}
                          </div>
                          <span className="type-micro text-ink-muted hidden sm:block uppercase tracking-wider">
                            {isAmericano ? 'Очки' : 'Победы'}
                          </span>
                          <span className="type-title-dense font-bold font-mono text-ink leading-none">
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

            {/* ТАБ 3: Призы */}
            <div className={activeTab === 'prizes' ? 'block' : 'hidden'} role="tabpanel" aria-label="Распределение призов">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                {prizes.map((prize, idx) => {
                  const icon =
                    idx === 0 ? (
                      <Trophy size={18} className="text-ink" />
                    ) : idx === 1 ? (
                      <Medal size={18} className="text-ink" />
                    ) : (
                      <Award size={18} className="text-ink" />
                    )

                  return (
                    <div
                      key={prize.place}
                      className="border-t-2 border-ink pt-4 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {icon}
                          <span className="type-micro font-mono font-bold text-ink uppercase tracking-wider">
                            {prize.place}
                          </span>
                          <span className="text-ink-muted text-xs">·</span>
                          <span className="type-caption text-ink-soft">
                            {typograph(prize.title)}
                          </span>
                        </div>
                        <p className="type-body font-semibold text-ink">
                          {typograph(prize.reward)}
                        </p>
                      </div>
                      <p className="type-body-sm text-ink-soft leading-relaxed">
                        {typograph(prize.desc)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
        </section>

        {/* 3. Нижний 2-колоночный блок: Регламент и правила (слева) + Частые вопросы (справа) с двумя отдельными заголовками */}
        <section aria-label="Игровой день и вопросы">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Левая колонка: 4 нативных аккордеона, свёрнутые по дефолту */}
            <div aria-label="Инфо перед игрой" className="space-y-6">
              <SectionHeader
                title={typograph('Регламент и правила')}
              />
              <div className="divide-y divide-ink/10 border-y border-ink/10">
                {/* 1. Регламент турнира */}
                <details aria-label="Регламент турнира" className="group/acc py-4 first:pt-0 last:pb-0">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none type-body font-medium text-ink hover:text-ink/80 transition-colors">
                    <span className="flex items-center gap-2.5">
                      <FileText size={16} className="text-ink-muted shrink-0" />
                      <span>{typograph('Регламент турнира')}</span>
                    </span>
                    <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-control text-ink transition-transform duration-200 group-open/acc:rotate-180">
                      <ChevronDown size={14} />
                    </span>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-ink/10">
                    {dto.item.regulationHTML ? (
                      <div
                        className="type-body-sm text-ink-soft leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>*:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: typograph(dto.item.regulationHTML) }}
                      />
                    ) : (
                      <p className="type-body-sm text-ink-soft">
                        {typograph(
                          'Регламент соревнований публикуется судейской коллегией перед началом турнира.'
                        )}
                      </p>
                    )}
                  </div>
                </details>

                {/* 2. Перед выходом на корт */}
                <details className="group/acc py-4 first:pt-0 last:pb-0">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none type-body font-medium text-ink hover:text-ink/80 transition-colors">
                    <span className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-ink-muted shrink-0" />
                      <span>{typograph('Перед выходом на корт')}</span>
                    </span>
                    <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-control text-ink transition-transform duration-200 group-open/acc:rotate-180">
                      <ChevronDown size={14} />
                    </span>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-ink/10">
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
                  </div>
                </details>

                {/* 3. Что включено для каждого игрока */}
                <details className="group/acc py-4 first:pt-0 last:pb-0">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none type-body font-medium text-ink hover:text-ink/80 transition-colors">
                    <span className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-ink-muted shrink-0" />
                      <span>{typograph('Включено для каждого игрока')}</span>
                    </span>
                    <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-control text-ink transition-transform duration-200 group-open/acc:rotate-180">
                      <ChevronDown size={14} />
                    </span>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-ink/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {includedPerks.map((perk) => {
                        const PerkIcon = perk.icon
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
                                {typograph(perk.desc)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </details>

                {/* 4. Как проходит игровой день */}
                <details className="group/acc py-4 first:pt-0 last:pb-0">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none type-body font-medium text-ink hover:text-ink/80 transition-colors">
                    <span className="flex items-center gap-2.5">
                      <Timer size={16} className="text-ink-muted shrink-0" />
                      <span>{typograph('Как проходит игровой день')}</span>
                    </span>
                    <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-control text-ink transition-transform duration-200 group-open/acc:rotate-180">
                      <ChevronDown size={14} />
                    </span>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-ink/10 divide-y divide-ink/10">
                    {matchdaySteps.map((step) => (
                      <div key={step.title} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <h4 className="type-body-sm font-semibold text-ink">{typograph(step.title)}</h4>
                          <span className="type-micro font-medium text-ink-muted shrink-0">
                            {typograph(step.timing)}
                          </span>
                        </div>
                        <p className="type-caption mt-0.5 text-ink-soft leading-relaxed">
                          {typograph(step.desc)}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            {/* Правая колонка: Частые вопросы — нативные чистые аккордеоны без задержек раскрытия */}
            <div aria-label="Частые вопросы" className="space-y-6">
              <SectionHeader
                title={typograph('Частые вопросы')}
              />
              <div className="divide-y divide-ink/10 border-y border-ink/10">
                {faqItems.map((item, idx) => (
                  <details key={item.q} open={idx === 0} className="group/faq py-4 first:pt-0 last:pb-0">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none type-body font-medium text-ink hover:text-ink/80 transition-colors">
                      <span>{typograph(item.q)}</span>
                      <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-control text-ink transition-transform duration-200 group-open/faq:rotate-180">
                        <ChevronDown size={14} />
                      </span>
                    </summary>
                    <p className="type-body-sm text-ink-soft mt-3 leading-relaxed">
                      {typograph(item.a)}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Секция: Другие турниры */}
        {dto.related.length > 0 && (
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
        )}
      </article>
    </SiteFrame>
  )
}

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
  Gauge,
  Medal,
  PartyPopper,
  Phone,
  Send,
  ShowerHead,
  Sparkles,
  Trophy,
  Wallet,
} from 'lucide-react'

import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { TournamentCard } from '../components/cards/TournamentCard'
import { Accordion } from '../components/ui/Accordion'
import { Badge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/Button'
import { ImageCard, MeshCard, SurfaceCard, type ImageOverlay, type MeshTone } from '../components/ui/Card'
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
  const matched = levelStr.match(/\d+(\.\d+)?/g) || ['2.0']
  const minVal = parseFloat(matched[0] || '2.0')
  const maxVal = parseFloat(matched[matched.length - 1] || matched[0] || '2.0')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs text-white/80">
        <span className="flex items-center gap-1.5 font-medium">
          <Gauge size={13} className="text-lime" />
          <span>Уровень игроков:</span>
          <span className="font-semibold text-white">{levelStr}</span>
        </span>
        <span className="text-[11px] text-white/60">Шкала 1.0–7.0</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {allLevels.map((lvl) => {
          const num = parseFloat(lvl)
          const isActive = num >= minVal && num <= maxVal
          return (
            <div key={lvl} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-1.5 w-full rounded-full transition-colors',
                  isActive ? 'bg-lime shadow-[0_0_8px_rgba(194,245,66,0.6)]' : 'bg-white/20'
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

  const [activeTab, setActiveTab] = useState<'participants' | 'standings'>(
    completed ? 'standings' : 'participants'
  )
  const [regulationOpen, setRegulationOpen] = useState(false)

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

  // Внутренний контент Hero-блока
  const heroCardContent = (
    <div className="relative z-10 flex min-h-[380px] sm:min-h-[420px] md:min-h-[450px] flex-col justify-between p-6 sm:p-8 md:p-9 h-full">
      {/* Верхний ряд бейджей и статус */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {completed ? (
            <Badge tone="glass" icon={<CheckCircle2 size={13} className="text-white/70" />}>
              Турнир завершён
            </Badge>
          ) : dto.item.lifecycle === 'active' ? (
            <Badge tone="lime" className="font-semibold shadow-sm">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lime-ink" />
              Идёт турнир
            </Badge>
          ) : (
            <Badge tone="lime" className="font-semibold shadow-sm">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lime-ink animate-pulse" />
              Регистрация открыта
            </Badge>
          )}

          <Badge tone="glass" icon={<Icon size={14} className="text-white/80" />}>
            {dto.item.format}
          </Badge>
        </div>

        <span className="type-caption text-white/70 hidden sm:inline-block">
          {isAmericano ? 'Ротация напарников' : 'Парный кубок'}
        </span>
      </div>

      {/* Заголовок и интро */}
      <div className="my-6">
        <h1 className="type-section font-bold text-white tracking-tight leading-tight">
          {typograph(dto.item.title)}
        </h1>
        <p className="type-body sm:type-editorial mt-3 text-white/80 leading-relaxed">
          {typograph(dto.item.description)}
        </p>
      </div>

      {/* Нижняя часть Hero: шкала уровня 1.0 - 7.0 и ЕДИНСТВЕННАЯ кнопка записи на странице */}
      <div className="space-y-5 pt-2">
        <div className="se-2 bg-black/35 backdrop-blur-md p-3.5 border-0">
          <LevelGauge levelStr={dto.item.level} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {completed ? (
            <div className="flex items-center gap-3">
              <ButtonLink href="/tournaments" variant="secondary" size="lg">
                Все турниры
              </ButtonLink>
              <span className="type-caption text-white/75">
                Этот турнир уже завершился
              </span>
            </div>
          ) : (
            <>
              <ContentAction
                action={dto.item.action}
                sourcePage={sourcePage}
                sourceEntity={dto.item.title}
                size="lg"
              />
              <span className="type-caption text-white/75">
                {availableSlots > 0 ? `Осталось ${availableSlots} слотов` : 'Мест нет'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <SiteFrame site={dto.site} backLink={{ href: '/tournaments' }}>
      <article data-page-enter="content" className="container-page pb-16 pt-6 md:pb-24 md:pt-8 space-y-10 md:space-y-14">
        {/* 1. Первый экран на ПК: Сплит Hero (слева) + Паспорт турнира (справа) */}
        <section aria-label="Визитка и паспорт турнира">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Левая колонка: Hero-визитка с мешем/фото и кнопкой записи */}
            <div aria-label="Визитка турнира" className="lg:col-span-7 flex flex-col">
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

            {/* Правая колонка: Паспорт турнира (Main Info) */}
            <div aria-label="Паспорт турнира" className="lg:col-span-5 flex flex-col">
              <SurfaceCard tone="white" interactive={false} className="p-6 sm:p-8 flex flex-col justify-between h-full border-0">
                <div>
                  <h2 className="type-title-card font-semibold text-ink">
                    {typograph('Информация о турнире')}
                  </h2>

                  <dl className="mt-6 divide-y divide-ink/10">
                    {/* Расписание (БЕЗ МЕСТА ПРОВЕДЕНИЯ) */}
                    <div className="py-4 first:pt-0">
                      <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {typograph('Расписание')}
                      </dt>
                      <dd className="mt-1.5">
                        <span className="type-title-dense font-semibold text-ink block leading-snug">
                          {typograph(dto.item.scheduleLabel)}
                        </span>
                      </dd>
                    </div>

                    {/* Формат соревнований */}
                    <div className="py-4">
                      <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                        <Icon size={14} />
                        {typograph('Формат')}
                      </dt>
                      <dd className="mt-1.5">
                        <span className="type-title-dense font-semibold text-ink block leading-snug">
                          {typograph(dto.item.format)}
                        </span>
                        <span className="type-caption text-ink-soft mt-0.5 block">
                          {typograph(`Уровень игроков ${dto.item.level}`)}
                        </span>
                      </dd>
                    </div>

                    {/* Вступительный взнос (ЕДИНСТВЕННОЕ МЕСТО НА СТРАНИЦЕ) */}
                    <div className="py-4">
                      <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                        <Wallet size={14} />
                        {typograph('Взнос')}
                      </dt>
                      <dd className="mt-1.5">
                        <span className="type-title-dense font-semibold text-ink block leading-snug">
                          {typograph(dto.item.entryFee)}
                        </span>
                      </dd>
                    </div>

                    {/* Призовой фонд */}
                    <div className="py-4">
                      <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                        <Award size={14} />
                        {typograph(hasDistinctPrize ? dto.item.prizeLabel : 'Призовой фонд')}
                      </dt>
                      <dd className="mt-1.5">
                        <span className="type-title-dense font-semibold text-ink block leading-snug">
                          {typograph(hasDistinctPrize ? dto.item.prize : 'Кубки и клубные призы')}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Быстрые контакты */}
                <div className="pt-6 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3 text-ink-soft type-caption">
                  <span className="text-ink-muted">Вопросы координатору:</span>
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
              </SurfaceCard>
            </div>
          </div>
        </section>

        {/* 2. Секция: Распределение призов по местам (Чистая швейцарская типографика без цветных подложек) */}
        <section aria-label="Распределение призов">
          <SectionHeader
            title={typograph('Распределение призов по местам')}
            action={
              hasDistinctPrize ? (
                <span className="type-caption font-semibold uppercase tracking-wider text-ink-muted">
                  {dto.item.prizeLabel || 'Призовой фонд'}: {dto.item.prize}
                </span>
              ) : undefined
            }
            className="mb-5"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink/10 bg-white se-3 p-6 sm:p-8 border-0">
            {prizes.map((prize) => (
              <div
                key={prize.place}
                className="py-5 md:py-0 md:px-6 first:pt-0 md:first:pl-0 last:pb-0 md:last:pr-0 flex flex-col justify-between"
              >
                <div>
                  <span className="type-caption font-mono font-bold text-ink-muted tracking-widest block">
                    {prize.place}
                  </span>
                  <p className="type-title-large font-bold text-ink mt-2">
                    {typograph(prize.reward)}
                  </p>
                  <p className="type-body font-semibold text-ink mt-1">
                    {typograph(prize.title)}
                  </p>
                </div>
                <p className="type-body-sm text-ink-soft mt-3 leading-relaxed">
                  {typograph(prize.desc)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Секция: Сетка, участники и итоги турнира (БЕЗ горизонтального скролла, адаптивные строки) */}
        <section aria-label="Участники и результаты">
          <SectionHeader
            title={typograph('Сетка и участники')}
            action={
              <div className="se-2 inline-flex bg-surface-muted p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('participants')}
                  className={cn(
                    'se-1 px-3.5 py-1.5 type-ui font-medium transition-colors cursor-pointer',
                    activeTab === 'participants'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  Список участников ({participants.length}/{totalSlots})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('standings')}
                  className={cn(
                    'se-1 px-3.5 py-1.5 type-ui font-medium transition-colors cursor-pointer',
                    activeTab === 'standings'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  Итоги турнира
                </button>
              </div>
            }
            className="mb-5"
          />

          <div className="bg-white se-3 p-5 sm:p-8 border-0">
            {/* Вкладка: Список участников */}
            {activeTab === 'participants' && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-ink-soft type-caption">
                  <span>
                    Занято слотов: <strong className="text-ink">{participants.length}</strong> из{' '}
                    <strong className="text-ink">{totalSlots}</strong>
                  </span>
                  <span className="text-lime-ink font-semibold">
                    {availableSlots > 0 ? `Доступно ${availableSlots} слотов` : 'Сетка заполнена'}
                  </span>
                </div>

                <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-lime transition-all duration-300"
                    style={{ width: `${(participants.length / totalSlots) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {participants.map((player, idx) => (
                    <div
                      key={player.id}
                      className="se-1 p-3.5 flex items-center justify-between gap-3 bg-surface-muted/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="se-full flex h-8 w-8 shrink-0 items-center justify-center bg-control font-mono text-xs font-semibold text-ink">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          {player.isPair ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="type-body-sm font-semibold text-ink">{player.player1}</span>
                              <span className="type-micro text-ink-muted font-mono">&</span>
                              <span className="type-body-sm font-semibold text-ink">{player.player2}</span>
                            </div>
                          ) : (
                            <p className="type-body-sm font-semibold text-ink truncate">
                              {typograph(player.name)}
                            </p>
                          )}
                          <p className="type-micro text-ink-soft">
                            Уровень {player.level} {player.isPair ? '· Пара' : '· Игрок'}
                          </p>
                        </div>
                      </div>
                      <Badge tone="muted" className="text-[11px] shrink-0">
                        Подтверждён
                      </Badge>
                    </div>
                  ))}

                  {/* Свободные слоты — чистый индикатор без дублирования кнопок */}
                  {!completed &&
                    Array.from({ length: availableSlots }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="se-1 border border-dashed border-ink/20 p-3.5 flex items-center justify-between gap-3 text-ink-muted"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="se-full flex h-8 w-8 shrink-0 items-center justify-center border border-dashed border-ink/20 font-mono text-xs">
                            {participants.length + i + 1}
                          </span>
                          <span className="type-body-sm text-ink-soft">Свободный слот</span>
                        </div>
                        <span className="type-micro font-mono uppercase text-ink-muted">Открыт</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Вкладка: Итоги турнира (Адаптивные строки БЕЗ горизонтального скролла) */}
            {activeTab === 'standings' && (
              <div>
                <p className="type-caption text-ink-soft mb-4">
                  {typograph(
                    isAmericano
                      ? 'Система Americano: начисление очков по сумме всех выигранных геймов в сыгранных турах.'
                      : 'Итоговые результаты кубка по сумме побед и разнице выигранных геймов.'
                  )}
                </p>

                {/* Адаптивный швейцарский список строк (без overflow-x-auto, без полосы скролла) */}
                <div className="divide-y divide-ink/10">
                  {standings.map((st) => {
                    const isTop1 = st.rank === 1
                    const isTop2 = st.rank === 2
                    const isTop3 = st.rank === 3
                    return (
                      <div
                        key={st.rank}
                        className={cn(
                          'py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors',
                          isTop1 && 'font-semibold'
                        )}
                      >
                        {/* Левая часть: Место и Участник/Пара */}
                        <div className="flex items-center gap-3 min-w-0">
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
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="type-body font-semibold text-ink">{st.player1}</span>
                                <span className="type-micro px-1 py-0.5 rounded bg-surface-muted text-ink-soft font-mono">
                                  &
                                </span>
                                <span className="type-body font-semibold text-ink">{st.player2}</span>
                                {isTop1 && <Trophy size={15} className="text-[#eab308] shrink-0 ml-1" />}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="type-body font-semibold text-ink truncate">
                                  {typograph(st.name)}
                                </span>
                                {isTop1 && <Trophy size={15} className="text-[#eab308] shrink-0" />}
                              </div>
                            )}

                            {st.award && (
                              <span className="type-micro font-medium text-ink-muted block mt-0.5">
                                {st.award}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Правая часть: Показатели (Очки, Матчи, Разница) — никогда не вылезает за экран */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 pl-10 sm:pl-0">
                          <div className="text-left sm:text-right">
                            <span className="type-caption text-ink-muted block text-[11px] uppercase tracking-wider">
                              Матчей
                            </span>
                            <span className="type-body-sm font-mono text-ink-soft">{st.matches}</span>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="type-caption text-ink-muted block text-[11px] uppercase tracking-wider">
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

                          <div className="text-right min-w-[70px]">
                            <span className="type-caption text-ink-muted block text-[11px] uppercase tracking-wider">
                              Очки
                            </span>
                            <span className="type-title-card font-bold font-mono text-ink leading-none">
                              {st.points}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. Секция: Регламент соревнований (Свёрнут по умолчанию, раскрывается кнопкой) */}
        <section aria-label="Регламент турнира">
          <SectionHeader
            title={typograph('Регламент турнира')}
            action={
              <button
                type="button"
                onClick={() => setRegulationOpen((prev) => !prev)}
                aria-expanded={regulationOpen}
                className="se-1 type-ui font-medium px-4 py-2 bg-control hover:bg-control-hover flex items-center justify-between sm:justify-center gap-2 text-ink transition-colors cursor-pointer"
              >
                <span>{regulationOpen ? 'Свернуть регламент' : 'Развернуть регламент'}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'transition-transform duration-200 text-ink-soft',
                    regulationOpen && 'rotate-180'
                  )}
                />
              </button>
            }
            className="mb-5"
          />

          <div className="bg-white se-3 p-5 sm:p-8 border-0">
            {regulationOpen ? (
              <div>
                {dto.item.regulationHTML ? (
                  <div
                    className="type-body text-ink leading-relaxed [&>p]:mb-3.5 [&>ul]:mb-3.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-3.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>*:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: typograph(dto.item.regulationHTML) }}
                  />
                ) : (
                  <p className="type-body text-ink-soft">
                    {typograph(
                      'Регламент соревнований публикуется судейской коллегией перед началом турнира.'
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 text-ink-soft type-body-sm">
                <p className="line-clamp-1 max-w-2xl">
                  {dto.item.regulationHTML
                    ? typograph(
                        dto.item.regulationHTML.replace(/<[^>]*>?/gm, '').slice(0, 140) + '…'
                      )
                    : typograph(
                        'Регламент определяет порядок жеребьевки, систему начисления очков и награждение.'
                      )}
                </p>
                <button
                  type="button"
                  onClick={() => setRegulationOpen(true)}
                  className="type-caption font-semibold text-ink underline underline-offset-4 hover:text-ink/70 cursor-pointer"
                >
                  Читать полностью
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 5. Секция: Игровой день и вопросы (2-колоночный сплит на десктопе, компактный на мобильном) */}
        <section aria-label="Игровой день и вопросы">
          <SectionHeader title={typograph('Игровой день и вопросы')} className="mb-6 md:mb-8" />

          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
            {/* Левая колонка: Как проходит игровой день и памятка */}
            <div className="space-y-8">
              <div>
                <h3 className="type-title-card font-semibold text-ink mb-4">
                  {typograph('Как проходит игровой день')}
                </h3>
                <div className="divide-y divide-ink/10 border-y border-ink/10">
                  {matchdaySteps.map((step) => (
                    <div key={step.title} className="py-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <h4 className="type-body font-semibold text-ink">{typograph(step.title)}</h4>
                        <span className="type-caption font-medium text-ink-muted shrink-0">
                          {typograph(step.timing)}
                        </span>
                      </div>
                      <p className="type-body-sm mt-1 text-ink-soft leading-relaxed">
                        {typograph(step.desc)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Памятка и сервис перед выходом на корт */}
              <div className="bg-white se-3 p-5 sm:p-6 border-0">
                <h3 className="type-title-card font-semibold text-ink mb-3">
                  {typograph('Перед выходом на корт')}
                </h3>
                <ul className="space-y-2.5">
                  {checklist.map((item) => (
                    <li key={item} className="type-body-sm flex items-start gap-2.5 text-ink-soft leading-snug">
                      <span className="se-1 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                        <Check size={13} strokeWidth={2.8} />
                      </span>
                      <span>{typograph(item)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-4 border-t border-ink/10">
                  <h4 className="type-caption uppercase tracking-wider font-semibold text-ink-muted mb-3">
                    {typograph('Включено для каждого игрока')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {includedPerks.map((perk) => {
                      const PerkIcon = perk.icon
                      return (
                        <div key={perk.title} className="flex items-center gap-2">
                          <span className="se-1 flex h-6 w-6 shrink-0 items-center justify-center bg-surface-muted text-ink">
                            <PerkIcon size={13} />
                          </span>
                          <span className="type-caption font-medium text-ink truncate">
                            {typograph(perk.title)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка: Частые вопросы */}
            <div>
              <h3 className="type-title-card font-semibold text-ink mb-4">
                {typograph('Частые вопросы')}
              </h3>
              <Accordion
                items={faqItems.map((item) => ({ q: typograph(item.q), a: typograph(item.a) }))}
              />
            </div>
          </div>
        </section>

        {/* 6. Секция: Другие турниры */}
        {dto.related.length > 0 && (
          <section aria-label="Другие турниры" className="pt-4">
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
              className="mb-6 md:mb-8"
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

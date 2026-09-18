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
  Clock,
  Droplets,
  FileText,
  Gauge,
  HelpCircle,
  Medal,
  PartyPopper,
  Phone,
  Send,
  ShowerHead,
  Sparkles,
  Trophy,
  Users,
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
      q: 'Как подтверждается участие и оплачивается взнос?',
      a: 'После подачи заявки координатор связывается с вами и бронирует слот в сетке. Оплатить взнос можно онлайн или на ресепшн клуба перед началом соревнований.',
    },
    {
      q: 'Что делать, если планы изменились после регистрации?',
      a: 'Пожалуйста, предупредите координатора не позднее чем за 24 часа до старта турнира. В этом случае мы перенесём ваш взнос на следующий турнир или полностью вернём оплату.',
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
    <div className="flex flex-col gap-1.5">
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
  title: string
  reward: string
  desc: string
  tone: 'gold' | 'silver' | 'bronze'
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
        title: 'Победитель Americano',
        reward: hasDistinctPrize ? item.prize : 'Золотой кубок + 15 000 ₽',
        desc: 'Кубок клуба, памятная медаль и подарочный сертификат Bullpadel.',
        tone: 'gold',
      },
      {
        place: '2 МЕСТО',
        title: 'Серебряный призёр',
        reward: 'Серебряная медаль + 10 000 ₽',
        desc: 'Клубный мерч и комплект турнирных мячей Bullpadel Gold.',
        tone: 'silver',
      },
      {
        place: '3 МЕСТО',
        title: 'Бронзовый призёр',
        reward: 'Бронзовая медаль + 5 000 ₽',
        desc: 'Сертификат в клубное кафе и памятный сувенир турнира.',
        tone: 'bronze',
      },
    ]
  }

  return [
    {
      place: '1 МЕСТО',
      title: 'Чемпионы турнира',
      reward: hasDistinctPrize ? item.prize : 'Кубок чемпионов + 50 000 ₽',
      desc: 'Главный кубок соревнований, золотые медали и ценные призы.',
      tone: 'gold',
    },
    {
      place: '2 МЕСТО',
      title: 'Финалисты кубка',
      reward: 'Серебряные медали + 25 000 ₽',
      desc: 'Серебряные медали и сертификаты на тренировки в клубе.',
      tone: 'silver',
    },
    {
      place: '3 МЕСТО',
      title: 'Призёры кубка',
      reward: 'Бронзовые медали + 15 000 ₽',
      desc: 'Бронзовые медали турнира и фирменные аксессуары.',
      tone: 'bronze',
    },
  ]
}

interface ParticipantItem {
  id: string
  name: string
  level: string
  status: 'confirmed' | 'waitlist'
  isPair?: boolean
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
    { id: '1', name: 'М. Воронов / А. Кузнецов', level: item.level, status: 'confirmed', isPair: true },
    { id: '2', name: 'Д. Соколов / И. Васильев', level: item.level, status: 'confirmed', isPair: true },
    { id: '3', name: 'А. Лебедев / К. Фёдоров', level: item.level, status: 'confirmed', isPair: true },
    { id: '4', name: 'Р. Орлов / С. Медведев', level: item.level, status: 'confirmed', isPair: true },
    { id: '5', name: 'М. Белов / П. Новиков', level: item.level, status: 'confirmed', isPair: true },
    { id: '6', name: 'Е. Морозов / О. Ильин', level: item.level, status: 'confirmed', isPair: true },
  ]
}

interface StandingItem {
  rank: number
  name: string
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
    { rank: 1, name: 'Воронов М. / Кузнецов А.', matches: 5, points: 15, diff: '+24', award: 'Чемпионы' },
    { rank: 2, name: 'Соколов Д. / Васильев И.', matches: 5, points: 12, diff: '+16', award: 'Финалисты' },
    { rank: 3, name: 'Лебедев А. / Фёдоров К.', matches: 5, points: 9, diff: '+8', award: '3-е место' },
    { rank: 4, name: 'Орлов Р. / Медведев С.', matches: 5, points: 6, diff: '-4' },
    { rank: 5, name: 'Белов М. / Новиков П.', matches: 5, points: 3, diff: '-18' },
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
    'Ракетку можно взять бесплатно на тест-драйв в клубном про-шопе.',
    completed
      ? 'Итоги и фотоотчёт турнира доступны в архиве клуба.'
      : 'После регистрации координатор подтвердит бронь вашего слота.',
  ]

  const faqItems = getFaqItems(dto.item.level, dto.item.format)
  const prizes = getPrizeDistribution(dto.item)
  const participants = getParticipants(dto.item)
  const standings = getStandings(dto.item)
  const totalSlots = isAmericano ? 16 : 8
  const availableSlots = Math.max(0, totalSlots - participants.length)

  // Контент внутри визуальной Hero-карточки (на меше или фото)
  const heroInnerContent = (
    <div className="relative z-10 flex min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex-col justify-between p-6 sm:p-8 md:p-10">
      {/* Верхний ряд бейджей */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {completed ? (
            <Badge tone="glass" icon={<CheckCircle2 size={13} className="text-white/70" />}>
              Турнир завершён
            </Badge>
          ) : dto.item.lifecycle === 'active' ? (
            <Badge tone="lime" className="font-semibold">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lime-ink" />
              Идёт турнир
            </Badge>
          ) : (
            <Badge tone="lime" className="font-semibold">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lime-ink animate-pulse" />
              Регистрация открыта
            </Badge>
          )}

          <Badge tone="glass" icon={<Icon size={14} className="text-white/80" />}>
            {dto.item.format}
          </Badge>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Badge tone="glass" className="text-white/90">
            {isAmericano ? 'Одиночная регистрация · Ротация пар' : 'Парный зачёт'}
          </Badge>
        </div>
      </div>

      {/* Центральный заголовок и краткое описание турнира */}
      <div className="my-6">
        <h1 className="type-section font-bold text-white tracking-tight leading-tight max-w-3xl">
          {typograph(dto.item.title)}
        </h1>
        <p className="type-body sm:type-editorial mt-3 max-w-2xl text-white/80 leading-relaxed">
          {typograph(dto.item.description)}
        </p>
      </div>

      {/* Нижняя часть Hero: шкала уровня 1.0 - 7.0 */}
      <div className="se-2 max-w-md bg-black/35 backdrop-blur-md p-3.5 border border-white/15">
        <LevelGauge levelStr={dto.item.level} />
      </div>
    </div>
  )

  return (
    <SiteFrame site={dto.site} backLink={{ href: '/tournaments' }}>
      <article data-page-enter="content" className="container-page pb-16 pt-6 md:pb-24 md:pt-8">
        {/* 1. Swiss Hero Section (Не фуллскрин, аккуратный брендовый баннер с картинкой или mesh) */}
        <section aria-label="Визитка турнира" className="relative">
          {dto.item.visualStyle === 'image' && dto.item.image ? (
            <ImageCard
              src={dto.item.image.url}
              alt={dto.item.image.alt}
              overlay={(dto.item.imageOverlay as ImageOverlay) || 'overlay-dark'}
              interactive={false}
              className="w-full"
            >
              {heroInnerContent}
            </ImageCard>
          ) : (
            <MeshCard
              tone={(dto.item.meshStyle as MeshTone) || 'deep-blue'}
              interactive={false}
              className="w-full"
            >
              {heroInnerContent}
            </MeshCard>
          )}
        </section>

        {/* 2. Секция: Паспорт турнира (Swiss Data Passport со строгой сеткой и делителями) */}
        <section aria-label="Паспорт турнира" className="mt-4">
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-0 lg:divide-x lg:divide-ink/10">
              {/* Расписание */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6 lg:first:pl-0">
                <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-ink-muted" />
                  {typograph('Расписание')}
                </dt>
                <dd className="mt-2.5">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(dto.item.scheduleLabel)}
                  </span>
                  <span className="type-caption text-ink-soft mt-1 block">
                    {typograph('Клуб UNLIM RIGA · Корты 1–4')}
                  </span>
                </dd>
              </div>

              {/* Формат соревнований */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6">
                <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Icon size={14} className="text-ink-muted" />
                  {typograph('Формат')}
                </dt>
                <dd className="mt-2.5">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(dto.item.format)}
                  </span>
                  {dto.item.level && (
                    <span className="type-caption text-ink-soft mt-1 block">
                      {typograph(`Уровень подготовки ${dto.item.level}`)}
                    </span>
                  )}
                </dd>
              </div>

              {/* Вступительный взнос */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6">
                <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Wallet size={14} className="text-ink-muted" />
                  {typograph('Взнос')}
                </dt>
                <dd className="mt-2.5">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(dto.item.entryFee)}
                  </span>
                  <span className="type-caption text-ink-soft mt-1 block">
                    {typograph('Мячи, вода и сауна включены')}
                  </span>
                </dd>
              </div>

              {/* Призовой фонд / Награды */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6 lg:last:pr-0">
                <dt className="type-caption font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Award size={14} className="text-ink-muted" />
                  {typograph(hasDistinctPrize ? dto.item.prizeLabel : 'Награды')}
                </dt>
                <dd className="mt-2.5">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(hasDistinctPrize ? dto.item.prize : 'Кубки и клубные призы')}
                  </span>
                  <span className="type-caption text-ink-soft mt-1 block">
                    {typograph('Награждение призеров в лаунже')}
                  </span>
                </dd>
              </div>
            </dl>

            {/* Быстрое действие в паспорте */}
            <div className="mt-6 pt-6 border-t border-ink/10 flex flex-wrap items-center justify-between gap-4">
              <div className="type-body-sm text-ink-soft flex items-center gap-2">
                <span className="se-1 inline-flex h-2 w-2 bg-lime" />
                <span>
                  {completed
                    ? 'Турнир завершён. Ознакомьтесь с результатами в таблице ниже.'
                    : `Осталось свободных мест: ${availableSlots} из ${totalSlots}.`}
                </span>
              </div>
              <div>
                {completed ? (
                  <ButtonLink href="/tournaments" variant="neutral" size="sm">
                    Все турниры
                  </ButtonLink>
                ) : (
                  <ContentAction
                    action={dto.item.action}
                    sourcePage={sourcePage}
                    sourceEntity={dto.item.title}
                    size="md"
                  />
                )}
              </div>
            </div>
          </SurfaceCard>
        </section>

        {/* 3. Секция: Список участников и Таблица итогов (Standings) — Всегда на первом плане */}
        <section aria-label="Участники и результаты" className="mt-8">
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
            {/* Таб-переключатель в Swiss-стиле */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <h2 className="type-title-card font-semibold text-ink flex items-center gap-2">
                  <Users size={20} className="text-ink" />
                  {typograph('Сетка и участники')}
                </h2>
                <p className="type-caption text-ink-soft mt-1">
                  {typograph(
                    isAmericano
                      ? 'Индивидуальные участники турнира Americano со сменными парами'
                      : 'Заявленные пары и турнирная сетка кубка'
                  )}
                </p>
              </div>

              <div className="se-2 inline-flex bg-surface-muted p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('participants')}
                  className={cn(
                    'se-1 px-4 py-2 type-ui font-medium transition-colors cursor-pointer',
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
                    'se-1 px-4 py-2 type-ui font-medium transition-colors cursor-pointer',
                    activeTab === 'standings'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  Итоги турнира
                </button>
              </div>
            </div>

            {/* Вкладка 1: Список участников */}
            {activeTab === 'participants' && (
              <div className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-ink-soft type-caption">
                  <span>
                    Занято слотов: <strong className="text-ink">{participants.length}</strong> из{' '}
                    <strong className="text-ink">{totalSlots}</strong>
                  </span>
                  <span className="text-lime-ink font-semibold">
                    {availableSlots > 0 ? `Доступно ${availableSlots} слотов` : 'Сетка укомплектована'}
                  </span>
                </div>

                {/* Прогресс-бар заполнения сетки */}
                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-lime transition-all duration-300"
                    style={{ width: `${(participants.length / totalSlots) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {participants.map((player, idx) => (
                    <div
                      key={player.id}
                      className="se-1 border border-ink/10 p-3.5 flex items-center justify-between gap-3 bg-surface-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="se-full flex h-8 w-8 shrink-0 items-center justify-center bg-control font-mono text-xs font-semibold text-ink">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="type-body-sm font-semibold text-ink truncate">
                            {typograph(player.name)}
                          </p>
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

                  {/* Свободные слоты для дозаписи */}
                  {!completed &&
                    Array.from({ length: availableSlots }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="se-1 border border-dashed border-ink/20 p-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="se-full flex h-8 w-8 shrink-0 items-center justify-center border border-dashed border-ink/20 font-mono text-xs text-ink-muted">
                            {participants.length + i + 1}
                          </span>
                          <span className="type-body-sm text-ink-muted">Свободный слот</span>
                        </div>
                        <ContentAction
                          action={dto.item.action}
                          sourcePage={sourcePage}
                          sourceEntity={dto.item.title}
                          size="sm"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Вкладка 2: Итоги турнира и турнирная таблица очков */}
            {activeTab === 'standings' && (
              <div className="mt-6">
                <div className="mb-4">
                  <p className="type-caption text-ink-soft">
                    {typograph(
                      isAmericano
                        ? 'Система Americano: место определяется суммой всех набранных очков во всех сетах с ротацией партнеров.'
                        : 'Итоговая таблица соревнований по сумме побед и разнице выигранных геймов.'
                    )}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-ink/10 text-ink-muted type-caption uppercase tracking-wider">
                        <th className="py-3 px-3 w-16">Место</th>
                        <th className="py-3 px-3">Участник / Пара</th>
                        <th className="py-3 px-3 text-center">Матчей</th>
                        <th className="py-3 px-3 text-right">Очки всего</th>
                        <th className="py-3 px-3 text-right">Разница</th>
                        <th className="py-3 px-3 text-right hidden sm:table-cell">Награда</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10 type-body-sm">
                      {standings.map((st) => {
                        const isTop1 = st.rank === 1
                        const isTop2 = st.rank === 2
                        const isTop3 = st.rank === 3
                        return (
                          <tr
                            key={st.rank}
                            className={cn(
                              'transition-colors',
                              isTop1
                                ? 'bg-[#fef9c3]/30 font-semibold'
                                : isTop2
                                  ? 'bg-[#f1f5f9]/40'
                                  : isTop3
                                    ? 'bg-[#ffedd5]/30'
                                    : ''
                            )}
                          >
                            <td className="py-3.5 px-3">
                              <span
                                className={cn(
                                  'se-full inline-flex h-7 w-7 items-center justify-center font-mono text-xs font-bold',
                                  isTop1
                                    ? 'bg-[#fef08a] text-[#854d0e]'
                                    : isTop2
                                      ? 'bg-[#e2e8f0] text-[#334155]'
                                      : isTop3
                                        ? 'bg-[#fed7aa] text-[#9a3412]'
                                        : 'text-ink-soft bg-surface-muted'
                                )}
                              >
                                {st.rank}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-medium text-ink">
                              <div className="flex items-center gap-2">
                                <span>{typograph(st.name)}</span>
                                {isTop1 && <Trophy size={15} className="text-[#eab308] shrink-0" />}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-ink-soft font-mono">
                              {st.matches}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-ink">
                              {st.points}
                            </td>
                            <td
                              className={cn(
                                'py-3.5 px-3 text-right font-mono text-xs',
                                st.diff.startsWith('+') ? 'text-green-600 font-semibold' : 'text-ink-soft'
                              )}
                            >
                              {st.diff}
                            </td>
                            <td className="py-3.5 px-3 text-right hidden sm:table-cell">
                              {st.award ? (
                                <span className="se-1 type-micro font-semibold px-2 py-0.5 bg-control text-ink">
                                  {st.award}
                                </span>
                              ) : (
                                <span className="text-ink-muted text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SurfaceCard>
        </section>

        {/* 4. Второстепенные секции для десктопа (hidden md:block / md:grid) */}
        <div className="hidden md:block">
          {/* Секция: Распределение призов по местам */}
          <section aria-label="Распределение призов" className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="type-title-card font-semibold text-ink flex items-center gap-2">
                  <Trophy size={20} className="text-ink" />
                  {typograph('Распределение призов по местам')}
                </h2>
                <p className="type-caption text-ink-soft mt-1">
                  {typograph('Официальные награды, медали и подарки партнеров соревнований')}
                </p>
              </div>
              <span className="type-caption font-semibold uppercase tracking-wider text-ink-muted">
                {dto.item.prizeLabel || 'Призовой фонд'}: {dto.item.prize}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prizes.map((prize) => {
                const isGold = prize.tone === 'gold'
                const isSilver = prize.tone === 'silver'
                return (
                  <SurfaceCard
                    key={prize.place}
                    tone="white"
                    interactive={false}
                    className={cn(
                      'p-5 md:p-6 relative overflow-hidden flex flex-col justify-between border-t-4',
                      isGold
                        ? 'border-t-[#eab308]'
                        : isSilver
                          ? 'border-t-[#94a3b8]'
                          : 'border-t-[#d97706]'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'se-1 type-micro font-bold px-2 py-0.5 uppercase tracking-wider',
                            isGold
                              ? 'bg-[#fef9c3] text-[#854d0e]'
                              : isSilver
                                ? 'bg-[#f1f5f9] text-[#334155]'
                                : 'bg-[#ffedd5] text-[#9a3412]'
                          )}
                        >
                          {prize.place}
                        </span>
                        {isGold ? (
                          <Trophy size={18} className="text-[#eab308]" />
                        ) : isSilver ? (
                          <Medal size={18} className="text-[#94a3b8]" />
                        ) : (
                          <Award size={18} className="text-[#d97706]" />
                        )}
                      </div>
                      <h3 className="type-title-dense font-semibold text-ink mt-3">
                        {typograph(prize.title)}
                      </h3>
                      <p className="type-title-card font-bold text-ink mt-2 text-lime-ink bg-lime/20 se-1 px-3 py-1 inline-block">
                        {typograph(prize.reward)}
                      </p>
                    </div>
                    <p className="type-body-sm text-ink-soft mt-4 border-t border-ink/10 pt-3 leading-relaxed">
                      {typograph(prize.desc)}
                    </p>
                  </SurfaceCard>
                )
              })}
            </div>
          </section>

          {/* Секция: Регламент турнира (свёрнут по дефолту) */}
          <section aria-label="Регламент турнира" className="mt-8">
            <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                      <FileText size={16} />
                    </span>
                    <h2 className="type-title-card font-semibold text-ink">
                      {typograph('Регламент турнира')}
                    </h2>
                  </div>
                  <p className="type-caption text-ink-soft mt-1">
                    {typograph('Официальные правила участия, порядок проведения туров и судейство')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRegulationOpen((prev) => !prev)}
                  aria-expanded={regulationOpen}
                  className="se-1 type-ui font-medium px-4 py-2.5 bg-control hover:bg-control-hover flex items-center justify-between sm:justify-center gap-2 text-ink transition-colors cursor-pointer"
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
              </div>

              {regulationOpen ? (
                <div className="mt-6 pt-2">
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

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-ink/10 pt-5 text-ink-soft type-caption">
                    <div className="flex items-center gap-2">
                      <span className="se-full h-2 w-2 bg-lime shrink-0" />
                      <span>Разминка: 5 минут перед первым матчем</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="se-full h-2 w-2 bg-lime shrink-0" />
                      <span>Формат: {dto.item.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="se-full h-2 w-2 bg-lime shrink-0" />
                      <span>Судья на корте: ведение электронного табло</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-ink-soft type-body-sm">
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
                    className="type-caption font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
                  >
                    Читать полностью
                  </button>
                </div>
              )}
            </SurfaceCard>
          </section>

          {/* Секция: Чек-лист перед кортом и сервис клуба */}
          <section aria-label="Регламент и подготовка" className="mt-8 grid items-start gap-6 lg:grid-cols-2">
            {/* Чек-лист перед стартом */}
            <SurfaceCard tone="white" interactive={false} className="p-6 md:p-7">
              <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <Clock size={16} />
                </span>
                <h3 className="type-title-card font-semibold text-ink">
                  {typograph('Перед выходом на корт')}
                </h3>
              </div>
              <ul className="mt-5 grid gap-3">
                {checklist.map((item) => (
                  <li key={item} className="type-body-sm flex items-start gap-3 leading-snug text-ink-soft">
                    <span className="se-1 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check size={13} strokeWidth={2.8} />
                    </span>
                    <span>{typograph(item)}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>

            {/* Сервис клуба: что включено */}
            <SurfaceCard tone="white" interactive={false} className="p-6 md:p-7">
              <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <Sparkles size={16} />
                </span>
                <h3 className="type-title-card font-semibold text-ink">
                  {typograph('Включено для каждого игрока')}
                </h3>
              </div>
              <ul className="mt-5 grid gap-3.5">
                {includedPerks.map((perk) => {
                  const PerkIcon = perk.icon
                  return (
                    <li key={perk.title} className="flex items-start gap-3">
                      <span className="se-1 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-surface-muted text-ink">
                        <PerkIcon size={14} />
                      </span>
                      <div>
                        <p className="type-body-sm font-medium text-ink">{typograph(perk.title)}</p>
                        <p className="type-caption text-ink-muted">{typograph(perk.desc)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </SurfaceCard>
          </section>

          {/* Секция: Как проходит игровой день и FAQ */}
          <section
            aria-label="Игровой день и вопросы"
            className="mt-12 md:mt-16 grid items-start gap-12 lg:grid-cols-2 lg:gap-16"
          >
            {/* Левая колонка: Как проходит игровой день */}
            <div>
              <SectionHeader title={typograph('Как проходит игровой день')} className="mb-6 md:mb-8" />
              <div className="flex flex-col">
                {matchdaySteps.map((step) => (
                  <div key={step.title} className="border-b border-ink/10 first:border-t py-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="type-body font-medium text-ink">{typograph(step.title)}</h3>
                      <span className="type-caption font-medium text-ink-muted shrink-0">
                        {typograph(step.timing)}
                      </span>
                    </div>
                    <p className="type-body-sm mt-1.5 text-ink-soft leading-relaxed">
                      {typograph(step.desc)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Правая колонка: Частые вопросы */}
            <div>
              <SectionHeader title={typograph('Частые вопросы')} className="mb-6 md:mb-8" />
              <Accordion
                items={faqItems.map((item) => ({ q: typograph(item.q), a: typograph(item.a) }))}
              />
            </div>
          </section>
        </div>

        {/* 5. Второстепенные секции для телефонов в аккордеонах (md:hidden) */}
        <div className="block md:hidden mt-8">
          <SurfaceCard tone="white" interactive={false} className="p-5">
            <h2 className="type-title-card font-semibold text-ink mb-2">
              {typograph('Подробности и регламент')}
            </h2>
            <p className="type-caption text-ink-soft mb-4">
              {typograph('Правила, призы, хронометраж и сервисы клуба')}
            </p>

            {/* Аккордеон с разделами для телефона */}
            <div className="divide-y divide-ink/10">
              {/* Регламент */}
              <details className="group py-3.5 first:pt-0">
                <summary className="type-body font-medium text-ink flex items-center justify-between cursor-pointer list-none">
                  <span className="flex items-center gap-2">
                    <FileText size={16} className="text-ink" />
                    <span>{typograph('Регламент соревнований')}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200 text-ink-soft group-open:rotate-180"
                  />
                </summary>
                <div className="pt-3 pb-2 text-ink-soft type-body-sm leading-relaxed">
                  {dto.item.regulationHTML ? (
                    <div
                      className="[&>p]:mb-2.5 [&>ul]:mb-2.5 [&>ul]:list-disc [&>ul]:pl-5 [&>*:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: typograph(dto.item.regulationHTML) }}
                    />
                  ) : (
                    <p>
                      {typograph(
                        'Регламент соревнований публикуется судейской коллегией перед началом турнира.'
                      )}
                    </p>
                  )}
                </div>
              </details>

              {/* Призы */}
              <details className="group py-3.5">
                <summary className="type-body font-medium text-ink flex items-center justify-between cursor-pointer list-none">
                  <span className="flex items-center gap-2">
                    <Trophy size={16} className="text-ink" />
                    <span>{typograph('Призовой фонд по местам')}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200 text-ink-soft group-open:rotate-180"
                  />
                </summary>
                <div className="pt-3 pb-2 space-y-3">
                  {prizes.map((pz) => (
                    <div key={pz.place} className="p-3 bg-surface-muted/40 se-1 border border-ink/10">
                      <div className="flex items-center justify-between">
                        <span className="se-1 type-micro font-bold px-2 py-0.5 bg-control text-ink">
                          {pz.place}
                        </span>
                        <span className="type-body-sm font-bold text-ink">{pz.reward}</span>
                      </div>
                      <p className="type-caption text-ink-soft mt-1.5">{pz.desc}</p>
                    </div>
                  ))}
                </div>
              </details>

              {/* Чек-лист и включено */}
              <details className="group py-3.5">
                <summary className="type-body font-medium text-ink flex items-center justify-between cursor-pointer list-none">
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-ink" />
                    <span>{typograph('Перед кортом и сервис')}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200 text-ink-soft group-open:rotate-180"
                  />
                </summary>
                <div className="pt-3 pb-2 space-y-4">
                  <div>
                    <h4 className="type-caption font-semibold text-ink mb-2 uppercase tracking-wider">
                      Перед выходом на корт
                    </h4>
                    <ul className="space-y-2">
                      {checklist.map((c) => (
                        <li key={c} className="flex items-start gap-2 type-caption text-ink-soft">
                          <Check size={13} className="text-lime-ink bg-lime se-full p-0.5 mt-0.5 shrink-0" />
                          <span>{typograph(c)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-ink/10 pt-3">
                    <h4 className="type-caption font-semibold text-ink mb-2 uppercase tracking-wider">
                      Включено для каждого игрока
                    </h4>
                    <ul className="space-y-2">
                      {includedPerks.map((pk) => (
                        <li key={pk.title} className="type-caption text-ink-soft">
                          <strong className="text-ink">{pk.title}:</strong> {pk.desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>

              {/* Как проходит игровой день */}
              <details className="group py-3.5">
                <summary className="type-body font-medium text-ink flex items-center justify-between cursor-pointer list-none">
                  <span className="flex items-center gap-2">
                    <Clock size={16} className="text-ink" />
                    <span>{typograph('Как проходит игровой день')}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200 text-ink-soft group-open:rotate-180"
                  />
                </summary>
                <div className="pt-3 pb-2 space-y-3">
                  {matchdaySteps.map((st) => (
                    <div key={st.title} className="p-3 bg-surface-muted/30 se-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="type-body-sm font-semibold text-ink">{st.title}</span>
                        <span className="type-micro font-medium text-ink-muted">{st.timing}</span>
                      </div>
                      <p className="type-caption text-ink-soft mt-1">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </details>

              {/* FAQ */}
              <details className="group py-3.5 last:pb-0">
                <summary className="type-body font-medium text-ink flex items-center justify-between cursor-pointer list-none">
                  <span className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-ink" />
                    <span>{typograph('Частые вопросы')}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200 text-ink-soft group-open:rotate-180"
                  />
                </summary>
                <div className="pt-3 pb-2 space-y-3">
                  {faqItems.map((f) => (
                    <div key={f.q} className="border-b border-ink/10 last:border-b-0 pb-3 last:pb-0">
                      <p className="type-body-sm font-semibold text-ink">{f.q}</p>
                      <p className="type-caption text-ink-soft mt-1">{f.a}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </SurfaceCard>
        </div>

        {/* 6. Секция: Запись и контакты координатора */}
        <section aria-label="Запись на турнир" className="mt-12 md:mt-16">
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-10">
            {completed ? (
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h2 className="type-section font-semibold text-ink leading-tight">
                    {typograph('Этот турнир уже завершился')}
                  </h2>
                  <p className="type-body mt-3 max-w-xl text-ink-soft leading-relaxed">
                    {typograph(
                      'Следите за расписанием новых турниров в календаре клуба или запишитесь на персональную тренировку для подготовки к следующим стартам.'
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ButtonLink href="/tournaments" variant="primary" size="lg">
                    Все турниры
                  </ButtonLink>
                  <ButtonLink href="/training" variant="neutral" size="lg">
                    Тренировки
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div>
                  <h2 className="type-section font-semibold text-ink leading-tight">
                    {typograph('Готовы выйти на корт?')}
                  </h2>
                  <p className="type-body mt-3 max-w-xl text-ink-soft leading-relaxed">
                    {typograph(
                      `Количество слотов ограничено форматом кортов (${totalSlots} участников). Оставьте заявку — координатор свяжется с вами и закрепит место в турнирной сетке.`
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ContentAction
                    action={dto.item.action}
                    sourcePage={sourcePage}
                    sourceEntity={dto.item.title}
                    size="lg"
                  />
                  <ButtonLink
                    href="https://t.me/unlimpadel"
                    target="_blank"
                    rel="noreferrer"
                    variant="neutral"
                    size="lg"
                    icon={<Send size={15} />}
                    iconPosition="left"
                  >
                    Telegram
                  </ButtonLink>
                  {dto.site.contacts?.phoneDisplay && (
                    <ButtonLink
                      href={`tel:${dto.site.contacts.phoneValue}`}
                      variant="neutral"
                      size="lg"
                      icon={<Phone size={15} />}
                      iconPosition="left"
                    >
                      {dto.site.contacts.phoneDisplay}
                    </ButtonLink>
                  )}
                </div>
              </div>
            )}
          </SurfaceCard>
        </section>

        {/* 7. Секция: Другие турниры */}
        {dto.related.length > 0 && (
          <section aria-label="Другие турниры" className="mt-14 md:mt-20">
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

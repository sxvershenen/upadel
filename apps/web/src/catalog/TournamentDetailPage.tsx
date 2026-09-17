import React from 'react'
import type { TournamentDetailDTO } from '@unlim/content-contract'
import {
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  HelpCircle,
  Medal,
  Phone,
  Send,
  ShieldCheck,
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
import { SurfaceCard } from '../components/ui/Card'
import { Typography } from '../components/ui/Typography'
import { PageHeader } from '../thematic/PageHeader'

// Неразрывные пробелы для предлогов и союзов по правилам русской типографики
export function typograph(text: string): string {
  if (!text) return ''
  return text.replace(
    /(?<=^|\s)(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)[ \t]+/gi,
    '$1\u00A0'
  )
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="type-caption flex flex-wrap items-center gap-2 text-ink-muted">
      <a href="/" className="transition-colors hover:text-ink">Главная</a>
      <span aria-hidden="true" className="text-ink/20">/</span>
      <a href="/tournaments" className="transition-colors hover:text-ink">Турниры</a>
      <span aria-hidden="true" className="text-ink/20">/</span>
      <span aria-current="page" className="font-medium text-ink">{typograph(title)}</span>
    </nav>
  )
}

export const matchdaySteps = [
  {
    step: '01',
    timing: 'За 30 минут',
    title: 'Сбор и разминка',
    desc: 'Регистрация участников на ресепшн, переодевание и разминка на кортах.',
  },
  {
    step: '02',
    timing: 'За 10 минут',
    title: 'Брифинг и жеребьёвка',
    desc: 'Судья озвучивает регламент, распределяет корты и даёт старт первому туру.',
  },
  {
    step: '03',
    timing: 'Основное время',
    title: 'Турнирные матчи',
    desc: 'Серия динамичных встреч с ротацией и оперативным ведением счёта на табло.',
  },
  {
    step: '04',
    timing: 'Финал турнира',
    title: 'Награждение и лаунж',
    desc: 'Финальные розыгрыши, вручение призов, напитки и обсуждение ярких моментов.',
  },
]

export const includedPerks = [
  {
    icon: Sparkles,
    title: 'Турнирные мячи',
    desc: 'Профессиональные мячи Bullpadel и Varlion на каждый сет.',
  },
  {
    icon: ShowerHead,
    title: 'Раздевалки и сауна',
    desc: 'Просторные душевые, свежие полотенца и финская сауна.',
  },
  {
    icon: Coffee,
    title: 'Вода и фруктовый бар',
    desc: 'Бутилированная вода без ограничений и фрукты в лаунже.',
  },
  {
    icon: Camera,
    title: 'Судейство и фотоотчёт',
    desc: 'Координатор сеток, хронометраж и памятные фотографии.',
  },
]

export function getFaqItems(category: string, format: string) {
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
      a: `Турнир рассчитан на категорию «${category}». Если вы сомневаетесь в своём уровне подготовки, свяжитесь с нами — дежурный тренер проведёт быструю оценку и подскажет комфортную группу.`,
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

export function TournamentDetailPage({ dto }: { dto: TournamentDetailDTO }) {
  const completed = dto.item.lifecycle === 'finished' || dto.item.lifecycle === 'cancelled'
  const sourcePage = `/tournaments/${dto.item.slug}`
  const heroMedia = dto.item.visualStyle === 'image' && dto.item.image ? dto.item.image : dto.page.hero.media

  const hasDistinctPrize = Boolean(dto.item.prize?.trim()) &&
    !dto.item.entryFee?.includes(dto.item.prize.trim()) &&
    dto.item.prize.trim() !== dto.item.entryFee.trim()

  const formatKey = dto.item.formatKey || ''
  const isAmericano = formatKey === 'americano' || dto.item.format.toLowerCase().includes('americano')

  const checklist = [
    'Приезжайте за 15–30 минут до начала для спокойной разминки и жеребьёвки.',
    'Возьмите спортивную обувь с немаркой подошвой (non-marking).',
    'Ракетку можно взять бесплатно на тест-драйв в клубном про-шопе.',
    completed
      ? 'Итоги и фотоотчёт турнира доступны в архиве клуба.'
      : 'После регистрации координатор подтвердит бронь вашего слота.',
  ]

  const faqItems = getFaqItems(dto.item.category, dto.item.format)

  return (
    <SiteFrame site={dto.site} backLink={{ href: '/tournaments' }}>
      {/* 1. Hero Block: Оставлен в исходном виде строго по правилам */}
      <PageHeader
        page={{
          eyebrow: dto.item.category,
          title: dto.item.title,
          intro: dto.item.description,
          hero: { media: heroMedia, grayscale: completed },
        }}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {completed && <Badge tone="glass" icon={<CheckCircle2 size={14} />}>Завершено</Badge>}
            <ContentAction action={dto.item.action} sourcePage={sourcePage} sourceEntity={dto.item.title} size="lg" />
          </div>
        }
      />

      {/* 2. Контентная часть страницы в Swiss-стиле */}
      <article data-page-enter="content" className="container-page pb-16 pt-8 md:pb-24 md:pt-10">
        <Breadcrumb title={dto.item.title} />

        {/* Секция: Паспорт турнира (Ключевые метрики) */}
        <section aria-label="Паспорт турнира" className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Метрика 1: Дата и время */}
            <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="type-micro uppercase tracking-wider text-ink-muted">01 · Расписание</span>
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <CalendarDays size={16} />
                </span>
              </div>
              <div className="mt-3">
                <Typography role="title-card" className="font-semibold text-ink">
                  {typograph(dto.item.scheduleLabel)}
                </Typography>
                <p className="type-caption mt-1 text-ink-muted">
                  {completed ? 'Турнирный этап завершён' : 'Сбор игроков за 20–30 минут'}
                </p>
              </div>
            </SurfaceCard>

            {/* Метрика 2: Формат */}
            <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="type-micro uppercase tracking-wider text-ink-muted">02 · Формат</span>
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <Medal size={16} />
                </span>
              </div>
              <div className="mt-3">
                <Typography role="title-card" className="font-semibold text-ink">
                  {typograph(dto.item.format)}
                </Typography>
                <p className="type-caption mt-1 text-ink-muted">
                  Категория: {typograph(dto.item.category)}
                </p>
              </div>
            </SurfaceCard>

            {/* Метрика 3: Взнос */}
            <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="type-micro uppercase tracking-wider text-ink-muted">03 · Взнос</span>
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <Wallet size={16} />
                </span>
              </div>
              <div className="mt-3">
                <Typography role="title-card" className="font-semibold text-ink">
                  {typograph(dto.item.entryFee)}
                </Typography>
                <p className="type-caption mt-1 text-ink-muted">
                  Включает мячи, воду и лаунж
                </p>
              </div>
            </SurfaceCard>

            {/* Метрика 4: Награды / Призовой фонд */}
            <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="type-micro uppercase tracking-wider text-ink-muted">
                  {hasDistinctPrize ? typograph(dto.item.prizeLabel) : '04 · Награды'}
                </span>
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <Trophy size={16} />
                </span>
              </div>
              <div className="mt-3">
                <Typography role="title-card" className="font-semibold text-ink">
                  {hasDistinctPrize ? typograph(dto.item.prize) : 'Кубки и клубные призы'}
                </Typography>
                <p className="type-caption mt-1 text-ink-muted">
                  {hasDistinctPrize ? 'Победителям турнира' : 'От клуба и партнёров Bullpadel'}
                </p>
              </div>
            </SurfaceCard>
          </div>
        </section>

        {/* Секция: Регламент соревнований и подготовка (2 колонки) */}
        <section aria-label="Регламент и подготовка" className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          {/* Левая колонка: Официальный регламент и правила матчей */}
          <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-5">
              <div>
                <span className="type-micro uppercase tracking-wider text-ink-muted">Правила и проведение</span>
                <Typography as="h2" role="title-large" className="mt-1 font-semibold text-ink">
                  Регламент турнира
                </Typography>
              </div>
              <Badge tone="muted" icon={<ShieldCheck size={14} />}>
                {typograph(dto.item.category)}
              </Badge>
            </div>

            <p className="type-editorial mt-5 text-ink-soft">
              {typograph(dto.item.description)}
            </p>

            {dto.item.regulationHTML ? (
              <div
                className="article-content mt-6 text-ink-soft leading-relaxed [&>*:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: typograph(dto.item.regulationHTML) }}
              />
            ) : (
              <p className="type-body-sm mt-6 text-ink-soft">
                Регламент будет опубликован организаторами перед началом соревнований.
              </p>
            )}

            {/* Специальная врезка по правилам формата */}
            <div className="se-2 mt-8 flex items-start gap-3.5 bg-surface-muted p-4 md:p-5">
              <span className="mt-0.5 shrink-0 text-ink">
                <HelpCircle size={18} />
              </span>
              <div className="type-body-sm text-ink-soft">
                <strong className="font-semibold text-ink">Особенности формата: </strong>
                {isAmericano
                  ? 'В каждом туре напарники меняются случайным образом. За каждый сыгранный гейм начисляются личные очки. Победитель определяется по наибольшей сумме очков за все матчи вечера.'
                  : 'Все матчи проводятся по официальным международным правилам FIP (International Padel Federation). При счёте 6:6 в сете разыгрывается классический тай-брейк до 7 очков.'}
              </div>
            </div>
          </SurfaceCard>

          {/* Правая колонка: Чек-лист подготовки и сервисы клуба */}
          <div className="space-y-6">
            {/* Чек-лист перед стартом */}
            <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-6 md:p-7">
              <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
                <span className="se-2 flex h-9 w-9 items-center justify-center bg-surface-muted text-ink">
                  <Clock size={18} />
                </span>
                <div>
                  <span className="type-micro uppercase tracking-wider text-ink-muted">Чек-лист</span>
                  <Typography as="h3" role="title-card" className="font-semibold text-ink">
                    {typograph('Перед выходом на корт')}
                  </Typography>
                </div>
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
            <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-6 md:p-7">
              <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
                <span className="se-2 flex h-9 w-9 items-center justify-center bg-surface-muted text-ink">
                  <Sparkles size={18} />
                </span>
                <div>
                  <span className="type-micro uppercase tracking-wider text-ink-muted">Удобства</span>
                  <Typography as="h3" role="title-card" className="font-semibold text-ink">
                    {typograph('Включено для каждого игрока')}
                  </Typography>
                </div>
              </div>
              <ul className="mt-5 grid gap-3.5">
                {includedPerks.map((perk) => {
                  const Icon = perk.icon
                  return (
                    <li key={perk.title} className="flex items-start gap-3">
                      <span className="se-1 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-surface-muted text-ink">
                        <Icon size={14} />
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
          </div>
        </section>

        {/* Секция: Таймлайн турнирного дня */}
        <section aria-label="Расписание игрового дня" className="mt-14 md:mt-20">
          <div className="flex flex-col gap-2">
            <span className="type-micro uppercase tracking-wider text-ink-muted">Тайминг</span>
            <Typography as="h2" role="section" className="font-semibold text-ink">
              {typograph('Как проходит игровой день')}
            </Typography>
            <p className="type-body-sm text-ink-soft">
              {typograph('Чёткая структура мероприятия позволяет отыграть серию матчей без задержек и с максимальным комфортом.')}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {matchdaySteps.map((step) => (
              <SurfaceCard key={step.step} tone="white" interactive={false} className="border border-ink/5 p-5 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="type-micro font-mono font-semibold text-ink-muted">{step.step}</span>
                  <Badge tone="muted">{step.timing}</Badge>
                </div>
                <Typography as="h3" role="title-compact" className="mt-4 font-semibold text-ink">
                  {typograph(step.title)}
                </Typography>
                <p className="type-caption mt-2 leading-relaxed text-ink-soft">
                  {typograph(step.desc)}
                </p>
              </SurfaceCard>
            ))}
          </div>
        </section>

        {/* Секция: Блок записи и конверсии */}
        <section aria-label="Запись на турнир" className="mt-12 md:mt-16">
          <SurfaceCard tone="white" interactive={false} className="border border-ink/10 p-6 md:p-10">
            {completed ? (
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <Badge tone="muted" icon={<CheckCircle2 size={14} />}>Завершённый турнир</Badge>
                  <Typography as="h2" role="title-large" className="mt-3 font-semibold text-ink">
                    {typograph('Этот турнир уже завершился')}
                  </Typography>
                  <p className="type-body-sm mt-2 max-w-xl text-ink-soft">
                    {typograph('Следите за расписанием новых турниров в календаре клуба или запишитесь на персональную тренировку для подготовки к следующим стартам.')}
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
                  <Badge tone="lime" icon={<Sparkles size={14} />}>Регистрация открыта</Badge>
                  <Typography as="h2" role="title-large" className="mt-3 font-semibold text-ink">
                    {typograph('Готовы выйти на корт?')}
                  </Typography>
                  <p className="type-body-sm mt-2 max-w-xl text-ink-soft">
                    {typograph('Количество слотов ограничено форматом кортов (16–24 участника). Оставьте заявку — координатор свяжется с вами и закрепит место в турнирной сетке.')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ContentAction action={dto.item.action} sourcePage={sourcePage} sourceEntity={dto.item.title} size="lg" />
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

        {/* Секция: FAQ об участии (без внешней карточки-обёртки строго по требованию) */}
        <section aria-label="Частые вопросы" className="mt-14 md:mt-20">
          <div className="flex flex-col gap-2">
            <span className="type-micro uppercase tracking-wider text-ink-muted">Вопросы и ответы</span>
            <Typography as="h2" role="section" className="font-semibold text-ink">
              {typograph('Частые вопросы об участии')}
            </Typography>
            <p className="type-body-sm text-ink-soft">
              {typograph('Всё, что важно знать перед турнирным выходом на корты UNLIM PADEL.')}
            </p>
          </div>

          <div className="mt-6">
            <Accordion items={faqItems.map((item) => ({ q: typograph(item.q), a: typograph(item.a) }))} />
          </div>
        </section>

        {/* Секция: Другие турниры */}
        {dto.related.length > 0 && (
          <section aria-label="Другие турниры" className="mt-16 md:mt-24">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="type-micro uppercase tracking-wider text-ink-muted">Календарь клуба</span>
                <Typography as="h2" role="section" className="mt-1 font-semibold text-ink">
                  {typograph('Другие турниры и лиги')}
                </Typography>
              </div>
              <ButtonLink href="/tournaments" variant="neutral" size="sm" icon={<ChevronRight size={15} />}>
                Все события
              </ButtonLink>
            </div>
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

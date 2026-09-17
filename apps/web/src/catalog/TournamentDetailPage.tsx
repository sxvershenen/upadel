import React from 'react'
import type { TournamentDetailDTO } from '@unlim/content-contract'
import {
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Medal,
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

  const checklist = [
    'Приезжайте за 15–30 минут до начала для спокойной разминки и жеребьёвки.',
    'Возьмите спортивную обувь с немаркой подошвой (non-marking).',
    'Ракетку можно взять бесплатно на тест-драйв в клубном про-шопе.',
    completed
      ? 'Итоги и фотоотчёт турнира доступны в архиве клуба.'
      : 'После регистрации координатор подтвердит бронь вашего слота.',
  ]

  const passportCards = [
    {
      label: 'Расписание',
      icon: CalendarDays,
      value: dto.item.scheduleLabel,
      caption: completed ? 'Турнирный этап завершён' : 'Сбор игроков за 20–30 минут',
    },
    {
      label: 'Формат',
      icon: Medal,
      value: dto.item.format,
      caption: `Категория: ${dto.item.category}`,
    },
    {
      label: 'Взнос',
      icon: Wallet,
      value: dto.item.entryFee,
      caption: 'Включает мячи, корт и судейство',
    },
    {
      label: hasDistinctPrize ? dto.item.prizeLabel : 'Награды',
      icon: Trophy,
      value: hasDistinctPrize ? dto.item.prize : 'Кубки и клубные призы',
      caption: hasDistinctPrize ? 'Победителям турнира' : 'От клуба и партнёров',
    },
  ]

  const faqItems = getFaqItems(dto.item.category, dto.item.format)

  return (
    <SiteFrame site={dto.site} backLink={{ href: '/tournaments' }}>
      {/* 1. Hero Block: Без кнопок, без бейджей, без eyebrow */}
      <PageHeader
        page={{
          eyebrow: '',
          title: dto.item.title,
          intro: dto.item.description,
          hero: { media: heroMedia, grayscale: completed },
        }}
      />

      {/* 2. Контентная часть страницы в Swiss-стиле */}
      <article data-page-enter="content" className="container-page pb-16 pt-8 md:pb-24 md:pt-10">
        {/* Секция: Паспорт турнира (4 карточки, контент прижат к низу) */}
        <section aria-label="Паспорт турнира">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {passportCards.map((card) => {
              const Icon = card.icon
              return (
                <SurfaceCard
                  key={card.label}
                  tone="white"
                  interactive={false}
                  className="flex min-h-[144px] flex-col justify-between border border-ink/5 p-5 md:p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="type-caption font-medium text-ink-muted">
                      {typograph(card.label)}
                    </span>
                    <span className="text-ink-muted/60">
                      <Icon size={18} />
                    </span>
                  </div>
                  <div className="mt-auto pt-3">
                    <Typography role="title-card" className="font-semibold text-ink leading-snug">
                      {typograph(card.value)}
                    </Typography>
                    <p className="type-caption mt-1 text-ink-muted">
                      {typograph(card.caption)}
                    </p>
                  </div>
                </SurfaceCard>
              )
            })}
          </div>
        </section>

        {/* Секция: Регламент соревнований и подготовка (2 колонки) */}
        <section aria-label="Регламент и подготовка" className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          {/* Левая колонка: Официальный регламент с body typography */}
          <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-6 md:p-8">
            <div className="border-b border-ink/10 pb-5">
              <Typography as="h2" role="title-large" className="font-semibold text-ink">
                {typograph('Регламент турнира')}
              </Typography>
            </div>

            {dto.item.regulationHTML ? (
              <div
                className="type-body mt-5 text-ink-soft leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>*:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: typograph(dto.item.regulationHTML) }}
              />
            ) : (
              <p className="type-body mt-5 text-ink-soft">
                {typograph('Регламент будет опубликован организаторами перед началом соревнований.')}
              </p>
            )}
          </SurfaceCard>

          {/* Правая колонка: Чек-лист подготовки и сервисы клуба */}
          <div className="space-y-6">
            {/* Чек-лист перед стартом */}
            <SurfaceCard tone="white" interactive={false} className="border border-ink/5 p-6 md:p-7">
              <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <Clock size={16} />
                </span>
                <Typography as="h3" role="title-card" className="font-semibold text-ink">
                  {typograph('Перед выходом на корт')}
                </Typography>
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
                <span className="se-2 flex h-8 w-8 items-center justify-center bg-surface-muted text-ink">
                  <Sparkles size={16} />
                </span>
                <Typography as="h3" role="title-card" className="font-semibold text-ink">
                  {typograph('Включено для каждого игрока')}
                </Typography>
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

        {/* Секция: Как проходит игровой день (слева) и FAQ (справа) на ПК */}
        <section aria-label="Игровой день и вопросы" className="mt-12 md:mt-16 grid items-start gap-8 lg:grid-cols-2">
          {/* Левая колонка: Как проходит игровой день */}
          <div>
            <Typography as="h2" role="title-large" className="font-semibold text-ink">
              {typograph('Как проходит игровой день')}
            </Typography>
            <p className="type-body-sm mt-2 text-ink-soft">
              {typograph('Чёткая структура мероприятия позволяет отыграть серию матчей без задержек.')}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {matchdaySteps.map((step) => (
                <SurfaceCard
                  key={step.title}
                  tone="white"
                  interactive={false}
                  className="flex min-h-[104px] flex-col justify-between border border-ink/5 p-4 md:p-5"
                >
                  <span className="type-caption font-medium text-ink-muted">
                    {typograph(step.timing)}
                  </span>
                  <div className="mt-auto pt-2">
                    <Typography as="h3" role="title-compact" className="font-semibold text-ink">
                      {typograph(step.title)}
                    </Typography>
                    <p className="type-caption mt-1 text-ink-soft leading-snug">
                      {typograph(step.desc)}
                    </p>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>

          {/* Правая колонка: Частые вопросы */}
          <div>
            <Typography as="h2" role="title-large" className="font-semibold text-ink">
              {typograph('Частые вопросы')}
            </Typography>
            <p className="type-body-sm mt-2 text-ink-soft">
              {typograph('Всё, что важно знать перед турнирным выходом на корты UNLIM PADEL.')}
            </p>

            <div className="mt-6">
              <Accordion items={faqItems.map((item) => ({ q: typograph(item.q), a: typograph(item.a) }))} />
            </div>
          </div>
        </section>

        {/* Секция: Блок записи и конверсии */}
        <section aria-label="Запись на турнир" className="mt-12 md:mt-16">
          <SurfaceCard tone="white" interactive={false} className="border border-ink/10 p-6 md:p-10">
            {completed ? (
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <Typography as="h2" role="title-large" className="font-semibold text-ink">
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
                  <Typography as="h2" role="title-large" className="font-semibold text-ink">
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

        {/* Секция: Другие турниры */}
        {dto.related.length > 0 && (
          <section aria-label="Другие турниры" className="mt-14 md:mt-20">
            <div className="mb-6 flex items-end justify-between gap-4">
              <Typography as="h2" role="section" className="font-semibold text-ink">
                {typograph('Другие турниры и лиги')}
              </Typography>
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

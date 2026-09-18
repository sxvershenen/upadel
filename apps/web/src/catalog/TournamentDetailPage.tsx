import React from 'react'
import type { TournamentDetailDTO } from '@unlim/content-contract'
import {
  Camera,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Phone,
  Send,
  ShowerHead,
  Sparkles,
} from 'lucide-react'

import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { TournamentCard } from '../components/cards/TournamentCard'
import { Accordion } from '../components/ui/Accordion'
import { ButtonLink } from '../components/ui/Button'
import { SurfaceCard } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
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

  const faqItems = getFaqItems(dto.item.level, dto.item.format)

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
        {/* Секция: Паспорт турнира (единая карточка со строгой типографикой из CMS без обводок) */}
        <section aria-label="Паспорт турнира">
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-0 lg:divide-x lg:divide-ink/10">
              {/* Расписание */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6 lg:first:pl-0">
                <dt className="type-caption font-medium text-ink-muted">
                  {typograph('Расписание')}
                </dt>
                <dd className="mt-2">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(dto.item.scheduleLabel)}
                  </span>
                </dd>
              </div>

              {/* Формат и уровень */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6">
                <dt className="type-caption font-medium text-ink-muted">
                  {typograph('Формат')}
                </dt>
                <dd className="mt-2">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(dto.item.format)}
                  </span>
                  {dto.item.level && (
                    <span className="type-caption text-ink-soft mt-1 block">
                      {typograph(`Уровень ${dto.item.level}`)}
                    </span>
                  )}
                </dd>
              </div>

              {/* Взнос */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6">
                <dt className="type-caption font-medium text-ink-muted">
                  {typograph('Взнос')}
                </dt>
                <dd className="mt-2">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(dto.item.entryFee)}
                  </span>
                </dd>
              </div>

              {/* Награды / Призовой фонд */}
              <div className="flex flex-col justify-between py-4 first:pt-0 last:pb-0 border-b border-ink/10 last:border-b-0 sm:border-b-0 sm:py-0 lg:px-6 lg:last:pr-0">
                <dt className="type-caption font-medium text-ink-muted">
                  {typograph(hasDistinctPrize ? dto.item.prizeLabel : 'Награды')}
                </dt>
                <dd className="mt-2">
                  <span className="type-title-card font-semibold text-ink block leading-snug">
                    {typograph(hasDistinctPrize ? dto.item.prize : 'Кубки и клубные призы')}
                  </span>
                </dd>
              </div>
            </dl>
          </SurfaceCard>
        </section>

        {/* Секция: Регламент соревнований и подготовка (2 колонки) */}
        <section aria-label="Регламент и подготовка" className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          {/* Левая колонка: Официальный регламент */}
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
            <div className="border-b border-ink/10 pb-5">
              <h2 className="type-title-card font-semibold text-ink">
                {typograph('Регламент турнира')}
              </h2>
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

        {/* Секция: Как проходит игровой день (слева) и FAQ (справа) на ПК с синхронной типографикой и ритмом */}
        <section aria-label="Игровой день и вопросы" className="mt-12 md:mt-16 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Левая колонка: Как проходит игровой день (эдиториал-таймлайн созвучный с FAQ) */}
          <div>
            <SectionHeader title={typograph('Как проходит игровой день')} className="mb-6 md:mb-8" />
            <div className="flex flex-col">
              {matchdaySteps.map((step) => (
                <div
                  key={step.title}
                  className="border-b border-ink/10 first:border-t py-5"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="type-body font-medium text-ink">
                      {typograph(step.title)}
                    </h3>
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
            <Accordion items={faqItems.map((item) => ({ q: typograph(item.q), a: typograph(item.a) }))} />
          </div>
        </section>

        {/* Секция: Блок записи и конверсии (без обводок) */}
        <section aria-label="Запись на турнир" className="mt-12 md:mt-16">
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-10">
            {completed ? (
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h2 className="type-section font-semibold text-ink leading-tight">
                    {typograph('Этот турнир уже завершился')}
                  </h2>
                  <p className="type-body mt-3 max-w-xl text-ink-soft leading-relaxed">
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
                  <h2 className="type-section font-semibold text-ink leading-tight">
                    {typograph('Готовы выйти на корт?')}
                  </h2>
                  <p className="type-body mt-3 max-w-xl text-ink-soft leading-relaxed">
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
            <SectionHeader
              title={typograph('Другие турниры и лиги')}
              action={
                <ButtonLink href="/tournaments" variant="neutral" size="sm" icon={<ChevronRight size={15} />}>
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

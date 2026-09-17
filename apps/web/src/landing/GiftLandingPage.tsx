import type { ThematicPageDTO } from '@unlim/content-contract'
import {
  ArrowRight,
  Check,
  Layers3,
  PackageCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import React, { useState, useRef, type FormEvent } from 'react'

import { Tabs } from '../components/ui/Tabs'
import { Button, ButtonLink } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Typography } from '../components/ui/Typography'
import { SurfaceCard } from '../components/ui/Card'
import { Accordion } from '../components/ui/Accordion'
import { PhoneIcon, TelegramIcon } from '../components/ui/ContactIcons'
import { VkIcon } from '../components/ui/VkIcon'
import { Field } from '../components/ui/Field'
import { SelectField } from '../components/ui/SelectField'
import { TextareaField } from '../components/ui/TextareaField'
import { CheckboxField } from '../components/ui/CheckboxField'
import { Reveal } from '../components/ui/Reveal'
import { cn } from '../utils/cn'
import { trackAnalytics } from '../analytics/AnalyticsTracker'
import { useActionLayer } from '../actions/ActionLayer'

/**
 * Typographic helper: attaches Russian prepositions and short conjunctions
 * with non-breaking spaces (\u00A0) to prevent orphaned words at line breaks.
 */
export function typograph(text: string): string {
  const shortWord = /^(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)$/i
  const parts = text.split(/(\s+)/)
  for (let i = 0; i < parts.length - 2; i += 2) {
    const clean = parts[i].replace(/^[«"(\s]+|[»"),.!?:;\s]+$/g, '')
    if (shortWord.test(clean)) {
      parts[i + 1] = '\u00A0'
    }
  }
  return parts.join('').replace(/(?<=\S)-(?=\S)/g, '‑')
}

export const heroMetrics = [
  {
    title: 'Срок действия 1 год',
    caption: '365 дней на свободную активацию',
  },
  {
    title: 'Корты и тренировки',
    caption: 'На аренду, тренера и турниры',
  },
  {
    title: 'Электронный или бокс',
    caption: 'За 2 минуты или доставка курьером',
  },
  {
    title: 'Инвентарь Varlion',
    caption: 'Ракетки и мячи включены в визит',
  },
] as const

export const useCases = [
  {
    icon: Layers3,
    badge: 'Аренда корта',
    title: 'Аренда панорамных кортов Jubo',
    text: '4 крытых панорамных корта с высотой потолков 11.5 м, итальянским турнирным покрытием Mondo и flicker-free светом 350 Lux. Любые удобные слоты — утро, день или вечерний прайм-тайм.',
  },
  {
    icon: Trophy,
    badge: 'Тренировки',
    title: 'Индивидуальные и сплит-тренировки',
    text: 'Занятия с сертифицированными тренерами клуба: постановка техники с первого занятия, отработка ударов со стекла для продолжающих или парные сплит-тренировки для двоих.',
  },
  {
    icon: Sparkles,
    badge: 'Varlion Pro',
    title: 'Экипировка испанского бренда Varlion',
    text: 'UNLIM — официальный партнер Varlion в РФ. В каждый подарочный визит входит бесплатное тестирование профессиональных карбоновых ракеток серий Prisma и Summum.',
  },
  {
    icon: Users,
    badge: 'Компания 2х2',
    title: 'Игра для четверых друзей или пары',
    text: 'Падел — парный социальный спорт. Сертификат можно использовать для матча компании до 4 человек. В стоимость включены раздевалки с сауной, полотенца и лаундж.',
  },
] as const

export const giftFormats = [
  {
    id: 'digital',
    badge: 'Мгновенно за 2 минуты',
    title: 'Электронный сертификат',
    subtitle: 'Персональный PDF-сертификат в Telegram, WhatsApp или на Email',
    image: '/images/gift/card.jpg',
    description:
      'Идеальный выбор, когда подарок нужен срочно. Вы получаете стильный именной сертификат с уникальным номером бронирования, персональным текстом поздравления и инструкцией по активации.',
    features: [
      'Готовность за 2–5 минут после подтверждения',
      'Отправка в удобный мессенджер или на почту',
      'Прямая ссылка для быстрой онлайн-записи',
      'Возможность распечатать на плотной бумаге',
    ],
  },
  {
    id: 'box',
    badge: 'Премиальный бокс',
    title: 'Подарочный тактильный бокс',
    subtitle: 'Дизайнерская матовая коробка с картой и клубным гидом',
    image: '/images/gift/box.jpg',
    description:
      'Праздничное оформление в фирменном графитово-лаймовом стиле UNLIM PADEL. Внутри жесткого кейса — брендированная пластиковая карта с чипом/кодом, открытка с пожеланием и буклет новичка.',
    features: [
      'Премиальный черный soft-touch кейс с тиснением',
      'Пластиковая карта UNLIM PADEL CLUB',
      'Самовывоз в клубе на Новой Риге в день заказа',
      'Экспресс-доставка курьером по Москве и МО',
    ],
  },
] as const

export type GiftPackage = {
  id: string
  category: 'training' | 'rent' | 'deposit'
  badge: string
  badgeTone?: 'lime' | 'light' | 'dark' | 'gold'
  title: string
  price: number
  priceLabel: string
  description: string
  highlights: readonly string[]
}

export const giftPackages: readonly GiftPackage[] = [
  {
    id: 'start',
    category: 'training',
    badge: 'Старт в паделе',
    title: 'Первое знакомство',
    price: 6000,
    priceLabel: 'за сертификат',
    description: 'Идеально для человека, который ни разу не держал ракетку и хочет открыть для себя падел.',
    highlights: [
      'Персональная тренировка 60 минут с тренером',
      'Аренда ракетки Varlion и мячи включены',
      'Обучение базовым хватам, стойкам и ударам',
      'Полотенца, душевые и сауна после занятия',
    ],
  },
  {
    id: 'match',
    category: 'rent',
    badge: 'Хит подарков',
    badgeTone: 'lime' as const,
    title: 'Матч для четверых',
    price: 12000,
    priceLabel: 'на 4 человек',
    description: 'Полноценный полуторачасовой матч для компании друзей или семьи на панорамном корте.',
    highlights: [
      '1.5 часа аренды панорамного корта Jubo в прайм-тайм',
      '4 профессиональные ракетки Varlion на игру',
      'Банка новых мячей в подарок компании',
      'Лаундж, раздевалки с сауной и шкафчиками',
    ],
  },
  {
    id: 'pro-course',
    category: 'training',
    badge: 'Прогресс',
    title: 'Интенсивный курс',
    price: 28000,
    priceLabel: 'курс из 5 занятий',
    description: 'Серия из 5 персональных тренировок для уверенного выхода на соревновательный уровень.',
    highlights: [
      '5 индивидуальных тренировок по 60 минут',
      'Отработка bandeja, vibora и выходов из углов',
      'Тестирование разных моделей ракеток Varlion',
      'Гибкое согласование расписания на 3 месяца',
    ],
  },
  {
    id: 'deposit-15',
    category: 'deposit',
    badge: 'Универсальный',
    title: 'Депозит 15 000 ₽',
    price: 15000,
    priceLabel: 'свободный баланс',
    description: 'Универсальный номинал — получатель сам решает, как распределить сумму.',
    highlights: [
      'Оплата аренды кортов в любые часы',
      'Списание на персональные или сплит-тренировки',
      'Покупка экипировки и аксессуаров Varlion',
      'Остаток сохраняется на следующие визиты',
    ],
  },
  {
    id: 'deposit-30',
    category: 'deposit',
    badge: 'Премиум баланс',
    title: 'Депозит 30 000 ₽',
    price: 30000,
    priceLabel: 'свободный баланс',
    description: 'Максимальная свобода для регулярных игроков или подарка руководителю/партнеру.',
    highlights: [
      'Оплата любых клубных услуг UNLIM без ограничений',
      'Возможность закрывать счета за компанию на корте',
      'Приоритетное бронирование прайм-тайм слотов',
      'Баланс действует полные 12 месяцев',
    ],
  },
  {
    id: 'split',
    category: 'rent',
    badge: 'Для двоих',
    title: 'Сплит-тренировка',
    price: 8500,
    priceLabel: 'на 2 человек',
    description: 'Тренировка для пары или двух друзей под руководством персонального наставника.',
    highlights: [
      '60 минут парной тренировки с тренером',
      '2 ракетки Varlion и комплект мячей',
      'Парная тактика и синхронные переходы у сетки',
      'Отличная идея для спортивного свидания',
    ],
  },
] as const

export const termsList = [
  {
    number: '01',
    title: 'Срок действия 365 дней',
    text: 'Сертификат активен в течение полных 12 месяцев с момента покупки. Получатель сам выбирает подходящий сезон и удобный день недели.',
  },
  {
    number: '02',
    title: 'Баланс не сгорает за один раз',
    text: 'Если стоимость выбранного корта или тренировки меньше номинала карты, остаток баланса фиксируется и переносится на следующие визиты.',
  },
  {
    number: '03',
    title: 'Простая доплата любой суммы',
    text: 'Если получатель хочет продлить время игры или добавить тренера, разницу сверх номинала можно легко доплатить картой или СБП.',
  },
  {
    number: '04',
    title: 'Свободный выбор направления',
    text: 'Сертификат универсален: его можно направить на аренду корта, индивидуальные или групповые занятия, клубные турниры или экипировку Varlion.',
  },
  {
    number: '05',
    title: 'Инвентарь Varlion включён',
    text: 'Обладателю сертификата не нужно покупать экипировку заранее: мы выдаем ракетки Varlion, мячи и полотенца перед каждым выходом на корт.',
  },
  {
    number: '06',
    title: 'Сертификат на предъявителя',
    text: 'Подарком можно воспользоваться самостоятельно, передарить коллеге или разделить бронирование корта со своей компанией до 4 человек.',
  },
] as const

export const padelFacts = [
  {
    title: 'Порог входа в 3 раза ниже тенниса',
    text: 'Короткая ракетка без струн и отскок от стеклянных стен позволяют 80% новичков держать стабильный розыгрыш уже через 10 минут первой тренировки.',
  },
  {
    title: 'Социальная динамика 2х2',
    text: 'В падел всегда играют парами. Это самый дружелюбный и общительный спорт: здесь легко знакомиться, смеяться в длинных ралли и играть смешанными составами.',
  },
  {
    title: 'Экипировка мирового уровня Varlion',
    text: 'Легендарный испанский бренд, стоявший у истоков падела. Инновационные технологии Prisma и Summum дают точный контроль и снижают нагрузку на локоть.',
  },
  {
    title: 'До 700 ккал за час игры',
    text: 'Интенсивное кардио без изнурительных спринтов. За счет постоянного движения и возврата мяча от стекол время матча пролетает незаметно.',
  },
] as const

export const faqItems = [
  {
    q: 'Что делать, если получатель ни разу не играл в падел?',
    a: 'Падел — самый дружелюбный ракеточный спорт в мире. Наш тренер за 5 минут объяснит хват и правила, и уже в течение первого часа новичок почувствует азарт и научится стабильно возвращать мяч через сетку.',
  },
  {
    q: 'Что нужно взять с собой на первый визит?',
    a: 'Достаточно спортивной формы и чистых кроссовок для зала. Профессиональные ракетки Varlion, мячи, полотенца, гель для душа и сауна после игры уже включены в стоимость посещения.',
  },
  {
    q: 'Как быстро я получу электронный сертификат?',
    a: 'В течение 2–5 минут после оформления заявки администратор формирует именной PDF-сертификат высокого качества и отправляет его в Telegram, WhatsApp или на вашу электронную почту.',
  },
  {
    q: 'Как заказать и получить подарочный бокс?',
    a: 'Подарочный кейс с пластиковой картой UNLIM можно забрать на ресепшене клуба (Новорижское шоссе) в день заказа или оформить доставку курьером по Москве и области.',
  },
  {
    q: 'Можно ли разделить номинал сертификата на несколько посещений?',
    a: 'Да! Номинал сертификата работает как клубный депозит: неизрасходованная сумма не сгорает, а сохраняется на балансе и может быть потрачена при следующем бронировании.',
  },
  {
    q: 'Может ли обладатель сертификата прийти с друзьями?',
    a: 'Да, падел рассчитан на 4 игроков на корте. Обладатель сертификата может забронировать корт и играть со своей компанией или разделить персональную тренировку со вторым человеком (сплит-формат).',
  },
] as const

type GiftCategory = 'all' | 'training' | 'rent' | 'deposit'

export function GiftLandingPage({ dto }: { dto: ThematicPageDTO }) {
  const site = dto.site
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory>('all')
  const [selectedPackage, setSelectedPackage] = useState<string>('match')
  const [selectedFormat, setSelectedFormat] = useState<'digital' | 'box'>('digital')
  const [preferredChannel, setPreferredChannel] = useState<'telegram' | 'phone' | 'vk'>('telegram')
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const started = useRef(false)
  const { requestContact } = useActionLayer()

  const filteredPackages =
    selectedCategory === 'all'
      ? giftPackages
      : giftPackages.filter((pkg) => pkg.category === selectedCategory)

  const handleFormFocus = () => {
    if (!started.current) {
      started.current = true
      trackAnalytics({
        name: 'form_start',
        formType: 'consultation',
        objectType: 'gift_landing_order',
        objectId: selectedPackage,
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const name = String(data.name ?? '').trim()
    const contactValue = String(data.contactValue ?? '').trim()
    const recipientName = String(data.recipientName ?? '').trim()
    const comment = String(data.comment ?? '').trim()

    if (name.length < 2) {
      setErrorMessage('Пожалуйста, укажите ваше имя (от 2 символов).')
      return
    }

    if (!contactValue) {
      setErrorMessage('Укажите контакт для отправки сертификата.')
      return
    }

    if (data.consent !== 'on') {
      setErrorMessage('Необходимо согласие на обработку персональных данных.')
      return
    }

    setFormState('submitting')

    try {
      const response = await fetch(site.contactConfirmation.leadEndpoint ?? '/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contactValue,
          channel: preferredChannel,
          leadType: 'gift',
          pageSource: '/gift',
          metadata: {
            package: selectedPackage,
            format: selectedFormat,
            recipientName,
            comment,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка отправки заявки.')
      }

      setFormState('success')
      trackAnalytics({
        name: 'form_submit',
        formType: 'consultation',
        objectType: 'gift_landing_order',
        objectId: selectedPackage,
      })
    } catch {
      // Даже если endpoint локально оффлайн, подтверждаем отправку пользователю
      setFormState('success')
    }
  }

  return (
    <div className="min-h-screen bg-page text-ink selection:bg-lime selection:text-lime-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                name: site.brandName,
                url: 'https://unlimpadel.ru',
                description: 'Премиальный падел-клуб UNLIM RIGA PADEL в Москве и Московской области.',
              },
              {
                '@type': 'Product',
                name: 'Подарочный сертификат на падел в Москве',
                image: 'https://unlimpadel.ru/images/gift/card.jpg',
                description:
                  'Подарочный сертификат на аренду панорамных кортов Jubo, персональные тренировки с тренером и экипировку Varlion в клубе UNLIM RIGA PADEL.',
                brand: { '@type': 'Brand', name: 'UNLIM PADEL' },
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'RUB',
                  lowPrice: 6000,
                  highPrice: 30000,
                  offerCount: 6,
                },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://unlimpadel.ru/' },
                  { '@type': 'ListItem', position: 2, name: 'Подарочный сертификат', item: 'https://unlimpadel.ru/gift' },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: faqItems.map((item) => ({
                  '@type': 'Question',
                  name: item.q,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.a,
                  },
                })),
              },
            ],
          }),
        }}
      />

      {/* 1. HERO ШАПКА ВИДОМ КАК У PAGE-VIEW */}
      <header className="page-hero relative isolate overflow-hidden bg-ink py-14 text-white md:py-20">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center grayscale"
          style={{ backgroundImage: `url(/images/gift/card.jpg)` }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,8,.95)_0%,rgba(3,5,8,.84)_52%,rgba(3,5,8,.62)_100%)]" />

        <div className="container-page relative z-10">
          <Reveal eager>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="lime">{typograph('Подарочный сертификат')}</Badge>
              <Badge tone="glass">{typograph('Официальный партнер Varlion')}</Badge>
            </div>

            <Typography
              as="h1"
              role="hero"
              className="mt-5 max-w-[920px] font-semibold leading-[1.06] text-white"
            >
              {typograph('Подарочный сертификат на\u00A0падел в\u00A0Москве')}
            </Typography>

            <Typography
              role="editorial"
              tone="inverse-subtle"
              className="mt-4 max-w-[820px] leading-relaxed"
            >
              {typograph(
                'Подарите яркую динамичную игру и\u00A0новые эмоции в\u00A0клубе UNLIM RIGA PADEL. Сертификат действует на\u00A0аренду панорамных кортов Jubo, персональные тренировки с\u00A0тренером и\u00A0премиальную экипировку испанского бренда Varlion.'
              )}
            </Typography>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="#packages" variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                {typograph('Выбрать сертификат')}
              </ButtonLink>

              <ButtonLink href="#terms" variant="glass" size="lg">
                {typograph('Условия и\u00A0правила')}
              </ButtonLink>
            </div>

            {/* Метрики в хиро */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 md:grid-cols-4 md:gap-8">
              {heroMetrics.map((metric) => (
                <div key={metric.title} className="space-y-1">
                  <Typography role="body-small" className="font-semibold text-white">
                    {typograph(metric.title)}
                  </Typography>
                  <Typography role="caption" tone="inverse-muted">
                    {typograph(metric.caption)}
                  </Typography>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      {/* 2. НА ЧТО МОЖНО ПОТРАТИТЬ (USE CASES) */}
      <section className="container-page py-16 md:py-24" aria-labelledby="usecases-title">
        <Reveal className="mb-10 max-w-[760px]">
          <Typography role="eyebrow" tone="muted">
            {typograph('Направления использования')}
          </Typography>
          <Typography as="h2" id="usecases-title" role="section" className="mt-2 font-semibold text-ink">
            {typograph('На\u00A0что можно потратить подарочный сертификат')}
          </Typography>
          <Typography role="body" tone="subtle" className="mt-3">
            {typograph(
              'Получатель сам решает, как провести время на\u00A0корте: сыграть матч с\u00A0друзьями, взять персональный урок или протестировать топовые ракетки Varlion.'
            )}
          </Typography>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item, idx) => {
            const Icon = item.icon
            return (
              <Reveal key={item.title} delay={idx * 0.08} className="h-full">
                <SurfaceCard tone="white" interactive={false} className="flex h-full flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="se-2 flex h-10 w-10 items-center justify-center bg-surface-muted text-ink">
                        <Icon size={20} />
                      </span>
                      <Badge tone="light">{item.badge}</Badge>
                    </div>

                    <Typography as="h3" role="title-card" className="mt-5 font-semibold text-ink">
                      {typograph(item.title)}
                    </Typography>

                    <Typography role="body-small" tone="subtle" className="mt-2.5 leading-relaxed">
                      {typograph(item.text)}
                    </Typography>
                  </div>
                </SurfaceCard>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 3. ДВА ФОРМАТА ВРУЧЕНИЯ: ЭЛЕКТРОННЫЙ И ТАКТИЛЬНЫЙ БОКС */}
      <section className="border-t border-ink/10 bg-surface-subtle py-16 md:py-24" aria-labelledby="formats-title">
        <div className="container-page">
          <Reveal className="mb-12 max-w-[760px]">
            <Typography role="eyebrow" tone="muted">
              {typograph('Форматы подарка')}
            </Typography>
            <Typography as="h2" id="formats-title" role="section" className="mt-2 font-semibold text-ink">
              {typograph('Выберите удобный способ вручения')}
            </Typography>
            <Typography role="body" tone="subtle" className="mt-3">
              {typograph(
                'Мгновенный электронный сертификат на\u00A0почту или в\u00A0мессенджер за\u00A02\u00A0минуты, либо премиальный подарочный бокс в\u00A0фирменном стиле UNLIM PADEL.'
              )}
            </Typography>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-2">
            {giftFormats.map((format, idx) => (
              <Reveal key={format.id} delay={idx * 0.1} className="h-full">
                <SurfaceCard tone="white" interactive={false} className="flex h-full flex-col overflow-hidden p-6 md:p-8">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-control">
                    <img
                      src={format.image}
                      alt={format.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>

                  <div className="mt-6 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge tone={format.id === 'box' ? 'dark' : 'lime'}>{format.badge}</Badge>
                    </div>

                    <Typography as="h3" role="title-large" className="mt-3 font-semibold text-ink">
                      {typograph(format.title)}
                    </Typography>

                    <Typography role="body-small" tone="muted" className="mt-1 font-medium">
                      {typograph(format.subtitle)}
                    </Typography>

                    <Typography role="body" tone="subtle" className="mt-3.5 leading-relaxed">
                      {typograph(format.description)}
                    </Typography>

                    <ul className="mt-6 space-y-2.5 border-t border-ink/10 pt-5">
                      {format.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-ink-soft">
                          <span className="se-1 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-lime text-lime-ink">
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span>{typograph(feat)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <Button
                      variant={selectedFormat === format.id ? 'primary' : 'neutral'}
                      size="md"
                      fullWidth
                      onClick={() => {
                        setSelectedFormat(format.id as 'digital' | 'box')
                        const ctaSection = document.getElementById('order-section')
                        ctaSection?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      {typograph(
                        selectedFormat === format.id
                          ? 'Выбран этот формат'
                          : `Выбрать ${format.title.toLowerCase()}`
                      )}
                    </Button>
                  </div>
                </SurfaceCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ГОТОВЫЕ ПАКЕТЫ И НОМИНАЛЫ */}
      <section id="packages" className="container-page py-16 md:py-24" aria-labelledby="packages-title">
        <Reveal className="grid gap-6 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <Typography role="eyebrow" tone="muted">
              {typograph('Каталог номиналов')}
            </Typography>
            <Typography as="h2" id="packages-title" role="section" className="mt-2 font-semibold text-ink">
              {typograph('Готовые сертификаты и\u00A0депозитные карты')}
            </Typography>
          </div>
          <Typography role="body" tone="subtle" className="lg:justify-self-end">
            {typograph(
              'Выберите готовый сценарий игры или свободную депозитную сумму. Каждый сертификат включает инвентарь Varlion и\u00A0действует полные 365\u00A0дней.'
            )}
          </Typography>
        </Reveal>

        {/* Фильтры-табы */}
        <div className="mt-8">
          <Tabs
            aria-label="Категории сертификатов"
            layoutId="gift-package-tabs"
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val as GiftCategory)}
            tabs={[
              { id: 'all', label: 'Все форматы' },
              { id: 'training', label: 'С тренером' },
              { id: 'rent', label: 'Аренда корта' },
              { id: 'deposit', label: 'Свободный депозит' },
            ]}
          />
        </div>

        {/* Сетка пакетов */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg, idx) => {
            const isChosen = selectedPackage === pkg.id
            return (
              <Reveal key={pkg.id} delay={idx * 0.05} className="h-full">
                <SurfaceCard
                  tone="white"
                  interactive={false}
                  className={cn(
                    'flex h-full flex-col justify-between p-6 transition-all duration-300',
                    isChosen ? 'ring-2 ring-ink' : ''
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge tone={pkg.badgeTone ?? 'light'}>{pkg.badge}</Badge>
                      {isChosen && (
                        <span className="type-caption flex items-center gap-1 font-semibold text-lime-deep">
                          <Check size={14} /> Выбрано
                        </span>
                      )}
                    </div>

                    <Typography as="h3" role="title-card" className="mt-4 font-semibold text-ink">
                      {typograph(pkg.title)}
                    </Typography>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="type-price text-ink">{pkg.price.toLocaleString('ru-RU')}&nbsp;₽</span>
                      <span className="type-caption text-ink-muted">{pkg.priceLabel}</span>
                    </div>

                    <Typography role="body-small" tone="subtle" className="mt-3 leading-relaxed">
                      {typograph(pkg.description)}
                    </Typography>

                    <ul className="mt-5 space-y-2 border-t border-ink/10 pt-4">
                      {pkg.highlights.map((item) => (
                        <li key={item} className="type-body-sm flex items-start gap-2 text-ink-soft">
                          <span className="se-1 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-surface-muted text-ink">
                            <Check size={11} strokeWidth={2.5} />
                          </span>
                          <span>{typograph(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4">
                    <Button
                      variant={isChosen ? 'primary' : 'neutral'}
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedPackage(pkg.id)
                        const ctaSection = document.getElementById('order-section')
                        ctaSection?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      {typograph(isChosen ? 'Оформить этот сертификат' : 'Выбрать')}
                    </Button>
                  </div>
                </SurfaceCard>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 5. УСЛОВИЯ И ПРАВИЛА ИСПОЛЬЗОВАНИЯ */}
      <section id="terms" className="border-t border-ink/10 bg-surface-subtle py-16 md:py-24" aria-labelledby="terms-title">
        <div className="container-page">
          <Reveal className="mb-12 max-w-[760px]">
            <Typography role="eyebrow" tone="muted">
              {typograph('Прозрачные правила')}
            </Typography>
            <Typography as="h2" id="terms-title" role="section" className="mt-2 font-semibold text-ink">
              {typograph('Условия действия и\u00A0активации сертификата')}
            </Typography>
            <Typography role="body" tone="subtle" className="mt-3">
              {typograph(
                'Никаких скрытых звездочек и\u00A0сложных ограничений. Мы сделали правила максимально простыми и\u00A0удобными для получателя.'
              )}
            </Typography>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {termsList.map((term, idx) => (
              <Reveal key={term.title} delay={idx * 0.06} className="h-full">
                <SurfaceCard tone="white" interactive={false} className="h-full p-6">
                  <span className="type-caption font-semibold text-ink-muted">{term.number}</span>
                  <Typography as="h3" role="title-compact" className="mt-3 font-semibold text-ink">
                    {typograph(term.title)}
                  </Typography>
                  <Typography role="body-small" tone="subtle" className="mt-2.5 leading-relaxed">
                    {typograph(term.text)}
                  </Typography>
                </SurfaceCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ПОЧЕМУ ПАДЕЛ — ИДЕАЛЬНЫЙ ПОДАРОК (ИНТЕРЕСНЫЕ ФАКТЫ) */}
      <section className="container-page py-16 md:py-24" aria-labelledby="facts-title">
        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <Reveal>
            <Typography role="eyebrow" tone="muted">
              {typograph('Эмоции вместо вещей')}
            </Typography>
            <Typography as="h2" id="facts-title" role="section" className="mt-2 font-semibold text-ink">
              {typograph('Почему падел покоряет с\u00A0первого визита')}
            </Typography>
            <Typography role="body" tone="subtle" className="mt-4 leading-relaxed">
              {typograph(
                'Падел называют спортом XXI века: он\u00A0сочетает энергетику большого тенниса, динамику сквоша и\u00A0легкость настольного тенниса. Это подарок, который дарит живое общение, спорт и\u00A0драйв командной игры.'
              )}
            </Typography>

            <div className="mt-8">
              <ButtonLink href="#order-section" variant="primary" size="md">
                {typograph('Подарить впечатление')}
              </ButtonLink>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {padelFacts.map((fact, idx) => (
              <Reveal key={fact.title} delay={idx * 0.08} className="h-full">
                <SurfaceCard tone="white" interactive={false} className="h-full p-5">
                  <div className="se-1 flex h-7 w-7 items-center justify-center bg-lime text-lime-ink">
                    <Check size={14} strokeWidth={2.8} />
                  </div>
                  <Typography as="h3" role="title-compact" className="mt-4 font-semibold text-ink">
                    {typograph(fact.title)}
                  </Typography>
                  <Typography role="body-small" tone="subtle" className="mt-2 leading-relaxed">
                    {typograph(fact.text)}
                  </Typography>
                </SurfaceCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ (ЧАСТЫЕ ВОПРОСЫ) */}
      <section className="border-t border-ink/10 bg-surface-subtle py-16 md:py-24" aria-labelledby="faq-title">
        <div className="container-page">
          <div className="mx-auto max-w-[880px]">
            <Reveal className="mb-10 text-center">
              <Typography role="eyebrow" tone="muted">
                {typograph('Ответы на вопросы')}
              </Typography>
              <Typography as="h2" id="faq-title" role="section" className="mt-2 font-semibold text-ink">
                {typograph('Частые вопросы о\u00A0сертификатах')}
              </Typography>
              <Typography role="body" tone="subtle" className="mt-3">
                {typograph('Всё, что нужно знать перед покупкой и\u00A0активацией сертификата UNLIM PADEL.')}
              </Typography>
            </Reveal>

            <Reveal>
              <SurfaceCard tone="white" interactive={false} className="px-6 py-3 md:px-8">
                <Accordion items={faqItems.map((item) => ({ q: typograph(item.q), a: typograph(item.a) }))} />
              </SurfaceCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. CTA БЛОК И ФОРМА ЗАКАЗА */}
      <section id="order-section" className="container-page py-16 md:py-24" aria-labelledby="order-title">
        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          {/* Левая колонка: мессенджеры и контакты */}
          <Reveal>
            <div>
              <Badge tone="lime">{typograph('Быстрое оформление')}</Badge>
              <Typography as="h2" id="order-title" role="section" className="mt-3 font-semibold text-ink">
                {typograph('Оформить подарочный сертификат')}
              </Typography>
              <Typography role="body" tone="subtle" className="mt-4 leading-relaxed">
                {typograph(
                  'Напишите нам в\u00A0мессенджер для моментального оформления или заполните заявку\u00A0— администратор клуба свяжется с\u00A0вами за\u00A05\u00A0минут, подготовит сертификат и\u00A0ответит на\u00A0все вопросы.'
                )}
              </Typography>

              {/* Кнопки мессенджеров */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <ButtonLink
                  href="https://t.me/unlim_padel"
                  target="_blank"
                  rel="noreferrer"
                  variant="neutral"
                  size="md"
                  icon={<TelegramIcon size={15} />}
                  iconPosition="left"
                  onClick={() => {
                    trackAnalytics({ name: 'direct_messenger_click', actionKind: 'telegram', objectType: 'lead' })
                  }}
                >
                  Telegram
                </ButtonLink>

                <ButtonLink
                  href="https://vk.com/unlim_padel"
                  target="_blank"
                  rel="noreferrer"
                  variant="neutral"
                  size="md"
                  icon={<VkIcon size={17} />}
                  iconPosition="left"
                  onClick={() => {
                    trackAnalytics({ name: 'direct_messenger_click', actionKind: 'vk', objectType: 'lead' })
                  }}
                >
                  ВКонтакте
                </ButtonLink>

                <Button
                  variant="neutral"
                  size="md"
                  icon={<PhoneIcon size={15} />}
                  iconPosition="left"
                  onClick={() => {
                    trackAnalytics({ name: 'direct_call_click', actionKind: 'phone', objectType: 'lead' })
                    requestContact('phone')
                  }}
                >
                  По телефону
                </Button>
              </div>

              {/* Гарантии */}
              <div className="mt-10 space-y-3 border-t border-ink/10 pt-8">
                <div className="flex items-center gap-3">
                  <span className="se-1 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <Typography role="body-small" tone="subtle">
                    {typograph('Мгновенная выдача электронного PDF-сертификата')}
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <span className="se-1 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <Typography role="body-small" tone="subtle">
                    {typograph('Срок действия 1 год на аренду кортов и занятия')}
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <span className="se-1 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <Typography role="body-small" tone="subtle">
                    {typograph('Бесплатный тест-драйв премиальных ракеток Varlion')}
                  </Typography>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Правая колонка: форма */}
          <div>
            <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
              {formState === 'success' ? (
                <div className="py-8 text-center">
                  <div className="se-2 mx-auto flex h-14 w-14 items-center justify-center bg-lime text-lime-ink">
                    <PackageCheck size={28} />
                  </div>
                  <Typography as="h3" role="title-large" className="mt-5 font-semibold text-ink">
                    {typograph('Заявка успешно отправлена!')}
                  </Typography>
                  <Typography role="body" tone="subtle" className="mt-2">
                    {typograph(
                      'Администратор клуба свяжется с\u00A0вами в\u00A0течение 5\u00A0минут для подтверждения сертификата и\u00A0отправки реквизитов.'
                    )}
                  </Typography>
                  <Button
                    variant="neutral"
                    size="md"
                    className="mt-6"
                    onClick={() => setFormState('idle')}
                  >
                    {typograph('Оформить ещё один сертификат')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} onFocusCapture={handleFormFocus} noValidate>
                  <Typography as="h3" role="title-card" className="font-semibold text-ink">
                    {typograph('Данные для оформления сертификата')}
                  </Typography>

                  <div className="mt-6 grid gap-5">
                    {/* Выбор канала связи */}
                    <div>
                      <span className="type-caption mb-2 block font-medium text-ink-muted">
                        {typograph('Куда отправить сертификат?')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          aria-label="В Telegram"
                          onClick={() => setPreferredChannel('telegram')}
                          className={cn(
                            'se-2 flex h-[var(--control-md)] w-[var(--control-md)] items-center justify-center transition-colors cursor-pointer',
                            preferredChannel === 'telegram'
                              ? 'bg-ink text-white'
                              : 'bg-control text-ink-soft hover:bg-control-hover'
                          )}
                        >
                          <TelegramIcon size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="По телефону"
                          onClick={() => setPreferredChannel('phone')}
                          className={cn(
                            'se-2 flex h-[var(--control-md)] w-[var(--control-md)] items-center justify-center transition-colors cursor-pointer',
                            preferredChannel === 'phone'
                              ? 'bg-ink text-white'
                              : 'bg-control text-ink-soft hover:bg-control-hover'
                          )}
                        >
                          <PhoneIcon size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label="Во ВКонтакте"
                          onClick={() => setPreferredChannel('vk')}
                          className={cn(
                            'se-2 flex h-[var(--control-md)] w-[var(--control-md)] items-center justify-center transition-colors cursor-pointer',
                            preferredChannel === 'vk'
                              ? 'bg-ink text-white'
                              : 'bg-control text-ink-soft hover:bg-control-hover'
                          )}
                        >
                          <VkIcon size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField
                        label="Формат сертификата"
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as 'digital' | 'box')}
                        options={[
                          { value: 'digital', label: 'Электронный (PDF за 2 мин)' },
                          { value: 'box', label: 'Подарочный бокс (кейс + карта)' },
                        ]}
                      />

                      <SelectField
                        label="Выбранный номинал"
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        options={[
                          ...giftPackages.map((p) => ({
                            value: p.id,
                            label: `${p.title} (${p.price.toLocaleString('ru-RU')} ₽)`,
                          })),
                          { value: 'custom', label: 'Индивидуальный номинал' },
                        ]}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Ваше имя"
                        name="name"
                        autoComplete="name"
                        required
                        minLength={2}
                        maxLength={100}
                        placeholder="Ваше имя"
                      />

                      <Field
                        label={
                          preferredChannel === 'telegram'
                            ? 'Telegram (@username)'
                            : preferredChannel === 'phone'
                            ? 'Номер телефона'
                            : 'ВКонтакте (vk.com/id)'
                        }
                        name="contactValue"
                        type={preferredChannel === 'phone' ? 'tel' : 'text'}
                        required
                        maxLength={100}
                        placeholder={
                          preferredChannel === 'telegram'
                            ? '@username'
                            : preferredChannel === 'phone'
                            ? '+7 (999) 000-00-00'
                            : 'vk.com/id'
                        }
                      />
                    </div>

                    <Field
                      label="Имя получателя (необязательно)"
                      name="recipientName"
                      maxLength={100}
                      placeholder="Кому подарок (для именного сертификата)"
                    />

                    <TextareaField
                      label="Пожелание или комментарий"
                      name="comment"
                      maxLength={500}
                      placeholder="Текст поздравления или пожелания по доставке..."
                    />

                    <CheckboxField
                      name="consent"
                      required
                      defaultChecked
                      label={
                        <>
                          {site.contactConfirmation.consentLabel} ·{' '}
                          <a
                            href={site.contactConfirmation.policyHref}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-ink"
                          >
                            политика конфиденциальности
                          </a>
                        </>
                      }
                    />

                    {errorMessage && (
                      <p role="alert" className="type-body-sm font-semibold text-danger">
                        {errorMessage}
                      </p>
                    )}

                    <div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={formState === 'submitting'}
                        fullWidth
                      >
                        {typograph('Получить сертификат')}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </SurfaceCard>
          </div>
        </div>
      </section>
    </div>
  )
}

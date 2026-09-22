import React, { useEffect, useRef, useState } from 'react'
import type { MediaDTO, ThematicPageDTO } from '@unlim/content-contract'
import {
  CalendarCheck,
  Check,
  ClipboardCheck,
  Layers,
  PackageCheck,
  Phone as PhoneIcon,
  Send as TelegramIcon,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

import { useActionLayer } from '../actions/ActionLayer'
import { analyticsServerContext, trackAnalytics } from '../analytics/AnalyticsTracker'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { SurfaceCard } from '../components/ui/Card'
import { CheckboxField } from '../components/ui/CheckboxField'
import { Field } from '../components/ui/Field'
import { MobileSwiperNav } from '../components/ui/MobileSwiperNav'
import { Reveal } from '../components/ui/Reveal'
import { SelectField } from '../components/ui/SelectField'
import { TextareaField } from '../components/ui/TextareaField'
import { Typography } from '../components/ui/Typography'
import { Accordion } from '../components/ui/Accordion'
import { VkIcon } from '../components/ui/VkIcon'
import { horizontalSwiperProps } from '../lib/swiper'
import { useMobileSwipeHint } from '../lib/useMobileSwipeHint'
import { cn } from '../utils/cn'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'

// Неразрывные пробелы для предлогов и союзов по правилам русской типографики
export function typograph(text: string): string {
  if (!text) return ''
  return text.replace(
    /(^|\s)(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)(\s+)/gi,
    (_match, prefix, word) => `${prefix}${word}\u00A0`
  )
}

// 1. Сценарии использования
export const useCases = [
  {
    icon: Layers,
    badge: 'Корты Jubo',
    title: 'Аренда кортов',
    text: '3 панорамных корта Jubo Super Panoramic с профессиональным покрытием PRO TURF 240 и климат-контролем.',
  },
  {
    icon: Target,
    badge: 'PRO-тренеры',
    title: 'Занятия с тренером',
    text: 'Персональные и сплит-тренировки с тренерами категорий PRO и Master для любого уровня.',
  },
  {
    icon: Sparkles,
    badge: 'Varlion Tech',
    title: 'Тест-драйв ракеток',
    text: 'Премиальные ракетки испанского бренда Varlion и мячи уже включены в каждый визит.',
  },
  {
    icon: Users,
    badge: 'Матчи 2х2',
    title: 'Игра для четверых',
    text: 'Классический парный матч с друзьями или коллегами: азартная динамичная игра с первого розыгрыша.',
  },
]

// 2. Форматы подарка (Слева физический, справа электронный)
export const giftFormats = [
  {
    id: 'box',
    badge: 'Физический бокс',
    title: 'Подарочный бокс',
    image: '/images/gift/box.jpg',
    buttonText: 'Выбрать бокс',
    buttonSelectedText: 'Выбран бокс',
    features: [
      'Премиальный матовый кейс и тиснёная пластиковая карта',
      'Брендовая лента и дизайнерская открытка с пожеланием',
      'Самовывоз на ресепшн клуба или доставка курьером по Москве',
      'Идеально подходит для личного торжественного вручения',
    ],
  },
  {
    id: 'digital',
    badge: 'Электронный PDF',
    title: 'Электронный сертификат',
    image: '/images/gift/card.jpg',
    buttonText: 'Выбрать PDF',
    buttonSelectedText: 'Выбран PDF',
    features: [
      'Согласование и отправка менеджером в Telegram или на Email',
      'Персональный QR-код и номер для мгновенной активации',
      'Стильный клубный PDF-сертификат UNLIM PADEL',
      'Удобный вариант, если получатель находится в другом городе',
    ],
  },
]

// 3. Условия и правила
export const termsList = [
  {
    title: 'Срок действия 365 дней',
    text: 'Сертификат действует целый год с момента оформления для свободного выбора удобного времени.',
  },
  {
    title: 'Несгораемый баланс',
    text: 'Остаток средств не сгорает после игры, а сохраняется на личном счёте для следующих визитов.',
  },
  {
    title: 'Любые услуги клуба',
    text: 'Номинал можно потратить на аренду кортов, персональные или групповые занятия и участие в турнирах.',
  },
  {
    title: 'Экипировка Varlion включена',
    text: 'Профессиональные ракетки Varlion и турнирные мячи бесплатно предоставляются на каждую игру.',
  },
  {
    title: 'На предъявителя',
    text: 'Сертификат можно свободно передавать друзьям, коллегам или членам семьи без переоформления.',
  },
  {
    title: 'Предварительное бронирование',
    text: 'Дата и время корта или тренера согласуются заранее с администратором клуба под ваше расписание.',
  },
]

const termsIcons = [CalendarCheck, ShieldCheck, Layers, PackageCheck, Users, ClipboardCheck]

const giftBenefitIcons: Record<string, LucideIcon> = { Gift: Layers, BadgeCheck: Target, CalendarCheck, Sparkles }
const giftTermIcons: Record<string, LucideIcon> = { CalendarCheck, ShieldCheck, Layers, PackageCheck, Users, ClipboardCheck }

type GiftFormatView = {
  id: string
  badge: string
  title: string
  image: string | MediaDTO
  features: string[]
  buttonText: string
  buttonSelectedText: string
}

const giftFormDefaults = {
  sectionTitle: 'Оформить подарочный сертификат',
  sectionCopy: 'Оставьте контакты — менеджер клуба свяжется с вами в течение 5 минут для согласования деталей, проведения оплаты и отправки сертификата.',
  channelLabel: 'Связаться в', telegramLabel: 'Telegram', phoneLabel: 'Телефон', vkLabel: 'ВКонтакте',
  formatLabel: 'Формат сертификата', purposeLabel: 'Направление или номинал', namePlaceholder: 'Ваше имя',
  contactPhonePlaceholder: '+7 (___) ___-__-__', contactTelegramPlaceholder: 'Telegram @username', contactVKPlaceholder: 'Профиль VK (vk.com/id)',
  recipientPlaceholder: 'Кому подарок (для именного сертификата)', commentPlaceholder: 'Пожелание или комментарий к заказу...',
  consentLabel: 'Согласие на обработку персональных данных (текст требует юридического согласования)', policyLabel: 'политика конфиденциальности',
  submitLabel: 'Получить сертификат', successTitle: 'Заявка успешно отправлена!',
  successText: 'Менеджер клуба свяжется с вами в течение 5 минут для согласования и проведения оплаты.', resubmitLabel: 'Оформить ещё один сертификат',
}

export const giftPurposeOptions = [
  { value: 'match', label: 'Игра с друзьями' },
  { value: 'training', label: 'Персональная тренировка' },
  { value: 'course', label: 'Курс тренировок' },
  { value: 'split', label: 'Сплит-тренировка' },
  { value: 'custom', label: 'Номинал согласовать с менеджером' },
]

// 4. Частые вопросы
export const faqItems = [
  {
    q: 'Что делать, если получатель ни разу не играл в падел?',
    a: 'Падел — самый доступный и дружелюбный ракеточный спорт. Тренер за 5 минут объяснит базовый хват и правила, и уже на первом занятии пойдёт азартная игра.',
  },
  {
    q: 'Что нужно взять с собой на первый визит?',
    a: 'Только удобную спортивную одежду и кроссовки. Ракетки Varlion и мячи бесплатно предоставляются клубом на каждое посещение.',
  },
  {
    q: 'Как быстро оформляется и отправляется сертификат?',
    a: 'После отправки заявки менеджер связывается с вами в течение 5 минут для согласования и оплаты. Электронный PDF отправляется сразу после подтверждения, а физический бокс доставляется курьером или выдаётся в клубе.',
  },
  {
    q: 'Можно ли доплатить, если выбранная услуга превышает номинал?',
    a: 'Да, получатель может выбрать любое время корта или более продолжительную тренировку, просто доплатив разницу на ресепшн клуба.',
  },
  {
    q: 'Какой срок действия сертификата?',
    a: 'Все сертификаты UNLIM PADEL действуют полные 365 дней со дня оформления.',
  },
  {
    q: 'Можно ли разделить номинал на несколько посещений?',
    a: 'Да, сумма не сгорает за один раз — остаток фиксируется на лицевом счёте получателя до полного расходования.',
  },
]

export function GiftLandingPage({ dto, publicOrigin: _publicOrigin = 'https://unlimriga.ru' }: { dto: ThematicPageDTO; publicOrigin?: string }) {
  const site = dto.site
  const giftPage = dto.kind === 'gift' ? dto : null
  const pageUseCases = giftPage?.benefits?.length
    ? giftPage.benefits.map((item) => ({ icon: giftBenefitIcons[item.icon] ?? Layers, badge: item.badge, title: item.title, text: item.body }))
    : useCases
  const pageFormats: GiftFormatView[] = giftPage?.formats?.length
    ? giftPage.formats
    : giftFormats
  const pageTerms = giftPage?.terms?.length
    ? giftPage.terms.map((term) => ({ ...term, icon: giftTermIcons[term.icon] ?? Check }))
    : termsList.map((term, index) => ({ ...term, icon: termsIcons[index] ?? Check }))
  const pageFaqItems = giftPage?.faq?.length
    ? giftPage.faq.map((item) => ({ q: item.question, a: item.answer }))
    : faqItems
  const pageForm = giftPage?.form ?? giftFormDefaults
  const [selectedFormat, setSelectedFormat] = useState<'box' | 'digital' | ''>('')
  const [selectedPurpose, setSelectedPurpose] = useState<string>('match')
  const [preferredChannel, setPreferredChannel] = useState<'telegram' | 'phone' | 'vk'>('telegram')
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const started = useRef(false)
  const [idempotencyKey] = useState(() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const { requestContact } = useActionLayer()

  useEffect(() => {
    trackAnalytics({ name: 'form_view', formType: 'gift', objectType: 'form', objectId: 'gift-landing' })
  }, [])

  // Swiper state for mobile formats
  const swiperRef = useRef<SwiperType | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const swipeHintRef = useMobileSwipeHint(swiperRef, 'gift-delivery-formats')

  const handleFormFocus = () => {
    if (!started.current) {
      started.current = true
      trackAnalytics({
        name: 'form_start',
        formType: 'gift',
        objectType: 'form',
        objectId: `gift:${selectedFormat}`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setFormState('submitting')

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const contactValue = String(formData.get('contactValue') ?? '').trim()
    const recipientName = String(formData.get('recipientName') ?? '').trim()
    const comment = String(formData.get('comment') ?? '').trim()

    if (!selectedFormat) {
      setErrorMessage('Выберите формат сертификата')
      setFormState('idle')
      trackAnalytics({ name: 'form_error', formType: 'gift', objectType: 'form', objectId: 'gift:unselected' })
      return
    }

    if (!name) {
      setErrorMessage('Укажите ваше имя')
      setFormState('idle')
      trackAnalytics({ name: 'form_error', formType: 'gift', objectType: 'form', objectId: `gift:${selectedFormat}` })
      return
    }

    if (!contactValue) {
      setErrorMessage('Укажите контакт для связи')
      setFormState('idle')
      trackAnalytics({ name: 'form_error', formType: 'gift', objectType: 'form', objectId: `gift:${selectedFormat}` })
      return
    }

    const validContact = preferredChannel === 'phone'
      ? /^[+\d\s()-]{6,40}$/.test(contactValue)
      : /^@?[\p{L}\p{N}_.-]{3,80}$/u.test(contactValue)
    if (!validContact) {
      setErrorMessage('Проверьте формат контакта')
      setFormState('idle')
      trackAnalytics({ name: 'form_error', formType: 'gift', objectType: 'form', objectId: `gift:${selectedFormat}` })
      return
    }

    const phone = preferredChannel === 'phone' ? contactValue : ''
    const telegram = preferredChannel === 'telegram' ? contactValue : ''
    const vk = preferredChannel === 'vk' ? contactValue : ''
    const formatLabel = selectedFormat === 'box' ? 'Подарочный бокс' : 'Электронный PDF'
    const sourceEntity = `Подарочный сертификат: ${formatLabel}`
    const fullComment = [`Формат: ${formatLabel}`, `Назначение: ${selectedPurpose}`, recipientName ? `Получатель: ${recipientName}` : '', comment ? `Пожелание: ${comment}` : ''].filter(Boolean).join('. ')
    trackAnalytics({ name: 'form_submit_attempt', formType: 'gift', objectType: 'form', objectId: `gift:${selectedFormat}` })

    try {
      const endpoint = site.contactConfirmation.leadEndpoint
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'gift',
          name,
          phone,
          telegram,
          vk,
          email: '',
          comment: fullComment,
          consent: true,
          sourcePage: '/gift',
          sourceEntity,
          idempotencyKey,
          analytics: analyticsServerContext(),
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка отправки заявки')
      }

      setFormState('success')
    } catch {
      setErrorMessage('Не удалось отправить заявку. Пожалуйста, напишите нам напрямую в мессенджер.')
      setFormState('idle')
      trackAnalytics({ name: 'form_error', formType: 'gift', objectType: 'form', objectId: `gift:${selectedFormat}` })
    }
  }

  const renderFormatCard = (format: GiftFormatView) => {
    const isChosen = selectedFormat === format.id
    return (
      <SurfaceCard
        tone="white"
        interactive
        className={cn(
          'flex h-full flex-col overflow-hidden p-6 transition-all duration-300 md:p-8',
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-control">
          {/* Glass-атом поверх изображения */}
          <div className="absolute left-3 top-3 z-10">
            <Badge tone="glass" className="image-glass px-2.5">
              {typograph(format.badge)}
            </Badge>
          </div>
          {typeof format.image === 'string'
            ? <ProgressiveImage src={format.image} alt={format.title} sizes="(min-width: 768px) 50vw, 100vw" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
            : <ProgressiveImage media={format.image} sizes="(min-width: 768px) 50vw, 100vw" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />}
        </div>

        <div className="mt-6 flex-1">
          <Typography as="h3" role="title-large" className="font-semibold text-ink">
            {typograph(format.title)}
          </Typography>

          <ul className="mt-5 space-y-2.5">
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

        <div className="mt-6">
          <Button
            variant={isChosen ? 'primary' : 'neutral'}
            size="md"
            fullWidth
            aria-pressed={isChosen}
            onClick={() => {
              setSelectedFormat(format.id as 'box' | 'digital')
              const ctaSection = document.getElementById('order-section')
              ctaSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {typograph(isChosen ? format.buttonSelectedText : format.buttonText)}
          </Button>
        </div>
      </SurfaceCard>
    )
  }

  return (
    <div className="min-h-screen bg-page text-ink selection:bg-lime selection:text-lime-ink">
      {/* 1. HERO ШАПКА ВИДОМ КАК У PAGE-VIEW (БЕЗ БЕЙДЖЕЙ, БЕЗ КНОПОК И МЕТРИК) */}
      <header className="page-hero relative isolate overflow-hidden bg-ink pb-6 pt-12 text-white md:pb-12 md:pt-24">
        {giftPage?.page.hero.media
          ? <ProgressiveImage media={giftPage.page.hero.media} sizes="100vw" loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover grayscale" />
          : <ProgressiveImage src="/images/gift/card.jpg" alt="" sizes="100vw" loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover grayscale" />}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,8,.95)_0%,rgba(3,5,8,.84)_52%,rgba(3,5,8,.62)_100%)]" />

        <div className="container-page relative z-10">
          <Typography as="h1" role="section" className="max-w-[920px] text-white" data-page-enter="title">
            {typograph(giftPage?.page.title ?? 'Подарочный сертификат на\u00A0падел в\u00A0Москве')}
          </Typography>

          <Typography role="editorial" className="mt-4 max-w-[820px] text-white/65" data-page-enter="intro">
            {typograph(
              giftPage?.page.intro ?? 'Подарите динамичную игру и\u00A0эмоции в\u00A0UNLIM RIGA PADEL: аренда кортов Jubo, тренировки с\u00A0тренером и\u00A0ракетки Varlion.'
            )}
          </Typography>
        </div>
      </header>

      {/* 2. НА ЧТО МОЖНО ПОТРАТИТЬ (USE CASES) — БЕЗ EYEBROW */}
      <section data-page-enter="surface" className="container-page py-12 md:py-20" aria-labelledby="usecases-title">
        <Reveal className="mb-10 max-w-[760px]">
          <Typography as="h2" id="usecases-title" role="section" className="font-semibold text-ink">
            {typograph(giftPage?.offerTitle ?? 'На\u00A0что можно потратить сертификат')}
          </Typography>
          <Typography role="body" tone="subtle" className="mt-2.5">
            {typograph(
              giftPage?.offerCopy ?? 'Получатель сам выбирает формат: игра с\u00A0друзьями, урок с\u00A0тренером или тест-драйв ракеток Varlion.'
            )}
          </Typography>
        </Reveal>

        <div data-mobile-compact-list className="grid border-y border-ink/10 sm:grid-cols-2 sm:gap-4 sm:border-y-0 lg:grid-cols-4">
          {pageUseCases.map((item, idx) => {
            const Icon = item.icon
            return (
              <Reveal key={item.title} delay={idx * 0.08} className="h-full border-b border-ink/10 last:border-b-0 sm:border-b-0">
                <SurfaceCard tone="white" interactive={false} className="flex h-full items-start gap-4 bg-transparent px-0 py-5 sm:block sm:bg-white sm:p-6">
                  <span className="se-2 flex h-10 w-10 shrink-0 items-center justify-center bg-surface-muted text-ink">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <Typography as="h3" role="title-card" className="font-semibold text-ink sm:mt-5">
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

      {/* 3. ФОРМАТЫ ВРУЧЕНИЯ: СЛЕВА ФИЗИЧЕСКИЙ, СПРАВА ЭЛЕКТРОННЫЙ (СВАЙПЕР НА МОБИЛКЕ) — БЕЗ EYEBROW */}
      <section className="bg-surface-subtle py-12 md:py-20" aria-labelledby="formats-title">
        <div className="container-page">
          <Reveal className="mb-10 flex items-end justify-between gap-4 md:mb-12">
            <div>
              <Typography as="h2" id="formats-title" role="section" className="font-semibold text-ink">
                {typograph(giftPage?.formatsTitle ?? 'Форматы вручения')}
              </Typography>
              <Typography role="body" tone="subtle" className="mt-2 max-w-[620px]">
                {typograph(
                  giftPage?.formatsCopy ?? 'Премиальный бокс для личного вручения или электронный PDF с\u00A0доставкой в\u00A0мессенджер.'
                )}
              </Typography>
            </div>

            <MobileSwiperNav
              className="shrink-0 lg:hidden"
              atStart={atStart}
              atEnd={atEnd}
              onPrev={() => swiperRef.current?.slidePrev()}
              onNext={() => swiperRef.current?.slideNext()}
            />
          </Reveal>

          {/* Desktop: 2 колонки */}
          <div className="hidden gap-8 lg:grid lg:grid-cols-2">
            {pageFormats.map((format, idx) => (
              <Reveal key={format.id} delay={idx * 0.1} className="h-full">
                {renderFormatCard(format)}
              </Reveal>
            ))}
          </div>

          {/* Mobile: Swiper */}
          <div ref={swipeHintRef} className="-mx-5 lg:hidden">
            <Swiper
              {...horizontalSwiperProps}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
                setAtStart(swiper.isBeginning)
                setAtEnd(swiper.isEnd)
              }}
              onSlideChange={(swiper) => {
                setAtStart(swiper.isBeginning)
                setAtEnd(swiper.isEnd)
              }}
              slidesPerView={1.15}
              spaceBetween={16}
              className="swiper-breathe !px-5"
            >
              {pageFormats.map((format) => (
                <SwiperSlide key={format.id} className="!h-auto">
                  <div className="h-full">{renderFormatCard(format)}</div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* 4. ОБЪЕДИНЁННЫЙ БЛОК: УСЛОВИЯ СЛЕВА, FAQ СПРАВА (БЕЗ ОБЁРТКИ КАРТОЧКИ) — БЕЗ EYEBROW */}
      <section id="terms" className="container-page py-12 md:py-20" aria-labelledby="terms-title">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-ink/10">
          {/* Слева: Условия */}
          <div className="lg:pr-16">
            <Reveal>
              <Typography as="h2" id="terms-title" role="section" className="font-semibold text-ink">
                {typograph(giftPage?.termsTitle ?? 'Условия и правила')}
              </Typography>
              <Typography role="body" tone="subtle" className="mt-2.5 max-w-none lg:whitespace-nowrap">
                {typograph(giftPage?.termsCopy ?? 'Понятные правила действия сертификата без скрытых условий.')}
              </Typography>
            </Reveal>

            <div className="mt-8 border-y border-ink/10" data-gift-terms-list>
              {pageTerms.map((term, idx) => {
                const Icon = term.icon
                return (
                <Reveal key={term.title} delay={idx * 0.05} className="border-b border-ink/10 last:border-b-0">
                  <div className="flex items-start gap-3 py-5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-ink-soft" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <Typography as="h3" role="body" className="font-medium text-ink">
                        {typograph(term.title)}
                      </Typography>
                      <Typography role="body-small" tone="subtle" className="mt-1.5 leading-relaxed">
                        {typograph(term.text)}
                      </Typography>
                    </div>
                  </div>
                </Reveal>
                )
              })}
            </div>
          </div>

          {/* Справа: FAQ без карточной обёртки */}
          <div className="lg:pl-16">
            <Reveal>
              <Typography as="h2" id="faq-title" role="section" className="font-semibold text-ink">
                {typograph(giftPage?.faqTitle ?? 'Частые вопросы')}
              </Typography>
              <Typography role="body" tone="subtle" className="mt-2.5 max-w-[520px]">
                {typograph('Ответы на\u00A0главные вопросы перед заказом и\u00A0первым визитом в\u00A0клуб.')}
              </Typography>
            </Reveal>

            <div className="mt-8">
              <Accordion items={pageFaqItems.map((item) => ({ q: typograph(item.q), a: typograph(item.a) }))} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA БЛОК И ФОРМА ЗАКАЗА (ПОЛЯ БЕЗ ВЕРХНИХ ПОДПИСЕЙ, С GHOST-ТЕКСТОМ) — БЕЗ EYEBROW */}
      <section id="order-section" className="bg-surface-subtle py-12 md:py-20" aria-labelledby="order-title">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            {/* Левая колонка: мессенджеры и детали */}
            <Reveal>
              <div>
                <Typography as="h2" id="order-title" role="section" className="font-semibold text-ink">
                  {typograph(pageForm.sectionTitle)}
                </Typography>
                <Typography role="body" tone="subtle" className="mt-3 leading-relaxed">
                  {typograph(
                    pageForm.sectionCopy
                  )}
                </Typography>

                {/* Кнопки прямых мессенджеров */}
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
                      trackAnalytics({ name: 'contact_click', actionKind: 'telegram', objectType: 'contact', objectId: 'gift-landing' })
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
                      trackAnalytics({ name: 'contact_click', actionKind: 'vk', objectType: 'contact', objectId: 'gift-landing' })
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
                      trackAnalytics({ name: 'contact_click', actionKind: 'phone', objectType: 'contact', objectId: 'gift-landing' })
                      requestContact('phone')
                    }}
                  >
                    По телефону
                  </Button>
                </div>

                {/* Пункты-гарантии */}
                <div className="mt-10 space-y-3 border-t border-ink/10 pt-8">
                  <div className="flex items-center gap-3">
                    <span className="se-1 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <Typography role="body-small" tone="subtle">
                      {typograph('Срок действия 365 дней на аренду кортов и занятия')}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="se-1 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <Typography role="body-small" tone="subtle">
                      {typograph('Премиальная экипировка Varlion включена')}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="se-1 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <Typography role="body-small" tone="subtle">
                      {typograph('Доставка подарочного бокса или отправка PDF')}
                    </Typography>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Правая колонка: форма без верхних лейблов */}
            <div>
              <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
                {formState === 'success' ? (
                  <div className="py-8 text-center">
                    <div className="se-2 mx-auto flex h-14 w-14 items-center justify-center bg-lime text-lime-ink">
                      <PackageCheck size={28} />
                    </div>
                    <Typography as="h3" role="title-large" className="mt-5 font-semibold text-ink">
                      {typograph(pageForm.successTitle)}
                    </Typography>
                    <Typography role="body" tone="subtle" className="mt-2">
                      {typograph(
                        pageForm.successText
                      )}
                    </Typography>
                    <Button
                      variant="neutral"
                      size="md"
                      className="mt-6"
                      onClick={() => setFormState('idle')}
                    >
                      {typograph(pageForm.resubmitLabel)}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} onFocusCapture={handleFormFocus} noValidate>
                    <Typography as="h3" role="title-card" className="font-semibold text-ink">
                      {typograph('Заявка на сертификат')}
                    </Typography>

                    <div className="mt-6 grid gap-4">
                      {/* Канал связи */}
                      <div>
                        <span className="type-caption mb-2 block text-ink-muted">{typograph(pageForm.channelLabel)}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            aria-label="В Telegram"
                            onClick={() => setPreferredChannel('telegram')}
                            variant={preferredChannel === 'telegram' ? 'dark' : 'neutral'}
                            size="md"
                            icon={<TelegramIcon size={15} />}
                            iconPosition="left"
                            iconDivider={false}
                            className="px-3"
                          >
                            {pageForm.telegramLabel}
                          </Button>
                          <Button
                            aria-label="По телефону"
                            onClick={() => setPreferredChannel('phone')}
                            variant={preferredChannel === 'phone' ? 'dark' : 'neutral'}
                            size="md"
                            icon={<PhoneIcon size={14} />}
                            iconPosition="left"
                            iconDivider={false}
                            className="px-3"
                          >
                            {pageForm.phoneLabel}
                          </Button>
                          <Button
                            aria-label="Во ВКонтакте"
                            onClick={() => setPreferredChannel('vk')}
                            variant={preferredChannel === 'vk' ? 'dark' : 'neutral'}
                            size="md"
                            icon={<VkIcon size={15} />}
                            iconPosition="left"
                            iconDivider={false}
                            className="px-3"
                          >
                            {pageForm.vkLabel}
                          </Button>
                        </div>
                      </div>

                      {/* Формат и номинал — БЕЗ ВЕРХНИХ ЛЕЙБЛОВ */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <SelectField
                          label={pageForm.formatLabel}
                          labelVisibility="sr-only"
                          value={selectedFormat}
                          onChange={(e) => setSelectedFormat(e.target.value as 'box' | 'digital' | '')}
                          options={[
                            { value: '', label: pageForm.formatLabel },
                            { value: 'box', label: 'Подарочный бокс (кейс + карта)' },
                            { value: 'digital', label: 'Электронный сертификат (PDF)' },
                          ]}
                        />

                        <SelectField
                          label={pageForm.purposeLabel}
                          labelVisibility="sr-only"
                          value={selectedPurpose}
                          onChange={(e) => setSelectedPurpose(e.target.value)}
                          options={giftPurposeOptions}
                        />
                      </div>

                      {/* Имя и контакт — БЕЗ ВЕРХНИХ ЛЕЙБЛОВ */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          label={pageForm.namePlaceholder}
                          labelVisibility="sr-only"
                          name="name"
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={100}
                          placeholder={pageForm.namePlaceholder}
                        />

                        <Field
                          label="Контакт для связи"
                          labelVisibility="sr-only"
                          name="contactValue"
                          type={preferredChannel === 'phone' ? 'tel' : 'text'}
                          required
                          maxLength={100}
                          placeholder={
                            preferredChannel === 'telegram'
                              ? pageForm.contactTelegramPlaceholder
                              : preferredChannel === 'phone'
                              ? pageForm.contactPhonePlaceholder
                              : pageForm.contactVKPlaceholder
                          }
                        />
                      </div>

                      {/* Получатель — БЕЗ ВЕРХНЕГО ЛЕЙБЛА */}
                      <Field
                        label={pageForm.recipientPlaceholder}
                        labelVisibility="sr-only"
                        name="recipientName"
                        maxLength={100}
                        placeholder={pageForm.recipientPlaceholder}
                      />

                      {/* Комментарий — БЕЗ ВЕРХНЕГО ЛЕЙБЛА */}
                      <TextareaField
                        label={pageForm.commentPlaceholder}
                        labelVisibility="sr-only"
                        name="comment"
                        maxLength={500}
                        placeholder={pageForm.commentPlaceholder}
                      />

                      {/* Согласие */}
                      <CheckboxField
                        name="consent"
                        required
                        defaultChecked
                        label={
                          <span>
                            {pageForm.consentLabel} ·{' '}
                            <a
                              href="/policy"
                              target="_blank"
                              rel="noreferrer"
                              className="text-ink underline hover:text-lime-deep"
                            >
                              {pageForm.policyLabel}
                            </a>
                          </span>
                        }
                      />

                      {errorMessage && (
                        <p role="alert" className="type-body-sm font-medium text-danger">
                          {errorMessage}
                        </p>
                      )}

                      <div className="mt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          fullWidth
                          disabled={formState === 'submitting'}
                        >
                          {typograph(
                            formState === 'submitting'
                              ? 'Отправка...'
                              : pageForm.submitLabel
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </SurfaceCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import type { PadelCourtZakazPageDTO, PadelCourtZakazPageIcon } from '@unlim/content-contract'
import {
  ArrowRight,
  ChevronRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Layers3,
  Ruler,
  Settings2,
  ShieldCheck,
  Sparkles,
  Truck,
  Wind,
  Wrench,
} from 'lucide-react'
import React, { useState, useRef, useEffect, type FormEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { SiteFrame } from '../components/SiteFrame'
import { Tabs } from '../components/ui/Tabs'
import { Button, ButtonLink } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Typography } from '../components/ui/Typography'
import { ImageCard, SurfaceCard, type ImageOverlay } from '../components/ui/Card'
import { PhoneIcon, TelegramIcon } from '../components/ui/ContactIcons'
import { VkIcon } from '../components/ui/VkIcon'
import { Field } from '../components/ui/Field'
import { SelectField } from '../components/ui/SelectField'
import { TextareaField } from '../components/ui/TextareaField'
import { CheckboxField } from '../components/ui/CheckboxField'
import { Reveal } from '../components/ui/Reveal'
import { SplitTextReveal } from '../components/ui/SplitTextReveal'
import { cn } from '../utils/cn'
import { analyticsServerContext, trackAnalytics } from '../analytics/AnalyticsTracker'
import { useActionLayer } from '../actions/ActionLayer'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const sourcePage = '/padel-court-zakaz'

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

const iconMap: Record<PadelCourtZakazPageIcon, typeof Ruler> = {
  Ruler,
  Settings2,
  Truck,
  Wrench,
  ClipboardCheck,
  Layers3,
  ShieldCheck,
  Factory,
  Sparkles,
  Wind,
  CheckCircle2,
}

type PadelModel = PadelCourtZakazPageDTO['models']['items'][number]
type ModelId = PadelModel['id']

export function CourtModelTabs({ badge, models, onSelectModel }: { badge: string; models: PadelModel[]; onSelectModel?: (modelId: ModelId) => void }) {
  const [activeModel, setActiveModel] = useState<ModelId>(models[0]?.id ?? 'consultation')
  const [showTabHint, setShowTabHint] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tabsNode = tabsRef.current
    if (!tabsNode) return
    const syncHint = () => setShowTabHint(tabsNode.scrollWidth > tabsNode.clientWidth + 4 && tabsNode.scrollLeft < 8)
    syncHint()
    window.addEventListener('resize', syncHint)
    return () => window.removeEventListener('resize', syncHint)
  }, [])

  useEffect(() => {
    if (!panelRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.48, ease: 'power3.out', clearProps: 'opacity,visibility,transform' })
    }, panelRef)
    return () => ctx.revert()
  }, [activeModel])

  const handleTabChange = (val: string) => {
    const id = val as ModelId
    setActiveModel(id)
    onSelectModel?.(id)
  }

  return (
    <div>
      <div className="sticky top-5 z-30 -mx-5 bg-page/95 px-5 py-3 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <Tabs
            aria-label="Модели кортов JUBO"
            containerRef={tabsRef}
            onScroll={() => { if (tabsRef.current && tabsRef.current.scrollLeft > 8) setShowTabHint(false) }}
            className="no-scrollbar w-full"
            layoutId="court-model-tabs"
            tabs={models.map((model) => ({
              id: model.id,
              label: model.name,
              panelId: `court-model-panel-${model.id}`,
            }))}
            value={activeModel}
            onChange={handleTabChange}
          />
        {showTabHint && <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 z-40 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-page/90 text-ink-soft shadow-sm md:hidden"><ChevronRight size={16} strokeWidth={2} /></span>}
      </div>

      <SurfaceCard tone="white" interactive={false} className="mt-6 p-6 md:p-10">
        <div ref={panelRef}>
          {models.map((model) => {
            const isSelected = activeModel === model.id
            return (
              <div
                key={model.id}
                id={`court-model-panel-${model.id}`}
                role="tabpanel"
                aria-label={model.name}
                tabIndex={0}
                hidden={!isSelected}
                className={cn(
                  isSelected ? 'block' : 'hidden',
                  'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2'
                )}
              >
                <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-12 lg:items-start">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-white flex items-center justify-center">
                    <ProgressiveImage
                      src={model.image.url}
                      alt={model.image.alt}
                      width={model.image.width ?? undefined}
                      height={model.image.height ?? undefined}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="dark">{badge}</Badge>
                    </div>

                    <Typography as="h3" role="title-large" className="mt-3 font-semibold text-ink min-h-[3.25rem] flex items-center">
                      {typograph(model.title)}
                    </Typography>

                    <Typography role="body" tone="subtle" className="mt-3 min-h-[4.5rem]">
                      {typograph(model.description)}
                    </Typography>

                    {/* Технические спецификации: обёрнуты в плашки, не жирный шрифт */}
                    <div className="mt-5 border-t border-ink/10 pt-5">
                      <Typography role="caption" tone="muted" className="mb-3 font-medium">
                        {typograph('Технические спецификации:')}
                      </Typography>
                      <dl className="grid gap-2 sm:grid-cols-2">
                        {model.specs.map((item) => (
                          <div
                            key={item.label}
                            className="se-2 bg-surface-subtle px-3.5 py-2.5 flex flex-col justify-start"
                          >
                            <dt className="type-caption text-ink-muted">{item.label}</dt>
                            <dd className="type-body-sm mt-0.5 font-medium leading-snug text-ink [hyphens:none] [overflow-wrap:normal]">
                              {typograph(item.value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <ul className="mt-5 grid gap-2" aria-label={`Преимущества ${model.name}`}>
                      {model.highlights.map((point) => (
                        <li key={point} className="type-body-sm flex items-start gap-2.5 text-ink-soft">
                          <span className="se-1 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                            <Check aria-hidden="true" size={13} strokeWidth={2.8} />
                          </span>
                          <span className="font-medium">{typograph(point)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SurfaceCard>
    </div>
  )
}

function InlineLeadCalculatorForm({
  site,
  page,
  initialModel = 'infinity',
}: {
  site: PadelCourtZakazPageDTO['site']
  page: PadelCourtZakazPageDTO
  initialModel?: ModelId
}) {
  const formCopy = page.cta.form
  const modelItems = page.models.items
  const [preferredChannel, setPreferredChannel] = useState<'phone' | 'telegram' | 'vk'>('phone')
  const [selectedModel, setSelectedModel] = useState<string>(initialModel)
  const [courtCount, setCourtCount] = useState<string>('1')
  const [state, setState] = useState<'form' | 'sending' | 'success'>('form')
  const [error, setError] = useState('')
  const [key] = useState(
    () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
  const started = useRef(false)

  useEffect(() => {
    trackAnalytics({ name: 'form_view', formType: 'consultation', objectType: 'form', objectId: `court:${initialModel}` })
  }, [initialModel])

  React.useEffect(() => {
    if (initialModel) setSelectedModel(initialModel)
  }, [initialModel])

  const handleFocus = () => {
    if (!started.current) {
      started.current = true
      trackAnalytics({
        name: 'form_start',
        formType: 'consultation',
        objectType: 'form',
        objectId: `court:${selectedModel}`,
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const name = String(data.name ?? '').trim()
    const contactValue = String(data.contactValue ?? '').trim()
    const city = String(data.city ?? '').trim()
    const userComment = String(data.comment ?? '').trim()

    const errors: string[] = []
    if (name.length < 2) errors.push(formCopy.nameError)
    if (!contactValue) errors.push(formCopy.contactError)

    let phone = ''
    let telegram = ''
    let vk = ''

    if (preferredChannel === 'phone') {
      phone = contactValue
      if (!/^[+\d\s()-]{6,40}$/.test(phone)) errors.push(formCopy.contactError)
    } else if (preferredChannel === 'telegram') {
      telegram = contactValue
      if (!/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(telegram)) {
        errors.push(formCopy.contactError)
      }
    } else if (preferredChannel === 'vk') {
      vk = contactValue
      if (!/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(vk)) {
        errors.push(formCopy.contactError)
      }
    }

    if (data.consent !== 'on') {
      errors.push(formCopy.consentError)
    }

    if (errors.length > 0) {
      setError(errors.join(' '))
      trackAnalytics({
        name: 'form_error',
        formType: 'consultation',
        objectType: 'form',
        objectId: `court:${selectedModel}`,
      })
      return
    }

    const fullComment = `Модель: ${selectedModel}. Количество кортов: ${courtCount}.${city ? ` Город: ${city}.` : ''}${
      userComment ? ` Пожелания: ${userComment}` : ''
    }`

    setState('sending')
    trackAnalytics({
      name: 'form_submit_attempt',
      formType: 'consultation',
      objectType: 'form',
      objectId: `court:${selectedModel}`,
    })

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)

    try {
      const response = await fetch(site.contactConfirmation.leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          phone,
          telegram,
          vk,
          email: '',
          comment: fullComment,
          consent: true,
          type: 'consultation',
          sourcePage,
          sourceEntity: `Корт JUBO: ${selectedModel} (${courtCount} шт.)`,
          idempotencyKey: key,
          analytics: analyticsServerContext(),
        }),
      })

      const result = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean }
      if (response.ok && result.ok) {
        setState('success')
      } else {
        setState('form')
        setError(result.error ?? formCopy.submitError)
        trackAnalytics({
          name: 'form_error',
          formType: 'consultation',
          objectType: 'form',
          objectId: `court:${selectedModel}`,
        })
      }
    } catch {
      setState('form')
      setError(formCopy.connectionError)
      trackAnalytics({
        name: 'form_error',
        formType: 'consultation',
        objectType: 'form',
        objectId: `court:${selectedModel}`,
      })
    } finally {
      window.clearTimeout(timeout)
    }
  }

  if (state === 'success') {
    return (
      <SurfaceCard tone="white" interactive={false} className="p-8 md:p-12 text-left" role="status">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-lime-ink">
          <Check size={28} strokeWidth={2.8} />
        </div>
        <Typography as="h3" role="title-large" className="mt-6 text-ink">
          {typograph(formCopy.successTitle)}
        </Typography>
        <Typography role="body" tone="subtle" className="mt-3 max-w-[540px]">
          {typograph(formCopy.successText.replace('{{channel}}', preferredChannel === 'telegram' ? 'Telegram' : preferredChannel === 'vk' ? 'VK' : 'телефону'))}
        </Typography>
        <div className="mt-8">
          <Button variant="neutral" size="md" onClick={() => setState('form')}>
            {typograph(formCopy.resubmitLabel)}
          </Button>
        </div>
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8">
      <form onSubmit={handleSubmit} onFocusCapture={handleFocus} noValidate>
        <div className="mb-6">
          <Typography as="h3" role="title-card" className="font-semibold text-ink">
            {typograph(formCopy.title)}
          </Typography>
        </div>

        <div className="grid gap-5">
          <div>
            <span className="type-caption text-ink-muted mb-2 block font-medium">
              {typograph(formCopy.channelLabel)}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-label={formCopy.phoneLabel}
                onClick={() => setPreferredChannel('phone')}
                className={cn(
                  'se-2 flex h-[var(--control-md)] w-[var(--control-md)] items-center justify-center type-ui font-medium transition-colors cursor-pointer',
                  preferredChannel === 'phone'
                    ? 'bg-ink text-white'
                    : 'bg-control text-ink-soft hover:bg-control-hover'
                )}
              >
                <PhoneIcon size={15} />
              </button>
              <button
                type="button"
                aria-label={formCopy.telegramLabel}
                onClick={() => setPreferredChannel('telegram')}
                className={cn(
                  'se-2 flex h-[var(--control-md)] w-[var(--control-md)] items-center justify-center type-ui font-medium transition-colors cursor-pointer',
                  preferredChannel === 'telegram'
                    ? 'bg-ink text-white'
                    : 'bg-control text-ink-soft hover:bg-control-hover'
                )}
              >
                <TelegramIcon size={15} />
              </button>
              <button
                type="button"
                aria-label={formCopy.vkLabel}
                onClick={() => setPreferredChannel('vk')}
                className={cn(
                  'se-2 flex h-[var(--control-md)] w-[var(--control-md)] items-center justify-center type-ui font-medium transition-colors cursor-pointer',
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
            <Field label={formCopy.nameLabel} labelVisibility="sr-only" name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder={formCopy.namePlaceholder} />
            <Field
              label={preferredChannel === 'phone' ? formCopy.phoneLabel : preferredChannel === 'telegram' ? formCopy.telegramLabel : formCopy.vkLabel}
              labelVisibility="sr-only"
              name="contactValue"
              type={preferredChannel === 'phone' ? 'tel' : 'text'}
              autoComplete={preferredChannel === 'phone' ? 'tel' : 'off'}
              required
              maxLength={80}
              placeholder={preferredChannel === 'phone' ? formCopy.phonePlaceholder : preferredChannel === 'telegram' ? formCopy.telegramPlaceholder : formCopy.vkPlaceholder}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField label={formCopy.modelLabel} labelVisibility="sr-only" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} options={[...modelItems.map((model) => ({ value: model.id, label: `${formCopy.modelOptionPrefix}: ${model.name}` })), { value: 'consultation', label: formCopy.consultationOptionLabel }]} />
            <SelectField label={formCopy.courtCountLabel} labelVisibility="sr-only" value={courtCount} onChange={(e) => setCourtCount(e.target.value)} options={[{ value: '1', label: formCopy.courtCountOneLabel }, { value: '2-3', label: formCopy.courtCountTwoThreeLabel }, { value: '4-6', label: formCopy.courtCountFourSixLabel }, { value: '7+', label: formCopy.courtCountSevenPlusLabel }]} />
            <Field label={formCopy.cityLabel} labelVisibility="sr-only" name="city" placeholder={formCopy.cityPlaceholder} maxLength={100} />
          </div>

          <TextareaField label={formCopy.commentLabel} labelVisibility="sr-only" name="comment" maxLength={1000} placeholder={formCopy.commentPlaceholder} />

          <label className="absolute -left-[10000px]" aria-hidden="true">
            Компания
            <input name="company" tabIndex={-1} autoComplete="off" />
          </label>

          <CheckboxField name="consent" required defaultChecked label={<>{formCopy.consentLabel} ·{' '}<a href={site.contactConfirmation.policyHref} target="_blank" rel="noreferrer" className="underline hover:text-ink">{formCopy.policyLabel}</a></>} />

          {error && (
            <p role="alert" className="type-body-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <div>
            <Button type="submit" variant="primary" size="lg" loading={state === 'sending'} fullWidth>
              {typograph(formCopy.submitLabel)}
            </Button>
          </div>
        </div>
      </form>
    </SurfaceCard>
  )
}

function DirectContactButtons({ contacts }: { contacts: PadelCourtZakazPageDTO['cta']['contacts'] }) {
  const { requestContact } = useActionLayer()

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2.5 overflow-clip">
      <ButtonLink
        reveal={{ delay: 0.12 }}
        href={contacts.telegramURL}
        target="_blank"
        rel="noreferrer"
        variant="neutral"
        size="md"
        icon={<TelegramIcon size={15} />}
        iconPosition="left"
        onClick={() => {
          trackAnalytics({ name: 'contact_click', actionKind: 'telegram', objectType: 'contact', objectId: 'padel-court-zakaz' })
        }}
      >{contacts.telegramLabel}</ButtonLink>

      <ButtonLink
        reveal={{ delay: 0.16 }}
        href={contacts.vkURL}
        target="_blank"
        rel="noreferrer"
        variant="neutral"
        size="md"
        icon={<VkIcon size={17} />}
        iconPosition="left"
        onClick={() => {
          trackAnalytics({ name: 'contact_click', actionKind: 'vk', objectType: 'contact', objectId: 'padel-court-zakaz' })
        }}
      >{contacts.vkLabel}</ButtonLink>

      <Button
        reveal={{ delay: 0.2 }}
        variant="neutral"
        size="md"
        icon={<PhoneIcon size={15} />}
        iconPosition="left"
        onClick={() => {
          trackAnalytics({ name: 'contact_click', actionKind: 'phone', objectType: 'contact', objectId: 'padel-court-zakaz' })
          requestContact('phone')
        }}
      >{contacts.phoneLabel}</Button>
    </div>
  )
}

export function PadelCourtZakazPage({ dto, publicOrigin }: { dto: PadelCourtZakazPageDTO; publicOrigin: string }) {
  const { site } = dto
  const origin = new URL(publicOrigin).origin
  const pageURL = new URL('/padel-court-zakaz', origin).toString()
  const heroImageURL = new URL(dto.page.hero.media.url, origin).toString()
  const [activeModelForForm, setActiveModelForForm] = useState<ModelId>(dto.models.items[0]?.id ?? 'consultation')
  const heroRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !heroRef.current || !videoRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        videoRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <SiteFrame site={site} backLink={{ href: '/' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                name: site.brandName,
                url: origin,
                description: dto.page.intro,
              },
              {
                '@type': 'Product',
                name: dto.page.title,
                image: heroImageURL,
                description: dto.page.intro,
                brand: { '@type': 'Brand', name: 'JUBO Padel' },
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'RUB',
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    priceType: 'https://schema.org/InvoicePrice',
                    unitText: 'корт под ключ',
                  },
                },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Главная', item: new URL('/', origin).toString() },
                  { '@type': 'ListItem', position: 2, name: dto.page.title, item: pageURL },
                ],
              },
            ],
          }),
        }}
      />

      {/* 1. HERO-ШАПКА: КОМПАКТНАЯ ВЫСОТА НА ОДИН ЭКРАН, GSAP ПАРАЛЛАКС, БЕЗ 01-04 И EYEBROWS */}
      <header
        ref={heroRef}
        className="page-hero relative overflow-hidden text-white bg-ink min-h-[100svh] flex flex-col justify-between pt-20 pb-6 md:pt-24 md:pb-8"
      >
        <video
          ref={videoRef}
          src={dto.heroVideo?.url ?? 'https://jubopadel.com/wp-content/uploads/2026/05/Header-Super-Pano-2400-1080-H265.webm'}
          poster={dto.page.hero.media.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,.52)_0%,rgba(3,5,8,.82)_65%,rgba(3,5,8,.98)_100%)]" />

        <div className="container-page relative z-10 flex flex-col justify-between flex-1">
          <Reveal eager className="pt-2 sm:pt-4">
            <Badge tone="glass" className="mb-4">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-lime animate-pulse" />
              {typograph(dto.page.eyebrow)}
            </Badge>

            <Typography as="h1" role="hero" className="max-w-[960px] text-white font-semibold leading-[1.08]">
              <SplitTextReveal
                text={dto.page.title}
                reveal={false}
              />
            </Typography>

            <Typography role="editorial" className="mt-4 max-w-[800px] text-white/80 text-base md:text-lg">
              {typograph(dto.page.intro)}
            </Typography>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink
                href="#cta-section"
                variant="primary"
                size="md"
                icon={<ArrowRight size={16} />}
              >
                {typograph(dto.hero.primaryLabel)}
              </ButtonLink>

              <ButtonLink
                href="#models-section"
                variant="glass"
                size="md"
              >
                {typograph(dto.hero.secondaryLabel)}
              </ButtonLink>
            </div>
          </Reveal>

          {/* 4 пункта в хиро: лаконично, без 01-04 и без eyebrows */}
          <Reveal eager delay={0.12} className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 md:grid-cols-4 md:gap-6">
            {dto.hero.metrics.map((metric) => (
              <div key={metric.title} className="space-y-0.5">
                <Typography role="body-small" className="font-semibold text-white">
                  {typograph(metric.title)}
                </Typography>
                <Typography role="caption" className="text-white/60">
                  {typograph(metric.caption)}
                </Typography>
              </div>
            ))}
          </Reveal>
        </div>
      </header>

      <article>
        {/* 2. СТАТУС ДИСТРИБЬЮТОРА И ГАРАНТИИ (БЕЗ EYEBROWS И БЕЗ 01-04) */}
        <section className="container-page py-16 md:py-24 border-b border-ink/10" aria-labelledby="distributor-title">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <Reveal>
              <div>
              <Typography reveal={{ delay: 0.02 }} as="h2" id="distributor-title" role="section" className="text-ink">
                {typograph(dto.distributor.title)}
              </Typography>
              <Typography reveal={{ delay: 0.08 }} role="body" tone="subtle" className="mt-5 leading-relaxed">
                {typograph(dto.distributor.text)}
              </Typography>

              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {dto.distributor.advantages.map((adv, idx) => (
                <Reveal key={adv.title} delay={idx * 0.08} className="h-full">
                  <SurfaceCard tone="white" interactive={false} className="p-6 h-full">
                    <Typography as="h3" role="title-card" className="font-semibold text-ink">
                      {typograph(adv.title)}
                    </Typography>
                    <Typography role="body-small" tone="subtle" className="mt-2.5 leading-relaxed">
                      {typograph(adv.text)}
                    </Typography>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. ЧТО ВХОДИТ В УСЛУГИ ПОД КЛЮЧ: 5 ЭТАПОВ (БЕЗ EYEBROWS И БЕЗ 01-05) */}
        <section className="container-page py-16 md:py-24" aria-labelledby="turnkey-title">
          <Reveal className="mb-12 max-w-[760px]">
            <Typography reveal={{ delay: 0.02 }} as="h2" id="turnkey-title" role="section" className="text-ink">
            {typograph(dto.turnkey.title)}
            </Typography>
            <Typography reveal={{ delay: 0.08 }} role="body" tone="subtle" className="mt-4">
              {typograph(dto.turnkey.intro)}
            </Typography>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {dto.turnkey.steps.map((step, idx) => {
              const Icon = iconMap[step.icon]
              return (
              <Reveal key={step.title} delay={idx * 0.08} className="h-full">
                <ImageCard src={step.image.url} alt={step.title} overlay={step.overlay as ImageOverlay} className="min-h-[360px] h-full" imgClassName="object-center">
                  <div className="flex h-full flex-col justify-between p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="se-2 flex h-10 w-10 items-center justify-center bg-white/15 text-white backdrop-blur-sm"><Icon size={20} /></span>
                      <span className="type-eyebrow text-white/75">{step.number}</span>
                    </div>
                    <div>
                      <Typography as="h3" role="title-card" className="font-semibold text-white">{typograph(step.title)}</Typography>
                      <Typography role="body-small" className="mt-2.5 leading-relaxed text-white/80">{typograph(step.text)}</Typography>
                    </div>
                  </div>
                </ImageCard>
              </Reveal>
              )
            })}
          </div>
        </section>

        {/* 4. ЦЕНА КОРТА И ФАКТОРЫ СМЕТЫ (БЕЗ EYEBROWS) */}
        <section className="container-page pb-16 md:pb-24" aria-labelledby="price-factors-title">
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-12 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <Reveal>
                <div>
                <Typography reveal={{ delay: 0.02 }} as="h2" id="price-factors-title" role="section" className="text-ink">
                  {typograph(dto.price.title)}
                </Typography>
                <Typography reveal={{ delay: 0.08 }} role="body" tone="subtle" className="mt-5 leading-relaxed">
                  {typograph(dto.price.text)}
                </Typography>
                <div className="mt-8">
                  <ButtonLink reveal={{ delay: 0.16 }} href="#cta-section" variant="dark" size="md" icon={<ArrowRight size={16} />}>
                    {typograph(dto.price.actionLabel)}
                  </ButtonLink>
                </div>
                </div>
              </Reveal>

              <Reveal>
                <ul className="grid gap-2.5 sm:grid-cols-2" aria-label={dto.price.title}>
                {dto.price.factors.map((factor) => (
                  <li
                    key={factor.label}
                    className="se-2 bg-surface-subtle p-4 flex flex-col justify-start"
                  >
                    <Typography role="body-small" className="font-semibold text-ink">
                      {typograph(factor.label)}
                    </Typography>
                    <Typography role="caption" tone="muted" className="mt-0.5">
                      {typograph(factor.detail)}
                    </Typography>
                  </li>
                ))}
                </ul>
              </Reveal>
            </div>
          </SurfaceCard>
        </section>

        {/* 5. ИНФОГРАФИКА ТЕХНОЛОГИЙ JUBO (НЕТ БЛЮРА НА КАРТИНКЕ, НЕТ ОБВОДОК У ПЛАШЕК, АНИМАЦИЯ БЕЗ 0 OPACITY) */}
        <section className="relative isolate overflow-hidden py-16 text-white md:py-24 bg-ink" aria-labelledby="tech-title">
          <ProgressiveImage src={dto.technology.background.url} alt={dto.technology.background.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          {/* Чистое затемнение без размытия/блюра фонового изображения */}
          <div className="absolute inset-0 bg-ink/80" />

          <div className="container-page relative z-10">
            <Reveal className="grid gap-6 lg:grid-cols-[1fr_.8fr] lg:items-end">
              <div>
                <Typography reveal={{ delay: 0.02 }} as="h2" id="tech-title" role="section" tone="inverse">
                  {typograph(dto.technology.title)}
                </Typography>
              </div>
              <Typography reveal={{ delay: 0.08 }} role="body" tone="inverse-subtle" className="lg:justify-self-end">
                {typograph(dto.technology.text)}
              </Typography>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dto.technology.items.map((tech, idx) => {
                const Icon = iconMap[tech.icon]
                return (
                <Reveal key={tech.title} fade={false} y={20} delay={idx * 0.06} className="h-full">
                  {/* Плашки без обводки border, backdrop-blur не ломается так как fade={false} держит opacity 1 */}
                  <div className="se-3 bg-white/[0.08] p-6 backdrop-blur-md h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="se-2 flex h-11 w-11 items-center justify-center bg-white/10 text-white">
                          <Icon size={22} />
                        </span>
                        <Badge reveal={{ delay: 0.04 }} tone="glass" className="text-white/70">
                          {tech.tag}
                        </Badge>
                      </div>
                      <Typography reveal={{ delay: 0.09 }} as="h3" role="title-card" tone="inverse" className="mt-6 font-semibold">
                        {typograph(tech.title)}
                      </Typography>
                      <Typography reveal={{ delay: 0.14 }} role="body-small" tone="inverse-subtle" className="mt-3 leading-relaxed">
                        {typograph(tech.text)}
                      </Typography>
                    </div>
                  </div>
                </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ГАЛЕРЕЯ КЛУБНЫХ РЕАЛИЗАЦИЙ JUBO (БЕЗ EYEBROWS) */}
        <section className="container-page py-16 md:py-24" aria-labelledby="gallery-title">
          <Reveal className="mb-10 max-w-[760px]">
            <Typography reveal={{ delay: 0.02 }} as="h2" id="gallery-title" role="section" className="text-ink">
              {typograph(dto.gallery.title)}
            </Typography>
            <Typography reveal={{ delay: 0.08 }} role="body" tone="subtle" className="mt-4">
              {typograph(dto.gallery.text)}
            </Typography>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2">
            {dto.gallery.items.map((image, idx) => (
              <Reveal key={image.media.url} delay={idx * 0.1}>
                <SurfaceCard tone="white" interactive={false} className="p-3 overflow-hidden">
                  <figure className="group">
                    <div className="se-3 aspect-[16/9] overflow-hidden bg-control">
                      <ProgressiveImage
                        src={image.media.url}
                        alt={image.media.alt}
                        width={image.media.width ?? undefined}
                        height={image.media.height ?? undefined}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <figcaption className="mt-3 px-1 flex items-center justify-between">
                      <Typography role="caption" tone="muted">
                        {typograph(image.caption)}
                      </Typography>
                      <Typography role="micro" tone="subtle">
                        {dto.gallery.creditLabel}
                      </Typography>
                    </figcaption>
                  </figure>
                </SurfaceCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. МОДЕЛЬНЫЙ РЯД КОРТОВ JUBO (БЕЗ EYEBROWS) */}
        <section id="models-section" className="bg-page py-16 md:py-24 border-t border-ink/10" aria-labelledby="models-title">
          <div className="container-page">
            <Reveal className="grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
              <div>
                <Typography reveal={{ delay: 0.02 }} as="h2" id="models-title" role="section" className="max-w-[720px] text-ink">
                  {typograph(dto.models.title)}
                </Typography>
              </div>
              <Typography reveal={{ delay: 0.08 }} role="body" tone="subtle" className="max-w-[620px] lg:justify-self-end">
                {typograph(dto.models.text)}
              </Typography>
            </Reveal>

            <div className="mt-10">
              <CourtModelTabs badge={dto.models.badge} models={dto.models.items} onSelectModel={(modelId) => setActiveModelForForm(modelId)} />
            </div>
          </div>
        </section>

        {/* 7. CTA БЛОК: ШВЕЙЦАРСКИЙ ЛЕВООРИЕНТИРОВАННЫЙ СТИЛЬ (БЕЗ EYEBROWS) */}
        <section id="cta-section" className="bg-page py-16 md:py-24 border-t border-ink/10" aria-labelledby="cta-heading">
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
              {/* Левая колонка: швейцарская типографика, лаконичные кнопки, гарантии */}
              <Reveal>
                <div>
                <Typography reveal={{ delay: 0.02 }} as="h2" id="cta-heading" role="section" className="text-ink">
                  {typograph(dto.cta.title)}
                </Typography>
                <Typography reveal={{ delay: 0.08 }} role="body" tone="subtle" className="mt-4 leading-relaxed">
                  {typograph(dto.cta.text)}
                </Typography>

                {/* Лаконичные швейцарские кнопки мессенджеров */}
                <DirectContactButtons contacts={dto.cta.contacts} />

                {/* Гарантии и факты */}
                <div className="mt-10 space-y-3.5 border-t border-ink/10 pt-8">
                  {dto.cta.guarantees.map((guarantee, index) => (
                    <div key={guarantee} className="flex items-center gap-3">
                      <span className="se-1 flex h-6 w-6 shrink-0 items-center justify-center bg-lime text-lime-ink">
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <Typography reveal={{ delay: 0.1 + index * 0.05 }} role="body-small" tone="subtle">
                        {typograph(guarantee)}
                      </Typography>
                    </div>
                  ))}
                </div>
                </div>
              </Reveal>

              {/* Правая колонка: форма расчёта */}
              <div>
                <InlineLeadCalculatorForm page={dto} site={site} initialModel={activeModelForForm} />
              </div>
            </div>
          </div>
        </section>
      </article>
    </SiteFrame>
  )
}

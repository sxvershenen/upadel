import type { ActionDTO, BrandLogoMode, MediaDTO, PageHeroDTO, PageSEO, SiteDTO } from '@unlim/content-contract'

import type { Media, SiteSetting } from '../payload-types'
import { bookingReadiness } from '../integrations/validation'

export type MediaVariant = 'card' | 'hero' | 'original' | 'thumbnail'

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value && 'mimeType' in value
}

function publicMediaURL(value: string, origin: string): string {
  const resolved = new URL(value, origin)
  if (resolved.pathname.startsWith('/api/media/file/')) return new URL(resolved.pathname + resolved.search, origin).toString()
  return resolved.toString()
}

export function mediaDTO(value: unknown, origin: string, variant: MediaVariant = 'card'): MediaDTO | null {
  if (!isMedia(value) || !value.url || !value.mimeType) return null
  const selected = value.mimeType.startsWith('image/') && variant !== 'original' ? value.sizes?.[variant] : null
  const url = selected?.url ?? value.url
  return { alt: value.alt, height: selected?.height ?? value.height, mimeType: selected?.mimeType ?? value.mimeType, url: publicMediaURL(url, origin), width: selected?.width ?? value.width }
}

export function requiredMedia(value: unknown, origin: string, variant: MediaVariant = 'card'): MediaDTO {
  const media = mediaDTO(value, origin, variant)
  if (!media) throw new Error('A required public media relation is missing or not populated.')
  return media
}

export function pageHeroDTO(value: unknown, kind: string, origin: string): PageHeroDTO {
  const page = value && typeof value === 'object' ? value as { heroImage?: unknown; heroGrayscale?: boolean } : {}
  const uploaded = mediaDTO(page.heroImage, origin, 'hero')
  const assetKind = kind === 'policy' || kind === 'oferta' || kind === 'gift' || kind === 'padel-court-zakaz' ? 'about' : kind
  const media = uploaded ?? { alt: `Фон страницы ${kind}`, height: 745, mimeType: 'image/webp', url: new URL(`/page-heroes/${assetKind}.webp`, process.env.PUBLIC_WEB_URL ?? origin).toString(), width: 2110 }
  return { media, grayscale: page.heroGrayscale !== false }
}

export function actionDTO(value: unknown): ActionDTO {
  const action = (value ?? {}) as { href?: string | null; leadType?: ActionDTO['leadType']; label?: string | null; mode?: ActionDTO['mode'] }
  return { href: action.href, leadType: action.leadType, label: action.label, mode: action.mode ?? 'none' }
}

export function seoDTO(value: unknown, origin: string): PageSEO {
  const seo = (value ?? {}) as { canonical?: string | null; description?: string | null; robots?: string; socialImage?: unknown; title?: string | null }
  return { title: seo.title, description: seo.description, canonical: seo.canonical, robots: seo.robots ?? 'index-follow', socialImage: mediaDTO(seo.socialImage, origin) }
}

export function siteDTO(site: SiteSetting, origin: string, partners: Array<Record<string, unknown>> = []): SiteDTO {
  const social = site.socialLinks ?? []
  const telegram = social.find(({ provider }) => provider === 'telegram')
  const vk = social.find(({ provider }) => provider === 'vk')
  const confirmation = site.contactConfirmation
  const externalAnalyticsAllowed = site.analytics?.mode === 'consent-required'
  const booking = bookingReadiness(site.booking ?? {})
  return {
    brandName: site.brandName,
    brandLogo: mediaDTO(site.brandLogo, origin, 'original'),
    brandLogoMode: (site.brandLogoMode ?? 'prefix') as BrandLogoMode,
    headerSubtitle: site.headerSubtitle ?? '',
    desktopNavigation: (site.desktopNavigation ?? []).map(({ label, href, icon, children }) => ({
      label,
      href,
      icon: mediaDTO(icon, origin, 'original'),
      children: (children ?? []).map((child) => ({ label: child.label, href: child.href, icon: mediaDTO(child.icon, origin, 'original') })),
    })),
    mobileNavigation: (site.mobileNavigation ?? []).map(({ label, href, icon }) => ({ label, href, icon })),
    mobileMenuNavigation: (site.mobileMenuNavigation ?? []).map(({ label, href }) => ({ label, href })),
    mobileActions: {
      playLabel: site.mobileActions?.playLabel ?? '', menuLabel: site.mobileActions?.menuLabel ?? '', menuTitle: site.mobileActions?.menuTitle ?? '', quickActionsTitle: site.mobileActions?.quickActionsTitle ?? '', bookCourtLabel: site.mobileActions?.bookCourtLabel ?? '', callLabel: site.mobileActions?.callLabel ?? '', directionsLabel: site.mobileActions?.directionsLabel ?? '',
    },
    contacts: {
      address: site.address ?? '', directionsURL: site.directionsURL, phoneDisplay: site.phoneDisplay ?? '', phoneValue: site.phoneValue ?? '', email: site.email ?? '', transit: site.transit ?? '', parking: site.parking ?? '', openingHours: site.openingHours ?? '',
      labels: { address: site.addressLabel ?? '', transit: site.transitLabel ?? '', parking: site.parkingLabel ?? '', openingHours: site.openingHoursLabel ?? '', phone: site.phoneFieldLabel ?? '', email: site.emailFieldLabel ?? '' },
      map: { latitude: site.map?.latitude ?? 0, longitude: site.map?.longitude ?? 0, zoom: site.map?.zoom ?? 14 },
    },
    footer: {
      image: mediaDTO(site.footerImage, origin), about: site.footerAbout ?? '', stats: (site.footerStats ?? []).map(({ value, label }) => ({ value, label })), legalEntity: site.legalEntity ?? '',
      navigation: (site.footerNavigation ?? []).map(({ label, href, column }) => ({ label, href, column })), socialLinks: (site.socialLinks ?? []).map(({ provider, label, url }) => ({ provider, label, url })), legalLinks: (site.legalLinks ?? []).map(({ label, href }) => ({ label, href })), copyright: site.copyright ?? '', cookieNotice: { text: site.cookieNotice?.text ?? '', acceptLabel: site.cookieNotice?.acceptLabel ?? 'Принять', rejectLabel: site.cookieNotice?.rejectLabel ?? 'Отклонить', manageLabel: site.cookieNotice?.manageLabel ?? 'Настроить cookies' },
    },
    analytics: {
      mode: site.analytics?.mode ?? 'consent-required', endpoint: new URL('/api/public/analytics', process.env.PUBLIC_CONTENT_URL ?? process.env.PUBLIC_CMS_URL ?? origin).toString(), schemaVersion: 1,
      vendors: {
        yandexMetrica: { enabled: externalAnalyticsAllowed && site.analytics?.yandexMetricaEnabled === true && Boolean(site.analytics?.yandexMetricaCounterID), counterId: site.analytics?.yandexMetricaCounterID, webvisor: site.analytics?.yandexMetricaWebvisor === true },
        ga4: { enabled: externalAnalyticsAllowed && site.analytics?.ga4Enabled === true && Boolean(site.analytics?.ga4MeasurementID), measurementId: site.analytics?.ga4MeasurementID },
        webmasterVerification: site.analytics?.yandexWebmasterVerification,
      },
    },
    partners: partners.map((item) => ({ id: String(item.id), name: String(item.name), logo: mediaDTO(item.logo, origin), websiteURL: item.websiteURL as string | null })),
    booking: {
      mode: site.booking?.mode ?? 'disabled', externalURL: site.booking?.externalURL, buttonLabel: site.booking?.buttonLabel ?? '',
      ready: booking.ready, status: booking.status,
    },
    contactConfirmation: {
      avatar: mediaDTO(confirmation?.avatar, origin, 'thumbnail'), dialogTitle: confirmation?.dialogTitle ?? 'Связаться с клубом', cancelLabel: confirmation?.cancelLabel ?? 'Отмена', continueLabel: confirmation?.continueLabel ?? 'Продолжить',
      formTitle: confirmation?.formTitle ?? 'Оставить заявку', submitLabel: confirmation?.submitLabel ?? 'Отправить', successTitle: confirmation?.successTitle ?? 'Заявка отправлена', successText: confirmation?.successText ?? '', consentLabel: confirmation?.consentLabel ?? '', leadEndpoint: new URL('/api/public/leads', process.env.PUBLIC_CONTENT_URL ?? process.env.PUBLIC_CMS_URL ?? origin).toString(), policyHref: confirmation?.policyHref ?? '/policy',
      channels: [
        { channel: 'phone', enabled: confirmation?.phoneEnabled !== false, label: 'Телефон', displayValue: site.phoneDisplay ?? '', destination: `tel:${site.phoneValue ?? ''}` },
        { channel: 'email', enabled: confirmation?.emailEnabled !== false, label: 'Email', displayValue: site.email ?? '', destination: `mailto:${site.email ?? ''}` },
        { channel: 'telegram', enabled: confirmation?.telegramEnabled !== false, label: telegram?.label ?? 'Telegram', displayValue: telegram?.url ?? '', destination: telegram?.url ?? '' },
        { channel: 'vk', enabled: confirmation?.vkEnabled !== false, label: vk?.label ?? 'VK', displayValue: vk?.url ?? '', destination: vk?.url ?? '' },
      ],
    },
  }
}

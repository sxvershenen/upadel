import type { CatalogPagination, CatalogQuery } from './catalog'
export * from './catalog'
export const homepageDTOversion = 13 as const

export const publicRouteRegistry = [
  { path: '/', parent: null, template: 'homepage', globalSlug: 'homepage' },
  { path: '/blog', parent: '/', template: 'blog-catalog', globalSlug: 'blog-page' },
  { path: '/coaches', parent: '/', template: 'coaches-catalog', globalSlug: 'coaches-page' },
  { path: '/tournaments', parent: '/', template: 'tournaments-catalog', globalSlug: 'tournaments-page' },
  { path: '/prices', parent: '/', template: 'prices', globalSlug: 'prices-page' },
  { path: '/training', parent: '/', template: 'training', globalSlug: 'training-page' },
  { path: '/gift', parent: '/', template: 'gift', globalSlug: 'gift-page' },
  { path: '/courts', parent: '/', template: 'courts', globalSlug: 'courts-page' },
  { path: '/gallery', parent: '/', template: 'gallery', globalSlug: 'gallery-page' },
  { path: '/about', parent: '/', template: 'about', globalSlug: 'about-page' },
  { path: '/policy', parent: '/', template: 'legal-policy', globalSlug: 'policy-page' },
  { path: '/oferta', parent: '/', template: 'legal-oferta', globalSlug: 'oferta-page' },
] as const

export const codeDefinedRouteRegistry = [
  {
    path: '/padel-court-zakaz',
    parent: '/',
    template: 'padel-court-zakaz',
    globalSlug: 'padel-court-zakaz-page',
    title: 'Падел корт купить под ключ — цена, строительство, монтаж',
    description: 'Официальный дистрибьютор падел-кортов JUBO в России: продажа, поставка с завода и монтаж под ключ. Модели Infinity, Super Panoramic, Xtrem. Расчёт стоимости под объект.',
    robots: 'index-follow',
    canonical: null,
    socialImage: 'https://jubopadel.com/wp-content/uploads/2025/01/JGC06036-2048x1365.jpg',
  },
  {
    path: '/padel-courts',
    parent: '/',
    template: 'padel-courts',
    title: 'Падел корт купить под ключ — цена, строительство, монтаж',
    description: 'Продажа и монтаж падел-кортов JUBO в России: подбор модели, комплектации и расчёт проекта под площадку. Дистрибьютор JUBO — UNLIM.',
    robots: 'noindex-follow',
    canonical: '/padel-court-zakaz',
    socialImage: 'https://jubopadel.com/wp-content/uploads/2025/01/JGC06036-2048x1365.jpg',
  },
] as const

export const padelCourtZakazRoute = codeDefinedRouteRegistry[0]
export const padelCourtsRoute = codeDefinedRouteRegistry[1]

export const dynamicRouteRegistry = [
  { parent: '/blog', template: 'article-detail', collection: 'articles' },
  { parent: '/coaches', template: 'coach-detail', collection: 'coaches' },
  { parent: '/tournaments', template: 'tournament-detail', collection: 'tournaments' },
] as const

export type MediaDTO = {
  alt: string
  height?: number | null
  mimeType: string
  url: string
  width?: number | null
  srcSet?: string
}

export type BrandLogoMode = 'text' | 'prefix' | 'replace'
export type PageHeroDTO = { media: MediaDTO; grayscale: boolean }
export type DesktopNavigationChild = { label: string; href: string; icon?: MediaDTO | null }
export type DesktopNavigationItem = DesktopNavigationChild & { children?: DesktopNavigationChild[] | null }

export type ActionDTO = {
  href?: string | null
  leadType?: 'membership' | 'gift' | 'trial' | 'consultation' | 'other' | null
  label?: string | null
  mode: 'none' | 'booking' | 'trial-booking' | 'internal-link' | 'external-link' | 'phone' | 'email' | 'lead-form'
}

export type TournamentFormat = 'americano' | 'groups-knockout' | 'round-robin-playoff' | 'other'
export type TournamentParticipantMode = 'players' | 'pairs'
export type TournamentParticipantDTO = { id: string; name: string; partnerName?: string | null; level?: string | null; status: 'confirmed' | 'waitlist' }
export type TournamentStandingDTO = { id: string; rank: number; name: string; partnerName?: string | null; matches: number; points: number; difference: string; award?: string | null }
export type TournamentPrizeDTO = { id: string; place: number; title: string; reward: string; description: string }
export type TournamentChecklistDTO = { id: string; text: string }
export type TournamentPerkDTO = { id: string; icon: 'Sparkles' | 'Droplets' | 'ShowerHead' | 'Camera'; title: string; description: string }
export type TournamentMatchdayDTO = { id: string; timing: string; title: string; description: string }
export type TournamentFaqDTO = { id: string; question: string; answer: string }
export type TournamentCardDTO = {
  id: string
  slug: string
  visualStyle: 'image' | 'mesh'
  image?: MediaDTO | null
  imageOverlay?: string | null
  meshStyle?: string | null
  levelFrom: number
  levelTo: number
  levelLabel: string
  icon: 'PartyPopper' | 'Trophy' | 'Medal'
  title: string
  startsAt: string
  endsAt: string
  scheduleLabel: string
  format: TournamentFormat
  formatLabel: string
  entryFee: string
  description: string
  prizeLabel: string
  prize: string
}

export type HomeSectionKey =
  | 'hero' | 'benefits' | 'offers' | 'courts' | 'pricing' | 'coaches'
  | 'methodist-banner' | 'tournaments' | 'gallery' | 'blog' | 'reviews-faq'

export type HomepageDTO = {
  version: typeof homepageDTOversion
  preview: boolean
  generatedAt: string
  sections: Array<{ key: HomeSectionKey; visible: boolean }>
  seo: { title?: string | null; description?: string | null; canonical?: string | null; robots: string; socialImage?: MediaDTO | null }
  site: {
    brandName: string
    brandLogo?: MediaDTO | null
    brandLogoMode: BrandLogoMode
    headerSubtitle: string
    desktopNavigation: DesktopNavigationItem[]
    mobileNavigation: Array<{ label: string; href: string; icon: 'Home' | 'Dumbbell' | 'Tag' }>
    mobileMenuNavigation: Array<{ label: string; href: string }>
    mobileActions: { playLabel: string; menuLabel: string; menuTitle: string; quickActionsTitle: string; bookCourtLabel: string; callLabel: string; directionsLabel: string }
    contacts: { address: string; directionsURL?: string | null; phoneDisplay: string; phoneValue: string; email: string; transit: string; parking: string; openingHours: string; labels: Record<'address' | 'transit' | 'parking' | 'openingHours' | 'phone' | 'email', string>; map: { latitude: number; longitude: number; zoom: number } }
    footer: { image?: MediaDTO | null; about: string; stats: Array<{ value: string; label: string }>; legalEntity: string; navigation: Array<{ label: string; href: string; column: '1' | '2' }>; socialLinks: Array<{ provider: 'telegram' | 'vk' | 'instagram' | 'video'; label: string; url: string }>; legalLinks: Array<{ label: string; href: string }>; copyright: string; cookieNotice: { text: string; acceptLabel: string; rejectLabel: string; manageLabel: string } }
    analytics: { mode: 'disabled' | 'consent-required' | 'first-party'; endpoint: string; schemaVersion: 1; vendors: { yandexMetrica: { enabled: boolean; counterId?: string | null; webvisor: boolean }; ga4: { enabled: boolean; measurementId?: string | null }; webmasterVerification?: string | null } }
    partners: Array<{ id: string; name: string; logo?: MediaDTO | null; websiteURL?: string | null }>
    booking: { mode: 'disabled' | 'external-link' | 'provider-adapter'; externalURL?: string | null; buttonLabel: string; ready: boolean; status: 'disabled' | 'ready-external' | 'missing-config' | 'integration-not-implemented' }
    contactConfirmation: {
      avatar?: MediaDTO | null
      cancelLabel: string
      continueLabel: string
      dialogTitle: string
      formTitle: string
      submitLabel: string
      successTitle: string
      successText: string
      consentLabel: string
      leadEndpoint: string
      policyHref: string
      channels: Array<{ channel: 'phone' | 'email' | 'telegram' | 'vk'; enabled: boolean; label: string; displayValue: string; destination: string }>
    }
  }
  home: {
    hero: { seoHeading: string; titleLine: string; titleConnector: string; titleAccent: string; description: string; desktopMedia?: MediaDTO | null; mobileMedia?: MediaDTO | null; desktopPoster?: MediaDTO | null; mobilePoster?: MediaDTO | null; primaryAction: ActionDTO; secondaryAction: ActionDTO; socialProof: { ratingLabel: string; caption: string; coachPhotos: MediaDTO[] }; stats: Array<{ value: string; label: string }> }
    benefits: { eyebrow: string; title: string; cards: Array<{ id: string; variant: 'parking' | 'lockers' | 'shower' | 'chill' | 'online-booking' | 'coaches-metric' | 'kids-wide'; eyebrow?: string | null; title: string; description: string; supportingText?: string | null; media?: MediaDTO | null; overlay?: string | null; meshTone?: string | null; action: ActionDTO }> }
    offers: Array<{ id: string; variant: 'tournament-venue' | 'event'; badge: string; title: string; description: string; image?: MediaDTO | null; overlay: string; icon: 'Trophy' | 'PartyPopper'; action: ActionDTO }>
    courtsSection: { titleLineOne: string; titleLineTwo: string; background?: MediaDTO | null; backgroundAlt: string }
    pricingSection: { eyebrow: string; title: string; defaultTab: 'rent' | 'training' | 'memberships'; rentTabLabel: string; trainingTabLabel: string; membershipsTabLabel: string }
    methodistBanner: { title: string; description: string; decorativeMedia?: MediaDTO | null; meshTone: string; action: ActionDTO }
    coachesSection: { eyebrow: string; title: string }
    tournamentsSection: { eyebrow: string; title: string }
    gallerySection: { eyebrow: string; title: string; action: ActionDTO }
    blogSection: { eyebrow: string; title: string; action: ActionDTO }
    reviewsSection: { reviewsEyebrow: string; reviewsTitle: string; faqEyebrow: string; faqTitle: string; externalRatingLabel: string; externalReviewsLabel: string; externalReviewsURL: string }
  }
  entities: {
    coaches: Array<{ id: string; name: string; slug: string; photo: MediaDTO; specialization: string; bio: string; level: string; experience: string; languages: string; rating: number; reviewsCount: number; certificates: string[]; priceFrom: number; action: ActionDTO }>
    tournaments: TournamentCardDTO[]
    articles: Array<{ id: string; slug: string; image: MediaDTO; category: string; readingTimeMinutes: number; title: string; excerpt: string }>
    articleRows: Array<{ id: string; slug: string; title: string; excerpt: string }>
    courts: Array<{ id: string; slug: string; title: string; eyebrow?: string | null; description?: string | null; cardVariant: 'panoramic' | 'metrics' | 'damping' | 'surface'; metrics?: Array<{ value: string; label: string; icon: 'PanelTop' | 'Lightbulb' | 'Activity' | 'Layers3' }> | null }>
    rentalRates: Array<{ id: string; title: string; eyebrow?: string | null; timeLabel?: string | null; description: string; price?: number | null; priceLabel?: string | null; priceSuffix?: string | null; badge?: string | null; badgeTone?: string | null; cardVariant: 'rate' | 'trial' | 'standards'; meshTone?: string | null; includedItems: string[]; action: ActionDTO }>
    trainingPrograms: Array<{ id: string; slug: string; title: string; badge: string; description: string; image: MediaDTO; overlay: string; icon: 'User' | 'Users' | 'Baby'; priceFrom: number; action: ActionDTO }>
    memberships: Array<{ id: string; title: string; badge?: string | null; badgeTone?: string | null; description: string; cardVariant: 'gift' | 'package' | 'featured-package' | 'resident'; meshTone?: string | null; price?: number | null; oldPrice?: number | null; priceLabel?: string | null; benefits: string[]; giftAmountLimits?: { minimum?: number | null; maximum?: number | null } | null; action: ActionDTO }>
    gallery: Array<{ id: string; title: string; media: MediaDTO; caption?: string | null }>
    reviews: Array<{ id: string; authorName: string; authorMeta: string; avatar?: MediaDTO | null; rating: number; text: string }>
    faqs: Array<{ id: string; question: string; answer: string }>
  }
}

export type SiteDTO = HomepageDTO['site']
export type PageSEO = HomepageDTO['seo']
export type CatalogPageHeader = { eyebrow: string; title: string; intro: string; hero: PageHeroDTO; seo: PageSEO }
export type ArticleCatalogItem = Omit<HomepageDTO['entities']['articles'][number], 'category'> & { category: { slug: string; title: string }; publishedAt: string; updatedAt?: string; popularityScore: number }
export type CoachCatalogItem = HomepageDTO['entities']['coaches'][number] & { levels: string[]; focusAreas: string[]; languageCodes: string[] }
export type TournamentCatalogItem = TournamentCardDTO & {
  action: ActionDTO
  lifecycle: 'upcoming' | 'active' | 'finished' | 'cancelled'
  participantMode: TournamentParticipantMode
  totalSlots: number
  participants: TournamentParticipantDTO[]
  standings: TournamentStandingDTO[]
  prizes: TournamentPrizeDTO[]
  checklist: TournamentChecklistDTO[]
  perks: TournamentPerkDTO[]
  matchday: TournamentMatchdayDTO[]
  faqs: TournamentFaqDTO[]
  coordinator: { telegramLabel?: string | null; telegramURL?: string | null; phoneDisplay?: string | null; phoneValue?: string | null }
  regulationHTML: string
}

type CatalogBase = { version: typeof homepageDTOversion; preview: boolean; generatedAt: string; page: CatalogPageHeader; site: SiteDTO }
type CatalogListBase = CatalogBase & { pagination: CatalogPagination; query: CatalogQuery }
export type BlogCatalogDTO = CatalogListBase & { kind: 'blog'; items: ArticleCatalogItem[]; categories: Array<{ slug: string; title: string }> }
export type CoachesCatalogDTO = CatalogListBase & { kind: 'coaches'; items: CoachCatalogItem[] }
export type TournamentsCatalogDTO = CatalogListBase & { kind: 'tournaments'; items: Array<TournamentCardDTO & Pick<TournamentCatalogItem, 'lifecycle' | 'action'>> }
export type CatalogDTO = BlogCatalogDTO | CoachesCatalogDTO | TournamentsCatalogDTO

export type BlogDetailDTO = CatalogBase & { kind: 'blog'; item: ArticleCatalogItem & { contentHTML: string; seo: PageSEO }; related: ArticleCatalogItem[] }
export type CoachDetailDTO = CatalogBase & { kind: 'coaches'; item: CoachCatalogItem & { seo: PageSEO }; related: CoachCatalogItem[] }
export type TournamentDetailDTO = CatalogBase & { kind: 'tournaments'; item: TournamentCatalogItem & { seo: PageSEO }; related: TournamentCatalogItem[] }
export type DetailDTO = BlogDetailDTO | CoachDetailDTO | TournamentDetailDTO

type ThematicPageBase = { version: typeof homepageDTOversion; preview: boolean; generatedAt: string; page: CatalogPageHeader; site: SiteDTO }
export type PricesPageDTO = ThematicPageBase & {
  kind: 'prices'
  tabs: { rent: string; training: string; memberships: string }
  rules: Array<{ title: string; contentHTML: string }>
  rentalRates: HomepageDTO['entities']['rentalRates']
  trainingPrograms: HomepageDTO['entities']['trainingPrograms']
  memberships: HomepageDTO['entities']['memberships']
}
export type TrainingPageDTO = ThematicPageBase & {
  kind: 'training'
  infographicEyebrow: string
  infographicTitle: string
  programsEyebrow: string
  programsTitle: string
  blocks: Array<{ title: string; body: string; icon: 'Target' | 'Calendar' | 'TrendingUp' | 'Users' }>
  coachesEyebrow: string
  coachesTitle: string
  coachesDesktopActionLabel: string
  coachesMobileActionLabel: string
  knowledgeEyebrow: string
  knowledgeTitle: string
  firstVisitTitle: string
  firstVisitCopy: string
  firstVisitItems: Array<{ title: string; body: string; icon: 'Dumbbell' | 'Footprints' | 'ShowerHead' | 'Timer' }>
  faqTitle: string
  faqCopy: string
  faq: Array<{ question: string; answer: string }>
  action: ActionDTO
  programs: HomepageDTO['entities']['trainingPrograms']
  trial: HomepageDTO['entities']['rentalRates'][number] | null
  coaches?: HomepageDTO['entities']['coaches']
}
export type GiftPageDTO = ThematicPageBase & {
  kind: 'gift'
  offerEyebrow: string
  offerTitle: string
  offerCopy: string
  formatsTitle: string
  formatsCopy: string
  termsTitle: string
  termsCopy: string
  benefits: Array<{ badge: string; title: string; body: string; icon: 'Gift' | 'BadgeCheck' | 'CalendarCheck' | 'Sparkles' }>
  formats: Array<{
    id: 'box' | 'digital'
    badge: string
    title: string
    image: MediaDTO
    features: string[]
    buttonText: string
    buttonSelectedText: string
  }>
  terms: Array<{ title: string; text: string; icon: 'CalendarCheck' | 'ShieldCheck' | 'Layers' | 'PackageCheck' | 'Users' | 'ClipboardCheck' }>
  stepsEyebrow: string
  stepsTitle: string
  steps: Array<{ title: string; body: string }>
  articleHTML: string
  faqTitle: string
  faq: Array<{ question: string; answer: string }>
  form: {
    sectionTitle: string
    sectionCopy: string
    channelLabel: string
    telegramLabel: string
    phoneLabel: string
    vkLabel: string
    formatLabel: string
    purposeLabel: string
    namePlaceholder: string
    contactPhonePlaceholder: string
    contactTelegramPlaceholder: string
    contactVKPlaceholder: string
    recipientPlaceholder: string
    commentPlaceholder: string
    consentLabel: string
    policyLabel: string
    submitLabel: string
    successTitle: string
    successText: string
    resubmitLabel: string
  }
  action: ActionDTO
}

export type PadelCourtZakazPageIcon = 'Ruler' | 'Settings2' | 'Truck' | 'Wrench' | 'ClipboardCheck' | 'Layers3' | 'ShieldCheck' | 'Factory' | 'Sparkles' | 'Wind' | 'CheckCircle2'
export type PadelCourtZakazPageOverlay = 'overlay-blue' | 'overlay-violet' | 'overlay-emerald' | 'overlay-lime' | 'overlay-dark'
export type PadelCourtZakazPageDTO = ThematicPageBase & {
  kind: 'padel-court-zakaz'
  heroVideo?: MediaDTO | null
  hero: {
    primaryLabel: string
    secondaryLabel: string
    metrics: Array<{ title: string; caption: string }>
  }
  distributor: {
    title: string
    text: string
    advantages: Array<{ index: string; title: string; text: string }>
  }
  turnkey: {
    title: string
    intro: string
    steps: Array<{ number: string; title: string; text: string; image: MediaDTO; icon: PadelCourtZakazPageIcon; overlay: PadelCourtZakazPageOverlay }>
  }
  price: {
    title: string
    text: string
    actionLabel: string
    factors: Array<{ label: string; detail: string }>
  }
  technology: {
    title: string
    text: string
    background: MediaDTO
    items: Array<{ title: string; tag: string; text: string; icon: PadelCourtZakazPageIcon }>
  }
  gallery: {
    title: string
    text: string
    creditLabel: string
    items: Array<{ media: MediaDTO; caption: string }>
  }
  models: {
    title: string
    text: string
    badge: string
    items: Array<{
      id: string
      name: string
      eyebrow: string
      title: string
      tagline: string
      description: string
      image: MediaDTO
      specs: Array<{ label: string; value: string }>
      highlights: string[]
    }>
  }
  cta: {
    title: string
    text: string
    guarantees: string[]
    contacts: { telegramLabel: string; telegramURL: string; vkLabel: string; vkURL: string; phoneLabel: string }
    form: {
      title: string
      channelLabel: string
      nameLabel: string
      namePlaceholder: string
      phoneLabel: string
      phonePlaceholder: string
      telegramLabel: string
      telegramPlaceholder: string
      vkLabel: string
      vkPlaceholder: string
      modelLabel: string
      modelOptionPrefix: string
      consultationOptionLabel: string
      courtCountLabel: string
      courtCountOneLabel: string
      courtCountTwoThreeLabel: string
      courtCountFourSixLabel: string
      courtCountSevenPlusLabel: string
      cityLabel: string
      cityPlaceholder: string
      commentLabel: string
      commentPlaceholder: string
      consentLabel: string
      policyLabel: string
      submitLabel: string
      successTitle: string
      successText: string
      resubmitLabel: string
      nameError: string
      contactError: string
      consentError: string
      submitError: string
      connectionError: string
    }
  }
}
export type CourtsPageDTO = ThematicPageBase & {
  kind: 'courts'
  infographicTitle: string
  infographicCopy: string
  metrics: Array<{ value: string; label: string; icon: 'Layers3' | 'PanelTop' | 'Lightbulb' | 'Thermometer' }>
  courts: HomepageDTO['entities']['courts']
  gallery: HomepageDTO['entities']['gallery']
}
export type GalleryPageDTO = ThematicPageBase & { kind: 'gallery'; gallery: HomepageDTO['entities']['gallery'] }
export type AboutPageDTO = ThematicPageBase & { kind: 'about'; storyHTML: string; stats: Array<{ value: string; label: string }>; gallery: HomepageDTO['entities']['gallery'] }
export type ContactsPageDTO = ThematicPageBase & { kind: 'contacts'; directionsTitle: string; directionsText: string; arrivalNotes: Array<{ title: string; text: string; icon: 'Car' | 'Train' | 'Clock' | 'MapPin' }> }
export type LegalPageDTO = ThematicPageBase & { kind: 'policy' | 'oferta'; notice: string; contentHTML: string; approved: boolean }
export type ThematicPageDTO = PricesPageDTO | TrainingPageDTO | GiftPageDTO | CourtsPageDTO | GalleryPageDTO | AboutPageDTO | ContactsPageDTO | LegalPageDTO

const sectionKeys = new Set<HomeSectionKey>(['hero', 'benefits', 'offers', 'courts', 'pricing', 'coaches', 'methodist-banner', 'tournaments', 'gallery', 'blog', 'reviews-faq'])
const overlays = new Set(['overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark'])
const meshes = new Set(['indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold'])
const padelOverlays = new Set<PadelCourtZakazPageOverlay>(['overlay-blue', 'overlay-violet', 'overlay-emerald', 'overlay-lime', 'overlay-dark'])
const padelIcons = new Set<PadelCourtZakazPageIcon>(['Ruler', 'Settings2', 'Truck', 'Wrench', 'ClipboardCheck', 'Layers3', 'ShieldCheck', 'Factory', 'Sparkles', 'Wind', 'CheckCircle2'])

function assertNavigationIcon(icon: unknown) {
  if (icon == null) return
  if (typeof icon !== 'object') throw new Error('Desktop navigation contains an invalid icon.')
  const media = icon as Partial<MediaDTO>
  if (typeof media.alt !== 'string' || typeof media.url !== 'string' || typeof media.mimeType !== 'string' || !media.mimeType.startsWith('image/')) {
    throw new Error('Desktop navigation contains an invalid icon.')
  }
}

function assertNavigationItem(item: unknown, allowChildren: boolean) {
  if (!item || typeof item !== 'object') throw new Error('Desktop navigation contains an invalid item.')
  const { label, href, icon, children } = item as { label?: unknown; href?: unknown; icon?: unknown; children?: unknown }
  if (typeof label !== 'string' || typeof href !== 'string') throw new Error('Desktop navigation contains an invalid item.')
  assertNavigationIcon(icon)
  if (children == null) return
  if (!allowChildren || !Array.isArray(children)) throw new Error('Desktop navigation contains invalid children.')
  children.forEach((child) => assertNavigationItem(child, false))
}

function assertDesktopNavigation(site: unknown) {
  if (!site || typeof site !== 'object') return
  const navigation = (site as { desktopNavigation?: unknown }).desktopNavigation
  if (navigation === undefined) return
  if (!Array.isArray(navigation)) throw new Error('Desktop navigation is invalid.')
  navigation.forEach((item) => assertNavigationItem(item, true))
}

export function parseHomepageDTO(value: unknown): HomepageDTO {
  if (!value || typeof value !== 'object') throw new Error('Homepage DTO must be an object.')
  const dto = value as Partial<HomepageDTO>
  if (dto.version !== homepageDTOversion) throw new Error(`Unsupported homepage DTO version: ${String(dto.version)}.`)
  if (!dto.site || !dto.home || !dto.entities || !Array.isArray(dto.sections)) throw new Error('Homepage DTO is incomplete.')
  assertDesktopNavigation(dto.site)
  if (dto.sections.some((section) => !section || !sectionKeys.has(section.key) || typeof section.visible !== 'boolean')) {
    throw new Error('Homepage DTO contains an invalid section definition.')
  }
  for (const key of ['coaches', 'tournaments', 'articles', 'articleRows', 'courts', 'rentalRates', 'trainingPrograms', 'memberships', 'gallery', 'reviews', 'faqs'] as const) {
    if (!Array.isArray(dto.entities[key])) throw new Error(`Homepage DTO entity list ${key} is invalid.`)
  }
  const suppliedOverlays = [
    ...dto.home.offers.map(({ overlay }) => overlay),
    ...dto.home.benefits.cards.flatMap(({ overlay }) => overlay ? [overlay] : []),
    ...dto.entities.tournaments.flatMap(({ imageOverlay }) => imageOverlay ? [imageOverlay] : []),
    ...dto.entities.trainingPrograms.map(({ overlay }) => overlay),
  ]
  const suppliedMeshes = [
    dto.home.methodistBanner.meshTone,
    ...dto.home.benefits.cards.flatMap(({ meshTone }) => meshTone ? [meshTone] : []),
    ...dto.entities.tournaments.flatMap(({ meshStyle }) => meshStyle ? [meshStyle] : []),
    ...dto.entities.rentalRates.flatMap(({ meshTone }) => meshTone ? [meshTone] : []),
    ...dto.entities.memberships.flatMap(({ meshTone }) => meshTone ? [meshTone] : []),
  ]
  if (suppliedOverlays.some((overlay) => !overlays.has(overlay)) || suppliedMeshes.some((mesh) => !meshes.has(mesh))) {
    throw new Error('Homepage DTO contains an unapproved visual token.')
  }
  return dto as HomepageDTO
}

export function parseCatalogDTO(value: unknown): CatalogDTO {
  if (!value || typeof value !== 'object') throw new Error('Catalog DTO must be an object.')
  const dto = value as Partial<CatalogDTO>
  if (dto.version !== homepageDTOversion || !dto.site || !dto.page || !Array.isArray(dto.items)) throw new Error('Catalog DTO is incomplete.')
  if (dto.kind !== 'blog' && dto.kind !== 'coaches' && dto.kind !== 'tournaments') throw new Error('Catalog DTO kind is invalid.')
  assertDesktopNavigation(dto.site)
  if (!dto.pagination || !dto.query || !Number.isSafeInteger(dto.pagination.page) || dto.pagination.page < 1 || !Number.isSafeInteger(dto.pagination.totalPages) || dto.pagination.totalPages < dto.pagination.page || !Number.isSafeInteger(dto.pagination.totalDocs) || dto.pagination.totalDocs < 0 || !Number.isSafeInteger(dto.pagination.limit) || dto.pagination.limit < 1 || dto.query.page !== dto.pagination.page) throw new Error('Catalog pagination is invalid.')
  return dto as CatalogDTO
}

export function parseDetailDTO(value: unknown): DetailDTO {
  if (!value || typeof value !== 'object') throw new Error('Detail DTO must be an object.')
  const dto = value as Partial<DetailDTO>
  if (dto.version !== homepageDTOversion || !dto.site || !dto.page || !dto.item || !Array.isArray(dto.related)) throw new Error('Detail DTO is incomplete.')
  if (dto.kind !== 'blog' && dto.kind !== 'coaches' && dto.kind !== 'tournaments') throw new Error('Detail DTO kind is invalid.')
  assertDesktopNavigation(dto.site)
  return dto as DetailDTO
}

export function parseThematicPageDTO(value: unknown): ThematicPageDTO {
  if (!value || typeof value !== 'object') throw new Error('Page DTO must be an object.')
  const dto = value as Partial<ThematicPageDTO>
  if (dto.version !== homepageDTOversion || !dto.site || !dto.page) throw new Error('Page DTO is incomplete.')
  if (!['prices', 'training', 'gift', 'courts', 'gallery', 'about', 'contacts', 'policy', 'oferta'].includes(String(dto.kind))) throw new Error('Page DTO kind is invalid.')
  assertDesktopNavigation(dto.site)
  return dto as ThematicPageDTO
}

export function parsePadelCourtZakazPageDTO(value: unknown): PadelCourtZakazPageDTO {
  if (!value || typeof value !== 'object') throw new Error('Padel court page DTO must be an object.')
  const dto = value as Partial<PadelCourtZakazPageDTO>
  if (dto.version !== homepageDTOversion || !dto.site || !dto.page || dto.kind !== 'padel-court-zakaz') throw new Error('Padel court page DTO is incomplete.')
  if (!dto.hero || !dto.distributor || !dto.turnkey || !dto.price || !dto.technology || !dto.gallery || !dto.models || !dto.cta) throw new Error('Padel court page DTO content is incomplete.')
  if (!Array.isArray(dto.hero.metrics) || !Array.isArray(dto.distributor.advantages) || !Array.isArray(dto.turnkey.steps) || !Array.isArray(dto.price.factors) || !Array.isArray(dto.technology.items) || !Array.isArray(dto.gallery.items) || !Array.isArray(dto.models.items) || !Array.isArray(dto.cta.guarantees)) throw new Error('Padel court page DTO contains an invalid list.')
  if (dto.turnkey.steps.some((step) => !padelIcons.has(step.icon) || !padelOverlays.has(step.overlay)) || dto.technology.items.some((item) => !padelIcons.has(item.icon))) throw new Error('Padel court page DTO contains an invalid visual token.')
  assertDesktopNavigation(dto.site)
  return dto as PadelCourtZakazPageDTO
}

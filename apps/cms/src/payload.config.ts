import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { ru } from 'payload/i18n/ru'
import sharp from 'sharp'

import { ArticleCategories } from './collections/ArticleCategories'
import { Articles } from './collections/Articles'
import { Coaches } from './collections/Coaches'
import { Courts } from './collections/Courts'
import { FAQs } from './collections/FAQs'
import { GalleryItems } from './collections/GalleryItems'
import { Media } from './collections/Media'
import { Memberships } from './collections/Memberships'
import { Partners } from './collections/Partners'
import { Pages } from './collections/Pages'
import { RentalRates } from './collections/RentalRates'
import { Reviews } from './collections/Reviews'
import { TrainingPrograms } from './collections/TrainingPrograms'
import { Tournaments } from './collections/Tournaments'
import { Users } from './collections/Users'
import { Leads } from './collections/Leads'
import { AnalyticsEvents } from './collections/AnalyticsEvents'
import { AnalyticsBrowsers } from './collections/AnalyticsBrowsers'
import { AnalyticsSessions } from './collections/AnalyticsSessions'
import { AnalyticsDaily } from './collections/AnalyticsDaily'
import { Redirects } from './collections/Redirects'
import { payloadPublicURLConfig } from './config/publicURLs'
import { applyDefaultCollapsedAccordions } from './components/admin/accordionDefaults'
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'
import { BlogPage } from './globals/BlogPage'
import { CoachesPage } from './globals/CoachesPage'
import { TournamentsPage } from './globals/TournamentsPage'
import { TournamentDefaults } from './globals/TournamentDefaults'
import { AboutPage, ContactsPage, CourtsPage, GalleryPage, GiftPage, OfertaPage, PadelCourtZakazPage, PolicyPage, PricesPage, TrainingPage } from './globals/ThematicPages'
import { migrations } from './migrations'
import { installTransactionInvalidation, invalidateCollectionContent, invalidateGlobalContent } from './content/projectionCache'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const configuredAdminRoute = process.env.PAYLOAD_ADMIN_ROUTE?.trim() ?? ''
const adminRoute = /^\/[a-z0-9-]+$/.test(configuredAdminRoute) ? configuredAdminRoute : '/urp-panel'

export default buildConfig({
  onInit: async (payload) => { installTransactionInvalidation(payload) },
  jobs: { autoRun: process.env.PAYLOAD_DISABLE_JOBS === '1' ? [] : [{ cron: '* * * * *', allQueues: true, limit: 20 }] },
  ...payloadPublicURLConfig({
    PUBLIC_CMS_URL: process.env.PUBLIC_CMS_URL,
    PUBLIC_WEB_URL: process.env.PUBLIC_WEB_URL,
  }),
  admin: {
    components: {
      Nav: '/components/admin/OrderedPayloadNav#OrderedPayloadNav',
      beforeNavLinks: ['/components/admin/AdminQuickSearch#AdminQuickSearch'],
      afterNavLinks: ['/components/admin/AdminToolsNav#AdminToolsNav'],
      beforeDashboard: ['/components/admin/DashboardOverview#DashboardOverview'],
      views: {
        analytics: {
          Component: '/components/admin/AnalyticsViewServer#AnalyticsView',
          path: '/analytics',
        },
        pageMap: {
          Component: '/components/admin/PageMapViewServer#PageMapView',
          path: '/page-map',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  routes: {
    admin: adminRoute,
  },
  graphQL: {
    disable: true,
    disablePlaygroundInProduction: true,
  },
  i18n: {
    fallbackLanguage: 'ru',
    supportedLanguages: { ru },
  },
  collections: [
    Leads,
    Pages,
    RentalRates,
    Coaches,
    TrainingPrograms,
    Memberships,
    Tournaments,
    Articles,
    ArticleCategories,
    GalleryItems,
    Media,
    Partners,
    AnalyticsEvents,
    AnalyticsBrowsers,
    AnalyticsSessions,
    AnalyticsDaily,
    Redirects,
    Users,
    // Homepage-only collections remain editable through native drawers from the Homepage tabs.
    { ...Courts, admin: { ...Courts.admin, group: false as const } },
    { ...Reviews, admin: { ...Reviews.admin, group: false as const } },
    { ...FAQs, admin: { ...FAQs.admin, group: false as const } },
  ].map((collection) => {
    const withAccordionDefaults = { ...collection, fields: applyDefaultCollapsedAccordions(collection.fields) }
    return collection.slug === 'users' || collection.slug === 'leads' || collection.slug.startsWith('analytics-') ? withAccordionDefaults : invalidateCollectionContent(withAccordionDefaults)
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? '',
      connectionTimeoutMillis: 3_000,
    },
    prodMigrations: migrations,
    push: false,
  }),
  editor: lexicalEditor(),
  globals: [
    { ...SiteSettings, admin: { ...SiteSettings.admin, group: 'Настройки' } },
    { ...TournamentDefaults, label: 'Общие условия турниров', admin: { ...TournamentDefaults.admin, group: 'Турниры' } },
    ...[HomePage, PricesPage, TrainingPage, CoachesPage, TournamentsPage, GiftPage, BlogPage, GalleryPage, AboutPage, ContactsPage, CourtsPage, PadelCourtZakazPage, PolicyPage, OfertaPage]
      .map((global) => ({
        ...global,
        ...(global.slug === 'padel-court-zakaz-page' ? { label: 'Дистрибьюция кортов' } : {}),
        admin: {
          ...global.admin,
          group: ['policy-page', 'oferta-page'].includes(global.slug) ? false as const : 'Страницы / разделы',
          ...(global.slug === 'courts-page' ? { hidden: true } : {}),
        },
      })),
  ].map((global) => invalidateGlobalContent({ ...global, fields: applyDefaultCollapsedAccordions(global.fields) })),
  secret: process.env.PAYLOAD_SECRET ?? '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

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
    Users,
    Pages,
    Media,
    ArticleCategories,
    Articles,
    Coaches,
    Courts,
    RentalRates,
    TrainingPrograms,
    Memberships,
    Tournaments,
    GalleryItems,
    Reviews,
    FAQs,
    Partners,
    Leads,
    AnalyticsEvents,
    AnalyticsBrowsers,
    AnalyticsSessions,
    AnalyticsDaily,
    Redirects,
  ].map((collection) => collection.slug === 'users' || collection.slug === 'leads' || collection.slug.startsWith('analytics-') ? collection : invalidateCollectionContent(collection)),
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
    SiteSettings,
    TournamentDefaults,
    ...[HomePage, BlogPage, CoachesPage, TournamentsPage, PricesPage, TrainingPage, GiftPage, CourtsPage, PadelCourtZakazPage, GalleryPage, AboutPage, ContactsPage, PolicyPage, OfertaPage]
      .map((global) => ({ ...global, admin: { ...global.admin, group: 'Контент' } })),
  ].map(invalidateGlobalContent),
  secret: process.env.PAYLOAD_SECRET ?? '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

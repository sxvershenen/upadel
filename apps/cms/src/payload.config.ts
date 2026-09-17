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
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'
import { BlogPage } from './globals/BlogPage'
import { CoachesPage } from './globals/CoachesPage'
import { TournamentsPage } from './globals/TournamentsPage'
import { AboutPage, ContactsPage, CourtsPage, GalleryPage, GiftPage, OfertaPage, PadelCourtZakazPage, PolicyPage, PricesPage, TrainingPage } from './globals/ThematicPages'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
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
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? '',
    },
  }),
  editor: lexicalEditor(),
  globals: [
    SiteSettings,
    ...[HomePage, BlogPage, CoachesPage, TournamentsPage, PricesPage, TrainingPage, GiftPage, CourtsPage, PadelCourtZakazPage, GalleryPage, AboutPage, ContactsPage, PolicyPage, OfertaPage]
      .map((global) => ({ ...global, admin: { ...global.admin, group: 'Контент' } })),
  ],
  secret: process.env.PAYLOAD_SECRET ?? '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

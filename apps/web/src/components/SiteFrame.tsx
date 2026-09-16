import type { SiteDTO } from '@unlim/content-contract'
import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

import { SiteProvider } from '../content/ContentContext'
import { CookieBanner } from './CookieBanner'
import { CoolModeEffects } from './ui/CoolModeButton'
import { DesktopHeader } from './navigation/DesktopHeader'
import { MobileBottomNav } from './navigation/MobileBottomNav'
import { Footer } from '../sections/Footer'
import { AnalyticsTracker } from '../analytics/AnalyticsTracker'
import { ExternalAnalytics } from '../analytics/ExternalAnalytics'
import { FloatingBackLink, type BackLink } from './navigation/FloatingBackLink'

export function SiteFrame({ site, children, backLink }: { site: SiteDTO; children: ReactNode; backLink?: BackLink }) {
  const rootHref = (href: string) => href.startsWith('#') ? `/${href}` : href
  const innerSite: SiteDTO = {
    ...site,
    desktopNavigation: site.desktopNavigation.map((item) => ({ ...item, href: rootHref(item.href) })),
    mobileNavigation: site.mobileNavigation.map((item) => ({ ...item, href: rootHref(item.href) })),
    mobileMenuNavigation: site.mobileMenuNavigation.map((item) => ({ ...item, href: rootHref(item.href) })),
    footer: { ...site.footer, navigation: site.footer.navigation.map((item) => ({ ...item, href: rootHref(item.href) })) },
  }
  return <SiteProvider site={innerSite} homeHref="/#top"><MotionConfig reducedMotion="user"><AnalyticsTracker analytics={innerSite.analytics} /><ExternalAnalytics vendors={innerSite.analytics.vendors} /><CoolModeEffects /><div className="min-h-screen bg-page text-ink">{backLink && <FloatingBackLink {...backLink} />}<DesktopHeader /><main>{children}</main><Footer /><MobileBottomNav /><CookieBanner /></div></MotionConfig></SiteProvider>
}

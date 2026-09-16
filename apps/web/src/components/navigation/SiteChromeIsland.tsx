import type { SiteDTO } from '@unlim/content-contract'
import { MotionConfig } from 'framer-motion'

import { SiteProvider } from '../../content/ContentContext'
import { DesktopHeader } from './DesktopHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { normalizeSiteChrome } from './siteChromeState'

/** Navigation chrome stays mounted while Swup replaces only the page surface. */
export function SiteChromeIsland({ site }: { site: SiteDTO }) {
  const chromeSite = normalizeSiteChrome(site)
  return <SiteProvider site={chromeSite} homeHref="/#top" captureContacts={false}>
    <MotionConfig reducedMotion="user">
      <DesktopHeader />
      <MobileBottomNav />
    </MotionConfig>
  </SiteProvider>
}

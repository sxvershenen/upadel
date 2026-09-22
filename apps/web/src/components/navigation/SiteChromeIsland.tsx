import type { SiteDTO } from '@unlim/content-contract'
import { MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'

import { SiteProvider, subscribeSiteUpdates } from '../../content/ContentContext'
import { DesktopHeader } from './DesktopHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { normalizeSiteChrome } from './siteChromeState'

/** Navigation chrome stays mounted while Swup replaces only the page surface. */
export function SiteChromeIsland({ site }: { site: SiteDTO }) {
  const [currentSite, setCurrentSite] = useState(site)
  useEffect(() => subscribeSiteUpdates(document, setCurrentSite), [])
  const chromeSite = normalizeSiteChrome(currentSite)
  return <SiteProvider site={chromeSite} homeHref="/#top" captureContacts={false}>
    <MotionConfig reducedMotion="user">
      <DesktopHeader />
      <MobileBottomNav />
    </MotionConfig>
  </SiteProvider>
}

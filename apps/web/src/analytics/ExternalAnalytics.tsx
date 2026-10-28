import type { SiteDTO } from '@unlim/content-contract'
import { useEffect } from 'react'
import { initializeExternalAnalytics } from './externalVendors'
export { shouldInitializeMetrica, shouldInitializeVendor, shouldLoadExternalVendor, shouldLoadMetricaScript, shouldReloadForVendorRevoke } from './externalVendors'

export function ExternalAnalytics(props: { vendors: SiteDTO['analytics']['vendors']; analyticsEnabled: boolean; analyticsMode: SiteDTO['analytics']['mode'] }) {
  useEffect(() => initializeExternalAnalytics(props), [props.analyticsEnabled, props.analyticsMode, props.vendors])
  return null
}

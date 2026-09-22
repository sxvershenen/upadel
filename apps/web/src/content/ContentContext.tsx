import React, { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { HomepageDTO, SiteDTO } from '@unlim/content-contract'
import { ActionLayerProvider } from '../actions/ActionLayer'

const ContentContext = createContext<HomepageDTO | null>(null)
const SiteContext = createContext<SiteDTO | null>(null)
const HomeHrefContext = createContext('#top')

export const SITE_UPDATE_EVENT = 'unlim:site-update'

export function subscribeSiteUpdates(target: EventTarget, update: (site: SiteDTO) => void) {
  const handleUpdate = (event: Event) => update((event as CustomEvent<SiteDTO>).detail)
  target.addEventListener(SITE_UPDATE_EVENT, handleUpdate)
  return () => target.removeEventListener(SITE_UPDATE_EVENT, handleUpdate)
}

export function SiteProvider({ site, children, homeHref = '#top', captureContacts = true }: { site: SiteDTO; children: ReactNode; homeHref?: string; captureContacts?: boolean }) {
  useEffect(() => {
    if (captureContacts) document.dispatchEvent(new CustomEvent<SiteDTO>(SITE_UPDATE_EVENT, { detail: site }))
  }, [captureContacts, site])
  return <HomeHrefContext.Provider value={homeHref}><SiteContext.Provider value={site}><ActionLayerProvider site={site} captureContacts={captureContacts}>{children}</ActionLayerProvider></SiteContext.Provider></HomeHrefContext.Provider>
}

export function ContentProvider({ content, children }: { content: HomepageDTO; children: ReactNode }) {
  return <SiteProvider site={content.site}><ContentContext.Provider value={content}>{children}</ContentContext.Provider></SiteProvider>
}

export function useSite(): SiteDTO {
  const site = useContext(SiteContext)
  if (!site) throw new Error('Site settings are not available.')
  return site
}

export function useHomeHref(): string {
  return useContext(HomeHrefContext)
}

export function useContent(): HomepageDTO {
  const content = useContext(ContentContext)
  if (!content) throw new Error('Homepage content is not available.')
  return content
}

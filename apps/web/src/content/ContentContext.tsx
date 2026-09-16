import { createContext, useContext, type ReactNode } from 'react'
import type { HomepageDTO, SiteDTO } from '@unlim/content-contract'
import { ActionLayerProvider } from '../actions/ActionLayer'

const ContentContext = createContext<HomepageDTO | null>(null)
const SiteContext = createContext<SiteDTO | null>(null)
const HomeHrefContext = createContext('#top')

export function SiteProvider({ site, children, homeHref = '#top' }: { site: SiteDTO; children: ReactNode; homeHref?: string }) {
  return <HomeHrefContext.Provider value={homeHref}><SiteContext.Provider value={site}><ActionLayerProvider site={site}>{children}</ActionLayerProvider></SiteContext.Provider></HomeHrefContext.Provider>
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

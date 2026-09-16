import type { SiteDTO } from '@unlim/content-contract'

export function persistentNavigationHref(href: string): string {
  return href.startsWith('#') ? `/${href}` : href
}

/** Persistent chrome cannot depend on the page that happened to mount it first. */
export function normalizeSiteChrome(site: SiteDTO): SiteDTO {
  return {
    ...site,
    desktopNavigation: site.desktopNavigation.map((item) => ({
      ...item,
      href: persistentNavigationHref(item.href),
      children: item.children?.map((child) => ({ ...child, href: persistentNavigationHref(child.href) })),
    })),
    mobileNavigation: site.mobileNavigation.map((item) => ({ ...item, href: persistentNavigationHref(item.href) })),
    mobileMenuNavigation: site.mobileMenuNavigation.map((item) => ({ ...item, href: persistentNavigationHref(item.href) })),
  }
}

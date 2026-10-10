'use client'

import { Link, useConfig } from '@payloadcms/ui'
import { LineIcon } from '@payloadcms/ui/icons/Line'
import { ListViewIcon } from '@payloadcms/ui/icons/ListView'
import { usePathname, useRouter } from 'next/navigation.js'
import { formatAdminURL } from 'payload/shared'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { createPrefetchQueue, resolveAdminPrefetchHref } from './adminNavPrefetch'
import './adminToolsNav.scss'

type Tool = {
  href: string
  id: string
  label: string
  Icon: React.ComponentType
}

function isCurrentPath(pathname: string, href: string): boolean {
  return pathname === href || (pathname.startsWith(href) && ['/',''].includes(pathname[href.length] ?? ''))
}

function ToolLink({ href, id, label, Icon, pathname }: Tool & { pathname: string }) {
  const active = isCurrentPath(pathname, href)
  const className = ['nav__link', 'admin-tool-nav__link', active && 'active'].filter(Boolean).join(' ')
  const contents = (
    <>
      {active && <span className="nav__link-indicator" aria-hidden="true" />}
      <span className="admin-tool-nav__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="nav__link-label">{label}</span>
    </>
  )

  if (active) {
    return <div className={className} id={id} aria-current="page">{contents}</div>
  }

  return <Link className={className} href={href} id={id} prefetch={false}>{contents}</Link>
}

/** A single grouped entry point for custom Payload admin tools. */
export function AdminToolsNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { config } = useConfig()
  const adminRoute = config.routes.admin
  const [settingsGroup, setSettingsGroup] = useState<Element | null>(null)
  const analytics: Tool = {
    href: formatAdminURL({ adminRoute, path: '/analytics' }),
    id: 'nav-analytics',
    label: 'Аналитика',
    Icon: LineIcon,
  }
  const pageMap: Tool = {
    href: formatAdminURL({ adminRoute, path: '/page-map' }),
    id: 'nav-page-map',
    label: 'Карта страниц',
    Icon: ListViewIcon,
  }

  useEffect(() => {
    const findSettingsGroup = () => {
      const settings = document.getElementById('nav-group-Настройки')?.querySelector('.nav-group__content') ?? null
      setSettingsGroup(settings)
      return Boolean(settings)
    }
    if (findSettingsGroup()) return
    const observer = new MutationObserver(() => { if (findSettingsGroup()) observer.disconnect() })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!settingsGroup) return
    const scheduleIdle = (callback: () => void) => {
      const idle = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback.bind(window) : null
      if (idle) return idle(callback, { timeout: 1000 })
      return setTimeout(callback, 100)
    }
    const queue = createPrefetchQueue((href) => router.prefetch(href), scheduleIdle)
    const enqueueLink = (link: HTMLAnchorElement) => {
      let href: string | null = null
      try {
        href = resolveAdminPrefetchHref(link.href, window.location.href, adminRoute)
      } catch {
        return
      }
      if (href) queue.enqueue(href)
    }
    document.querySelectorAll<HTMLAnchorElement>('a.nav__link[href]').forEach(enqueueLink)
    const prefetchNavLink = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>('a.nav__link[href]')
      if (!link) return
      enqueueLink(link)
    }

    document.addEventListener('mouseover', prefetchNavLink, { passive: true })
    document.addEventListener('focusin', prefetchNavLink)
    return () => {
      document.removeEventListener('mouseover', prefetchNavLink)
      document.removeEventListener('focusin', prefetchNavLink)
      queue.dispose()
    }
  }, [adminRoute, settingsGroup, router])

  return (
    <>
      {settingsGroup && createPortal(<ToolLink {...analytics} pathname={pathname} />, settingsGroup)}
      {settingsGroup && createPortal(<ToolLink {...pageMap} pathname={pathname} />, settingsGroup)}
    </>
  )
}

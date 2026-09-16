import { Dumbbell, Gift, Home, Info, LayoutGrid, Newspaper, Phone, Send, Tag, Trophy, UsersRound, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { ContentAction } from '../ContentAction'
import { useHomeHref, useSite } from '../../content/ContentContext'
import { useActionLayer } from '../../actions/ActionLayer'
import { springLayout } from '../../lib/motion'
import { initialHeaderScrollState, navigationIconPreset, nextHeaderScrollState, type HeaderScrollState, type NavigationIconPreset } from './desktopHeaderState'

const navigationIcons: Record<NavigationIconPreset, LucideIcon> = {
  about: Info,
  article: Newspaper,
  coaches: UsersRound,
  courts: LayoutGrid,
  default: LayoutGrid,
  gift: Gift,
  home: Home,
  prices: Tag,
  training: Dumbbell,
  tournaments: Trophy,
}

function NavigationIcon({ href, icon }: { href: string; icon?: { url: string } | null }) {
  if (icon) return <img src={icon.url} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
  const Icon = navigationIcons[navigationIconPreset(href)]
  return <Icon aria-hidden="true" size={16} strokeWidth={1.9} />
}

export function DesktopHeader() {
  const site = useSite()
  const homeHref = useHomeHref()
  const { requestContact } = useActionLayer()
  const telegram = site.footer.socialLinks.find(({ provider }) => provider === 'telegram')
  const vk = site.footer.socialLinks.find(({ provider }) => provider === 'vk')
  const showLogo = Boolean(site.brandLogo) && site.brandLogoMode !== 'text'
  const replaceBrand = showLogo && site.brandLogoMode === 'replace'
  const [scrollState, setScrollState] = useState<HeaderScrollState>(() => initialHeaderScrollState())
  const compact = scrollState.compact

  useEffect(() => {
    let frame: number | null = null
    const update = () => {
      frame = null
      setScrollState((current) => nextHeaderScrollState(current, window.scrollY))
    }
    const handleScroll = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  return <motion.header
    initial={{ opacity: 0, y: -24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 1.1 }}
    data-header-compact={compact ? 'true' : 'false'}
    data-header-direction={scrollState.direction ?? 'none'}
    className="desktop-header fixed inset-x-0 top-0 z-50 hidden justify-center md:flex"
  >
    <motion.div layout transition={springLayout} className={`desktop-header-island se-top-2 mx-4 flex items-center justify-between whitespace-nowrap bg-ink text-white ${compact ? 'gap-2 py-1.5 pl-4 pr-2' : 'gap-4 py-2.5 pl-7 pr-3'}`}>
      <a href={homeHref} className="flex shrink-0 items-center gap-2.5 leading-none">
        {showLogo ? <img src={site.brandLogo?.url} alt={site.brandName} className={replaceBrand ? 'h-9 max-w-[150px] object-contain' : 'h-7 w-7 object-contain'} /> : <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime" />}
        {!replaceBrand && <span className="flex flex-col">
          <span className="text-[14px] font-semibold tracking-[0] text-white">{site.brandName}</span>
          <span className="desktop-header-subtitle type-micro text-white/50">{site.headerSubtitle}</span>
        </span>}
      </a>

      <nav className="desktop-header-nav flex min-w-0 items-center gap-0.5" aria-label="Основная навигация">
        {site.desktopNavigation.map((link) => (
          <motion.a
            key={`${link.href}-${link.label}`}
            href={link.href}
            aria-label={link.label}
            title={link.label}
            className="desktop-header-nav-link se-1 type-caption flex h-[var(--control-sm)] shrink-0 items-center justify-center gap-2 px-2.5 py-1.5 font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2"
          >
            <span className="desktop-header-nav-icon" aria-hidden="true"><NavigationIcon href={link.href} icon={link.icon} /></span>
            <span className="desktop-header-nav-label">{link.label}</span>
          </motion.a>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        {telegram && <motion.a
          href={telegram.url}
          data-analytics-action="telegram"
          onClick={(event) => { event.preventDefault(); requestContact('telegram') }}
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          className="se-1 hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 lg:flex"
        >
          <Send size={14} />
        </motion.a>}
        {vk && <motion.a
          href={vk.url}
          data-analytics-action="vk"
          onClick={(event) => { event.preventDefault(); requestContact('vk') }}
          target="_blank"
          rel="noreferrer"
          aria-label="VK"
          className="se-1 type-micro hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 lg:flex"
        >
          VK
        </motion.a>}
        <motion.a
          href={`tel:${site.contacts.phoneValue}`}
          data-analytics-action="phone"
          onClick={(event) => { event.preventDefault(); requestContact('phone') }}
          aria-label="Позвонить"
          className="se-1 flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2"
        >
          <Phone size={14} />
        </motion.a>
        <ContentAction action={{ mode: 'booking', label: site.booking.buttonLabel }} variant="primary" size="sm" />
      </div>
    </motion.div>
  </motion.header>
}

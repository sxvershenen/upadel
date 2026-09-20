import type { DesktopNavigationChild, DesktopNavigationItem } from '@unlim/content-contract'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, ChevronDown, Dumbbell, Gift, Home, Info, LayoutGrid, Newspaper, Tag, Trophy, UsersRound, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

import { useActionLayer } from '../../actions/ActionLayer'
import { useHomeHref, useSite } from '../../content/ContentContext'
import { springSnappy, tapScaleSm } from '../../lib/motion'
import { ContentAction } from '../ContentAction'
import { VkIcon } from '../ui/VkIcon'
import { PhoneIcon, TelegramIcon } from '../ui/ContactIcons'
import { bindHeaderScroll, desktopSubmenuKeyAction, HEADER_MORPH_LOCK_MS, HEADER_TOP_THRESHOLD, initialHeaderScrollState, navigationIconPreset, nextHeaderScrollState, type HeaderScrollState, type NavigationIconPreset } from './desktopHeaderState'

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

const iconHover = { scale: 1.08, y: -1 }
const headerMorphTransition = { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const }

function NavigationIcon({ href, icon, size = 16 }: { href: string; icon?: { url: string } | null; size?: number }) {
  const content = icon
    ? <img src={icon.url} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
    : (() => {
        const Icon = navigationIcons[navigationIconPreset(href)]
        return <Icon aria-hidden="true" size={size} strokeWidth={1.9} />
      })()
  return <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{content}</span>
}

function useWideHeader() {
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1200px)')
    const update = () => setWide(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return wide
}

function GooFilter({ id, strength = 7 }: { id: string; strength?: number }) {
  return <svg aria-hidden="true" width="0" height="0" className="absolute">
    <defs>
      <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
}

function CompactTooltip({ children, filterId, reduceMotion }: { children: ReactNode; filterId: string; reduceMotion: boolean }) {
  return <span role="tooltip" className="desktop-header-tooltip">
    <span aria-hidden="true" className="desktop-header-tooltip-surface" style={{ filter: reduceMotion ? undefined : `url(#${filterId})` }}>
      <span className="desktop-header-tooltip-source" />
      <span className="desktop-header-tooltip-bead" />
      <span className="desktop-header-tooltip-body" />
    </span>
    <span className="desktop-header-tooltip-label">{children}</span>
  </span>
}

function AnimatedNavigationContents({ expanded, item }: { expanded: boolean; item: DesktopNavigationChild }) {
  return <span data-header-nav-mode={expanded ? 'expanded' : 'compact'} className="desktop-header-nav-content relative grid place-items-center overflow-hidden">
    <span aria-hidden={!expanded} data-header-nav-label className="desktop-header-nav-label col-start-1 row-start-1 block">{item.label}</span>
    <span aria-hidden="true" data-header-nav-icon className="desktop-header-nav-icon col-start-1 row-start-1 inline-flex items-center justify-center"><NavigationIcon href={item.href} icon={item.icon} /></span>
  </span>
}

function MegaMenuPanel({ children, id, label, reduceMotion, triggerWidth, onNavigate }: { children: DesktopNavigationChild[]; id: string; label: string; reduceMotion: boolean; triggerWidth: number; onNavigate: () => void }) {
  const filterId = `mega-menu-goo-${useId().replaceAll(':', '')}`
  const originScale = Math.max(0.1, Math.min(0.42, triggerWidth / 440))
  const surfaceTransition = reduceMotion ? { duration: 0.01 } : { type: 'spring' as const, visualDuration: 0.3, bounce: 0.15 }

  return <motion.div className="absolute left-0 top-full z-20 w-[min(440px,calc(100vw-2rem))] pt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduceMotion ? { duration: 0.01 } : { duration: 0.14 }}>
    <GooFilter id={filterId} strength={8} />
    <div aria-hidden="true" className="pointer-events-none absolute -inset-x-3 -bottom-3 -top-2" style={{ filter: reduceMotion ? undefined : `url(#${filterId})` }}>
      <motion.span
        className="absolute top-0 h-4 rounded-full bg-black"
        style={{ left: Math.max(12, triggerWidth / 2 + 2), width: Math.max(18, Math.min(32, triggerWidth * 0.48)) }}
        initial={reduceMotion ? false : { opacity: 0, scaleX: 0.45, scaleY: 0.35, y: -5 }}
        animate={{ opacity: 1, scaleX: 1, scaleY: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleX: 0.5, scaleY: 0.35, y: -5 }}
        transition={surfaceTransition}
      />
      <motion.span
        className="absolute top-3 h-5 w-5 rounded-full bg-black"
        style={{ left: Math.max(18, triggerWidth / 2 + 8) }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.35, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.35, y: -8 }}
        transition={surfaceTransition}
      />
      <motion.span
        className="se-3 absolute inset-x-3 bottom-3 top-5 bg-black shadow-[0_22px_70px_-28px_rgba(0,0,0,.65)]"
        initial={reduceMotion ? false : { scaleX: originScale, scaleY: 0.16, y: -10 }}
        animate={{ scaleX: 1, scaleY: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleX: originScale, scaleY: 0.16, y: -10 }}
        transition={surfaceTransition}
        style={{ transformOrigin: `${Math.max(20, triggerWidth / 2)}px 0` }}
      />
    </div>
    <motion.div
      id={id}
      role="group"
      aria-label={`Раздел «${label}»`}
      className="relative grid grid-cols-3 gap-1 p-2 text-white ring-1 ring-white/12"
      initial={reduceMotion ? false : { opacity: 0, clipPath: `inset(0 ${Math.round((1 - originScale) * 100)}% 82% 0 round 18px)` }}
      animate={{ opacity: 1, clipPath: 'inset(0 0 0 0 round 18px)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, clipPath: `inset(0 ${Math.round((1 - originScale) * 100)}% 82% 0 round 18px)` }}
      transition={reduceMotion ? { duration: 0.01 } : { duration: 0.24, ease: [0.2, 0.8, 0.2, 1], delay: 0.04 }}
    >
      {children.map((child, index) => <motion.a
        key={`${child.href}-${child.label}`}
        href={child.href}
        data-analytics-action="internal"
        onClick={onNavigate}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reduceMotion ? { duration: 0.01 } : { duration: 0.16, delay: 0.09 + index * 0.025 }}
        className="se-2 flex min-h-[92px] flex-col justify-between gap-4 bg-white/8 p-3 type-caption font-medium text-white/65 transition-colors hover:bg-white/12 hover:text-white focus-visible:bg-white/12 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2"
      >
        <span className="inline-flex text-current" aria-hidden="true"><NavigationIcon href={child.href} icon={child.icon} size={17} /></span>
        <span className="flex items-center justify-between gap-2 text-current"><span>{child.label}</span><span aria-hidden="true">↗</span></span>
      </motion.a>)}
    </motion.div>
  </motion.div>
}

function DesktopNavigationLink({ compact, filterId, item, wide }: { compact: boolean; filterId: string; item: DesktopNavigationItem; wide: boolean }) {
  const children = item.children?.filter((child) => child.label && child.href) ?? []
  const hasMenu = children.length > 0
  const expanded = wide && !compact
  const reduceMotion = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const [triggerWidth, setTriggerWidth] = useState(40)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const closeTimer = useRef<number | null>(null)
  const openTimer = useRef<number | null>(null)
  const panelId = `desktop-submenu-${useId().replaceAll(':', '')}`

  const cancelTimers = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    if (openTimer.current !== null) window.clearTimeout(openTimer.current)
    closeTimer.current = null
    openTimer.current = null
  }
  const openMenu = () => {
    if (!hasMenu) return
    cancelTimers()
    setTriggerWidth(triggerRef.current?.offsetWidth ?? 40)
    setOpen(true)
  }
  const closeMenu = () => {
    cancelTimers()
    setOpen(false)
  }
  const scheduleOpen = () => {
    cancelTimers()
    openTimer.current = window.setTimeout(openMenu, compact ? 180 : 0)
  }
  const scheduleClose = () => {
    cancelTimers()
    closeTimer.current = window.setTimeout(() => {
      if (!rootRef.current?.matches(':focus-within')) setOpen(false)
    }, 120)
  }

  useEffect(() => () => cancelTimers(), [])
  useEffect(() => {
    if (!open) return
    const outsidePointer = (event: globalThis.PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) closeMenu()
    }
    document.addEventListener('pointerdown', outsidePointer, true)
    return () => document.removeEventListener('pointerdown', outsidePointer, true)
  }, [open])

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' && hasMenu) scheduleOpen()
  }
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) closeMenu()
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!hasMenu) return
    const action = desktopSubmenuKeyAction(event.key, open)
    if (action === 'open') {
      event.preventDefault()
      openMenu()
    } else if (action === 'close') {
      event.preventDefault()
      closeMenu()
      triggerRef.current?.focus()
    }
  }

  return <div
    ref={rootRef}
    data-submenu-open={open ? 'true' : 'false'}
    className="desktop-header-compact-control relative shrink-0"
    onPointerEnter={handlePointerEnter}
    onPointerLeave={hasMenu ? scheduleClose : undefined}
    onFocusCapture={hasMenu ? openMenu : undefined}
    onBlurCapture={hasMenu ? handleBlur : undefined}
    onKeyDown={hasMenu ? handleKeyDown : undefined}
  >
    <motion.a
      ref={triggerRef}
      href={item.href}
      data-analytics-action="internal"
      aria-label={item.label}
      aria-haspopup={hasMenu ? true : undefined}
      aria-expanded={hasMenu ? open : undefined}
      aria-controls={hasMenu ? panelId : undefined}
      whileHover={reduceMotion ? undefined : iconHover}
      whileTap={reduceMotion ? undefined : tapScaleSm}
      transition={springSnappy}
      className={`desktop-header-nav-link se-1 relative flex h-[var(--control-sm)] shrink-0 items-center justify-center gap-2 overflow-hidden py-1.5 font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 ${expanded ? 'px-2.5 type-caption' : 'w-[var(--control-sm)] px-0 type-caption'}`}
    >
      <AnimatedNavigationContents expanded={expanded} item={item} />
      {hasMenu && <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="desktop-header-nav-chevron inline-flex" aria-hidden="true"><ChevronDown size={13} /></motion.span>}
    </motion.a>
    {!expanded && !hasMenu && <CompactTooltip filterId={filterId} reduceMotion={reduceMotion}>{item.label}</CompactTooltip>}
    <AnimatePresence initial={false}>
      {hasMenu && open && <MegaMenuPanel children={children} id={panelId} label={item.label} reduceMotion={reduceMotion} triggerWidth={triggerWidth} onNavigate={closeMenu} />}
    </AnimatePresence>
  </div>
}

function HeaderBrand({ compact, filterId, homeHref, logo, logoMode, name, reduceMotion, subtitle }: { compact: boolean; filterId: string; homeHref: string; logo?: { url: string } | null; logoMode: 'text' | 'prefix' | 'replace'; name: string; reduceMotion: boolean; subtitle: string }) {
  const showLogo = Boolean(logo) && logoMode !== 'text'
  const replaceBrand = showLogo && logoMode === 'replace'
  return <div className="desktop-header-brand desktop-header-compact-control relative shrink-0">
    <motion.a href={homeHref} aria-label={name} whileHover={compact && !reduceMotion ? iconHover : undefined} whileTap={compact && !reduceMotion ? tapScaleSm : undefined} transition={springSnappy} className={`flex h-[var(--control-sm)] shrink-0 items-center justify-center overflow-hidden leading-none focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 ${compact ? 'w-[var(--control-sm)] text-white/70 hover:text-white' : 'text-white'}`}>
      <span data-header-brand-mode={compact ? 'compact' : 'expanded'} className="desktop-header-brand-content grid place-items-center">
        <span data-header-brand-icon className="col-start-1 row-start-1 inline-flex items-center justify-center" aria-hidden={!compact}><Home aria-hidden="true" size={17} strokeWidth={1.9} /></span>
        <span data-header-brand-label className="col-start-1 row-start-1 flex items-center gap-2.5" aria-hidden={compact}>
          {showLogo ? <img src={logo?.url} alt="" aria-hidden="true" className={replaceBrand ? 'h-9 max-w-[150px] object-contain' : 'h-7 w-7 object-contain'} /> : <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime" />}
          {!replaceBrand && <span className="flex flex-col"><span className="text-[14px] font-semibold tracking-[0] text-white">{name}</span><span className="desktop-header-subtitle type-micro text-white/50">{subtitle}</span></span>}
        </span>
      </span>
    </motion.a>
    {compact && <CompactTooltip filterId={filterId} reduceMotion={reduceMotion}>Главная</CompactTooltip>}
  </div>
}

function UtilityControl({ className = '', compact, filterId, label, reduceMotion, children }: { className?: string; compact: boolean; filterId: string; label: string; reduceMotion: boolean; children: ReactNode }) {
  return <div className={`desktop-header-compact-control relative shrink-0 ${className}`}>{children}{compact && <CompactTooltip filterId={filterId} reduceMotion={reduceMotion}>{label}</CompactTooltip>}</div>
}

function BookingControl({ compact, label }: { compact: boolean; label: string }) {
  return <div data-booking-mode={compact ? 'compact' : 'expanded'} className="desktop-header-booking-control relative h-[var(--control-sm)] shrink-0">
    <ContentAction reveal={false} action={{ mode: 'booking', label }} variant="primary" size="sm" aria-label={label} className="h-[var(--control-sm)] w-full overflow-hidden px-0">
      <span className="grid place-items-center">
        <span data-booking-icon className="col-start-1 row-start-1 inline-flex items-center justify-center" aria-hidden={!compact}><CalendarCheck aria-hidden="true" size={17} strokeWidth={1.9} /></span>
        <span data-booking-label className="col-start-1 row-start-1 block" aria-hidden={compact}>{label}</span>
      </span>
    </ContentAction>
  </div>
}

export function DesktopHeader() {
  const site = useSite()
  const homeHref = useHomeHref()
  const { requestContact } = useActionLayer()
  const telegram = site.footer.socialLinks.find(({ provider }) => provider === 'telegram')
  const vk = site.footer.socialLinks.find(({ provider }) => provider === 'vk')
  const [scrollState, setScrollState] = useState<HeaderScrollState>(() => initialHeaderScrollState())
  const [tooltipSuppressed, setTooltipSuppressed] = useState(false)
  const morphLockUntilRef = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const wide = useWideHeader()
  const compact = scrollState.compact
  const reduceMotion = useReducedMotion() ?? false
  const tooltipFilterId = `header-tooltip-goo-${useId().replaceAll(':', '')}`

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const brand = header.querySelector<HTMLElement>('[data-header-brand-label]')!
    const links = Array.from(header.querySelectorAll<HTMLElement>('.desktop-header-nav-link'))
    const intrinsicWidth = (element: HTMLElement) => Math.ceil(Number.parseFloat(getComputedStyle(element).width) || element.scrollWidth)
    const measure = () => {
      header.style.setProperty('--header-brand-width', `${intrinsicWidth(brand)}px`)
      links.forEach((link) => {
        const label = link.querySelector<HTMLElement>('[data-header-nav-label]')!
        link.style.setProperty('--header-link-width', `${intrinsicWidth(label) + 20 + (link.hasAttribute('aria-haspopup') ? 21 : 0)}px`)
      })
      const utilities = Array.from(header.querySelectorAll<HTMLElement>('.desktop-header-utility-link'))
      const visibleUtilities = utilities.filter((link) => link.getClientRects().length > 0)
      const controlSize = visibleUtilities[0]?.offsetHeight || 40
      header.style.setProperty('--header-compact-width', `${(links.length + visibleUtilities.length + 2) * controlSize + 24}px`)
      header.dataset.headerGeometryReady = 'true'
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(brand)
    links.forEach((link) => observer.observe(link.querySelector('[data-header-nav-label]')!))
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [site.brandName, site.brandLogo?.url, site.desktopNavigation])

  useEffect(() => {
    const suppressTooltips = () => setTooltipSuppressed(true)
    const disposeScroll = bindHeaderScroll({
      scrollTarget: window,
      lifecycleTarget: document,
      onScroll: (scrollY) => setScrollState((current) => {
        const next = nextHeaderScrollState(current, scrollY)
        if (next.compact === current.compact) return next
        if (next.lastY <= HEADER_TOP_THRESHOLD) {
          morphLockUntilRef.current = 0
          return next
        }
        const now = performance.now()
        if (now < morphLockUntilRef.current) return { ...next, compact: current.compact }
        morphLockUntilRef.current = now + HEADER_MORPH_LOCK_MS
        return next
      }),
    })
    window.addEventListener('scroll', suppressTooltips, { passive: true })
    document.addEventListener('astro:after-swap', suppressTooltips)
    document.addEventListener('swup:page:view', suppressTooltips)
    return () => {
      disposeScroll()
      window.removeEventListener('scroll', suppressTooltips)
      document.removeEventListener('astro:after-swap', suppressTooltips)
      document.removeEventListener('swup:page:view', suppressTooltips)
    }
  }, [])

  const utilityClass = compact ? 'bg-transparent text-white/70 hover:text-white' : 'se-1 bg-white/10 text-white hover:bg-white/20'

  return <motion.header ref={headerRef} initial={false} animate={{ '--header-progress': compact ? 1 : 0 }} transition={reduceMotion ? { duration: 0 } : headerMorphTransition} data-header-compact={compact ? 'true' : 'false'} data-header-direction={scrollState.direction ?? 'none'} data-header-scroll="true" data-header-tooltips={tooltipSuppressed ? 'suppressed' : 'ready'} onClickCapture={() => setTooltipSuppressed(true)} onFocusCapture={() => setTooltipSuppressed(false)} onPointerLeave={() => setTooltipSuppressed(false)} onPointerMove={() => setTooltipSuppressed(false)} className="desktop-header fixed inset-x-0 top-0 z-50 hidden justify-center md:flex">
    <GooFilter id={tooltipFilterId} strength={5} />
      <div className={`desktop-header-island se-top-2 mx-4 flex h-[60px] items-center whitespace-nowrap bg-black text-white ${compact ? 'gap-0 py-1.5 pl-3 pr-2' : 'justify-between gap-4 py-2.5 pl-7 pr-3'}`}>
      <HeaderBrand compact={compact} filterId={tooltipFilterId} homeHref={homeHref} logo={site.brandLogo} logoMode={site.brandLogoMode} name={site.brandName} reduceMotion={reduceMotion} subtitle={site.headerSubtitle} />
      <nav className={`desktop-header-nav flex min-w-0 items-center ${compact ? 'gap-0' : 'gap-0.5'}`} aria-label="Основная навигация">
        {site.desktopNavigation.map((item) => <DesktopNavigationLink key={`${item.href}-${item.label}`} compact={compact} filterId={tooltipFilterId} item={item} wide={wide} />)}
      </nav>
      <div className={`desktop-header-utilities flex shrink-0 items-center ${compact ? 'gap-0' : 'gap-1.5'}`}>
        {telegram && <UtilityControl className="hidden lg:block" compact={compact} filterId={tooltipFilterId} label="Telegram" reduceMotion={reduceMotion}><motion.a href={telegram.url} data-contact-confirmed data-analytics-action="telegram" onClick={(event) => { event.preventDefault(); requestContact('telegram') }} target="_blank" rel="noreferrer" aria-label="Telegram" whileHover={reduceMotion ? undefined : iconHover} whileTap={reduceMotion ? undefined : tapScaleSm} transition={springSnappy} className={`desktop-header-utility-link flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 ${utilityClass}`}><TelegramIcon size={16} /></motion.a></UtilityControl>}
        {vk && <UtilityControl className="hidden lg:block" compact={compact} filterId={tooltipFilterId} label="VK" reduceMotion={reduceMotion}><motion.a href={vk.url} data-contact-confirmed data-analytics-action="vk" onClick={(event) => { event.preventDefault(); requestContact('vk') }} target="_blank" rel="noreferrer" aria-label="VK" whileHover={reduceMotion ? undefined : iconHover} whileTap={reduceMotion ? undefined : tapScaleSm} transition={springSnappy} className={`desktop-header-utility-link flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 ${utilityClass}`}><VkIcon size={18} /></motion.a></UtilityControl>}
        <UtilityControl compact={compact} filterId={tooltipFilterId} label="Позвонить" reduceMotion={reduceMotion}><motion.a href={`tel:${site.contacts.phoneValue}`} data-contact-confirmed data-analytics-action="phone" onClick={(event) => { event.preventDefault(); requestContact('phone') }} aria-label="Позвонить" whileHover={reduceMotion ? undefined : iconHover} whileTap={reduceMotion ? undefined : tapScaleSm} transition={springSnappy} className={`desktop-header-utility-link flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 ${utilityClass}`}><PhoneIcon size={16} /></motion.a></UtilityControl>
        <UtilityControl compact={compact} filterId={tooltipFilterId} label={site.booking.buttonLabel} reduceMotion={reduceMotion}><BookingControl compact={compact} label={site.booking.buttonLabel} /></UtilityControl>
      </div>
    </div>
  </motion.header>
}

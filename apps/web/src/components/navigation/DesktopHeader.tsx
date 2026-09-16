import type { DesktopNavigationChild, DesktopNavigationItem } from '@unlim/content-contract'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, ChevronDown, Dumbbell, Gift, Home, Info, LayoutGrid, Newspaper, Phone, Send, Tag, Trophy, UsersRound, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react'

import { useActionLayer } from '../../actions/ActionLayer'
import { useHomeHref, useSite } from '../../content/ContentContext'
import { VkIcon } from '../ui/VkIcon'
import { springLayout, springSnappy, tapScaleSm } from '../../lib/motion'
import { ContentAction } from '../ContentAction'
import { bindHeaderScroll, desktopSubmenuKeyAction, initialHeaderScrollState, navigationIconPreset, nextHeaderScrollState, type HeaderScrollState, type NavigationIconPreset } from './desktopHeaderState'

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

function NavigationIcon({ href, icon, size = 16 }: { href: string; icon?: { url: string } | null; size?: number }) {
  if (icon) return <img src={icon.url} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
  const Icon = navigationIcons[navigationIconPreset(href)]
  return <Icon aria-hidden="true" size={size} strokeWidth={1.9} />
}

function useWideHeader() {
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1200px)')
    const update = () => setWide(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return wide
}

function AnimatedNavigationContents({ expanded, item }: { expanded: boolean; item: DesktopNavigationChild }) {
  return <AnimatePresence initial={false} mode="popLayout">
    {expanded ? <motion.span
      key="label"
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'auto' }}
      exit={{ opacity: 0, width: 0 }}
      transition={springSnappy}
      className="block overflow-hidden"
    >{item.label}</motion.span> : <motion.span
      key="icon"
      initial={{ opacity: 0, scale: 0.75, width: 0 }}
      animate={{ opacity: 1, scale: 1, width: 16 }}
      exit={{ opacity: 0, scale: 0.75, width: 0 }}
      transition={springSnappy}
      className="inline-flex shrink-0 items-center justify-center overflow-hidden"
      aria-hidden="true"
    ><NavigationIcon href={item.href} icon={item.icon} /></motion.span>}
  </AnimatePresence>
}

function MegaMenuPanel({ children, id, label, layoutId, reduceMotion, onNavigate }: { children: DesktopNavigationChild[]; id: string; label: string; layoutId: string; reduceMotion: boolean; onNavigate: () => void }) {
  return <motion.div
    className="absolute left-0 top-full z-20 w-[min(440px,calc(100vw-2rem))] pt-3"
    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, clipPath: 'inset(0 82% 82% 0 round 10px)' }}
    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, clipPath: 'inset(0 0 0 0 round 20px)' }}
    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, clipPath: 'inset(0 82% 82% 0 round 10px)' }}
    transition={reduceMotion ? { duration: 0.01 } : springLayout}
    style={{ originX: 0.08, originY: 0 }}
  >
    <motion.div
      id={id}
      layoutId={reduceMotion ? undefined : layoutId}
      role="group"
      aria-label={`Раздел «${label}»`}
      className="se-3 grid grid-cols-3 gap-1 bg-black p-2 text-white shadow-[0_22px_70px_-28px_rgba(0,0,0,.65)] ring-1 ring-white/12"
      transition={springLayout}
    >
      {children.map((child) => <motion.a
        key={`${child.href}-${child.label}`}
        href={child.href}
        data-analytics-action="internal"
        onClick={onNavigate}
        whileHover={reduceMotion ? undefined : { y: -2 }}
        transition={springSnappy}
        className="se-2 flex min-h-[92px] flex-col justify-between gap-4 bg-white/8 p-3 type-caption font-medium text-white/75 transition-colors hover:bg-lime hover:text-ink focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white" aria-hidden="true"><NavigationIcon href={child.href} icon={child.icon} size={17} /></span>
        <span className="flex items-center justify-between gap-2"><span>{child.label}</span><span aria-hidden="true" className="text-white/45">↗</span></span>
      </motion.a>)}
    </motion.div>
  </motion.div>
}

function DesktopNavigationLink({ compact, item, wide }: { compact: boolean; item: DesktopNavigationItem; wide: boolean }) {
  const children = item.children?.filter((child) => child.label && child.href) ?? []
  const hasMenu = children.length > 0
  const expanded = wide && !compact
  const reduceMotion = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const closeTimer = useRef<number | null>(null)
  const reactId = useId().replaceAll(':', '')
  const panelId = `desktop-submenu-${reactId}`
  const layoutId = `desktop-submenu-surface-${reactId}`

  const cancelClose = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    closeTimer.current = null
  }
  const openMenu = () => {
    if (!hasMenu) return
    cancelClose()
    setTooltipOpen(false)
    setOpen(true)
  }
  const closeMenu = () => {
    cancelClose()
    setOpen(false)
  }
  const openTooltip = () => {
    if (!expanded && !hasMenu) setTooltipOpen(true)
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => {
      if (!rootRef.current?.matches(':focus-within')) setOpen(false)
    }, 110)
  }

  useEffect(() => () => cancelClose(), [])
  useEffect(() => {
    if (!open) return
    const outsidePointer = (event: globalThis.PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) closeMenu()
    }
    document.addEventListener('pointerdown', outsidePointer, true)
    return () => document.removeEventListener('pointerdown', outsidePointer, true)
  }, [open])

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    if (hasMenu) openMenu()
    else openTooltip()
  }
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
      closeMenu()
      setTooltipOpen(false)
    }
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
    className="relative shrink-0"
    onPointerEnter={handlePointerEnter}
    onPointerLeave={hasMenu ? scheduleClose : !expanded ? () => setTooltipOpen(false) : undefined}
    onFocusCapture={hasMenu ? openMenu : openTooltip}
    onBlurCapture={hasMenu || !expanded ? handleBlur : undefined}
    onKeyDown={hasMenu ? handleKeyDown : undefined}
  >
    <motion.a
      ref={triggerRef}
      layout
      href={item.href}
      data-analytics-action="internal"
      aria-label={item.label}
      aria-haspopup={hasMenu ? true : undefined}
      aria-expanded={hasMenu ? open : undefined}
      aria-controls={hasMenu ? panelId : undefined}
      title={item.label}
      whileHover={reduceMotion ? undefined : iconHover}
      whileTap={reduceMotion ? undefined : tapScaleSm}
      transition={springLayout}
      className={`desktop-header-nav-link se-1 relative flex h-[var(--control-sm)] shrink-0 items-center justify-center gap-2 overflow-hidden py-1.5 font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 ${expanded ? 'px-2.5 type-caption' : 'w-[var(--control-sm)] px-0 type-caption'}`}
    >
      <AnimatedNavigationContents expanded={expanded} item={item} />
      {hasMenu && expanded && <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="inline-flex" aria-hidden="true"><ChevronDown size={13} /></motion.span>}
    </motion.a>
    <AnimatePresence initial={false}>
      {!expanded && !hasMenu && tooltipOpen && <motion.span
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.92, clipPath: 'inset(0 50% 100% 50% round 999px)' }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0 0 0 0 round 999px)' }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -3, scale: 0.94, clipPath: 'inset(0 50% 100% 50% round 999px)' }}
        transition={reduceMotion ? { duration: 0.01 } : springSnappy}
        className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-40 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-3 py-1.5 type-micro font-medium text-white shadow-[0_12px_28px_-16px_rgba(0,0,0,.8)] ring-1 ring-white/15"
      >{item.label}</motion.span>}
    </AnimatePresence>
    <AnimatePresence initial={false}>
      {hasMenu && open && <MegaMenuPanel children={children} id={panelId} label={item.label} layoutId={layoutId} reduceMotion={reduceMotion} onNavigate={closeMenu} />}
    </AnimatePresence>
  </div>
}

function HeaderBrand({ compact, homeHref, logo, logoMode, name, subtitle }: { compact: boolean; homeHref: string; logo?: { url: string } | null; logoMode: 'text' | 'prefix' | 'replace'; name: string; subtitle: string }) {
  const showLogo = Boolean(logo) && logoMode !== 'text'
  const replaceBrand = showLogo && logoMode === 'replace'
  return <motion.a
    layout
    href={homeHref}
    aria-label={name}
    title={name}
    whileHover={compact ? iconHover : undefined}
    whileTap={compact ? tapScaleSm : undefined}
    transition={springLayout}
    className="flex h-[var(--control-sm)] shrink-0 items-center justify-center overflow-hidden leading-none focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2"
  >
    <AnimatePresence initial={false} mode="popLayout">
      {compact ? <motion.span key="home" initial={{ opacity: 0, scale: 0.7, width: 0 }} animate={{ opacity: 1, scale: 1, width: 24 }} exit={{ opacity: 0, scale: 0.7, width: 0 }} transition={springSnappy} className="inline-flex items-center justify-center"><Home aria-hidden="true" size={17} /></motion.span> : <motion.span key="brand" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={springLayout} className="flex items-center gap-2.5 overflow-hidden">
        {showLogo ? <img src={logo?.url} alt="" aria-hidden="true" className={replaceBrand ? 'h-9 max-w-[150px] object-contain' : 'h-7 w-7 object-contain'} /> : <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime" />}
        {!replaceBrand && <span className="flex flex-col"><span className="text-[14px] font-semibold tracking-[0] text-white">{name}</span><span className="desktop-header-subtitle type-micro text-white/50">{subtitle}</span></span>}
      </motion.span>}
    </AnimatePresence>
  </motion.a>
}

export function DesktopHeader() {
  const site = useSite()
  const homeHref = useHomeHref()
  const { requestContact } = useActionLayer()
  const telegram = site.footer.socialLinks.find(({ provider }) => provider === 'telegram')
  const vk = site.footer.socialLinks.find(({ provider }) => provider === 'vk')
  const [scrollState, setScrollState] = useState<HeaderScrollState>(() => initialHeaderScrollState())
  const headerRef = useRef<HTMLElement>(null)
  const wide = useWideHeader()
  const compact = scrollState.compact

  useEffect(() => {
    headerRef.current?.setAttribute('data-header-hydrated', 'true')
    const disposeScroll = bindHeaderScroll({
      scrollTarget: window,
      lifecycleTarget: document,
      onScroll: (scrollY) => setScrollState((current) => nextHeaderScrollState(current, scrollY)),
    })
    return () => {
      disposeScroll()
      headerRef.current?.removeAttribute('data-header-hydrated')
    }
  }, [])

  const utilityClass = compact
    ? 'bg-transparent text-white hover:bg-white/10'
    : 'se-1 bg-white/10 text-white hover:bg-white/20'

  return <motion.header
    ref={headerRef}
    initial={{ opacity: 0, y: -24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 1.1 }}
    data-header-compact={compact ? 'true' : 'false'}
    data-header-direction={scrollState.direction ?? 'none'}
    data-header-hydrated="false"
    data-header-scroll="true"
    className="desktop-header fixed inset-x-0 top-0 z-50 hidden justify-center md:flex"
  >
    <motion.div layout transition={springLayout} className={`desktop-header-island se-top-2 mx-4 flex items-center justify-between whitespace-nowrap bg-black text-white ${compact ? 'gap-0 py-1.5 pl-5 pr-2' : 'gap-4 py-2.5 pl-7 pr-3'}`}>
      <HeaderBrand compact={compact} homeHref={homeHref} logo={site.brandLogo} logoMode={site.brandLogoMode} name={site.brandName} subtitle={site.headerSubtitle} />

      <nav className={`desktop-header-nav flex min-w-0 items-center ${compact ? 'gap-0' : 'gap-0.5'}`} aria-label="Основная навигация">
        {site.desktopNavigation.map((item) => <DesktopNavigationLink key={`${item.href}-${item.label}`} compact={compact} item={item} wide={wide} />)}
      </nav>

      <motion.div layout transition={springLayout} className={`desktop-header-utilities flex shrink-0 items-center ${compact ? 'gap-0' : 'gap-1.5'}`}>
        {telegram && <motion.a
          layout
          href={telegram.url}
          data-analytics-action="telegram"
          onClick={(event) => { event.preventDefault(); requestContact('telegram') }}
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          title="Telegram"
          whileHover={iconHover}
          whileTap={tapScaleSm}
          transition={springLayout}
          className={`desktop-header-utility-link hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 lg:flex ${utilityClass}`}
        ><Send aria-hidden="true" size={14} /></motion.a>}
        {vk && <motion.a
          layout
          href={vk.url}
          data-analytics-action="vk"
          onClick={(event) => { event.preventDefault(); requestContact('vk') }}
          target="_blank"
          rel="noreferrer"
          aria-label="VK"
          title="VK"
          whileHover={iconHover}
          whileTap={tapScaleSm}
          transition={springLayout}
          className={`desktop-header-utility-link type-micro hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center font-semibold focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 lg:flex ${utilityClass}`}
        ><VkIcon size={15} /></motion.a>}
        <motion.a
          layout
          href={`tel:${site.contacts.phoneValue}`}
          data-analytics-action="phone"
          onClick={(event) => { event.preventDefault(); requestContact('phone') }}
          aria-label="Позвонить"
          title="Позвонить"
          whileHover={iconHover}
          whileTap={tapScaleSm}
          transition={springLayout}
          className={`desktop-header-utility-link flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 ${utilityClass}`}
        ><Phone aria-hidden="true" size={14} /></motion.a>
        <ContentAction
          action={{ mode: 'booking', label: site.booking.buttonLabel }}
          variant="primary"
          size="sm"
          aria-label={site.booking.buttonLabel}
          title={site.booking.buttonLabel}
          layout
          transition={springLayout}
          className={`overflow-hidden ${compact ? 'w-[var(--control-sm)] px-0' : ''}`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {compact ? <motion.span key="icon" initial={{ opacity: 0, scale: 0.7, width: 0 }} animate={{ opacity: 1, scale: 1, width: 18 }} exit={{ opacity: 0, scale: 0.7, width: 0 }} transition={springSnappy} className="inline-flex items-center justify-center"><CalendarCheck aria-hidden="true" size={17} /></motion.span> : <motion.span key="label" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={springSnappy} className="block overflow-hidden">{site.booking.buttonLabel}</motion.span>}
          </AnimatePresence>
        </ContentAction>
      </motion.div>
    </motion.div>
  </motion.header>
}

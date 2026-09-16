import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { CalendarCheck, Dumbbell, Gift, Home, Info, Newspaper, Phone, Send, Tag, Trophy, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { VkIcon } from '../ui/VkIcon'
import { HEADER_MORPH_LOCK_MS, HEADER_TOP_THRESHOLD } from './desktopHeaderState'
import { initialHeaderPlaygroundScrollState, nextHeaderPlaygroundScrollState } from './headerPlaygroundState'

type PlaygroundNavItem = {
  href: string
  icon: LucideIcon
  label: string
}

const navItems: PlaygroundNavItem[] = [
  { label: 'Цены', href: '/prices', icon: Tag },
  { label: 'Тренировки', href: '/training', icon: Dumbbell },
  { label: 'Турниры', href: '/tournaments', icon: Trophy },
  { label: 'Статьи', href: '/blog', icon: Newspaper },
  { label: 'Подарить', href: '/gift', icon: Gift },
  { label: 'О нас', href: '/about', icon: Info },
]

const shellSpring = { type: 'spring' as const, visualDuration: 0.2, bounce: 0.06, velocity: 0 }
const contentTransition = { duration: 0.16, ease: [0.2, 0.8, 0.2, 1] as const }

function useCompactHeader() {
  const [scrollState, setScrollState] = useState(() => initialHeaderPlaygroundScrollState(typeof window === 'undefined' ? 0 : window.scrollY))
  const morphLockUntilRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      frameRef.current = null
      setScrollState((current) => {
        const next = nextHeaderPlaygroundScrollState(current, window.scrollY)
        if (next.compact === current.compact) return next
        if (next.lastY <= HEADER_TOP_THRESHOLD) {
          morphLockUntilRef.current = 0
          return next
        }
        const now = performance.now()
        if (now < morphLockUntilRef.current) return { ...next, compact: current.compact }
        morphLockUntilRef.current = now + HEADER_MORPH_LOCK_MS
        return next
      })
    }
    const onScroll = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return scrollState.compact
}

function ExpandedNav() {
  return <motion.div
    key="expanded-nav"
    initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
    transition={contentTransition}
    className="dynamic-island-expanded-nav"
  >
    <a href="/" className="dynamic-island-brand" aria-label="UNLIM RIGA PADEL — главная">
      <span className="dynamic-island-brand-mark" aria-hidden="true" />
      <span className="dynamic-island-brand-copy"><strong>UNLIM RIGA PADEL</strong><small>Новорижское шоссе 3к1</small></span>
    </a>
    <nav className="dynamic-island-text-nav" aria-label="Основная навигация playground">
      {navItems.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
    </nav>
    <div className="dynamic-island-actions">
      <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram"><Send aria-hidden="true" size={17} strokeWidth={1.9} /></a>
      <a href="https://vk.com" target="_blank" rel="noreferrer" aria-label="VK"><VkIcon size={18} /></a>
      <a href="tel:+79990000000" aria-label="Позвонить"><Phone aria-hidden="true" size={17} strokeWidth={1.9} /></a>
      <a href="#header-playground-content" className="dynamic-island-booking"><span>Забронировать</span><CalendarCheck aria-hidden="true" size={17} strokeWidth={1.9} /></a>
    </div>
  </motion.div>
}

function CompactNav() {
  return <motion.div
    key="compact-nav"
    initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
    transition={contentTransition}
    className="dynamic-island-compact-nav"
  >
    <a href="/" aria-label="Главная"><Home aria-hidden="true" size={18} strokeWidth={1.9} /></a>
    {navItems.map(({ href, label, icon: Icon }) => <a key={href} href={href} aria-label={label}><Icon aria-hidden="true" size={17} strokeWidth={1.9} /></a>)}
    <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram"><Send aria-hidden="true" size={17} strokeWidth={1.9} /></a>
    <a href="https://vk.com" target="_blank" rel="noreferrer" aria-label="VK"><VkIcon size={18} /></a>
    <a href="tel:+79990000000" aria-label="Позвонить"><Phone aria-hidden="true" size={17} strokeWidth={1.9} /></a>
    <a href="#header-playground-content" className="dynamic-island-compact-booking" aria-label="Забронировать"><CalendarCheck aria-hidden="true" size={18} strokeWidth={1.9} /></a>
  </motion.div>
}

export function HeaderPlayground() {
  const compact = useCompactHeader()
  const reduceMotion = useReducedMotion() ?? false
  const transition = reduceMotion ? { layout: { duration: 0.01 } } : { layout: shellSpring }

  return <MotionConfig reducedMotion="user">
    <header className="dynamic-island-playground-header" data-header-playground-state={compact ? 'compact' : 'expanded'}>
      <motion.div layout transition={transition} className="dynamic-island-shell" data-state={compact ? 'compact' : 'expanded'}>
        <AnimatePresence initial={false} mode="popLayout">
          {compact ? <CompactNav /> : <ExpandedNav />}
        </AnimatePresence>
      </motion.div>
    </header>
  </MotionConfig>
}

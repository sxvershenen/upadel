import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { springSnappy, tapScaleSm } from '../../lib/motion'

export type BackLink = { href: string; label?: string }

export function FloatingBackLink({ href, label = 'Назад' }: BackLink) {
  return <motion.a
    href={href}
    aria-label={label}
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: -3 }}
    whileTap={tapScaleSm}
    transition={springSnappy}
    className="se-full fixed left-[var(--page-gutter)] top-2.5 z-[60] hidden min-h-[var(--control-sm)] items-center gap-1.5 border border-white/55 bg-white/72 px-3 type-caption text-ink-soft shadow-[0_8px_24px_-14px_rgba(20,20,26,.72)] backdrop-blur-xl transition-colors hover:bg-white/90 hover:text-ink focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 md:inline-flex"
  >
    <ArrowLeft aria-hidden="true" size={14} />
    {label}
  </motion.a>
}

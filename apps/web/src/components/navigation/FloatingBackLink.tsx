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
    className="se-full fixed left-4 top-2.5 z-[60] hidden min-h-[var(--control-sm)] items-center gap-1.5 bg-control px-3 type-caption text-ink-soft shadow-[0_8px_18px_-12px_rgba(20,20,26,.8)] transition-colors hover:bg-control-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 md:inline-flex xl:left-8"
  >
    <ArrowLeft aria-hidden="true" size={14} />
    {label}
  </motion.a>
}

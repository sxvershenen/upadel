import type { ActionDTO } from '@unlim/content-contract'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { springSoft } from '../../lib/motion'
import { ContentAction } from '../ContentAction'
import { cardVariants } from '../ui/Card'

/** One keyboard-accessible action covers the card without nested buttons. */
export function CardAction({ action, title, sourcePage, children }: { action: ActionDTO; title: string; sourcePage?: string; children: ReactNode }) {
  return <motion.div initial="rest" whileHover={action.mode !== 'none' ? 'hover' : undefined} variants={cardVariants} transition={springSoft} className="group/card card-spring relative h-full">
    {children}
    {action.mode !== 'none' && <ContentAction
      action={action} sourceEntity={title} sourcePage={sourcePage} mobileQuickActions
      aria-label={action.label || title} reveal={false} variant="neutral"
      className="!absolute inset-0 z-20 !h-full !w-full !rounded-[var(--se-3)] !bg-transparent !p-0 hover:!bg-transparent focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2"
    ><span className="sr-only">{action.label || title}</span></ContentAction>}
  </motion.div>
}

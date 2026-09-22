import type { HomepageDTO } from '@unlim/content-contract'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { IconButton } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'

type GalleryItem = HomepageDTO['entities']['gallery'][number]

export function GalleryLightbox({ active, items, onChange }: { active: number | null; items: GalleryItem[]; onChange: (index: number | null) => void }) {
  const current = active == null ? null : items[active]
  const move = (step: number) => {
    if (active == null || items.length < 2) return
    onChange((active + step + items.length) % items.length)
  }

  return <Dialog open={current !== null} onClose={() => onChange(null)} title={current?.title ?? 'Галерея'}>
    <AnimatePresence mode="wait" initial={false}>
      {current && <motion.figure
        key={current.id}
        initial={{ opacity: 0, scale: 0.975, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.985, y: -6 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="se-4 overflow-hidden bg-surface-muted">
          <ProgressiveImage media={current.media} alt={current.media.alt} className="se-4 max-h-[68svh] w-full object-contain" />
        </div>
        <figcaption className="type-body-sm mt-4 text-ink-soft">{current.caption || current.title}</figcaption>
        {items.length > 1 && <div className="mt-5 flex justify-end gap-2">
          <IconButton aria-label="Предыдущее изображение" variant="neutral" onClick={() => move(-1)}><ChevronLeft /></IconButton>
          <IconButton aria-label="Следующее изображение" variant="neutral" onClick={() => move(1)}><ChevronRight /></IconButton>
        </div>}
      </motion.figure>}
    </AnimatePresence>
  </Dialog>
}

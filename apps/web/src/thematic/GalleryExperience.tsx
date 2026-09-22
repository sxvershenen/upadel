import type { HomepageDTO } from '@unlim/content-contract'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

import { IconButton } from '../components/ui/Button'
import { horizontalSwiperProps } from '../lib/swiper'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'
import { GalleryLightbox } from './GalleryLightbox'

type GalleryItem = HomepageDTO['entities']['gallery'][number]

function GalleryButton({ item, onOpen, className = '' }: { item: GalleryItem; onOpen: () => void; className?: string }) {
  return <button type="button" onClick={onOpen} className={`se-3 group relative block w-full overflow-hidden bg-surface-muted text-left focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 ${className}`} aria-label={`Открыть изображение: ${item.title}`}>
    <ProgressiveImage media={item.media} alt={item.media.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
    {(item.caption || item.title) && <span className="type-caption absolute bottom-3 left-3 w-fit max-w-[calc(100%-1.5rem)] rounded-xl bg-white/15 px-4 py-3 text-white backdrop-blur">{item.caption || item.title}</span>}
  </button>
}

export function GalleryExperience({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null)
  const swiper = useRef<SwiperType | null>(null)
  const [edge, setEdge] = useState({ start: true, end: items.length < 2 })
  const update = (instance: SwiperType) => setEdge({ start: instance.isBeginning, end: instance.isEnd })
  if (items.length === 0) return <p role="status" className="se-2 bg-white p-6 type-body text-ink-soft">В галерее пока нет опубликованных изображений.</p>

  return <>
    <div className="hidden columns-2 gap-4 md:block lg:columns-3">{items.map((item, index) => <GalleryButton key={item.id} item={item} onOpen={() => setActive(index)} className={`mb-4 break-inside-avoid ${index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`} />)}</div>
    <div className="md:hidden">
      <Swiper {...horizontalSwiperProps} slidesPerView={1.08} spaceBetween={12} onSwiper={(instance) => { swiper.current = instance; update(instance) }} onSlideChange={update} className="!overflow-visible">
        {items.map((item, index) => <SwiperSlide key={item.id} className="!h-auto"><GalleryButton item={item} onOpen={() => setActive(index)} className="h-full min-h-[360px]" /></SwiperSlide>)}
      </Swiper>
      <div className="mt-4 flex items-center justify-between"><span className="type-caption text-ink-soft">Свайпните, чтобы увидеть больше</span><div className="flex gap-2"><IconButton aria-label="Предыдущее фото" variant="neutral" size="sm" disabled={edge.start} onClick={() => swiper.current?.slidePrev()}><ChevronLeft size={17} /></IconButton><IconButton aria-label="Следующее фото" variant="neutral" size="sm" disabled={edge.end} onClick={() => swiper.current?.slideNext()}><ChevronRight size={17} /></IconButton></div></div>
    </div>
    <GalleryLightbox active={active} items={items} onChange={setActive} />
  </>
}

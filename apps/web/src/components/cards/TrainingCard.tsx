import type { HomepageDTO } from '@unlim/content-contract'
import { Baby, User, Users } from 'lucide-react'

import { ArrowAction } from '../ui/ArrowAction'
import { Badge } from '../ui/Badge'
import { ImageCard, type ImageOverlay } from '../ui/Card'
import { Price } from '../ui/Price'

export type Training = HomepageDTO['entities']['trainingPrograms'][number]
const icons = { Baby, User, Users }

export function TrainingCard({ training }: { training: Training }) {
  const Icon = icons[training.icon]
  return <ImageCard reveal={false} src={training.image.url} alt={training.image.alt} overlay={training.overlay as ImageOverlay} className="h-[500px] min-h-[500px]"><div className="flex h-full flex-col justify-between p-6 md:p-7"><div className="flex items-start justify-between"><Badge tone="outline-light" icon={<Icon size={13} />}>{training.badge}</Badge></div><div><h3 className="type-title-card text-white">{training.title}</h3><p className="type-body-sm mt-2 text-white">{training.description}</p><div className="mt-6 flex items-end justify-between border-t border-white/15 pt-4"><Price label="час от" value={training.priceFrom} tone="light" /><ArrowAction tone="glass" size="sm" cardHover /></div></div></div></ImageCard>
}

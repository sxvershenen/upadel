import type { LucideIcon } from 'lucide-react'
import { Reveal } from './ui/Reveal'
import { Typography } from './ui/Typography'

type Term = { title: string; icon: LucideIcon } & ({ text: string; contentHTML?: never } | { contentHTML: string; text?: never })

/** Shared terms layout for prices and gift certificates. HTML is sanitized by CMS projection. */
export function TermsList({ items, gift = false }: { items: Term[]; gift?: boolean }) {
  return <div className="mt-8 border-y border-ink/10" data-terms-list data-gift-terms-list={gift || undefined}>
    {items.map(({ title, icon: Icon, text, contentHTML }, index) => <Reveal key={title} delay={index * .05} className="border-b border-ink/10 last:border-b-0">
      <div className="flex items-start gap-3 py-5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-ink-soft" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
        <div className="min-w-0">
          <Typography as="h3" role="body" className="font-medium text-ink">{title}</Typography>
          {contentHTML != null
            ? <Typography as="div" role="body-small" tone="subtle" className="mt-1.5 leading-relaxed [&_p]:my-0 [&_p+p]:mt-2" dangerouslySetInnerHTML={{ __html: contentHTML }}>{undefined}</Typography>
            : <Typography role="body-small" tone="subtle" className="mt-1.5 leading-relaxed">{text}</Typography>}
        </div>
      </div>
    </Reveal>)}
  </div>
}

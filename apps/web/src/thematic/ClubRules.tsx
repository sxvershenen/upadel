import type { ClubRulesPageDTO } from '@unlim/content-contract'
import { Plus } from 'lucide-react'

/** Native disclosure keeps the complete CMS document accessible before hydration. */
export function ClubRules({ dto }: { dto: ClubRulesPageDTO }) {
  return <article className="container-page py-8 md:py-12"><div className="mx-auto max-w-[960px] border-t border-ink/10">
    {dto.sections.map((section, index) => <details key={section.title} open={index === 0} className="group/rule border-b border-ink/10" data-club-rule>
      <summary className="flex cursor-pointer list-none items-center gap-3 py-5 text-left [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-4">
        <span className="type-caption w-6 shrink-0 text-ink-soft" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <h2 className="type-body min-w-0 flex-1 font-medium text-ink">{section.title.replace(/^\d+\.\s*/, '')}</h2>
        <span className="se-1 flex h-8 w-8 shrink-0 items-center justify-center bg-control text-ink group-open/rule:bg-ink group-open/rule:text-white"><Plus size={16} className="transition-transform group-open/rule:rotate-45" /></span>
      </summary>
      <div className="type-body-sm pb-6 pl-9 text-ink-soft [&_p]:my-0 [&_p+p]:mt-3" dangerouslySetInnerHTML={{ __html: section.contentHTML }} />
    </details>)}
  </div>{dto.closingText && <p className="type-body-sm mx-auto mt-8 max-w-[960px] whitespace-pre-line text-ink-soft">{dto.closingText}</p>}</article>
}

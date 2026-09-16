import type { CatalogPageHeader } from '@unlim/content-contract'
import { ArrowLeft } from 'lucide-react'
import React, { type ReactNode } from 'react'

type PageHeaderData = Pick<CatalogPageHeader, 'eyebrow' | 'title' | 'intro' | 'hero'>

export function StickyBackLink({ href = '/', label = 'Назад' }: { href?: string; label?: string }) {
  return <>
    <div aria-hidden="true" className="hidden h-[60px] md:block" />
    <a href={href} className="se-full fixed right-4 top-4 z-[60] inline-flex items-center gap-1.5 bg-control px-3 py-2 type-caption text-ink-soft shadow-[0_8px_18px_-12px_rgba(20,20,26,.8)] transition-colors hover:bg-control-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 md:right-8 md:top-[30px] md:-translate-y-1/2">
      <ArrowLeft aria-hidden="true" size={14} />
      {label}
    </a>
  </>
}

export function PageHeader({ page, backHref = '/', actions }: { page: PageHeaderData; backHref?: string; actions?: ReactNode }) {
  return <>
    <StickyBackLink href={backHref} />
    <header className="page-hero relative isolate overflow-hidden py-12 text-white md:py-16">
      <div className={`absolute inset-0 -z-20 bg-cover bg-center ${page.hero.grayscale ? 'grayscale' : ''}`} style={{ backgroundImage: `url(${page.hero.media.url})` }} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,8,.94)_0%,rgba(3,5,8,.8)_56%,rgba(3,5,8,.58)_100%)]" />
      <div className="container-page">
        <span className="type-eyebrow text-white/50">{page.eyebrow}</span>
        <h1 className="type-section mt-3 max-w-[920px] text-white">{page.title}</h1>
        <p className="type-editorial mt-4 max-w-[820px] text-white/65">{page.intro}</p>
        {actions && <div className="mt-7">{actions}</div>}
      </div>
    </header>
  </>
}

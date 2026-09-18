import type { CatalogPageHeader } from '@unlim/content-contract'
import React, { type ReactNode } from 'react'

type PageHeaderData = Pick<CatalogPageHeader, 'eyebrow' | 'title' | 'intro' | 'hero'>

export function PageHeader({ page, actions }: { page: PageHeaderData; actions?: ReactNode }) {
  return <header className="page-hero relative isolate overflow-hidden py-12 text-white md:pb-12 md:pt-24">
      <div className={`absolute inset-0 -z-20 bg-cover bg-center ${page.hero.grayscale ? 'grayscale' : ''}`} style={{ backgroundImage: `url(${page.hero.media.url})` }} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,8,.94)_0%,rgba(3,5,8,.8)_56%,rgba(3,5,8,.58)_100%)]" />
      <div className="container-page">
        <h1 data-page-enter="title" className="type-section max-w-[920px] text-white">{page.title}</h1>
        <p data-page-enter="intro" className="type-editorial mt-4 max-w-[820px] text-white/65">{page.intro}</p>
        {actions && <div data-page-enter="actions" className="mt-7">{actions}</div>}
      </div>
  </header>
}

'use client'

import { DefaultListView, useConfig, useListQuery } from '@payloadcms/ui'
import type { ListViewClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { useMediaUsage } from './useMediaUsage'
import './adminCards.scss'

function GalleryGrid() {
  const { data } = useListQuery()
  const { config } = useConfig()
  const docs = (data?.docs ?? []) as Array<Record<string, unknown>>
  const mediaIDs = docs.flatMap((doc) => typeof doc.media === 'number' || typeof doc.media === 'string' ? [doc.media] : [])
  const { error, loading, media } = useMediaUsage(mediaIDs)
  if (error) return <div className="admin-card-error" role="alert">{error}</div>

  return <div className="gallery-admin-grid" aria-busy={loading}>{docs.map((doc) => {
    const mediaID = String(doc.media ?? '')
    const preview = media[mediaID]
    const href = formatAdminURL({ adminRoute: config.routes.admin, path: `/collections/gallery-items/${String(doc.id)}` })
    return <a className="gallery-admin-card" href={href} key={String(doc.id)}>
      <div className="gallery-admin-card__image">{preview?.thumbnailURL ? <img src={preview.thumbnailURL} alt={preview.alt || String(doc.title ?? '')} /> : <div className="gallery-admin-card__placeholder">{loading ? 'Загрузка…' : 'Нет превью'}</div>}<div className="gallery-admin-card__overlay"><strong className="gallery-admin-card__title" title={String(doc.title ?? 'Без названия')}>{String(doc.title ?? 'Без названия')}</strong>{Boolean(doc.caption) && <p className="gallery-admin-card__caption" title={String(doc.caption)}>{String(doc.caption)}</p>}<div className="gallery-admin-card__badges"><span>{doc._status === 'published' ? 'Опубликовано' : 'Черновик'}</span><span>{doc.isActive === false ? 'Неактивно' : 'Активно'}</span>{Boolean(doc.showOnHomepage) && <span>На главной · {String(doc.homepageOrder ?? '—')}</span>}</div></div></div>
    </a>
  })}</div>
}

export function GalleryListView(props: ListViewClientProps) {
  return <DefaultListView {...props} Table={<GalleryGrid />} />
}

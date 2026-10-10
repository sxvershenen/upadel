'use client'

import { useDocumentDrawer, useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useMemo, useState } from 'react'

import { useAdminFieldVisibility } from './adminFieldVisibility'
import './homepageAdmin.scss'

type CollectionSlug = 'courts' | 'reviews' | 'faqs'
type Row = Record<string, unknown>

const panels: Record<CollectionSlug, { title: string; description: string; collectionTitle: string }> = {
  courts: { title: 'Корты', description: 'Опубликованные активные корты с флагом и порядком главной.', collectionTitle: 'title' },
  reviews: { title: 'Отзывы', description: 'Отзывы, отмеченные для главной страницы.', collectionTitle: 'authorName' },
  faqs: { title: 'Частые вопросы', description: 'Вопросы и ответы, отмеченные для главной страницы.', collectionTitle: 'question' },
}

function RecordDrawer({ collection, id, title, onChange }: { collection: CollectionSlug; id?: number; title: string; onChange: () => void }) {
  const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({ collectionSlug: collection, id })

  return (
    <>
      <DocumentDrawerToggler className="homepage-admin-panel__record">
        {title}
      </DocumentDrawerToggler>
      <DocumentDrawer id={id} onSave={onChange} onDelete={onChange} onDuplicate={onChange} />
    </>
  )
}

function CollectionPanel({ collection }: { collection: CollectionSlug }) {
  const { config } = useConfig()
  const [rows, setRows] = useState<Row[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [refresh, setRefresh] = useState(0)
  const [fieldRef, visible] = useAdminFieldVisibility<HTMLElement>()
  const meta = panels[collection]
  const endpoint = useMemo(() => formatAdminURL({ adminRoute: config.routes.admin, path: `/collections/${collection}` }), [collection, config.routes.admin])

  useEffect(() => {
    let cancelled = false
    if (!visible) return
    setState('loading')
    void (async () => {
      const records: Row[] = []
      let page = 1
      let hasNextPage = true
      while (hasNextPage) {
        const response = await fetch(`/api/${collection}?depth=0&draft=true&limit=100&page=${page}&sort=createdAt`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Не удалось загрузить записи.')
        const result = await response.json() as { docs?: unknown[]; hasNextPage?: boolean }
        records.push(...(Array.isArray(result.docs) ? result.docs.filter((row): row is Row => Boolean(row && typeof row === 'object')) : []))
        hasNextPage = result.hasNextPage === true
        page += 1
        if (page > 100) throw new Error('Слишком много записей для просмотра из главной страницы.')
      }
      return records
    })()
      .then((result) => { if (!cancelled) { setRows(result); setState('ready') } })
      .catch(() => { if (!cancelled) setState('error') })
    return () => { cancelled = true }
  }, [collection, refresh, visible])

  return (
    <section ref={fieldRef} className="homepage-admin-panel" aria-label={meta.title}>
      <header className="homepage-admin-panel__header">
        <div><h3>{meta.title}</h3><p>{meta.description}</p></div>
        <RecordDrawer collection={collection} title="Добавить" onChange={() => setRefresh((value) => value + 1)} />
      </header>
      {state === 'loading' && <p className="homepage-admin-panel__state">Загружаем…</p>}
      {state === 'error' && <p className="homepage-admin-panel__state" role="alert">Не удалось загрузить список. Откройте вкладку ещё раз.</p>}
      {state === 'ready' && rows.length === 0 && <p className="homepage-admin-panel__state">Записей пока нет.</p>}
      {state === 'ready' && rows.length > 0 && (
        <div className="homepage-admin-panel__list">
          {rows.map((row) => {
            const title = String(row[meta.collectionTitle] ?? 'Без названия')
            const id = typeof row.id === 'number' ? row.id : Number(row.id)
            const status = row._status === 'published' ? 'опубликовано' : 'черновик'
            const visibility = row.isActive === false ? ' · выключено' : row.showOnHomepage === false ? ' · не показывается на главной' : ''
            return <RecordDrawer key={String(id)} collection={collection} id={id} title={`${title} · ${status}${visibility}`} onChange={() => setRefresh((value) => value + 1)} />
          })}
        </div>
      )}
      <a className="homepage-admin-panel__list-link" href={endpoint}>Перейти к полному списку</a>
    </section>
  )
}

export function HomepageCourtsPanel() { return <CollectionPanel collection="courts" /> }
export function HomepageReviewsPanel() { return <CollectionPanel collection="reviews" /> }
export function HomepageFAQsPanel() { return <CollectionPanel collection="faqs" /> }

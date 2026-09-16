'use client'

import { useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useMemo, useState } from 'react'

import { createAdminRequestCache } from './adminRequestCache'
import { useAdminFieldVisibility } from './adminFieldVisibility'

type Kind = 'users' | 'redirects'
type Row = Record<string, unknown>
const collectionCache = createAdminRequestCache<Row[]>({ maxEntries: 2, ttlMs: 60_000 })

const copy: Record<Kind, { collection: string; description: string; empty: string; label: string; plural: string }> = {
  users: {
    collection: 'users',
    description: 'Учетные записи, которым разрешен вход в CMS.',
    empty: 'Пользователей пока нет.',
    label: 'Пользователь',
    plural: 'Пользователи',
  },
  redirects: {
    collection: 'redirects',
    description: 'Изменения адресов, которые Astro подхватит после следующего запуска.',
    empty: 'Редиректов пока нет.',
    label: 'Редирект',
    plural: 'Редиректы',
  },
}

function display(row: Row, kind: Kind): { detail: string; title: string } {
  if (kind === 'users') return { title: String(row.email ?? 'Без email'), detail: 'Аккаунт CMS' }
  return { title: String(row.sourcePath ?? '/'), detail: `→ ${String(row.destinationPath ?? '/')} · ${row.enabled === false ? 'выключен' : 'активен'}` }
}

function SettingsCollectionField({ kind }: { kind: Kind }) {
  const { config } = useConfig()
  const [fieldRef, visible] = useAdminFieldVisibility<HTMLElement>()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const meta = copy[kind]
  const collectionURL = useMemo(() => formatAdminURL({ adminRoute: config.routes.admin, path: `/collections/${meta.collection}` }), [config.routes.admin, meta.collection])
  const createURL = `${collectionURL}/create`

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setError('')
    const key = meta.collection
    const cached = collectionCache.read(key)
    if (cached?.fresh) {
      setRows(cached.value)
      setLoading(false)
    } else setLoading(true)
    void collectionCache.request(key, async () => {
      const response = await fetch(`/api/${meta.collection}?depth=0&limit=50`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Не удалось загрузить данные.')
      const data = await response.json() as { docs?: unknown[] }
      return Array.isArray(data.docs) ? data.docs.filter((row): row is Row => Boolean(row && typeof row === 'object')) : []
    }).then((nextRows) => {
      if (!cancelled) setRows(nextRows)
    }).catch((cause) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : 'Не удалось загрузить данные.')
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [meta.collection, visible])

  return (
    <section ref={fieldRef} className="settings-collection-field" aria-labelledby={`${kind}-settings-title`}>
      <header className="settings-collection-field__header">
        <div>
          <h3 id={`${kind}-settings-title`}>{meta.plural}</h3>
          <p>{meta.description}</p>
        </div>
        <a className="settings-collection-action" href={createURL}>Добавить</a>
      </header>
      {loading && <p className="settings-collection-state">Загружаем…</p>}
      {error && <p className="settings-collection-state settings-collection-state--error" role="alert">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="settings-collection-state">{meta.empty}</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="settings-collection-list">
          {rows.map((row) => {
            const item = display(row, kind)
            const href = `${collectionURL}/${String(row.id)}`
            return <a className="settings-collection-row" href={href} key={String(row.id)}><strong>{item.title}</strong><span>{item.detail}</span></a>
          })}
        </div>
      )}
    </section>
  )
}

export function UsersSettingsField() { return <SettingsCollectionField kind="users" /> }
export function RedirectsSettingsField() { return <SettingsCollectionField kind="redirects" /> }

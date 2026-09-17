'use client'

import { Button, DefaultListView, useConfig, useListDrawerContext, useListQuery } from '@payloadcms/ui'
import { EditIcon } from '@payloadcms/ui/icons/Edit'
import { ExternalLinkIcon } from '@payloadcms/ui/icons/ExternalLink'
import type { ListViewClientProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useMemo, useRef, useState } from 'react'

import { formatFileSize } from '../../uploads/mediaPolicy'
import { selectMediaDocument } from './mediaDrawerSelection'
import { UsageList } from './UsageList'
import { useMediaUsage } from './useMediaUsage'
import './adminCards.scss'

type MediaDocument = Record<string, unknown>

function UsagePopover({ loading, usage }: { loading: boolean; usage: ReturnType<typeof useMediaUsage>['usage'] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  const count = usage.length
  return <div ref={ref} className="media-admin-card__usage-popover">
    <button type="button" className="media-admin-card__usage-trigger" aria-expanded={open} aria-label={loading ? 'Проверяем использование' : count ? `Используется в ${count} местах` : 'Медиа не используется'} title={loading ? 'Проверяем использование' : count ? `Используется · ${count}` : 'Не используется'} onClick={() => setOpen((value) => !value)}>
      {loading ? <span className="media-admin-card__usage-dot" aria-hidden="true">…</span> : <><ExternalLinkIcon /><span className="media-admin-card__usage-count">{count}</span></>}
    </button>
    {open && <div className="media-admin-card__usage-panel"><UsageList usage={usage} /></div>}
  </div>
}

function useAllMedia(fallback: MediaDocument[], enabled: boolean, totalDocs?: number) {
  const fallbackRef = useRef(fallback)
  const loadedRef = useRef<{ complete: boolean; totalDocs?: number }>({ complete: false })
  const [state, setState] = useState<{ docs: MediaDocument[]; error?: string; loaded: boolean; loading: boolean }>({ docs: [], loaded: false, loading: false })
  fallbackRef.current = fallback

  useEffect(() => {
    if (!enabled || (loadedRef.current.complete && loadedRef.current.totalDocs === totalDocs)) return

    const controller = new AbortController()
    setState((current) => ({ ...current, error: undefined, loaded: false, loading: true }))
    fetch('/api/media?depth=0&limit=100&sort=-createdAt', { credentials: 'same-origin', signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json() as Promise<{ docs?: MediaDocument[] }>
    }).then((result) => {
      loadedRef.current = { complete: true, totalDocs }
      setState({ docs: result.docs ?? fallbackRef.current, loaded: true, loading: false })
    }).catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return
      loadedRef.current = { complete: false }
      setState({ docs: [], error: `Не удалось загрузить полный список: ${error instanceof Error ? error.message : String(error)}`, loaded: false, loading: false })
    })
    return () => controller.abort()
  }, [enabled, totalDocs])

  return { ...state, loading: enabled && (!state.loaded || state.loading) }
}

function mediaPreviewURL(doc: Record<string, unknown>): string | undefined {
  const sizes = doc.sizes as { thumbnail?: { url?: string } } | undefined
  return sizes?.thumbnail?.url ?? (doc.thumbnailURL as string | undefined) ?? (doc.url as string | undefined)
}

function MediaUsageGrid() {
  const { data, query, refineListData } = useListQuery()
  const { config } = useConfig()
  const { isInDrawer, onSelect } = useListDrawerContext()
  const docs = (data?.docs ?? []) as MediaDocument[]
  const [tab, setTab] = useState<'all' | 'unused'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const allMedia = useAllMedia(docs, !isInDrawer && tab === 'unused', data?.totalDocs)
  const sourceDocs = !isInDrawer && tab === 'unused' ? allMedia.docs : docs
  const ids = isInDrawer ? [] : (tab === 'unused' && allMedia.loaded ? allMedia.docs : docs).map((doc) => String(doc.id))
  const { error, loading, usage } = useMediaUsage(ids)
  const usageByMedia = useMemo(() => {
    const result = new Map<string, typeof usage>()
    for (const item of usage) result.set(item.mediaID, [...(result.get(item.mediaID) ?? []), item])
    return result
  }, [usage])
  const unusedDocs = useMemo(() => allMedia.loaded ? allMedia.docs.filter((doc) => !(usageByMedia.get(String(doc.id))?.length)) : [], [allMedia.docs, allMedia.loaded, usageByMedia])
  const visibleDocs = !isInDrawer && tab === 'unused' ? unusedDocs : sourceDocs

  const toggleSelected = (id: string) => setSelected((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const deleteSelected = async () => {
    const idsToDelete = [...selected]
    if (!idsToDelete.length || !window.confirm(`Удалить выбранные медиафайлы (${idsToDelete.length})?`)) return
    setBusy(true)
    setActionError('')
    const failed: string[] = []
    for (const id of idsToDelete) {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!response.ok) failed.push(id)
    }
    if (failed.length) setActionError(`Не удалось удалить ${failed.length} файл(ов). Используемые файлы защищены.`)
    else setSelected(new Set())
    setBusy(false)
    await refineListData(query, false)
  }

  if (error) return <div className="admin-card-error" role="alert">{error}</div>
  if (!docs.length) return <div className="media-admin-empty">Медиафайлы не найдены.</div>

  return (
    <>
      <div className={`media-admin-toolbar${isInDrawer ? ' media-admin-toolbar--drawer' : ''}`}>
        {isInDrawer ? <p className="media-admin-drawer-hint">Выберите изображение — оно сразу появится в тексте статьи.</p> : <>
        <div className="media-admin-tabs" role="tablist" aria-label="Фильтр медиа">
          <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'active' : ''} onClick={() => { setTab('all'); setSelected(new Set()) }}>Все <span>{data?.totalDocs ?? docs.length}</span></button>
          <button type="button" role="tab" aria-selected={tab === 'unused'} className={tab === 'unused' ? 'active' : ''} onClick={() => { setTab('unused'); setSelected(new Set()) }}>Неиспользуемые {allMedia.loaded && <span>{unusedDocs.length}</span>}</button>
        </div>
        <div className="media-admin-selection-actions">
          <span>{selected.size ? `Выбрано: ${selected.size}` : tab === 'unused' ? 'Файлы без связей' : 'Отметьте файлы для пакетного действия'}</span>
          {selected.size > 0 && <><button type="button" className="media-admin-action-button" disabled={busy} onClick={() => void deleteSelected()}>{busy ? 'Удаляем…' : 'Удалить выбранные'}</button><button type="button" className="media-admin-action-button media-admin-action-button--muted" disabled={busy} onClick={() => setSelected(new Set())}>Снять</button></>}
        </div>
        {actionError && <p className="media-admin-action-error" role="alert">{actionError}</p>}
        </>}
      </div>
      <div className="media-admin-list" aria-busy={loading || allMedia.loading}>
      {tab === 'unused' && allMedia.loading && <div className="media-admin-empty">Загружаем полный список медиафайлов…</div>}
      {tab === 'unused' && allMedia.error && <div className="admin-card-error" role="alert">{allMedia.error}</div>}
      {!(tab === 'unused' && (allMedia.loading || allMedia.error)) && <>
      {visibleDocs.map((doc) => {
        const id = String(doc.id)
        const imageURL = mediaPreviewURL(doc)
        const itemUsage = usageByMedia.get(id) ?? []
        const href = formatAdminURL({ adminRoute: config.routes.admin, path: `/collections/media/${id}` })
        const mimeType = String(doc.mimeType ?? '')
        const video = mimeType === 'video/mp4' || mimeType === 'video/webm'
        const title = String(doc.filename ?? doc.alt ?? 'Медиа')
        const alt = String(doc.alt ?? '')
        return (
          <article className="media-admin-card" key={id}>
            <div className="media-admin-card__preview">
              {isInDrawer ? <button className="media-admin-card__media-link media-admin-card__media-select" type="button" onClick={() => selectMediaDocument(onSelect, doc)} aria-label={`Выбрать ${title}`}>
              {video && imageURL ? (
                <video src={imageURL} preload="metadata" muted playsInline aria-label={`Видео: ${alt || title}`} />
              ) : mimeType.startsWith('image/') && imageURL ? (
                <img src={imageURL} alt={alt} decoding="async" loading="lazy" />
              ) : (
                <span className="media-admin-card__placeholder">Файл без превью</span>
              )}
              </button> : <a className="media-admin-card__media-link" href={href} aria-label={`Открыть ${title}`}>
              {video && imageURL ? (
                <video src={imageURL} preload="metadata" muted playsInline aria-label={`Видео: ${alt || title}`} />
              ) : mimeType.startsWith('image/') && imageURL ? (
                <img src={imageURL} alt={alt} decoding="async" loading="lazy" />
              ) : (
                <span className="media-admin-card__placeholder">Файл без превью</span>
              )}
              </a>}
              {!isInDrawer && <label className="media-admin-card__select" title={`Выбрать ${title}`}>
                <input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelected(id)} aria-label={`Выбрать ${title}`} />
              </label>}
              <span className="media-admin-card__type">
                {video ? `Видео · ${mimeType.replace('video/', '').toUpperCase()}` : mimeType.replace('image/', '').toUpperCase() || 'Файл'}
              </span>
              <div className="media-admin-card__overlay">
                <div className="media-admin-card__topline">
                  <span aria-hidden="true" />
                  {!isInDrawer && <Button
                    aria-label={`Редактировать ${title}`}
                    buttonStyle="none"
                    el="link"
                    extraButtonProps={{ title: `Редактировать ${title}` }}
                    icon={<EditIcon />}
                    margin={false}
                    size="small"
                    to={href}
                  />}
                </div>
                <div className="media-admin-card__bottomline">
                  <div className="media-admin-card__copy">
                    <strong className="media-admin-card__title" title={title}>{title}</strong>
                    {alt && <span className="media-admin-card__alt" title={alt}>{alt}</span>}
                  </div>
                  {isInDrawer ? <button type="button" className="media-admin-card__choose" onClick={() => selectMediaDocument(onSelect, doc)}>Выбрать</button> : <span className="media-admin-card__file" title="Размер файла">
                    <span aria-hidden="true">◫</span>{formatFileSize(doc.filesize)}
                  </span>}
                </div>
              </div>
            </div>
            {!isInDrawer && <UsagePopover loading={loading} usage={itemUsage} />}
          </article>
        )
      })}
      {!visibleDocs.length && <div className="media-admin-empty">В этой вкладке файлов нет.</div>}
      </>}
      </div>
    </>
  )
}

export function MediaListView(props: ListViewClientProps) {
  return <DefaultListView {...props} Table={<MediaUsageGrid />} />
}

'use client'

import { Button, ChevronIcon, ExternalLinkIcon, Pill, useConfig } from '@payloadcms/ui'
import { EditIcon } from '@payloadcms/ui/icons/Edit'
import { EyeIcon } from '@payloadcms/ui/icons/Eye'
import { PlusIcon } from '@payloadcms/ui/icons/Plus'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  buildPageMapTree,
  collectPageMapAncestors,
  filterPageMapTree,
  flattenPageMapTree,
  pageMapSearchPredicate,
} from '../../pageMap/tree'
import type { PageMapRow, PageMapSort, PageMapTreeNode } from '../../pageMap/tree'
import { AdminPageFrame } from './AdminPageFrame'
import './pageMap.scss'

type ApiResponse = { row?: unknown; rows?: unknown; error?: string }
type StatusFilter = 'all' | 'published' | 'draft'

const statusLabels: Record<string, string> = {
  'draft-only': 'Только черновик',
  'draft-with-published': 'Черновик + опубликовано',
  published: 'Опубликовано',
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function rowFromApi(value: unknown): PageMapRow | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Record<string, unknown>
  const path = text(source.path)
  if (!path.startsWith('/')) return null
  const issues = Array.isArray(source.issues)
    ? source.issues.filter((issue): issue is string => typeof issue === 'string')
    : []
  return {
    edit: text(source.edit),
    issues,
    parent: source.parent === null || typeof source.parent === 'string' ? source.parent : null,
    path,
    preview: typeof source.preview === 'string' ? source.preview : null,
    public: typeof source.public === 'string' ? source.public : null,
    robots: text(source.robots, 'index-follow'),
    status: text(source.status, 'draft-only'),
    template: text(source.template, 'page'),
    title: text(source.title, path),
  }
}

function configuredAdminHref(href: string, adminRoute: string): string {
  // Older API responses used a literal /admin prefix. Keep those links usable
  // when Payload is mounted at a custom admin route.
  if (href.startsWith('/admin/')) return `${adminRoute === '/' ? '' : adminRoute}${href.slice('/admin'.length)}`
  return href
}

function IconGlyph({ kind }: { kind: 'edit' | 'open' | 'preview' }) {
  if (kind === 'edit') return <EditIcon />
  if (kind === 'preview') return <EyeIcon />
  return <ExternalLinkIcon />
}

function ActionButton({
  external = false,
  href,
  kind,
  label,
}: {
  external?: boolean
  href: string
  kind: 'edit' | 'open' | 'preview'
  label: string
}) {
  if (!href) return null
  if (external) {
    return (
      <Button
        aria-label={label}
        buttonStyle="none"
        el="anchor"
        extraButtonProps={{ rel: 'noopener noreferrer', target: '_blank', title: label }}
        icon={<IconGlyph kind={kind} />}
        margin={false}
        size="small"
        url={href}
      />
    )
  }
  return (
    <Button
      aria-label={label}
      buttonStyle="none"
      el="link"
      extraButtonProps={{ title: label }}
      icon={<IconGlyph kind={kind} />}
      margin={false}
      size="small"
      to={href}
    />
  )
}

function StatusPills({ node }: { node: PageMapTreeNode }) {
  return (
    <div className="page-map-pills">
      <Pill pillStyle={node.status === 'published' ? 'success' : 'warning'} size="small">
        {statusLabels[node.status] ?? node.status}
      </Pill>
      <Pill pillStyle="light-gray" size="small">
        {node.robots === 'noindex-nofollow' ? 'noindex · nofollow' : node.robots}
      </Pill>
      {node.issues.length > 0 && (
        <details className="page-map-issues">
          <summary>
            <Pill pillStyle="warning" size="small">
              {node.issues.length} SEO {node.issues.length === 1 ? 'проблема' : 'проблемы'}
            </Pill>
          </summary>
          <ul>
            {node.issues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </details>
      )}
    </div>
  )
}

function TreeToggle({ node, expanded, onToggle }: { node: PageMapTreeNode; expanded: boolean; onToggle: () => void }) {
  if (node.children.length === 0) return <span className="page-map-tree-toggle-spacer" aria-hidden="true" />
  return (
    <button
      aria-expanded={expanded}
      aria-label={`${expanded ? 'Свернуть' : 'Развернуть'} ${node.title}`}
      className="page-map-tree-toggle"
      onClick={onToggle}
      type="button"
    >
      <ChevronIcon direction={expanded ? 'down' : 'right'} size="small" />
    </button>
  )
}

function NodeIdentity({ node, expanded, onToggle }: { node: PageMapTreeNode; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="page-map-node-identity"
      style={{ '--page-map-depth': node.depth } as React.CSSProperties}
    >
      <span className="page-map-connectors" aria-hidden="true" />
      <TreeToggle node={node} expanded={expanded} onToggle={onToggle} />
      <div className="page-map-node-copy">
        <strong>{node.title}</strong>
        <code>{node.path}</code>
      </div>
    </div>
  )
}

function Actions({ node, adminRoute }: { node: PageMapTreeNode; adminRoute: string }) {
  const title = node.title || node.path
  return (
    <div className="page-map-actions">
      <ActionButton
        href={configuredAdminHref(node.edit, adminRoute)}
        kind="edit"
        label={`Редактировать: ${title}`}
      />
      <ActionButton external href={node.public ?? ''} kind="open" label={`Открыть: ${title}`} />
      <ActionButton external href={node.preview ?? ''} kind="preview" label={`Предпросмотр: ${title}`} />
    </div>
  )
}

function TreeTable({
  adminRoute,
  expanded,
  nodes,
  onToggle,
}: {
  adminRoute: string
  expanded: ReadonlySet<string>
  nodes: PageMapTreeNode[]
  onToggle: (key: string) => void
}) {
  return (
    <div className="page-map-table" role="treegrid" aria-label="Дерево публичных страниц" aria-rowcount={nodes.length}>
      <table>
        <thead>
          <tr>
            <th scope="col">Страница</th>
            <th scope="col">Состояние</th>
            <th scope="col">Шаблон</th>
            <th scope="col">Действия</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            const isExpanded = expanded.has(node.key)
            const isRoot = node.depth === 0
            const isMajor = node.depth === 1
            return (
              <tr
                aria-expanded={node.children.length > 0 ? isExpanded : undefined}
                aria-level={node.depth + 1}
                className={['page-map-row', isRoot && 'page-map-row--root', isMajor && 'page-map-row--major'].filter(Boolean).join(' ')}
                id={`page-map-row-${node.key}`}
                key={node.key}
                role="row"
              >
                <td data-label="Страница" role="gridcell">
                  <NodeIdentity node={node} expanded={isExpanded} onToggle={() => onToggle(node.key)} />
                </td>
                <td data-label="Состояние" role="gridcell"><StatusPills node={node} /></td>
                <td data-label="Шаблон" role="gridcell"><span className="page-map-template">{node.template}</span></td>
                <td data-label="Действия" role="gridcell"><Actions node={node} adminRoute={adminRoute} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TreeCards({
  adminRoute,
  expanded,
  nodes,
  onToggle,
}: {
  adminRoute: string
  expanded: ReadonlySet<string>
  nodes: PageMapTreeNode[]
  onToggle: (key: string) => void
}) {
  return (
    <div className="page-map-tree-mobile" role="tree" aria-label="Дерево публичных страниц">
      {nodes.map((node) => {
        const isExpanded = expanded.has(node.key)
        const isRoot = node.depth === 0
        const isMajor = node.depth === 1
        return (
          <article
            aria-expanded={node.children.length > 0 ? isExpanded : undefined}
            aria-level={node.depth + 1}
            className={['page-map-card', isRoot && 'page-map-card--root', isMajor && 'page-map-card--major'].filter(Boolean).join(' ')}
            id={`page-map-card-${node.key}`}
            key={node.key}
            role="treeitem"
            style={{ '--page-map-depth': node.depth } as React.CSSProperties}
          >
            <div className="page-map-card-heading">
              <NodeIdentity node={node} expanded={isExpanded} onToggle={() => onToggle(node.key)} />
              <Actions node={node} adminRoute={adminRoute} />
            </div>
            <StatusPills node={node} />
            <span className="page-map-template">Шаблон: {node.template}</span>
          </article>
        )
      })}
    </div>
  )
}

export function PageMapView() {
  const { config } = useConfig()
  const adminRoute = config.routes.admin
  const [rows, setRows] = useState<PageMapRow[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<PageMapSort>('path')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [newPage, setNewPage] = useState({ title: '', slug: '', parentPath: '/' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/page-map', { cache: 'no-store' })
      const data = await response.json() as ApiResponse
      if (!response.ok) throw new Error(data.error || 'Карта страниц временно недоступна.')
      const nextRows = Array.isArray(data.rows)
        ? data.rows.map((row) => rowFromApi(row)).filter((row): row is PageMapRow => row !== null)
        : []
      setRows(nextRows)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Карта страниц временно недоступна.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const tree = useMemo(() => buildPageMapTree(rows, sort), [rows, sort])
  const predicate = useMemo(() => pageMapSearchPredicate(query, status), [query, status])
  const filteredRoots = useMemo(() => filterPageMapTree(tree.roots, predicate), [predicate, tree.roots])
  const filterAncestors = useMemo(
    () => collectPageMapAncestors(tree.roots, predicate),
    [predicate, tree.roots],
  )
  const filtering = Boolean(query.trim()) || status !== 'all'
  const effectiveExpanded = useMemo(() => {
    if (!filtering) return expanded
    return new Set([...expanded, ...filterAncestors])
  }, [expanded, filterAncestors, filtering])
  const visibleNodes = useMemo(
    () => flattenPageMapTree(filteredRoots, effectiveExpanded),
    [effectiveExpanded, filteredRoots],
  )

  const toggle = (key: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const issueCount = rows.reduce((count, row) => count + row.issues.length, 0)
  const warningCount = tree.warnings.length
  const parentOptions = useMemo(
    () => [...rows].sort((left, right) => left.path.localeCompare(right.path, 'ru', { numeric: true })),
    [rows],
  )

  const createPage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const response = await fetch('/api/admin/page-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      })
      const data = await response.json() as ApiResponse
      if (!response.ok) throw new Error(data.error || 'Не удалось создать страницу.')
      const created = rowFromApi(data.row)
      if (!created) throw new Error('Сервер вернул некорректную запись страницы.')
      setRows((current) => current.some((row) => row.path === created.path) ? current : [...current, created])
      setExpanded((current) => new Set(current).add(created.parent ?? '/'))
      setNewPage({ title: '', slug: '', parentPath: created.parent ?? '/' })
      setCreateSuccess(`Создан черновик ${created.path}`)
    } catch (cause) {
      setCreateError(cause instanceof Error ? cause.message : 'Не удалось создать страницу.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <AdminPageFrame className="page-map">
      <header className="admin-page-title-band page-map-header">
        <div>
          <h1>Карта страниц</h1>
          <p>Иерархия публичных маршрутов и их SEO-состояние.</p>
        </div>
        <div className="page-map-summary" aria-label="Сводка карты страниц">
          <strong>{rows.length}</strong><span>страниц</span>
          <strong>{issueCount}</strong><span>SEO проблем</span>
        </div>
      </header>

      <section className="page-map-controls" aria-label="Фильтры карты страниц">
        <label>
          Поиск
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Путь, заголовок или шаблон" />
        </label>
        <label>
          Состояние
          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
            <option value="all">Все</option>
            <option value="published">Опубликовано</option>
            <option value="draft">Черновики</option>
          </select>
        </label>
        <label>
          Сортировка
          <select value={sort} onChange={(event) => setSort(event.target.value as PageMapSort)}>
            <option value="path">По пути</option>
            <option value="title">По заголовку</option>
          </select>
        </label>
        <Button buttonStyle="secondary" margin={false} onClick={() => void load()} size="medium">
          Обновить
        </Button>
        <Button
          buttonStyle="primary"
          icon={<PlusIcon />}
          margin={false}
          onClick={() => setShowCreate((value) => !value)}
          size="medium"
        >
          Новая страница
        </Button>
      </section>

      {showCreate && (
        <form className="page-map-create" onSubmit={(event) => void createPage(event)}>
          <div className="page-map-create-heading">
            <div><h2>Новая страница</h2><p>Создаётся черновик маршрута. Публичный code-defined шаблон подключается отдельно.</p></div>
          </div>
          <div className="page-map-create-fields">
            <label>
              Название
              <input required maxLength={120} value={newPage.title} onChange={(event) => setNewPage((value) => ({ ...value, title: event.target.value }))} />
            </label>
            <label>
              Родитель
              <select required value={newPage.parentPath} onChange={(event) => setNewPage((value) => ({ ...value, parentPath: event.target.value }))}>
                {parentOptions.map((row) => <option key={row.path} value={row.path}>{row.path} — {row.title}</option>)}
              </select>
            </label>
            <label>
              URL-сегмент
              <input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="summer-camp" value={newPage.slug} onChange={(event) => setNewPage((value) => ({ ...value, slug: event.target.value }))} />
            </label>
            <button className="page-map-create-submit" disabled={creating || parentOptions.length === 0} type="submit">
              {creating ? 'Создаём…' : 'Создать черновик'}
            </button>
          </div>
          {createError && <p className="page-map-create-message error" role="alert">{createError}</p>}
          {createSuccess && <p className="page-map-create-message success" role="status">{createSuccess}</p>}
        </form>
      )}

      {warningCount > 0 && (
        <details className="page-map-warning">
          <summary>{warningCount} предупреждений структуры</summary>
          <ul>{tree.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </details>
      )}
      {loading && <p className="page-map-state">Загружаем карту страниц…</p>}
      {!loading && error && <p className="page-map-state error" role="alert">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="page-map-state">Публичных страниц пока нет.</p>}
      {!loading && !error && rows.length > 0 && visibleNodes.length === 0 && <p className="page-map-state">По выбранным фильтрам ничего не найдено.</p>}
      {!loading && !error && visibleNodes.length > 0 && <>
        <p className="page-map-results" aria-live="polite">Показано {visibleNodes.length} из {rows.length} страниц</p>
        <TreeTable adminRoute={adminRoute} expanded={effectiveExpanded} nodes={visibleNodes} onToggle={toggle} />
        <TreeCards adminRoute={adminRoute} expanded={effectiveExpanded} nodes={visibleNodes} onToggle={toggle} />
      </>}
    </AdminPageFrame>
  )
}

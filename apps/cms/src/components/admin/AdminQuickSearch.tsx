'use client'

import { Link, useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useMemo, useState } from 'react'

import { filterAdminQuickSearch, type AdminQuickSearchTarget } from './adminQuickSearchModel'
import './adminToolsNav.scss'

type AdminEntity = {
  slug: string
  label?: unknown
  labels?: { singular?: unknown; plural?: unknown }
  admin?: { group?: unknown; hidden?: boolean }
}

type AdminEntityConfig = {
  collections: AdminEntity[]
  globals: AdminEntity[]
  routes: { admin: string }
}

const entityKeywords: Record<string, string> = {
  homepage: 'робопушка цена порядок секций первый экран главная баннер',
  'prices-page': 'цены тарифы абонементы аренда стоимость',
  'site-settings': 'контакты телефон адрес соцсети футер сайт',
  'padel-court-zakaz-page': 'робопушка строительство заказать корт',
  tournaments: 'турниры события лиги',
  coaches: 'тренеры команда специалисты',
  'rental-rates': 'цены аренда кортов стоимость тарифы',
  memberships: 'абонементы цены скидки',
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function groupName(value: unknown): string {
  return stringValue(value) ?? 'Разделы админки'
}

export function AdminQuickSearch() {
  const { config } = useConfig()
  const [query, setQuery] = useState('')
  const adminConfig = config as unknown as AdminEntityConfig
  const [recordResults, setRecordResults] = useState<AdminQuickSearchTarget[]>([])
  const [recordSearchStatus, setRecordSearchStatus] = useState<'idle' | 'loading' | 'failed'>('idle')
  const targets = useMemo<AdminQuickSearchTarget[]>(() => {
    const globals = adminConfig.globals
      .filter((global) => !global.admin?.hidden)
      .map((global) => ({
        label: stringValue(global.label) ?? global.slug,
        group: groupName(global.admin?.group),
        href: formatAdminURL({ adminRoute: adminConfig.routes.admin, path: `/globals/${global.slug}` }),
        keywords: entityKeywords[global.slug],
      }))
    const collections = adminConfig.collections
      .filter((collection) => !collection.admin?.hidden)
      .map((collection) => ({
        label: stringValue(collection.labels?.plural) ?? stringValue(collection.labels?.singular) ?? collection.slug,
        group: groupName(collection.admin?.group),
        href: formatAdminURL({ adminRoute: adminConfig.routes.admin, path: `/collections/${collection.slug}` }),
        keywords: entityKeywords[collection.slug],
      }))
    const custom: AdminQuickSearchTarget[] = [
      { label: 'Карта страниц', group: 'Инструменты', href: formatAdminURL({ adminRoute: adminConfig.routes.admin, path: '/page-map' }), keywords: 'страницы адреса структура редиректы' },
      { label: 'Аналитика', group: 'Инструменты', href: formatAdminURL({ adminRoute: adminConfig.routes.admin, path: '/analytics' }), keywords: 'лиды заявки посещения' },
    ]
    return [...globals, ...collections, ...custom]
  }, [adminConfig.collections, adminConfig.globals, adminConfig.routes.admin])
  const results = useMemo(() => filterAdminQuickSearch(targets, query), [query, targets])

  useEffect(() => {
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) {
      setRecordResults([])
      setRecordSearchStatus('idle')
      return
    }

    const controller = new AbortController()
    setRecordResults([])
    setRecordSearchStatus('loading')
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/quick-search?q=${encodeURIComponent(normalizedQuery)}`, {
          credentials: 'same-origin',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Search request failed')
        const payload = await response.json() as { results?: AdminQuickSearchTarget[] }
        setRecordResults(Array.isArray(payload.results) ? payload.results : [])
        setRecordSearchStatus('idle')
      } catch {
        if (!controller.signal.aborted) {
          setRecordResults([])
          setRecordSearchStatus('failed')
        }
      }
    }, 250)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const combinedResults = useMemo(() => {
    const navigable = results.filter((target) => !recordResults.some((record) => record.href === target.href))
    return [...recordResults, ...navigable].slice(0, 12)
  }, [recordResults, results])

  return (
    <div className="admin-quick-search">
      <div className="search-filter">
        <input
          aria-label="Поиск в админке"
          autoComplete="off"
          className="search-filter__input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск в админке"
          type="search"
          value={query}
        />
      </div>
      {query.trim() && (
        <div className="admin-quick-search__results" aria-label="Результаты поиска">
          {combinedResults.length ? combinedResults.map((target) => (
            <Link className="admin-quick-search__result" href={target.href} key={target.href}>
              <span className="admin-quick-search__result-title">{target.label}</span>
              <span className="admin-quick-search__result-group">{target.record ? `Запись · ${target.group}` : target.group}</span>
            </Link>
          )) : query.trim().length < 2 ? <p className="admin-quick-search__empty">Введите ещё символ.</p> : recordSearchStatus === 'loading' ? <p className="admin-quick-search__empty">Ищем записи…</p> : recordSearchStatus === 'failed' ? <p className="admin-quick-search__empty">Не удалось выполнить поиск.</p> : <p className="admin-quick-search__empty">Ничего не найдено.</p>}
        </div>
      )}
    </div>
  )
}

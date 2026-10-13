'use client'

import { Link, useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useMemo, useState } from 'react'

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

  return (
    <div className="admin-quick-search">
      <label className="admin-quick-search__label" htmlFor="admin-quick-search-input">Найти раздел</label>
      <input
        autoComplete="off"
        className="admin-quick-search__input"
        id="admin-quick-search-input"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Например, робопушка"
        type="search"
        value={query}
      />
      {query.trim() && (
        <div className="admin-quick-search__results" aria-label="Результаты поиска">
          {results.length ? results.map((target) => (
            <Link className="admin-quick-search__result" href={target.href} key={target.href}>
              <span className="admin-quick-search__result-title">{target.label}</span>
              <span className="admin-quick-search__result-group">{target.group}</span>
            </Link>
          )) : <p className="admin-quick-search__empty">Раздел не найден.</p>}
        </div>
      )}
    </div>
  )
}

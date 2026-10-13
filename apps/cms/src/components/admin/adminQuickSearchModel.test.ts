import assert from 'node:assert/strict'
import test from 'node:test'

import { filterAdminQuickSearch, type AdminQuickSearchTarget } from './adminQuickSearchModel'

const targets: AdminQuickSearchTarget[] = [
  { label: 'Главная', group: 'Страницы', href: '/urp-panel/globals/homepage', keywords: 'робопушка цена порядок секций' },
  { label: 'Цены', group: 'Страницы', href: '/urp-panel/globals/prices-page', keywords: 'тарифы аренда' },
  { label: 'Тренеры', group: 'Услуги и цены', href: '/urp-panel/collections/coaches' },
]

test('admin quick search finds destinations by title, section, and editorial keywords', () => {
  assert.deepEqual(filterAdminQuickSearch(targets, 'РОБОПУШКА'), [targets[0]])
  assert.deepEqual(filterAdminQuickSearch(targets, 'услуги тренеры'), [targets[2]])
  assert.deepEqual(filterAdminQuickSearch(targets, '  '), [])
})

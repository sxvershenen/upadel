import assert from 'node:assert/strict'
import test from 'node:test'

import { mergeRequiredNavigation, requiredPageLinks } from './requiredNavigation'

test('adds required absolute page links and preserves unrelated navigation rows', () => {
  const result = mergeRequiredNavigation([
    { id: 'prices', label: 'Цены', href: '#pricing' },
    { id: 'about', label: 'О клубе', href: '#footer' },
    { id: 'custom', label: 'Лига', href: '/league' },
  ], requiredPageLinks)

  assert.deepEqual(result.slice(0, requiredPageLinks.length).map(({ label, href }) => ({ label, href })), requiredPageLinks)
  assert.deepEqual(result.at(-1), { id: 'custom', label: 'Лига', href: '/league' })
  assert.equal(result.find(({ label }) => label === 'Цены')?.id, 'prices')
})

test('normalizes article and about aliases without duplicating links', () => {
  const result = mergeRequiredNavigation([
    { label: 'Блог', href: '#blog' },
    { label: 'О клубе', href: '#footer' },
    { label: 'Контакты', href: '#footer' },
  ], requiredPageLinks)

  assert.equal(result.filter(({ label }) => label === 'Статьи').length, 1)
  assert.equal(result.filter(({ label }) => label === 'О нас').length, 1)
  assert.equal(result.some(({ label }) => label === 'Контакты'), false)
})

test('keeps required links when legacy extras would exceed the CMS row limit', () => {
  const result = mergeRequiredNavigation([
    { label: 'Главная', href: '#top' },
    { label: 'Корты', href: '#courts' },
  ], requiredPageLinks)

  assert.equal(result.length, 8)
  assert.deepEqual(result.slice(0, 7).map(({ label }) => label), requiredPageLinks.map(({ label }) => label))
})

import assert from 'node:assert/strict'
import test from 'node:test'

import { PadelCourtZakazPage, TrainingPage } from './ThematicPages'

test('padel court page keeps its sections in separate admin tabs', () => {
  const tabsField = PadelCourtZakazPage.fields.find((field) => field.type === 'tabs') as {
    type: 'tabs'
    tabs: Array<{ label: string; fields: Array<{ name?: string }> }>
  } | undefined

  assert.ok(tabsField)
  assert.deepEqual(tabsField.tabs.map((tab) => tab.label), [
    'Первый экран',
    'Дистрибьютор',
    'Строительство',
    'Стоимость',
    'Технологии',
    'Галерея',
    'Модельный ряд',
    'Заявка',
    'Шапка страницы',
    'SEO',
  ])

  assert.deepEqual(tabsField.tabs[0]?.fields.map((field) => field.name), [
    'eyebrow',
    'title',
    'intro',
    'heroVideo',
    'heroPrimaryLabel',
    'heroSecondaryLabel',
    'heroMetrics',
  ])
})

test('training page exposes structured CMS tabs and no legacy rich-text surrogate', () => {
  const tabsField = TrainingPage.fields.find((field) => field.type === 'tabs') as {
    type: 'tabs'
    tabs: Array<{ label: string; fields: Array<{ name?: string }> }>
  } | undefined

  assert.ok(tabsField)
  assert.deepEqual(tabsField.tabs.map((tab) => tab.label), [
    'Методика',
    'Программы и тренеры',
    'База знаний',
    'Шапка страницы',
    'SEO',
  ])
  const names = tabsField.tabs.flatMap((tab) => tab.fields.map((field) => field.name))
  assert.ok(names.includes('firstVisitItems'))
  assert.ok(names.includes('faq'))
  assert.equal(names.includes('article'), false)
  assert.equal(names.includes('infographicCopy'), false)
})

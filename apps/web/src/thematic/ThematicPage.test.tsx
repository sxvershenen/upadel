import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Prices } from './ThematicPage'

const dto = {
  tabs: { rent: 'Аренда', memberships: 'Абонементы' }, rentalRates: [], memberships: [],
  termsTitle: 'Условия и правила', faqTitle: 'Частые вопросы',
  rules: [{ title: 'Абонементы', icon: 'CreditCard', contentHTML: '<p>Цена по запросу</p>' }, { title: 'Отмена и перенос', contentHTML: '<p>За 12 часов</p>' }],
  faq: [{ question: 'Как приобрести абонемент?', answer: 'Обратитесь к администратору' }],
} as any

test('Prices removes the tab control when memberships are hidden and keeps terms/FAQ in two columns', () => {
  const html = renderToStaticMarkup(<Prices dto={dto} />)
  assert.doesNotMatch(html, /role="tablist"|role="tabpanel"|Разделы цен/)
  assert.match(html, /lg:grid-cols-2/)
  assert.match(html, /Условия и правила/)
  assert.match(html, /lucide-credit-card/)
  assert.match(html, /data-terms-list/)
  assert.match(html, /type-body font-medium text-ink/)
  assert.doesNotMatch(html, /article-content/)
  assert.match(html, /Частые вопросы/)
  assert.match(html, /Как приобрести абонемент/)
  assert.ok(html.indexOf('Абонементы') < html.indexOf('Отмена и перенос'))
  assert.doesNotMatch(html, /md:bg-white md:p-6/)
})

test('Prices returns responsive tabs when at least one membership is enabled', () => {
  const html = renderToStaticMarkup(<Prices dto={{ ...dto, memberships: [{ id: 'm', title: '8 часов', description: '', benefits: [], cardVariant: 'package', action: { mode: 'none' } }] }} />)
  assert.match(html, /role="tablist" aria-label="Разделы цен"/)
  assert.match(html, /aria-controls="price-panel-rent"/)
  assert.match(html, /aria-controls="price-panel-memberships"/)
  assert.match(html, /w-full \[&amp;&gt;button\]:flex-1 md:w-auto md:\[&amp;&gt;button\]:flex-none/)
})


test('Prices displays the white membership offer after rates and keeps standards out of the tariff cards', () => {
  const rate = { description: '', includedItems: [], action: { mode: 'none' } }
  const rentalRates = [
    { ...rate, id: 'morning', title: 'Утро', cardVariant: 'rate', price: 3500 },
    { ...rate, id: 'prime', title: 'Прайм-тайм', cardVariant: 'rate', price: 5500 },
    { ...rate, id: 'offer', title: 'Специальные абонементы', cardVariant: 'membership-offer', priceLabel: 'Цена по запросу' },
    { ...rate, id: 'standards', title: 'Отдельная карточка стандартов', cardVariant: 'standards' },
    { ...rate, id: 'personal', title: 'Персональная программа', cardVariant: 'trial' },
  ]
  const html = renderToStaticMarkup(<Prices dto={{ ...dto, rentalRates }} />)
  assert.ok(html.indexOf('Прайм-тайм') < html.indexOf('Специальные абонементы'))
  assert.match(html, /Цена по запросу/)
  assert.doesNotMatch(html, /Отдельная карточка стандартов|Персональная программа/)
  assert.equal((html.match(/bg-white/g) ?? []).length, 3)
})

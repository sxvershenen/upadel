import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
import { RentalRateCard } from '../components/cards/RentPricingCards'
import { Prices } from './ThematicPage'

const dto = {
  tabs: { rent: 'Аренда', memberships: 'Абонементы' }, rentalRates: [], memberships: [],
  membershipOffer: { enabled: false, showOnHomepage: false, title: '', description: '', action: { mode: 'none' } },
  rentalStandards: { enabled: false, showOnHomepage: false, title: '', description: '', includedItems: [] },
  termsTitle: 'Условия и правила', faqTitle: 'Частые вопросы',
  rules: [{ title: 'Абонементы', icon: 'CreditCard', contentHTML: '<p>Цена по запросу</p>' }, { title: 'Отмена и перенос', contentHTML: '<p>За 12 часов</p>' }],
  faq: [{ question: 'Как приобрести абонемент?', answer: 'Обратитесь к администратору' }],
} as any

test('Prices removes the tab control when memberships are hidden and keeps terms/FAQ in two columns', () => {
  const html = renderToStaticMarkup(<Prices dto={dto} />)
  assert.doesNotMatch(html, /role="tablist"|role="tabpanel"|Разделы цен/)
  assert.match(html, /lg:grid-cols-12 lg:grid-rows-/)
  assert.match(html, /pricing-rent-swiper/)
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


test('Prices gets the membership offer and standards from homepage pricing content', () => {
  const rate = { description: '', includedItems: [], action: { mode: 'none' } }
  const rentalRates = [
    { ...rate, id: 'morning', title: 'Утро', cardVariant: 'rate', price: 3500 },
    { ...rate, id: 'prime', title: 'Прайм-тайм', cardVariant: 'rate', price: 5500 },
  ]
  const html = renderToStaticMarkup(<Prices dto={{ ...dto, rentalRates, membershipOffer: { enabled: true, showOnHomepage: true, title: 'Специальные абонементы', description: 'Скидки', priceLabel: 'Цена по запросу', action: { mode: 'none' } }, rentalStandards: { enabled: true, showOnHomepage: true, title: 'Стандарты Unlim Riga', description: 'Условия', includedItems: ['Корзина мячей'], action: { mode: 'none' } } }} />)
  assert.ok(html.indexOf('Прайм-тайм') < html.indexOf('Специальные абонементы'))
  assert.match(html, /Цена по запросу/)
  assert.match(html, /Стандарты Unlim Riga/)
  assert.match(html, /lg:col-span-8 lg:row-start-2/)
  assert.match(html, /lg:col-start-9 lg:row-span-2 lg:row-start-1/)
  assert.match(html, /pricing-rent-swiper/)
})

test('rental cards keep title and time at the top and description with the price at the bottom', () => {
  const document = new Window().document
  document.body.innerHTML = renderToStaticMarkup(<RentalRateCard rate={{ id: 'morning', title: 'Утро', eyebrow: 'Выгодные часы', timeLabel: '07:00–09:00', description: 'Спокойные часы для игры', price: 3500, priceSuffix: '/ час', cardVariant: 'rate', includedItems: [], action: { mode: 'none' } }} />)
  const heading = document.querySelector('[data-rate-heading]')!
  const details = document.querySelector('[data-rate-details]')!
  assert.match(heading.textContent!, /Утро.*07:00–09:00/)
  assert.equal(heading.querySelector('p'), null)
  assert.match(details.className, /mt-auto/)
  assert.match(details.querySelector('p')!.textContent!, /Спокойные часы/)
  assert.ok(details.querySelector('.type-price'))
  assert.ok(details.querySelector('.arrow-action'))
})

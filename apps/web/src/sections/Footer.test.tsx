import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SiteProvider } from '../content/ContentContext'
import { Footer } from './Footer'

const site = {
  brandName: 'UNLIM RIGA PADEL',
  partners: [],
  footer: {
    showPartners: false,
    about: 'Падел-клуб',
    stats: [],
    legalEntity: 'ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451',
    navigation: [
      { label: 'О клубе', href: '/about', column: '1' },
      { label: 'Тренировки', href: '/training', column: '2' },
    ],
    socialLinks: [{ provider: 'telegram', label: 'Telegram', url: 'https://t.me/unlim' }],
    legalLinks: [
      { label: 'Политика конфиденциальности', href: '/policy' },
      { label: 'Публичная оферта', href: '/oferta' },
    ],
    copyright: '© UNLIM',
    cookieNotice: { text: '', acceptLabel: '', rejectLabel: '', manageLabel: '' },
  },
  contacts: {
    address: 'Москва',
    directionsURL: 'https://yandex.ru/maps/example',
    transit: 'Строгино',
    parking: 'Парковка',
    openingHours: '07:00–23:00',
    phoneDisplay: '+7 999 000-00-00',
    phoneValue: '+79990000000',
    email: 'club@example.com',
    labels: { address: 'Адрес', transit: 'Ближайшее метро', parking: 'Парковка', openingHours: 'Часы работы', phone: 'Телефон', email: 'Email' },
    map: { longitude: 37.3, latitude: 55.8, zoom: 15 },
  },
  booking: { mode: 'external-link', ready: true, buttonLabel: 'Забронировать корт', externalURL: 'https://booking.example' },
  contactConfirmation: { channels: [], leadEndpoint: '/api/leads' },
  analytics: { mode: 'disabled', vendors: {} },
} as any

test('footer centers legal links and credits OCHK.OOO', () => {
  const html = renderToStaticMarkup(<SiteProvider site={site} captureContacts={false}><Footer /></SiteProvider>)

  const legalRow = html.match(/<div class="type-caption grid grid-cols-1[\s\S]*?<\/div><\/div><\/footer>/)?.[0] ?? ''
  assert.match(legalRow, /© UNLIM/)
  assert.match(legalRow, /href="\/policy"[^>]*>Политика конфиденциальности<\/a>/)
  assert.match(legalRow, /href="\/oferta"[^>]*>Публичная оферта<\/a>/)
  assert.match(legalRow, /href="https:\/\/ochk\.ooo"[^>]*>Разработано OCHK\.OOO<\/a>/)
  assert.match(legalRow, /sm:grid-cols-\[minmax\(0,1fr\)_auto_minmax\(0,1fr\)\]/)
  assert.match(legalRow, /justify-center/)
  assert.match(html, /Ближайшее метро[\s\S]*Строгино/)
})

test('partner strip follows the CMS footer toggle', () => {
  const hidden = renderToStaticMarkup(<SiteProvider site={site} captureContacts={false}><Footer /></SiteProvider>)
  assert.doesNotMatch(hidden, /partners-marquee/)

  const visibleSite = { ...site, footer: { ...site.footer, showPartners: true }, partners: [{ id: 'p1', name: 'Partner One' }] }
  const visible = renderToStaticMarkup(<SiteProvider site={visibleSite} captureContacts={false}><Footer /></SiteProvider>)
  assert.match(visible, /partners-marquee/)
  assert.match(visible, /Partner One/)
})

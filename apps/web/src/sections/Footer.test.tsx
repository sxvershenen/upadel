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
    about: 'Падел-клуб',
    stats: [],
    legalEntity: 'ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451',
    navigation: [
      { label: 'О клубе', href: '/about', column: '1' },
      { label: 'Тренировки', href: '/training', column: '2' },
    ],
    socialLinks: [{ provider: 'telegram', label: 'Telegram', url: 'https://t.me/unlim' }],
    legalLinks: [],
    copyright: '© UNLIM',
    cookieNotice: { text: '', acceptLabel: '', rejectLabel: '', manageLabel: '' },
  },
  contacts: {
    address: 'Москва',
    directionsURL: 'https://yandex.ru/maps/example',
    transit: 'Транспорт',
    parking: 'Парковка',
    openingHours: '07:00–23:00',
    phoneDisplay: '+7 999 000-00-00',
    phoneValue: '+79990000000',
    email: 'club@example.com',
    labels: { address: 'Адрес', transit: 'Транспорт', parking: 'Парковка', openingHours: 'Часы работы', phone: 'Телефон', email: 'Email' },
    map: { longitude: 37.3, latitude: 55.8, zoom: 15 },
  },
  booking: { mode: 'external-link', ready: true, buttonLabel: 'Забронировать корт', externalURL: 'https://booking.example' },
  contactConfirmation: { channels: [], leadEndpoint: '/api/leads' },
  analytics: { mode: 'disabled', vendors: {} },
} as any

test('footer renders separate legal lines, centered CMS navigation and icon-only actions', () => {
  const html = renderToStaticMarkup(<SiteProvider site={site} captureContacts={false}><Footer /></SiteProvider>)

  assert.match(html, /data-footer-legal[^>]*><span>ООО «Анлим Спорт»<\/span><span>ИНН 5024178932 · ОГРН 1235000078451<\/span>/)
  assert.match(html, /<nav aria-label="Навигация в подвале"/)
  assert.match(html, />О клубе<\/a>/)
  assert.match(html, />Тренировки<\/a>/)
  assert.match(html, /<button[^>]*aria-label="Позвонить"[^>]*data-analytics-action="phone"/)
  assert.match(html, /<a[^>]*aria-label="Построить маршрут"[^>]*href="https:\/\/yandex\.ru\/maps\/example"[^>]*data-analytics-action="directions"/)
  const bookingAction = html.match(/<a[^>]*aria-label="Забронировать корт"[^>]*>/)?.[0] ?? ''
  assert.match(bookingAction, /href="https:\/\/booking\.example"/)
  assert.match(bookingAction, /data-analytics-action="booking"/)
  assert.match(html, /data-footer-actions[\s\S]*aria-label="Telegram"/)
  assert.doesNotMatch(html, />Позвонить<|>Построить маршрут<|>Забронировать корт</)
})

test('footer booking action keeps the consultation fallback when booking is not ready', () => {
  const fallbackSite = { ...site, booking: { mode: 'disabled', ready: false, buttonLabel: 'Забронировать корт' } }
  const html = renderToStaticMarkup(<SiteProvider site={fallbackSite} captureContacts={false}><Footer /></SiteProvider>)

  assert.match(html, /<button[^>]*aria-label="Забронировать корт"[^>]*data-analytics-action="booking"/)
  assert.doesNotMatch(html, /href="https:\/\/booking\.example"/)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ContentAction } from '../components/ContentAction'
import { SiteProvider } from '../content/ContentContext'
import { MobileBottomNav } from '../components/navigation/MobileBottomNav'

const site = {
  booking: { mode: 'vivacrm-widget', ready: true, buttonLabel: 'Бронь', widgetURL: 'https://supadb.vivacrm.ru/storage/v1/object/public/widgets/3ffc4681-890e-4d27-9676-1a5a7c246b17.js' },
  account: { mode: 'vivacrm-widget', ready: true, buttonLabel: 'Личный кабинет', mobileLabel: 'Кабинет' },
  contactConfirmation: { channels: [] }, contacts: {}, footer: { socialLinks: [] },
  mobileNavigation: [{ href: '/', label: 'Главная', icon: 'Home' }, { href: '/training', label: 'Тренировки', icon: 'Dumbbell' }, { href: '/prices', label: 'Цены', icon: 'Tag' }],
  mobileActions: { playLabel: 'Играть', menuLabel: 'Меню' }, mobileMenuNavigation: [],
} as any
const render = (child: React.ReactNode, settings = site) => renderToStaticMarkup(<SiteProvider site={settings} captureContacts={false}>{child}</SiteProvider>)

test('booking, trial, account and individual widgets use buttons without executing script in SSR', () => {
  for (const mode of ['booking', 'trial-booking', 'account', 'embed-widget'] as const) {
    const html = render(<ContentAction action={{ mode, label: 'Запись', widgetKind: 'iframe', widgetURL: 'https://booking.example' }} />)
    assert.match(html, /<button/)
    assert.doesNotMatch(html, /<script|<iframe|<a /)
    assert.match(html, /Запись/)
  }
})

test('external booking links and disabled booking consultation remain available', () => {
  assert.match(render(<ContentAction action={{ mode: 'booking' }} />, { ...site, booking: { mode: 'external-link', ready: true, externalURL: 'https://booking.example' } }), /href="https:\/\/booking.example"/)
  assert.match(render(<ContentAction action={{ mode: 'booking' }} />, { ...site, booking: { mode: 'disabled', ready: false } }), /data-analytics-action="booking"/)
})

test('mobile navigation has five slots, prices second and account fourth, including old CMS data', () => {
  const html = render(<MobileBottomNav />)
  assert.match(html, /Главная[\s\S]*Цены[\s\S]*aria-label="Играть"[\s\S]*Кабинет[\s\S]*Меню/)
  assert.equal((html.match(/href="\/prices"/g) ?? []).length, 1)
  assert.doesNotMatch(html, /href="\/training"/)
  assert.match(html, /aria-label="Личный кабинет"/)
})

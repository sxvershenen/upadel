import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SiteProvider } from '../../content/ContentContext'
import { DesktopHeader } from './DesktopHeader'

const site = {
  brandName: 'UNLIM',
  brandLogo: null,
  brandLogoMode: 'text',
  headerSubtitle: 'RIGA PADEL',
  desktopNavigation: [{ label: 'Цены', href: '/prices', children: [] }],
  footer: { socialLinks: [] },
  contacts: { phoneValue: '+37100000000' },
  booking: { buttonLabel: 'Забронировать', externalURL: 'https://booking.example', mode: 'external-link', ready: true },
  contactConfirmation: { dialogTitle: '', formTitle: '', channels: [] },
} as any

function tagWithClass(html: string, className: string) {
  return html.match(new RegExp(`<[^>]+class="[^"]*${className}[^"]*"[^>]*>`))?.[0] ?? ''
}

test('desktop header SSR emits one visible booking state before hydration', () => {
  const html = renderToStaticMarkup(<SiteProvider site={site} captureContacts={false}><DesktopHeader /></SiteProvider>)
  const control = tagWithClass(html, 'desktop-header-booking-control')
  assert.match(tagWithClass(html, 'desktop-header fixed'), /style="[^"]*--header-progress:0/)
  assert.match(control, /data-booking-mode="expanded"/)
  assert.match(html, /<span[^>]*data-booking-icon="true"[^>]*aria-hidden="true"/)
  assert.match(html, /<span[^>]*data-booking-label="true"[^>]*aria-hidden="false"/)
  const bookingButton = html.match(/<a[^>]*aria-label="Забронировать"[^>]*>/)?.[0] ?? ''
  assert.ok(bookingButton)
  assert.doesNotMatch(bookingButton, /data-gsap-reveal/)
})

test('desktop navigation keeps a local fallback icon while a CMS icon loads', () => {
  const html = renderToStaticMarkup(<SiteProvider site={{ ...site, desktopNavigation: [{ label: 'Цены', href: '/prices', icon: { url: '/media/prices.svg' }, children: [] }] }} captureContacts={false}><DesktopHeader /></SiteProvider>)
  assert.match(html, /data-navigation-icon="prices"/)
  assert.match(html, /src="\/media\/prices\.svg"/)
  assert.match(html, /absolute inset-0 m-auto h-4 w-4/)
  assert.match(html, /lucide-tag|<svg/)
})

test('desktop navigation labels keep one grid-aligned box before and after measurement', () => {
  const html = renderToStaticMarkup(<SiteProvider site={site} captureContacts={false}><DesktopHeader /></SiteProvider>)
  const contents = tagWithClass(html, 'desktop-header-nav-content')
  const label = html.match(/<span[^>]*data-header-nav-label="true"[^>]*>/)?.[0] ?? ''
  assert.match(contents, /\bgrid\b/)
  assert.doesNotMatch(label, /\babsolute\b|\binset-0\b/)
})

test('tournament and gift icons use the same centered wrapper as every navigation icon', () => {
  const html = renderToStaticMarkup(<SiteProvider site={{ ...site, desktopNavigation: [
    { label: 'Турниры', href: '/tournaments', children: [] },
    { label: 'Подарить', href: '/gift', children: [] },
  ] }} captureContacts={false}><DesktopHeader /></SiteProvider>)
  const icons = html.match(/<span data-navigation-icon="(?:tournaments|gift)" class="[^"]+">/g) ?? []

  assert.equal(icons.length, 2)
  icons.forEach((icon) => {
    assert.match(icon, /class="relative block h-5 w-5 shrink-0"/)
    assert.doesNotMatch(icon, /translate-/)
  })
  assert.match(html, /data-navigation-glyph="tournaments"/)
  assert.match(html, /data-navigation-glyph="gift"/)
})

import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ActionLayerProvider } from '../actions/ActionLayer'
import {
  GiftLandingPage,
  giftPackages,
  useCases,
  giftFormats,
  termsList,
  padelFacts,
  faqItems,
  typograph,
} from './GiftLandingPage'

const mockSite = {
  title: 'UNLIM RIGA PADEL',
  navigation: [],
  contacts: {
    phone: '+7 999 000-00-00',
    email: 'info@unlimriga.club',
    address: 'Новорижское шоссе, 3к1',
    socials: {
      telegram: 'https://t.me/unlimpadel',
      vk: 'https://vk.com/unlimpadel',
    },
  },
  booking: {
    leadRecipientEmail: 'booking@unlimriga.club',
    phone: '+7 999 000-00-00',
    telegramBot: 'unlimpadel',
  },
  contactConfirmation: {
    dialogTitle: 'Связаться с клубом',
    formTitle: 'Заявка',
    cancelLabel: 'Отмена',
    continueLabel: 'Перейти',
    channels: [],
  },
  requisites: {
    legalName: 'ООО «Анлим Спорт»',
    inn: '5024178932',
    ogrn: '1235000078451',
  },
  operatingHours: '07:00–23:00',
  address: 'Новорижское шоссе, 3к1',
}

test('GiftLandingPage renders server HTML with SEO content, schema.org metadata and key sections', () => {
  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <GiftLandingPage dto={{ site: mockSite } as any} />
    </ActionLayerProvider>
  )

  // H1 heading and key SEO texts
  assert.match(html, /<h1[^>]*>[\s\S]*?Подарочный сертификат на\u00A0падел в\u00A0Москве[\s\S]*?<\/h1>/)
  assert.match(html, /id="packages"/)
  assert.match(html, /id="terms"/)
  assert.match(html, /id="order-section"/)

  // Schema.org JSON-LD
  assert.match(html, /application\/ld\+json/)
  assert.match(html, /schema\.org/)
  assert.match(html, /"FAQPage"/)
  assert.match(html, /"BreadcrumbList"/)
  assert.match(html, /"Product"/)

  // Packages count
  assert.equal(giftPackages.length, 6)
  for (const pkg of giftPackages) {
    assert.match(html, new RegExp(pkg.title))
  }

  // Use cases, formats, terms, facts, and FAQs counts
  assert.equal(useCases.length, 4)
  assert.equal(giftFormats.length, 2)
  assert.equal(termsList.length, 6)
  assert.equal(padelFacts.length, 4)
  assert.equal(faqItems.length, 6)

  // Varlion partnership badge and mentions
  assert.match(html, /Официальный партнер Varlion/)
  assert.match(html, /Varlion/)
})

test('typograph helper binds prepositions and short words with non-breaking spaces', () => {
  assert.equal(typograph('Сертификат на падел в Москве'), 'Сертификат на\u00A0падел в\u00A0Москве')
  assert.equal(typograph('Игра с тренером и аренда корта'), 'Игра с\u00A0тренером и\u00A0аренда корта')
  assert.equal(typograph('подарок для друга'), 'подарок для\u00A0друга')
})

import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ActionLayerProvider } from '../actions/ActionLayer'
import {
  GiftLandingPage,
  useCases,
  giftFormats,
  termsList,
  faqItems,
  typograph,
} from './GiftLandingPage'

const mockSite = {
  title: 'UNLIM RIGA PADEL',
  brandName: 'UNLIM RIGA PADEL',
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
  assert.match(html, /id="terms"/)
  assert.match(html, /id="order-section"/)

  // Schema.org JSON-LD
  assert.match(html, /application\/ld\+json/)
  assert.match(html, /schema\.org/)
  assert.match(html, /"FAQPage"/)
  assert.match(html, /"BreadcrumbList"/)
  assert.match(html, /"Product"/)

  // Formats (physical box on left, digital PDF on right)
  assert.equal(giftFormats.length, 2)
  assert.equal(giftFormats[0].id, 'box')
  assert.equal(giftFormats[1].id, 'digital')
  assert.match(html, /Физический бокс/)
  assert.match(html, /Электронный PDF/)
  assert.doesNotMatch(html, /ring-ink/)

  // Use cases, terms, and FAQs counts
  assert.equal(useCases.length, 4)
  assert.equal(termsList.length, 6)
  assert.equal(faqItems.length, 6)

  // Form inputs have sr-only labels
  assert.match(html, /class="[^"]*sr-only[^"]*"[^>]*>Ваше имя<\/label>/)
  assert.match(html, /class="[^"]*sr-only[^"]*"[^>]*>Контакт для связи<\/label>/)
})

test('typograph helper binds prepositions and short words with non-breaking spaces', () => {
  assert.equal(typograph('Сертификат на падел в Москве'), 'Сертификат на\u00A0падел в\u00A0Москве')
  assert.equal(typograph('Игра с тренером и аренда корта'), 'Игра с\u00A0тренером и\u00A0аренда корта')
  assert.equal(typograph('подарок для друга'), 'подарок для\u00A0друга')
})

test('GiftLandingPage uses the typed CMS content when it is available', () => {
  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <GiftLandingPage dto={{
        kind: 'gift',
        site: mockSite,
        page: { title: 'CMS hero title', intro: 'CMS hero intro', hero: { grayscale: false, media: { url: '/cms-hero.webp', alt: 'CMS hero', mimeType: 'image/webp' } } },
        offerTitle: 'CMS use cases', offerCopy: 'CMS use case copy', formatsTitle: 'CMS formats', formatsCopy: 'CMS formats copy', termsTitle: 'CMS terms', termsCopy: 'CMS terms copy',
        benefits: [{ badge: 'CMS badge', title: 'CMS benefit', body: 'CMS benefit copy', icon: 'Gift' }],
        formats: [{ id: 'box', badge: 'CMS box', title: 'CMS box title', image: { url: '/cms-box.webp', alt: 'CMS box', mimeType: 'image/webp' }, features: ['CMS feature'], buttonText: 'CMS select', buttonSelectedText: 'CMS selected' }],
        terms: [{ title: 'CMS rule', text: 'CMS rule copy', icon: 'CalendarCheck' }],
        stepsEyebrow: '', stepsTitle: '', steps: [], articleHTML: '', faqTitle: 'CMS FAQ', faq: [{ question: 'CMS question', answer: 'CMS answer' }],
        form: { sectionTitle: 'CMS form title', sectionCopy: 'CMS form copy', channelLabel: 'Связаться в', telegramLabel: 'CMS Telegram', phoneLabel: 'CMS phone', vkLabel: 'CMS VK', formatLabel: 'CMS format label', purposeLabel: 'CMS purpose label', namePlaceholder: 'CMS name', contactPhonePlaceholder: 'CMS phone placeholder', contactTelegramPlaceholder: 'CMS telegram placeholder', contactVKPlaceholder: 'CMS VK placeholder', recipientPlaceholder: 'CMS recipient', commentPlaceholder: 'CMS comment', consentLabel: 'CMS consent', policyLabel: 'CMS policy', submitLabel: 'CMS submit', successTitle: 'CMS success', successText: 'CMS success copy', resubmitLabel: 'CMS resubmit' },
      } as any} />
    </ActionLayerProvider>
  )

  assert.match(html, /CMS hero title/)
  assert.match(html, /CMS benefit/)
  assert.match(html, /CMS box title/)
  assert.match(html, /CMS rule/)
  assert.match(html, /CMS form title/)
  assert.match(html, /CMS question/)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
import { Offers } from './Offers'
import { OfferCard, type Offer } from '../components/cards/OfferCard'
import { ContentProvider } from '../content/ContentContext'

const offer: Offer = { id: '1', variant: 'event', badge: 'Под ваш формат', title: 'Ваше мероприятие', description: 'Турниры и праздники', meshTone: 'deep-blue', icon: 'Trophy', action: { mode: 'none' }, image: { url: '/tournament.webp', alt: 'Победители', mimeType: 'image/webp' } }
const site = { contacts: { phoneValue: '+79858350055' }, contactConfirmation: { channels: [] } }
const render = (offers: Offer[]) => renderToStaticMarkup(<ContentProvider content={{ site, home: { offers } } as any}><Offers /></ContentProvider>)
const renderCard = (card: Offer) => renderToStaticMarkup(<ContentProvider content={{ site, home: { offers: [] } } as any}><OfferCard offer={card} /></ContentProvider>)

test('zero offers remove the entire section; one fills the width and two split only above 1040px', () => {
  assert.equal(render([]), '')
  const one = render([offer])
  assert.match(one, /data-offers-section/)
  assert.doesNotMatch(one, /min-\[1041px\]:grid-cols-2/)
  assert.match(one, /md:aspect-\[4\/1\]/)
  assert.match(one, /offer-card--wide/)
  assert.match(one, /sizes="\(min-width: 1280px\) min\(1884px, calc\(100vw - 96px\)\), \(min-width: 768px\) calc\(100vw - 64px\), calc\(100vw - 40px\)"/)
  const oneDocument = new Window().document
  oneDocument.body.innerHTML = one
  assert.ok(oneDocument.querySelector('[data-offer-card] h3')!.classList.contains('type-section'))
  assert.ok(oneDocument.querySelector('[data-offer-card] p')!.classList.contains('type-body'))
  const two = render([offer, { ...offer, id: '2' }])
  assert.match(two, /min-\[1041px\]:grid-cols-2/)
  assert.match(two, /sizes="\(min-width: 1280px\) min\(934px, calc\(50vw - 56px\)\), \(min-width: 1041px\) calc\(50vw - 40px\), \(min-width: 768px\) calc\(100vw - 64px\), calc\(100vw - 40px\)"/)
  assert.doesNotMatch(two, /offer-card--wide/)
  const document = new Window().document
  document.body.innerHTML = two
  assert.equal(document.querySelectorAll('[data-offer-card]').length, 2)
  assert.ok([...document.querySelectorAll('[data-offer-card]')].every((card) => card.className.includes('md:aspect-[2/1]')))
  assert.ok([...document.querySelectorAll('[data-offer-card] h3')].every((heading) => heading.classList.contains('type-title-card')))
  assert.ok([...document.querySelectorAll('[data-offer-card] p')].every((paragraph) => paragraph.classList.contains('type-body-sm')))
  assert.ok([...document.querySelectorAll('[data-offer-card]')].every((card) => !card.className.includes('md:grid-cols-2')))
})

test('event offer retains the decorative arrow and exposes a single full-card contact action', () => {
  const document = new Window().document
  document.body.innerHTML = renderCard(offer)
  assert.equal(document.querySelectorAll('button,a').length, 1)
  assert.equal(document.querySelector('button')!.getAttribute('data-analytics-action'), 'phone')
  assert.ok(document.querySelector('.arrow-action'))
  assert.ok(document.querySelector('[data-parallax-layer] img'))
  assert.ok(document.querySelector('[data-image-overlay="overlay-blue"]'))
  assert.match(document.querySelector('[data-offer-card]')!.className, /card-spring/)
})

test('event offer renders a full-card contact control for both CMS variants', () => {
  for (const variant of ['event', 'tournament-venue'] as const) {
    const document = new Window().document
    document.body.innerHTML = renderToStaticMarkup(<ContentProvider content={{ site: { contacts: { phoneValue: '+79858350055' }, contactConfirmation: { channels: [] } }, home: { offers: [] } } as any}><OfferCard offer={{ ...offer, variant }} /></ContentProvider>)
    const button = document.querySelector('button[aria-label="Ваше мероприятие — связаться с клубом"]')
    assert.ok(button, `${variant} offers should expose the contact action`)
    assert.match(button!.className, /!absolute/)
    assert.match(button!.className, /!inset-0/)
    assert.equal(document.querySelectorAll('a').length, 0)
  }
})

test('empty optional fields still render an accessible event action without empty content', () => {
  const document = new Window().document
  document.body.innerHTML = renderCard({ ...offer, badge: '', title: '', description: '', image: null, icon: null })
  assert.ok(document.querySelector('[data-offer-card]'))
  assert.equal(document.querySelectorAll('h3,p,img').length, 0)
  assert.equal(document.querySelectorAll('button').length, 1)
  assert.doesNotMatch(document.body.innerHTML, /md:grid-cols-2/)
})

test('event card keeps its phone action even when a CMS action is configured', () => {
  const html = renderCard({ ...offer, action: { mode: 'internal-link', href: '/contacts', label: 'Условия мероприятия' } })
  assert.match(html, /Ваше мероприятие — связаться с клубом/)
  assert.doesNotMatch(html, /Условия мероприятия/)
  assert.doesNotMatch(html, /href="\/contacts"/)
})

test('offer image uses the CMS color and never returns a split photo panel', () => {
  const html = renderToStaticMarkup(<ContentProvider content={{ site, home: { offers: [] } } as any}><OfferCard offer={{ ...offer, meshTone: 'indigo' }} wide /></ContentProvider>)
  assert.match(html, /data-image-overlay="overlay-violet"/)
  assert.doesNotMatch(html, /md:grid-cols-2/)
})

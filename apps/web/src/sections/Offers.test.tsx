import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
import { Offers } from './Offers'
import { OfferCard, type Offer } from '../components/cards/OfferCard'
import { ContentProvider } from '../content/ContentContext'

const offer: Offer = { id: '1', variant: 'event', badge: 'Корпоративные и частные мероприятия', title: 'Ваше мероприятие', description: 'Турниры и праздники', meshTone: 'deep-blue', icon: 'Trophy', action: { mode: 'none' }, image: { url: '/tournament.webp', alt: 'Победители', mimeType: 'image/webp' } }
const render = (offers: Offer[]) => renderToStaticMarkup(<ContentProvider content={{ site: { contactConfirmation: { channels: [] } }, home: { offers } } as any}><Offers /></ContentProvider>)

test('zero offers remove the entire section; one fills the width and two split only above 1040px', () => {
  assert.equal(render([]), '')
  const one = render([offer])
  assert.match(one, /data-offers-section/)
  assert.doesNotMatch(one, /min-\[1041px\]:grid-cols-2/)
  const two = render([offer, { ...offer, id: '2' }])
  assert.match(two, /min-\[1041px\]:grid-cols-2/)
  const document = new Window().document
  document.body.innerHTML = two
  assert.equal(document.querySelectorAll('[data-offer-card]').length, 2)
  assert.ok([...document.querySelectorAll('[data-offer-card]')].every((card) => !card.className.includes('md:grid-cols-2')))
})

test('none action retains the original decorative arrow and image hover without injecting a CTA', () => {
  const document = new Window().document
  document.body.innerHTML = renderToStaticMarkup(<OfferCard offer={offer} />)
  assert.equal(document.querySelectorAll('button,a').length, 0)
  assert.doesNotMatch(document.body.innerHTML, /Обсудить/)
  assert.ok(document.querySelector('.arrow-action'))
  assert.ok(document.querySelector('[data-parallax-layer] img'))
  assert.ok(document.querySelector('[data-image-overlay="overlay-blue"]'))
  assert.match(document.querySelector('[data-offer-card]')!.className, /card-spring/)
})

test('empty optional fields still render a card without empty headings, badge or image', () => {
  const document = new Window().document
  document.body.innerHTML = renderToStaticMarkup(<OfferCard offer={{ ...offer, badge: '', title: '', description: '', image: null, icon: null }} />)
  assert.ok(document.querySelector('[data-offer-card]'))
  assert.equal(document.querySelectorAll('h3,p,img,button,a').length, 0)
  assert.doesNotMatch(document.body.innerHTML, /md:grid-cols-2/)
})

test('CTA uses only the configured CMS label and disappears when its label is empty', () => {
  const context = (label: string) => <ContentProvider content={{ site: { contactConfirmation: { channels: [] } }, home: { offers: [] } } as any}><OfferCard offer={{ ...offer, action: { mode: 'internal-link', href: '/contacts', label } }} /></ContentProvider>
  assert.match(renderToStaticMarkup(context('Условия мероприятия')), /Условия мероприятия/)
  assert.doesNotMatch(renderToStaticMarkup(context('')), /<button|<a\s/)
})

test('offer image uses the CMS color and never returns a split photo panel', () => {
  const html = renderToStaticMarkup(<OfferCard offer={{ ...offer, meshTone: 'indigo' }} wide />)
  assert.match(html, /data-image-overlay="overlay-violet"/)
  assert.doesNotMatch(html, /md:grid-cols-2/)
})

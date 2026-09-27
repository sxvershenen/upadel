import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('swipe hint timing matches Swiper and pricing carousels keep their initial gap', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8')
  const rentSource = readFileSync(new URL('./PricingRent.tsx', import.meta.url), 'utf8')
  const membershipsSource = readFileSync(new URL('./PricingMemberships.tsx', import.meta.url), 'utf8')

  assert.match(css, /60\.9% \{ translate: var\(--swiper-hint-translate/)
  assert.match(css, /swiper-swipe-hint 1\.33s both/)
  assert.match(rentSource, /className="swiper-breathe pricing-rent-swiper !px-5"/)
  assert.match(membershipsSource, /className="swiper-breathe pricing-memberships-swiper !px-5"/)
  assert.match(
    css,
    /\.pricing-rent-swiper:not\(\.swiper-initialized\) \.swiper-wrapper,\s*\.pricing-memberships-swiper:not\(\.swiper-initialized\) \.swiper-wrapper \{ gap: 12px; \}/,
  )
})

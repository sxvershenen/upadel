import assert from 'node:assert/strict'
import test from 'node:test'
import type { SiteDTO } from '@unlim/content-contract'

import { SITE_UPDATE_EVENT, subscribeSiteUpdates } from './ContentContext'

test('persistent chrome can receive fresh site settings from an incoming page provider', () => {
  const target = new EventTarget()
  const received: SiteDTO[] = []
  const unsubscribe = subscribeSiteUpdates(target, (site) => received.push(site))
  const freshSite = { brandName: 'Published brand' } as SiteDTO

  target.dispatchEvent(new CustomEvent<SiteDTO>(SITE_UPDATE_EVENT, { detail: freshSite }))
  unsubscribe()
  target.dispatchEvent(new CustomEvent<SiteDTO>(SITE_UPDATE_EVENT, { detail: { brandName: 'Ignored' } as SiteDTO }))

  assert.deepEqual(received, [freshSite])
})

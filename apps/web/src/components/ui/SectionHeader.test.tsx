import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SiteProvider } from '../../content/ContentContext'
import { SectionAction } from './SectionHeader'

const site = {
  booking: { buttonLabel: 'Забронировать', mode: 'external-link', ready: true },
  contactConfirmation: { channels: [] },
  contacts: {},
} as any

test('section navigation action uses muted text, diagonal arrow and no icon divider', () => {
  const html = renderToStaticMarkup(
    <SiteProvider site={site} captureContacts={false}>
      <SectionAction action={{ mode: 'internal-link', href: '/blog', label: 'Ещё' }}>Ещё</SectionAction>
    </SiteProvider>,
  )

  assert.match(html, /text-ink-soft/)
  assert.match(html, /lucide-arrow-up-right/)
  assert.doesNotMatch(html, /h-5 w-px/)
})

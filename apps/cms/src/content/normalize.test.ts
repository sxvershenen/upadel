import assert from 'node:assert/strict'
import test from 'node:test'

import { siteDTO } from './normalize'

test('site projection normalizes desktop navigation child icons', () => {
  const dto = siteDTO({
    brandName: 'UNLIM',
    desktopNavigation: [{
      label: 'Цены',
      href: '/prices',
      children: [
        { label: 'Аренда', href: '/prices', icon: { alt: '', mimeType: 'image/svg+xml', url: '/rent.svg' } },
        { label: 'Тренеры', href: '/coaches', icon: 17 },
      ],
    }],
  } as never, 'https://cms.example')

  assert.equal(dto.desktopNavigation[0].children?.[0].icon?.url, 'https://cms.example/rent.svg')
  assert.equal(dto.desktopNavigation[0].children?.[1].icon, null)
})

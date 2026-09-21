import assert from 'node:assert/strict'
import test from 'node:test'

import { mediaDTO, siteDTO } from './normalize'

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

test('internal Payload media can be projected through a same-origin web proxy', () => {
  const media = mediaDTO({ alt: 'Фото', mimeType: 'image/webp', url: 'http://cms.internal:3000/api/media/file/photo.webp' } as never, 'http://192.168.1.20:4321', 'original')
  assert.equal(media?.url, 'http://192.168.1.20:4321/api/media/file/photo.webp')
  const external = mediaDTO({ alt: 'Фото', mimeType: 'image/webp', url: 'https://cdn.example.test/photo.webp' } as never, 'http://192.168.1.20:4321', 'original')
  assert.equal(external?.url, 'https://cdn.example.test/photo.webp')
})

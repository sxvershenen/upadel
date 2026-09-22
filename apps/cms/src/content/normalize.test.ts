import assert from 'node:assert/strict'
import test from 'node:test'

import { mediaDTO, siteDTO } from './normalize'

test('responsive media keeps source aspect ratio and excludes a differently cropped thumbnail', () => {
  const dto = mediaDTO({ alt: 'Корт', mimeType: 'image/webp', url: '/original.webp', width: 2400, height: 1600, sizes: {
    small: { url: '/small.webp', width: 640, height: 427 },
    thumbnail: { url: '/square.webp', width: 480, height: 480 },
    card: { url: '/card.webp', width: 1200, height: 800 },
    hero: { url: '/hero.webp', width: 1920, height: 1280 },
  } }, 'https://cms.unlimpadel.ru', 'hero')
  assert.equal(dto?.srcSet, 'https://cms.unlimpadel.ru/small.webp 640w, https://cms.unlimpadel.ru/card.webp 1200w, https://cms.unlimpadel.ru/hero.webp 1920w')
  assert.equal(dto?.width, 1920)
  assert.equal(dto?.height, 1280)
})

test('placeholder social profiles are not published or enabled as contact actions', () => {
  const dto = siteDTO({ brandName: 'UNLIM', socialLinks: [
    { provider: 'telegram', label: 'Telegram', url: 'https://t.me' },
    { provider: 'vk', label: 'VK', url: 'https://vk.ru/unlimpadel' },
    { provider: 'video', label: 'Видео', url: '#' },
  ] } as never, 'https://cms.unlimpadel.ru')
  assert.deepEqual(dto.footer.socialLinks.map((item) => item.url), ['https://vk.ru/unlimpadel'])
  assert.equal(dto.contactConfirmation.channels.find((item) => item.channel === 'telegram')?.enabled, false)
})

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

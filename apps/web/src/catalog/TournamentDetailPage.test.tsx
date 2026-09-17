import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { TournamentDetailDTO } from '@unlim/content-contract'

import { ActionLayerProvider } from '../actions/ActionLayer'
import { TournamentDetailPage, typograph } from './TournamentDetailPage'

const mockSite = {
  title: 'UNLIM RIGA PADEL',
  brandName: 'UNLIM RIGA PADEL',
  partners: [],
  navigation: [],
  desktopNavigation: [],
  mobileNavigation: [],
  mobileMenuNavigation: [],
  footer: {
    about: 'Премиальный падел-клуб',
    legalEntity: 'ООО «Анлим Спорт»',
    copyright: '© 2026 UNLIM RIGA PADEL',
    navigation: [],
    socialLinks: [],
    legalLinks: [],
    stats: [{ value: '4', label: 'корта' }],
  },
  contacts: {
    address: 'Новорижское шоссе, 3к1',
    directionsURL: null,
    phoneDisplay: '+7 (495) 000-00-00',
    phoneValue: '+74950000000',
    email: 'info@unlimriga.club',
    transit: 'Метро Строгино',
    parking: 'Бесплатная парковка',
    openingHours: '07:00–23:00',
    labels: {
      address: 'Адрес',
      transit: 'Транспорт',
      parking: 'Парковка',
      openingHours: 'Часы работы',
      phone: 'Телефон',
      email: 'Email',
    },
    map: { latitude: 55.79, longitude: 37.31, zoom: 15 },
    socials: {
      telegram: 'https://t.me/unlimpadel',
      vk: 'https://vk.com/unlimpadel',
    },
  },
  booking: {
    buttonLabel: 'Забронировать корт',
    mode: 'internal-modal',
    ready: true,
  },
  contactConfirmation: {
    dialogTitle: 'Связаться с клубом',
    formTitle: 'Заявка',
    cancelLabel: 'Отмена',
    continueLabel: 'Перейти',
    channels: [],
  },
  analytics: {
    vendors: {},
  },
}

const mockTournamentDTO = {
  version: 10,
  kind: 'tournaments',
  preview: false,
  generatedAt: new Date().toISOString(),
  site: mockSite as any,
  page: {
    eyebrow: 'Клубная пятница',
    title: 'Game Party / Americano',
    intro: 'Самый душевный формат для знакомства с игроками клуба.',
    hero: {
      media: { url: '/page-heroes/tournaments.webp', alt: 'Турниры', mimeType: 'image/webp' },
      grayscale: false,
    },
    seo: { robots: 'index-follow' },
  },
  item: {
    id: 't-americano',
    slug: 'americano',
    title: 'Game Party / Americano',
    category: 'Клубная пятница',
    lifecycle: 'active',
    scheduleLabel: 'Каждую пятницу · 19:30–22:30',
    format: 'Americano (смена напарников каждый сет)',
    entryFee: '2 500 ₽ / участник',
    description: 'Самый душевный формат для знакомства с игроками клуба. Музыкальный сет, питьевая вода и динамичные матчи.',
    prizeLabel: 'Стоимость за участника',
    prize: '2 500 ₽',
    visualStyle: 'image',
    image: { url: '/tournaments/party.webp', alt: 'Party', mimeType: 'image/webp' },
    icon: 'PartyPopper',
    regulationHTML: '<p>Регистрация закрывается за 2 часа до начала. Формат — Americano со сменой напарников каждый сет. На матч приезжайте за 15 минут до старта.</p>',
    categoryKey: 'club-game',
    formatKey: 'americano',
    action: { label: 'Записаться', mode: 'booking' },
    seo: { robots: 'index-follow' },
  },
  related: [
    {
      id: 't-open',
      slug: 'open-league',
      title: 'Unlim Riga Masters Cup',
      category: 'Мужская Лига (B/C)',
      lifecycle: 'finished',
      scheduleLabel: 'Суббота, 14 марта · 11:00–17:00',
      format: 'Групповой этап + Олимпийская сетка',
      entryFee: 'Взнос: 4 500 ₽ / пара',
      description: 'Рейтинговый кубок для опытных пар.',
      prizeLabel: 'Призовой фонд',
      prize: '80 000 ₽',
      visualStyle: 'mesh',
      meshStyle: 'deep-blue',
      icon: 'Trophy',
      regulationHTML: '<p>Олимпийская сетка.</p>',
      categoryKey: 'mens-league',
      formatKey: 'groups-knockout',
      action: { label: 'Турнир завершён', mode: 'none' },
    },
  ],
}

test('TournamentDetailPage renders hero without buttons/badge/eyebrows and Swiss structure with passport, regulations, side-by-side timeline and FAQ', () => {
  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <TournamentDetailPage dto={mockTournamentDTO as unknown as TournamentDetailDTO} />
    </ActionLayerProvider>
  )

  // 1. Hero block checks: unchanged H1, intro; no actions, no badge, no eyebrow
  assert.match(html, /<header[^>]*class="page-hero[^>]*>/)
  assert.match(html, /<h1[^>]*>[\s\S]*?Game Party \/ Americano[\s\S]*?<\/h1>/)
  assert.doesNotMatch(html, /data-page-enter="eyebrow"/)
  assert.doesNotMatch(html, /data-page-enter="actions"/)

  // 2. Breadcrumbs removed
  assert.doesNotMatch(html, /aria-label="Хлебные крошки"/)

  // 3. Tournament passport metrics (no 01-04 numbers, bottom aligned)
  assert.match(html, /aria-label="Паспорт турнира"/)
  assert.match(html, /Расписание/)
  assert.doesNotMatch(html, /01\s*·/)
  assert.match(html, /19:30–22:30/)
  assert.match(html, /Формат/)
  assert.doesNotMatch(html, /02\s*·/)
  assert.match(html, /Americano/)
  assert.match(html, /Взнос/)
  assert.doesNotMatch(html, /03\s*·/)
  assert.match(html, /2[\s\u00A0]500[\s\u00A0]₽ \/ участник/)
  assert.match(html, /mt-auto/)

  // 4. Regulations and Checklist
  assert.match(html, /Регламент турнира/)
  assert.match(html, /Перед выходом на\u00A0корт/)
  assert.match(html, /Включено для\u00A0каждого игрока/)
  assert.doesNotMatch(html, /Особенности формата/)
  assert.match(html, /type-body/)
  assert.match(html, /Питьевая вода/)
  assert.doesNotMatch(html, /фруктовый бар/)
  assert.doesNotMatch(html, /без ограничений/)

  // 5. Side-by-side Matchday Timeline and FAQ on PC
  assert.match(html, /aria-label="Игровой день и вопросы"/)
  assert.match(html, /Как проходит игровой день/)
  assert.match(html, /Сбор и\u00A0разминка/)
  assert.match(html, /Брифинг и\u00A0жеребьёвка/)
  assert.match(html, /Частые вопросы/)
  assert.match(html, /Нужен ли постоянный напарник для\u00A0участия\?/)

  // 6. Registration CTA block (no badges)
  assert.match(html, /aria-label="Запись на турнир"/)
  assert.match(html, /Готовы выйти на\u00A0корт\?/)
  assert.doesNotMatch(html, /Регистрация открыта/)

  // 7. Related Tournaments
  assert.match(html, /aria-label="Другие турниры"/)
  assert.match(html, /Другие турниры и\u00A0лиги/)
  assert.match(html, /Unlim Riga Masters Cup/)
})

test('TournamentDetailPage renders completed lifecycle state appropriately without badges', () => {
  const completedDTO = {
    ...mockTournamentDTO,
    item: {
      ...mockTournamentDTO.item,
      lifecycle: 'finished',
      prizeLabel: 'Призовой фонд',
      prize: '80 000 ₽',
      entryFee: 'Взнос: 4 500 ₽ / пара',
      action: { label: 'Турнир завершён', mode: 'none' },
    },
  } as unknown as TournamentDetailDTO

  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <TournamentDetailPage dto={completedDTO} />
    </ActionLayerProvider>
  )

  assert.doesNotMatch(html, /Завершённый турнир/)
  assert.match(html, /Этот турнир уже завершился/)
  assert.match(html, /80[\s\u00A0]000[\s\u00A0]₽/)
  assert.match(html, /Все турниры/)
})

test('typograph utility glues prepositions with non-breaking spaces', () => {
  const input = 'Матч в субботу и в воскресенье для игроков на кортах'
  const expected = 'Матч в\u00A0субботу и\u00A0в\u00A0воскресенье для\u00A0игроков на\u00A0кортах'
  assert.equal(typograph(input), expected)
})

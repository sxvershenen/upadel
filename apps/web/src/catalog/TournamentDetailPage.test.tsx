import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { TournamentDetailDTO } from '@unlim/content-contract'

import { ActionLayerProvider } from '../actions/ActionLayer'
import { TournamentDetailPage, parseLevelRange, typograph } from './TournamentDetailPage'

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
  version: 11,
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
    levelFrom: 2,
    levelTo: 2,
    levelLabel: '2.0',
    lifecycle: 'upcoming',
    startsAt: '2026-09-20T16:30:00.000Z',
    endsAt: '2026-09-20T19:30:00.000Z',
    scheduleLabel: 'Воскресенье, 20 сентября · 19:30–22:30',
    format: 'americano',
    formatLabel: 'Americano (смена напарников каждый сет)',
    participantMode: 'players',
    totalSlots: 16,
    entryFee: '2 500 ₽ / участник',
    description: 'Самый душевный формат для знакомства с игроками клуба. Музыкальный сет, питьевая вода и динамичные матчи.',
    prizeLabel: 'Стоимость за участника',
    prize: '2 500 ₽',
    visualStyle: 'image',
    image: { url: '/tournaments/party.webp', alt: 'Party', mimeType: 'image/webp' },
    icon: 'PartyPopper',
    regulationHTML: '<p>Регистрация закрывается за 2 часа до начала. Формат — Americano со сменой напарников каждый сет. На матч приезжайте за 15 минут до старта.</p>',
    participants: ['Максим Воронов', 'Анна Кузнецова', 'Денис Соколов', 'Екатерина Морозова', 'Артём Лебедев', 'Полина Новикова', 'Михаил Белов', 'София Павлова', 'Роман Орлов', 'Дарья Смирнова', 'Кирилл Фёдоров', 'Елена Попова'].map((name, index) => ({ id: `p-${index}`, name, level: '2.0', status: 'confirmed' })),
    standings: [
      { id: 's-1', rank: 1, name: 'Максим Воронов', matches: 7, points: 142, difference: '+38', award: 'Золотой кубок' },
      { id: 's-2', rank: 2, name: 'Екатерина Морозова', matches: 7, points: 136, difference: '+26', award: 'Серебряный призёр' },
      { id: 's-3', rank: 3, name: 'Артём Лебедев', matches: 7, points: 131, difference: '+18', award: 'Бронзовый призёр' },
      { id: 's-4', rank: 4, name: 'Анна Кузнецова', matches: 7, points: 125, difference: '+12' },
      { id: 's-5', rank: 5, name: 'Михаил Белов', matches: 7, points: 119, difference: '+4' },
    ],
    prizes: [
      { id: 'pr-1', place: 1, title: 'Победитель Americano', reward: 'Золотой кубок + 15 000 ₽', description: 'Кубок клуба и сертификат.' },
      { id: 'pr-2', place: 2, title: 'Серебряный призёр', reward: 'Серебряная медаль + 10 000 ₽', description: 'Клубный мерч.' },
      { id: 'pr-3', place: 3, title: 'Бронзовый призёр', reward: 'Бронзовая медаль + 5 000 ₽', description: 'Памятный подарок.' },
    ],
    checklist: [{ id: 'c-1', text: 'Приезжайте за 15–30 минут до начала.' }],
    perks: [{ id: 'perk-1', icon: 'Droplets', title: 'Питьевая вода', description: 'Вода для участников.' }, { id: 'perk-2', icon: 'Sparkles', title: 'Турнирные мячи', description: 'Мячи на каждый сет.' }],
    matchday: [{ id: 'm-1', timing: 'За 30 минут', title: 'Сбор и разминка', description: 'Регистрация участников.' }, { id: 'm-2', timing: 'За 10 минут', title: 'Брифинг и жеребьёвка', description: 'Судья объясняет регламент.' }],
    faqs: [{ id: 'f-1', question: 'Нужен ли постоянный напарник для участия?', answer: 'Нет.' }],
    coordinator: { telegramLabel: 'Telegram', telegramURL: 'https://t.me/unlimpadel', phoneDisplay: '+7 (495) 000-00-00', phoneValue: '+74950000000' },
    action: { label: 'Записаться', mode: 'booking' },
    seo: { robots: 'index-follow' },
  },
  related: [
    {
      id: 't-open',
      slug: 'open-league',
      title: 'Unlim Riga Masters Cup',
      levelFrom: 4,
      levelTo: 4,
      levelLabel: '4.0',
      lifecycle: 'finished',
      startsAt: '2026-03-14T08:00:00.000Z',
      endsAt: '2026-03-14T14:00:00.000Z',
      scheduleLabel: 'Суббота, 14 марта · 11:00–17:00',
      format: 'groups-knockout',
      formatLabel: 'Групповой этап + Олимпийская сетка',
      entryFee: 'Взнос: 4 500 ₽ / пара',
      description: 'Рейтинговый кубок для опытных пар.',
      prizeLabel: 'Призовой фонд',
      prize: '80 000 ₽',
      visualStyle: 'mesh',
      meshStyle: 'deep-blue',
      icon: 'Trophy',
      regulationHTML: '<p>Олимпийская сетка.</p>',
      action: { label: 'Турнир завершён', mode: 'none' },
    },
  ],
}

test('TournamentDetailPage renders Swiss layout with hero, passport, prizes, participants, regulations, checklist and FAQ', () => {
  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <TournamentDetailPage dto={mockTournamentDTO as unknown as TournamentDetailDTO} />
    </ActionLayerProvider>
  )

  // 1. Hero block: visual card with status, title, format and 1.0-7.0 level gauge
  assert.match(html, /aria-label="Визитка турнира"/)
  assert.match(html, /<h1[^>]*>[\s\S]*?Game Party \/ Americano[\s\S]*?<\/h1>/)
  assert.match(html, /Регистрация открыта/)
  assert.match(html, /Americano/)
  assert.match(html, /Шкала 1\.0–7\.0/)
  assert.match(html, /Уровень игроков:/)

  // 2. Tournament passport metrics (Swiss grid with schedule, format, fee, prize)
  assert.match(html, /aria-label="Паспорт турнира"/)
  assert.match(html, /Расписание/)
  assert.match(html, /19:30–22:30/)
  assert.match(html, /Формат/)
  assert.match(html, /Americano/)
  assert.match(html, /Взнос/)
  assert.match(html, /2[\s\u00A0]500[\s\u00A0]₽ \/ участник/)

  // 3. Prize distribution by places
  assert.match(html, /aria-label="Распределение призов"/)
  assert.match(html, /1 МЕСТО/)
  assert.match(html, /1 МЕСТО/)
  assert.match(html, /2 МЕСТО/)
  assert.match(html, /3 МЕСТО/)

  // 4. Participants & Standings section with tab switcher
  assert.match(html, /aria-label="Участники и результаты"/)
  assert.match(html, /Сетка[\s\S]*?и[\s\S]*?участники/)
  assert.match(html, /Участники/)
  assert.match(html, /Итоги/)
  assert.match(html, /Максим Воронов/)

  // 5. Regulations (collapsed by default, expandable)
  assert.match(html, /aria-label="Регламент турнира"/)
  assert.match(html, /Регламент[\s\S]*?турнира/)
  assert.match(html, /Регламент[\s\S]*?и[\s\S]*?правила/)

  // 6. Checklist and Perks
  assert.match(html, /Перед выходом на\u00A0корт/)
  assert.match(html, /Включено для\u00A0каждого игрока/)
  assert.match(html, /Питьевая вода/)
  assert.match(html, /Турнирные мячи/)

  // 7. Matchday Timeline and FAQ
  assert.match(html, /aria-label="Игровой день и вопросы"/)
  assert.match(html, /Как[\s\S]*?проходит[\s\S]*?игровой[\s\S]*?день/)
  assert.match(html, /Сбор и\u00A0разминка/)
  assert.match(html, /Брифинг и\u00A0жеребьёвка/)
  assert.match(html, /Частые[\s\S]*?вопросы/)
  assert.match(html, /Нужен ли постоянный напарник для\u00A0участия\?/)

  // 8. CTA and no remaining slots text
  assert.match(html, /Записаться/)
  assert.doesNotMatch(html, /Осталось/)
  assert.doesNotMatch(html, /слотов/)

  // 9. Related Tournaments
  assert.match(html, /aria-label="Другие турниры"/)
  assert.match(html, /Другие[\s\S]*?турниры[\s\S]*?и[\s\S]*?лиги/)
  assert.match(html, /Unlim Riga Masters Cup/)
})

test('TournamentDetailPage renders completed lifecycle state appropriately', () => {
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

  assert.match(html, /Турнир завершён/)
  assert.match(html, /80[\s\u00A0]000[\s\u00A0]₽/)
  assert.match(html, /Все турниры/)
  assert.match(html, /Итоги/)
})

test('TournamentDetailPage preserves an external tournament action', () => {
  const externalDTO = {
    ...mockTournamentDTO,
    item: { ...mockTournamentDTO.item, action: { label: 'Регистрация на сайте партнёра', mode: 'external-link', href: 'https://booking.example/tournament' } },
  } as unknown as TournamentDetailDTO
  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <TournamentDetailPage dto={externalDTO} />
    </ActionLayerProvider>
  )
  assert.match(html, /data-analytics-action="external"/)
  assert.match(html, /Регистрация на сайте партнёра|Записаться/)
})

test('typograph utility glues prepositions with non-breaking spaces', () => {
  const input = 'Матч в субботу и в воскресенье для игроков на кортах'
  const expected = 'Матч в\u00A0субботу и\u00A0в\u00A0воскресенье для\u00A0игроков на\u00A0кортах'
  assert.equal(typograph(input), expected)
})

test('parseLevelRange correctly extracts single levels and ranges', () => {
  assert.deepEqual(parseLevelRange('2.0'), { min: 2.0, max: 2.0, isRange: false })
  assert.deepEqual(parseLevelRange('2.5 – 4.5'), { min: 2.5, max: 4.5, isRange: true })
  assert.deepEqual(parseLevelRange('3.0-4.0'), { min: 3.0, max: 4.0, isRange: true })
  assert.deepEqual(parseLevelRange('уровень 1.5'), { min: 1.5, max: 1.5, isRange: false })
})

test('TournamentDetailPage renders level range and omits club address', () => {
  const rangeDTO = {
    ...mockTournamentDTO,
    item: {
      ...mockTournamentDTO.item,
      levelFrom: 2.5,
      levelTo: 4.5,
      levelLabel: '2.5–4.5',
    },
  } as unknown as TournamentDetailDTO

  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <TournamentDetailPage dto={rangeDTO} />
    </ActionLayerProvider>
  )

  // 1. Level range is displayed in gauge
  assert.match(html, /2\.5\s*[–-]\s*4\.5/)

  // 2. Club address is NOT displayed in passport
  const passportHtml = html.match(/<div aria-label="Паспорт турнира"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0] ?? ''
  assert.doesNotMatch(passportHtml, /Новорижское шоссе/)
  assert.doesNotMatch(passportHtml, /Адрес/)

  // 3. No horizontal scroll wrapper
  assert.doesNotMatch(html, /overflow-x-auto/)
})

test('TournamentDetailPage renders pairs cleanly in participants and standings', () => {
  const pairsDTO = {
    ...mockTournamentDTO,
    item: {
      ...mockTournamentDTO.item,
      format: 'other',
      formatLabel: 'Парный кубок (фиксированные пары)',
      participantMode: 'pairs',
      levelFrom: 3,
      levelTo: 4.5,
      levelLabel: '3.0–4.5',
      participants: [{ id: 'pair-1', name: 'М. Воронов', partnerName: 'А. Кузнецов', level: '4.0', status: 'confirmed' }],
      standings: [{ id: 'pair-s-1', rank: 1, name: 'М. Воронов', partnerName: 'А. Кузнецов', matches: 5, points: 15, difference: '+24', award: 'Чемпионы' }],
    },
  } as unknown as TournamentDetailDTO

  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <TournamentDetailPage dto={pairsDTO} />
    </ActionLayerProvider>
  )

  // Participants pair visualization
  assert.match(html, /Воронов/)
  assert.match(html, /Кузнецов/)
  assert.match(html, /Пара/)
  assert.doesNotMatch(html, /Подтверждён/)
})

test('TournamentDetailPage renders 3 competition tabs and 4 collapsible left sections with FAQ on right', () => {
  const html = renderToStaticMarkup(
    <ActionLayerProvider site={mockSite as any}>
      <TournamentDetailPage dto={mockTournamentDTO as unknown as TournamentDetailDTO} />
    </ActionLayerProvider>
  )

  // 3 tabs in competition module
  assert.match(html, /Участники/)
  assert.match(html, /Итоги/)
  assert.match(html, /Распределение призов/)

  // 4 left sections in separate details
  assert.match(html, /Регламент турнира/)
  assert.match(html, /Перед выходом на\u00A0корт/)
  assert.match(html, /Включено для\u00A0каждого игрока/)
  assert.match(html, /Как[\s\S]*?проходит[\s\S]*?игровой[\s\S]*?день/)

  // Right section: FAQ
  assert.match(html, /aria-label="Частые вопросы"/)

  // Hero booking button + empty slot booking buttons ("Занять")
  const bookingButtons = html.match(/data-analytics-action="booking"/g)
  assert.equal(bookingButtons?.length, 5) // 1 hero CTA + 4 empty slots
  assert.match(html, /Занять/)
  assert.match(html, /Развернуть/)
})

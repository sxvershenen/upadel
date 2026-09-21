import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { TrainingPageDTO } from '@unlim/content-contract'

import { SiteProvider } from '../content/ContentContext'
import { RentalRateCard } from '../components/cards/RentPricingCards'
import { TrainingPage, typograph } from './TrainingPage'

const mockSite = {
  title: 'UNLIM RIGA PADEL',
  brandName: 'UNLIM RIGA PADEL',
  navigation: [],
  desktopNavigation: [],
  contacts: {
    phone: '+7 999 000-00-00',
    email: 'info@unlimriga.club',
    address: 'Новорижское шоссе, 3к1',
    socials: { telegram: 'https://t.me/unlimpadel', vk: 'https://vk.com/unlimpadel' },
  },
  booking: { leadRecipientEmail: 'booking@unlimriga.club', phone: '+7 999 000-00-00', telegramBot: 'unlimpadel' },
  contactConfirmation: { dialogTitle: 'Связаться с клубом', formTitle: 'Заявка', cancelLabel: 'Отмена', continueLabel: 'Перейти', channels: [] },
  requisites: { legalName: 'ООО «Анлим Спорт»', inn: '5024178932', ogrn: '1235000078451' },
  operatingHours: '07:00–23:00',
  address: 'Новорижское шоссе, 3к1',
}

const mockDTO: TrainingPageDTO = {
  version: 12,
  preview: false,
  generatedAt: new Date().toISOString(),
  kind: 'training',
  page: {
    eyebrow: 'Обучение',
    title: 'Тренировки по паделу',
    intro: 'Программы для первого знакомства с паделом, регулярного прогресса и подготовки к турнирам.',
    hero: { media: { alt: 'Фон', mimeType: 'image/webp', url: '/hero.webp' }, grayscale: false },
    seo: { robots: 'index-follow' },
  },
  site: mockSite as any,
  infographicEyebrow: 'Методика UNLIM',
  infographicTitle: 'Понятный путь от первого удара до уверенной игры',
  programsEyebrow: 'Программы',
  programsTitle: 'Форматы тренировок',
  blocks: [
    { title: 'Программа под ваш уровень', body: 'Тренер оценивает технику и формирует понятный план развития.', icon: 'Target' },
    { title: 'Удобное расписание', body: 'Индивидуальные и групповые занятия доступны в разные часы клуба.', icon: 'Calendar' },
    { title: 'Измеримый прогресс', body: 'Работаем над техникой, тактикой пары и уверенностью в игре.', icon: 'TrendingUp' },
  ],
  coachesEyebrow: 'Команда наставников',
  coachesTitle: 'Тренеры клуба',
  coachesDesktopActionLabel: 'Все',
  coachesMobileActionLabel: 'Все тренеры',
  knowledgeEyebrow: 'База знаний',
  knowledgeTitle: 'Перед первой тренировкой',
  firstVisitTitle: 'Что нужно для первого визита',
  firstVisitCopy: 'Основное уже есть в клубе.',
  firstVisitItems: [
    { title: 'Ракетка и мячи', body: 'Инвентарь предоставит клуб.', icon: 'Dumbbell' },
    { title: 'Обувь для корта', body: 'Нужна чистая сменная обувь.', icon: 'Footprints' },
  ],
  faqTitle: 'Частые вопросы',
  faqCopy: 'Ответы перед первым занятием.',
  faq: [
    { question: 'Как проходят тренировки по паделу?', answer: 'Занятие строится вокруг практики на корте.' },
    { question: 'Как выбрать формат занятий?', answer: 'Начните с пробного занятия.' },
  ],
  action: { label: 'Подобрать тренировку', mode: 'trial-booking' },
  programs: [
    {
      id: 'p1',
      slug: 'individual',
      title: 'Индивидуальная тренировка',
      badge: '1-на-1 с тренером',
      description: 'Максимум внимания постановке базовой механики.',
      image: { alt: 'Индивидуальная', mimeType: 'image/webp', url: '/images/ind.webp' },
      overlay: 'overlay-blue',
      icon: 'User',
      priceFrom: 4500,
      action: { label: 'Записаться', mode: 'trial-booking' },
    },
  ],
  trial: {
    id: 'trial-1',
    title: 'Пробная тренировка за 1 990 ₽',
    eyebrow: 'Специальное предложение',
    timeLabel: '60 минут',
    description: '60 минут индивидуального внимания тренера + корт + профессиональная ракетка включены.',
    includedItems: [],
    cardVariant: 'trial',
    meshTone: 'deep-blue',
    action: { label: 'Записаться на пробную', mode: 'trial-booking' },
  },
  coaches: [
    {
      id: 'c1',
      name: 'Артём Волков',
      slug: 'artem',
      photo: { alt: 'Артём', mimeType: 'image/webp', url: '/images/artem.webp' },
      specialization: 'Индивидуальная техника и подача',
      bio: 'Мастер спорта, старший методист клуба.',
      level: 'PRO / Master',
      experience: '7 лет',
      languages: 'Русский, English',
      rating: 4.9,
      reviewsCount: 38,
      certificates: ['FIP Certified', 'WPT Master'],
      priceFrom: 5000,
      action: { label: 'Выбрать тренера', mode: 'trial-booking' },
    },
  ],
}

test('typograph utility glues prepositions with non-breaking spaces', () => {
  assert.equal(typograph('по паделу в Москве'), 'по\u00A0паделу в\u00A0Москве')
  assert.equal(typograph('для детей и взрослых'), 'для\u00A0детей и\u00A0взрослых')
})

test('TrainingPage renders Swiss layout with methodology pillars, formats, coaches carousel, accordions, and checklist without extra CTA banner', () => {
  const html = renderToStaticMarkup(
    <SiteProvider site={mockSite as any}>
      <TrainingPage dto={mockDTO} />
    </SiteProvider>
  )

  const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')

  // Methodology section
  assert.match(plainText, /Методика UNLIM/)
  assert.doesNotMatch(plainText, /\b0[123]\b/)

  // Formats section
  assert.match(plainText, /Форматы тренировок/)
  assert.match(plainText, /Индивидуальная тренировка/)

  // Special offer card (compact) with unboxed eyebrow and standard button
  assert.match(plainText, /Пробная тренировка за 1 990 ₽/)
  assert.match(html, /<span class="type-eyebrow text-white\/65">Специальное предложение<\/span>/)
  assert.match(plainText, /Записаться на пробную/)

  // Coaches section with SectionHeader and IconButton navigation
  assert.match(plainText, /Тренеры клуба/)
  assert.match(plainText, /Артём Волков/)
  assert.match(html, /href="\/coaches"/)
  assert.match(html, /aria-label="Предыдущие тренеры"/)
  assert.match(html, /aria-label="Следующие тренеры"/)

  // Knowledge base / guide accordion
  assert.match(plainText, /Перед первой тренировкой/)
  assert.match(plainText, /Как проходят тренировки по паделу/)
  assert.match(plainText, /Как выбрать формат занятий/)

  // Checklist
  assert.match(plainText, /Что нужно для первого визита/)
  assert.match(plainText, /Ракетка и мячи/)
  assert.match(plainText, /Обувь для корта/)

  // Redundant CTA banner removed completely
  assert.equal(plainText.includes('Готовы выйти на корт?'), false)
})

test('RentalRateCard renders compact layout with unboxed eyebrow, bottom-edge background images, and standard action button', () => {
  const html = renderToStaticMarkup(
    <SiteProvider site={mockSite as any}>
      <RentalRateCard rate={mockDTO.trial!} layout="compact" />
    </SiteProvider>
  )

  // Unboxed eyebrow without pill badge wrapper
  assert.match(html, /<span class="type-eyebrow text-white\/65">Специальное предложение<\/span>/)
  // Standard button label
  assert.match(html, /<span>Записаться на пробную<\/span>/)
  // Compact card keeps only one enlarged ball and a full-width action.
  assert.doesNotMatch(html, /padel-racket\.webp/)
  assert.match(html, /bottom-20 -right-36/)
  assert.match(html, /w-full/)
})

test('RentalRateCard preserves wide layout for homepage with 2-column text and large images', () => {
  const html = renderToStaticMarkup(
    <SiteProvider site={mockSite as any}>
      <RentalRateCard rate={mockDTO.trial!} layout="wide" />
    </SiteProvider>
  )

  // Wide layout has max-w on text column
  assert.match(html, /max-w-\[82%\] md:max-w-\[60%\]/)
  // Full button text preserved on wide
  assert.match(html, /Записаться на пробную/)
  // Larger images raised higher
  assert.match(html, /h-\[340px\]/)
  assert.match(html, /h-\[210px\]/)
})

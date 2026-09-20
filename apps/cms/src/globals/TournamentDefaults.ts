import type { GlobalConfig } from 'payload'

import { authenticated } from '../fields/access'

export const tournamentDefaultContent = {
  checklist: [
    { text: 'Приезжайте за 15–30 минут до начала для спокойной разминки и жеребьёвки.' },
    { text: 'Возьмите спортивную обувь с немаркой подошвой (non-marking).' },
    { text: 'Ракетку можно принести свою или взять на тест-драйв в про-шопе.' },
  ],
  perks: [
    { icon: 'Sparkles', title: 'Турнирные мячи', description: 'Профессиональные мячи Bullpadel на каждый сет.' },
    { icon: 'Droplets', title: 'Питьевая вода', description: 'Бутилированная и фильтрованная вода для участников.' },
    { icon: 'ShowerHead', title: 'Раздевалки и сауна', description: 'Просторные душевые, свежие полотенца и финская сауна.' },
    { icon: 'Camera', title: 'Судейство и фотоотчёт', description: 'Координатор сеток, хронометраж и памятные фотографии.' },
  ],
  matchday: [
    { timing: 'За 30 минут', title: 'Сбор и разминка', description: 'Регистрация участников на ресепшн, переодевание и разминка на кортах.' },
    { timing: 'За 10 минут', title: 'Брифинг и жеребьёвка', description: 'Судья озвучивает регламент, распределяет корты и даёт старт первому туру.' },
    { timing: 'Основное время', title: 'Турнирные матчи', description: 'Серия динамичных встреч с ротацией и оперативным ведением счёта на табло.' },
    { timing: 'Финал турнира', title: 'Награждение и лаунж', description: 'Финальные розыгрыши, вручение призов и неформальное общение.' },
  ],
  faqs: [
    { question: 'Нужен ли постоянный напарник для участия?', answer: 'Формат участия указан в описании турнира. Если у вас пока нет партнёра, оставьте заявку — администратор подскажет доступные варианты.' },
    { question: 'Какой уровень подготовки требуется?', answer: 'Ориентируйтесь на диапазон уровня на странице турнира. Если сомневаетесь, свяжитесь с клубом для быстрой оценки.' },
    { question: 'Какая экипировка нужна для турнира?', answer: 'Обязательна спортивная обувь для падела или тенниса с немаркой подошвой. Ракетку можно принести свою или взять в клубе.' },
    { question: 'Что делать, если планы изменились после регистрации?', answer: 'Пожалуйста, предупредите координатора не позднее чем за 24 часа до старта турнира.' },
  ],
} as const

const perkIcons = [
  { label: 'Искры', value: 'Sparkles' },
  { label: 'Вода', value: 'Droplets' },
  { label: 'Душ', value: 'ShowerHead' },
  { label: 'Камера', value: 'Camera' },
]

export const TournamentDefaults: GlobalConfig = {
  slug: 'tournament-defaults',
  label: 'Шаблон турниров',
  access: { read: () => true, readVersions: authenticated, update: authenticated },
  admin: {
    group: 'Контент',
    description: 'Изменения применяются ко всем турнирам, где для соответствующего блока включено наследование.',
  },
  fields: [
    { name: 'seedVersion', type: 'text', admin: { hidden: true }, access: { read: ({ req }) => Boolean(req.user) } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Перед кортом',
          fields: [{ name: 'checklist', type: 'array', label: 'Перед выходом на корт', defaultValue: [...tournamentDefaultContent.checklist], fields: [{ name: 'text', type: 'text', label: 'Пункт', required: true }] }],
        },
        {
          label: 'Включено',
          fields: [{ name: 'perks', type: 'array', label: 'Включено для каждого игрока', defaultValue: [...tournamentDefaultContent.perks], fields: [
            { name: 'icon', type: 'select', label: 'Иконка', options: perkIcons, required: true },
            { name: 'title', type: 'text', label: 'Название', required: true },
            { name: 'description', type: 'textarea', label: 'Описание', required: true },
          ] }],
        },
        {
          label: 'Игровой день',
          fields: [{ name: 'matchday', type: 'array', label: 'Как проходит игровой день', defaultValue: [...tournamentDefaultContent.matchday], fields: [
            { name: 'timing', type: 'text', label: 'Время / этап', required: true },
            { name: 'title', type: 'text', label: 'Название', required: true },
            { name: 'description', type: 'textarea', label: 'Описание', required: true },
          ] }],
        },
        {
          label: 'FAQ',
          fields: [{ name: 'faqs', type: 'array', label: 'Частые вопросы', defaultValue: [...tournamentDefaultContent.faqs], fields: [
            { name: 'question', type: 'text', label: 'Вопрос', required: true },
            { name: 'answer', type: 'textarea', label: 'Ответ', required: true },
          ] }],
        },
      ],
    },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true } },
}

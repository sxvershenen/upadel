export type TransitionPageKey = 'serve' | 'rally'

export type TransitionPageContent = {
  key: TransitionPageKey
  index: string
  kicker: string
  title: string
  intro: string
  image: string
  imageAlt: string
  accent: string
  stats: Array<{ value: string; label: string }>
  features: Array<{ number: string; title: string; body: string }>
  quote: string
}

export const transitionPages: Record<TransitionPageKey, TransitionPageContent> = {
  serve: {
    key: 'serve',
    index: '01',
    kicker: 'Transition playground · Serve',
    title: 'Первый удар задаёт ритм всей игре',
    intro: 'Тестовая страница в стилистике UNLIM: здесь мяч стартует из нижнего угла, набирает скорость и на долю секунды заполняет экран.',
    image: '/page-heroes/courts.webp',
    imageAlt: 'Панорамные корты UNLIM',
    accent: 'lime',
    stats: [
      { value: '4.5 м', label: 'высота сетки' },
      { value: '360°', label: 'обзор корта' },
      { value: '24/7', label: 'онлайн-бронирование' },
    ],
    features: [
      { number: '01', title: 'Разогреться', body: 'Мягкое покрытие, свет без бликов и достаточно пространства для короткой разминки.' },
      { number: '02', title: 'Поймать темп', body: 'После первого розыгрыша площадка работает на вас: ритм, азарт и понятная траектория.' },
      { number: '03', title: 'Остаться дольше', body: 'После игры можно спокойно разобрать матч, выбрать тренировку или забронировать следующий слот.' },
    ],
    quote: 'Хороший переход должен ощущаться как удар по мячу: коротко, точно и с понятным продолжением.',
  },
  rally: {
    key: 'rally',
    index: '02',
    kicker: 'Transition playground · Rally',
    title: 'Игра продолжается, когда появляется свой ритм',
    intro: 'Вторая композиция — более редакционная: крупная фотография, короткие тезисы и спокойный ритм для проверки разных траекторий мяча.',
    image: '/page-heroes/training.webp',
    imageAlt: 'Тренировка по паделу в UNLIM',
    accent: 'cyan',
    stats: [
      { value: '1 → 1', label: 'формат для новичка' },
      { value: '60 мин', label: 'фокусной тренировки' },
      { value: '∞', label: 'поводов вернуться' },
    ],
    features: [
      { number: '01', title: 'Понять базу', body: 'Тренер объясняет позицию, движение и удар так, чтобы это сразу можно было повторить.' },
      { number: '02', title: 'Играть смелее', body: 'Небольшие цели на каждую тренировку превращают случайные мячи в уверенные решения.' },
      { number: '03', title: 'Собрать пару', body: 'Открытые игры и турниры помогают найти партнёров с похожим темпом и настроением.' },
    ],
    quote: 'Мяч проходит сквозь экран только на секунду — достаточно, чтобы следующая страница уже ждала своего хода.',
  },
}

export const transitionPageLinks: Array<{ key: TransitionPageKey; label: string }> = [
  { key: 'serve', label: 'Serve' },
  { key: 'rally', label: 'Rally' },
]

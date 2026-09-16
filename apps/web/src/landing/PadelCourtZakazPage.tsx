import type { SiteDTO } from '@unlim/content-contract'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Layers3,
  MessageCircle,
  Phone,
  Ruler,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Truck,
  Wind,
  Wrench,
} from 'lucide-react'
import React, { useState, useRef, type FormEvent } from 'react'

import { SiteFrame } from '../components/SiteFrame'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { cn } from '../utils/cn'
import { analyticsServerContext, trackAnalytics } from '../analytics/AnalyticsTracker'
import { useActionLayer } from '../actions/ActionLayer'

const sourcePage = '/padel-court-zakaz'

export const heroImage = {
  src: 'https://jubopadel.com/wp-content/uploads/2025/01/JGC06036-2048x1365.jpg',
  alt: 'Панорамные падел-корты JUBO в спортивном клубе мирового уровня',
  width: 2048,
  height: 1365,
}

export const galleryImages = [
  {
    src: 'https://jubopadel.com/wp-content/uploads/2026/05/showroom-aereal-1536x848.jpg',
    alt: 'Комплекс падел-кортов JUBO — открытые и крытые площадки, вид сверху',
    width: 1536,
    height: 848,
    caption: 'Комплексный объект JUBO: открытые и крытые корты',
  },
  {
    src: 'https://jubopadel.com/wp-content/uploads/2023/09/header-18-1024x569.png',
    alt: 'Панорамные корты JUBO в интерьере премиального крытого клуба',
    width: 1024,
    height: 569,
    caption: 'Крытый клуб с непрерывной линией остекления',
  },
] as const

export const distributorAdvantages = [
  {
    index: '01',
    title: 'Прямой заводской контракт',
    text: 'Прямые поставки с роботизированного завода JUBO в Валенсии (Испания). Фиксированные заводские цены, официальный контракт и отсутствие наценок посредников.',
  },
  {
    index: '02',
    title: 'Климатическая адаптация для РФ',
    text: 'Инженерный расчёт ветровых и снеговых нагрузок под климатические зоны России. Высокопрочная сталь с защитным антикоррозийным покрытием Magnelis® C4/C5.',
  },
  {
    index: '03',
    title: 'Сертифицированный шеф-монтаж',
    text: 'Штатные сертифицированные монтажные бригады UNLIM. Специализированный вакуумный монтаж 12 мм остекления, лазерная юстировка и бесшовное примыкание к сетке.',
  },
  {
    index: '04',
    title: 'Склад комплектующих и гарантия',
    text: 'Официальная гарантия производителя и собственный оперативный склад запасных стеклопакетов, крепежа AISI 316 и расходников в РФ для непрерывной работы кортов.',
  },
] as const

export const turnkeySteps = [
  {
    icon: Ruler,
    number: '01',
    title: 'Аудит локации и основания',
    text: 'Выезд инженера или детальный аудит площадки: геометрия зала, качество бетонного основания, снеговые/ветровые нагрузки, высоты потолков и прокладка коммуникаций.',
  },
  {
    icon: Settings2,
    number: '02',
    title: 'Подбор модели и кастомизация',
    text: 'Выбор конструкции под цели клуба, подбор цвета металлокаркаса по шкале RAL, освещения (4×200W или 8×200W), спортивного газона FIP и брендинга.',
  },
  {
    icon: Truck,
    number: '03',
    title: 'Поставка и таможенная логистика',
    text: 'Прямая транспортировка еврофурами с фабрики в Испании, полное таможенное оформление, страхование 100% груза и ответственное хранение до монтажа.',
  },
  {
    icon: Wrench,
    number: '04',
    title: 'Профессиональный монтаж',
    text: 'Сборка силового металлокаркаса, вакуумная посадка закалённого стекла 12 мм, бесшовная стыковка сетки заподлицо, укладка газона и засыпка калиброванным кварцевым песком.',
  },
  {
    icon: ClipboardCheck,
    number: '05',
    title: 'Сдача в эксплуатацию и сервис',
    text: 'Инструментальная проверка плоскостности, замер освещенности по стандарту FIP, передача исполнительной документации, гарантийный талон и регламентное ТО.',
  },
] as const

export const priceFactors = [
  { label: 'Модель и класс корта', detail: 'от клубного Vision Pro до ураганного Infinity Xtrem' },
  { label: 'Тип размещения', detail: 'indoor (в помещении) или outdoor (открытый грунт с C4/C5)' },
  { label: 'Готовность основания', detail: 'ровная плита, обустройство подушек или анкерование' },
  { label: 'Комплектация остекления', detail: '12 мм монолитное закалённое стекло с полированной еврокромкой' },
  { label: 'Спортивное покрытие', detail: 'профессиональный монофиламентный или текстурированный газон FIP' },
  { label: 'Осветительная система', detail: 'мачты 6–8 м, 4 или 8 LED прожекторов 200–300W без бликов' },
  { label: 'Персонализация', detail: 'индивидуальный цвет RAL, амбилайт, защитные протекторы стоек' },
  { label: 'Логистика до объекта', detail: 'расстояние, схема разгрузки и сроки монтажного окна' },
] as const

export const technologies = [
  {
    icon: Layers3,
    title: 'Закалённое стекло 12 мм',
    tag: 'FIP Standard',
    text: '18 стеклопакетов формата 2995×1995 мм (108 м²). Шлифованные плоские еврокромки, зенкованные отверстия с полиамидными втулками против УФ-деградации и неопреновые демпферы.',
  },
  {
    icon: ShieldCheck,
    title: 'Антикоррозия Magnelis® C4/C5',
    tag: 'ISO 12944',
    text: 'Инновационный стальной сплав с цинково-алюминиево-магниевым слоем. Стойкость к коррозии в 10 раз выше обычной оцинковки, выдерживает агрессивный климат и реагенты.',
  },
  {
    icon: Factory,
    title: 'Роботизированное производство',
    tag: 'Laser Cut',
    text: 'Прецизионная лазерная резка деталей, автоматизированная сварка и сборка на нержавеющих метизах класса А4 (AISI 316) со скруглёнными травмобезопасными головками.',
  },
  {
    icon: Sparkles,
    title: 'Система Total Visibility',
    tag: 'Patented',
    text: 'Запатентованный треугольный силовой профиль 150×70×3 мм по периметру 60 м. Полное отсутствие угловых металлических стоек обеспечивает идеальный угол обзора для зрителей и ТВ.',
  },
  {
    icon: Wind,
    title: 'Ветростойкость до 260 км/ч',
    tag: 'Eurocodes 1 & 3',
    text: 'Динамическое распределение ветровых нагрузок. Корты сертифицированы по европейским нормам Eurocode и испанскому стандарту UNE 147201:2024 с подтверждённым запасом прочности.',
  },
  {
    icon: CheckCircle2,
    title: 'Flush стыковка сетки и стекла',
    tag: 'Safety First',
    text: 'Сварная сетка 50×50×4 мм с загнутыми кромками монтируется заподлицо со стеклом без выступающих углов. Регламентные проёмы 220×200 см сертифицированы для игроков на колясках.',
  },
] as const

export const models = [
  {
    id: 'infinity',
    name: 'Infinity',
    eyebrow: 'Премиальный флагман',
    title: 'Патентованная панорамная система без угловых стоек',
    tagline: 'Идеальный выбор для главных ТВ-кортов и премиальных клубов',
    description:
      'Флагман модельного ряда JUBO с патентованной конструкцией, полностью лишённой угловых металлических профилей. Разработана для турниров высшего уровня и флагманских клубов, где приоритетны безупречная обзорность, эстетика и премиальный статус.',
    image: {
      src: 'https://jubopadel.com/wp-content/uploads/2023/07/fondoAzul.377.png',
      alt: 'Панорамный падел-корт JUBO Infinity без угловых стоек',
      width: 1648,
      height: 822,
    },
    videoUrl: 'https://jubopadel.com/wp-content/uploads/2026/05/Header-Infinity-2400-1080-h265.webm',
    specs: [
      { label: 'Остекление', value: '12 мм закалённое FIP (18 панелей, 108 м²)' },
      { label: 'Силовой каркас', value: '4 колонны 160×80×3 мм + 8 опорных ласт 3 м' },
      { label: 'Антикоррозия', value: 'Сталь Magnelis® C4 / C5 по ISO 12944' },
      { label: 'Сетка', value: 'Электросварная 50×50×4 мм, заподлицо со стеклом' },
      { label: 'Крепёж', value: 'Нержавеющая сталь AISI 316, втулки с УФ-защитой' },
      { label: 'Доступность', value: 'Проёмы 2200×2000 мм (стандарт FIP и МГН)' },
    ],
    highlights: [
      'Полная панорама 360° без угловых стоек для безупречной телетрансляции',
      'Запатентованный треугольный силовой профиль 150×70×3 мм по периметру',
      'Опциональная интеграция скрытой контурной амбилайт-подсветки',
    ],
  },
  {
    id: 'super-panoramic',
    name: 'Super Panoramic',
    eyebrow: 'Чемпионский обзор',
    title: 'Открытая панорама и максимальная конструктивная жёсткость',
    tagline: 'Турнирный стандарт для престижных международных соревнований',
    description:
      'Сертифицированный корт с непрерывным остеклением задней и боковых линий. Оснащён усиленным силовым периметром, нейтрализующим вибрации при ударах о стекло и обеспечивающим равномерный отскок мяча по всей площади.',
    image: {
      src: 'https://jubopadel.com/wp-content/uploads/2023/08/super_panoraic_inicio.png',
      alt: 'Падел-корт JUBO Super Panoramic для профессиональных турниров',
      width: 1648,
      height: 822,
    },
    videoUrl: 'https://jubopadel.com/wp-content/uploads/2026/05/Header-Super-Pano-2400-1080-H265.webm',
    specs: [
      { label: 'Остекление', value: '12 мм закалённое с полированной еврофаской' },
      { label: 'Силовой каркас', value: 'Усиленный профиль без центральных колонн' },
      { label: 'Антикоррозия', value: 'Защитное покрытие Magnelis® C4 (опция C5)' },
      { label: 'Сетка', value: 'Трёхслойное усиление, сглаженные края' },
      { label: 'Сертификация', value: 'UNE 147201:2024 и Eurocodes 1 & 3' },
      { label: 'Конфигурация', value: 'Стационарная или мобильная pop-up рама' },
    ],
    highlights: [
      'Отсутствие металлических стоек в зонах активного зрительского обзора',
      'Стекло и сетка в одной плоскости (Flush Transition) для безопасности',
      'Подтверждённая устойчивость к динамическим ударам и вибрациям',
    ],
  },
  {
    id: 'panoramic',
    name: 'Panoramic',
    eyebrow: 'Клубный стандарт',
    title: 'Широкий обзор и оптимальный клубный бюджет',
    tagline: 'Баланс открытой панорамы и проверенной клубной надёжности',
    description:
      'Классическая панорамная модель без внутренних металлических стоек в задней игровой зоне. Идеальное решение для клубов, которым требуется современная эстетика открытого корта при оптимальной инвестиционной стоимости.',
    image: {
      src: 'https://jubopadel.com/wp-content/uploads/2023/08/panoramic_presentation.png',
      alt: 'Панорамный падел-корт JUBO Panoramic для спортивных клубов',
      width: 1648,
      height: 822,
    },
    videoUrl: 'https://jubopadel.com/wp-content/uploads/2026/05/Header-Panoramic-2400-1080-H265.webm',
    specs: [
      { label: 'Остекление', value: '10 мм или 12 мм закалённое безопасное стекло' },
      { label: 'Торцевые стены', value: 'Панорамное полотно без вертикальных перемычек' },
      { label: 'Антикоррозия', value: 'Антикоррозийный цинковый грунт + порошковая эмаль' },
      { label: 'Опоры', value: 'Усиленные колонны с надёжным анкерным креплением' },
      { label: 'Освещение', value: 'Мачты 6 м прямой или изогнутой формы' },
      { label: 'Размещение', value: 'Indoor (залы/ангары) и outdoor (улица)' },
    ],
    highlights: [
      'Открытый панорамный вид на игровую зону с торцевых трибун',
      'Доступность в стационарном и быстроразборном переносном исполнении',
      'Быстрая окупаемость в коммерческих падел-центрах',
    ],
  },
  {
    id: 'vision-pro',
    name: 'Vision Pro',
    eyebrow: 'Интенсивная эксплуатация',
    title: 'Сверхжёсткая металлоконструкция для высокой проходимости',
    tagline: 'Максимальная прочность и долговечность для коммерческих кортов 24/7',
    description:
      'Эволюция легендарной модели Vision с усиленным сечением стоек, утолщёнными рамами и дополнительными рёбрами жесткости. Спроектирована специально для клубов с непрерывным потоком игроков и высокими ударными нагрузками.',
    image: {
      src: 'https://jubopadel.com/wp-content/uploads/2023/08/presentation_vision.png',
      alt: 'Падел-корт JUBO Vision Pro с усиленным каркасом',
      width: 1648,
      height: 822,
    },
    videoUrl: null,
    specs: [
      { label: 'Каркас', value: 'Усиленные профильные трубы с толщиной стенки до 4 мм' },
      { label: 'Остекление', value: '10 мм или 12 мм закалённое стекло' },
      { label: 'Сетка', value: 'Антивандальная электросварная сетка с двойной связкой' },
      { label: 'Защита', value: 'Покрытие Qualisteelcoat® C4 / C5 против износа' },
      { label: 'Стойки сетки', value: 'Интегрированные со скрытым внутренним механизмом' },
      { label: 'Эксплуатация', value: 'Рассчитан на работу более 14 часов в сутки' },
    ],
    highlights: [
      'Максимальная геометрическая стабильность при интенсивной клубной игре',
      'Стекло установлено заподлицо со стальной рамой для защиты кромок',
      'Минимальные требования к обслуживанию на протяжении 10+ лет',
    ],
  },
  {
    id: 'infinity-tournament',
    name: 'Infinity Tournament',
    eyebrow: 'Мобильный Pop-up корт',
    title: 'Турнирный корт для временных локаций без анкерования в основание',
    tagline: 'Быстрый монтаж и демонтаж на площадях, стадионах и выставочных центрах',
    description:
      'Специальная переносная конфигурация линейки Infinity с самонесущей балансировочной рамой. Позволяет собрать полноценный турнирный падел-корт международного класса без сверления отверстий и разрушения чистового покрытия пола.',
    image: {
      src: 'https://jubopadel.com/wp-content/uploads/2024/07/destacada.png',
      alt: 'Мобильный переносной падел-корт JUBO Infinity Tournament',
      width: 1580,
      height: 736,
    },
    videoUrl: null,
    specs: [
      { label: 'Тип установки', value: 'Автономная рама без постоянных анкеров в пол' },
      { label: 'Время монтажа', value: 'Сборка силами бригады за 48–72 часа' },
      { label: 'Остекление', value: '12 мм закалённое соревновательное стекло FIP' },
      { label: 'Каркас', value: 'Облегчённая модульная высокопрочная сталь' },
      { label: 'Транспортировка', value: 'Компактный контейнерный комплект для перевозок' },
      { label: 'Кастомизация', value: 'Брендирование спонсоров под конкретное событие' },
    ],
    highlights: [
      'Монтаж на ледовых аренах, паркете, асфальте и временных помостах',
      'Сохраняет 100% соревновательные игровые характеристики постоянного корта',
      'Полная совместимость с телетрансляционными регламентами FIP / Premier Padel',
    ],
  },
  {
    id: 'infinity-xtrem',
    name: 'Infinity Xtrem',
    eyebrow: 'Ураганная ветростойкость',
    title: 'Инженерная защита от ветровых порывов до 260 км/ч (160 mph)',
    tagline: 'Создан для морских побережий, крыш зданий и открытых ветровых зон',
    description:
      'Высокопрочная модификация Infinity для проектов в зонах экстремальных климатических нагрузок. Усиленный треугольный периметр 150×70×3 мм и массивные опорные плиты распределяют колоссальные аэродинамические нагрузки как единый силовой блок.',
    image: {
      src: 'https://jubopadel.com/wp-content/uploads/2025/05/3-4.png',
      alt: 'Ветростойкий падел-корт JUBO Infinity Xtrem для побережий и крыш',
      width: 1920,
      height: 1080,
    },
    videoUrl: 'https://jubopadel.com/wp-content/uploads/2026/05/xtrem-header.webm',
    specs: [
      { label: 'Ветростойкость', value: 'До 160 миль/ч (260 км/ч) — ураганная категория' },
      { label: 'Периметр', value: 'Запатентованный треугольный профиль 150×70×3 мм' },
      { label: 'Анкерные плиты', value: 'Утолщённые опорные узлы для распределения нагрузок' },
      { label: 'Остекление', value: '12 мм закалённое с усиленными эластичными прокладками' },
      { label: 'Антикоррозия', value: 'Qualisteelcoat® C5VH для морского воздуха и соли' },
      { label: 'Применение', value: 'Открытые побережья, крыши небоскрёбов, открытые поля' },
    ],
    highlights: [
      'Непрерывный панорамный обзор даже при предельных ветровых нагрузках',
      'Сертифицированный расчёт сопротивления конструкций по Eurocode 1',
      'Специальная морская защита от коррозии и солевого тумана',
    ],
  },
] as const

type ModelId = (typeof models)[number]['id']

export function CourtModelTabs({ onSelectModel }: { onSelectModel?: (modelId: ModelId) => void }) {
  const [activeModel, setActiveModel] = useState<ModelId>(models[0].id)

  return (
    <div>
      <Tabs
        aria-label="Модели кортов JUBO"
        className="no-scrollbar w-full"
        layoutId="court-model-tabs"
        tabs={models.map((model) => ({
          id: model.id,
          label: model.name,
          panelId: `court-model-panel-${model.id}`,
        }))}
        value={activeModel}
        onChange={(val) => setActiveModel(val as ModelId)}
      />

      {models.map((model) => (
        <div
          key={model.id}
          id={`court-model-panel-${model.id}`}
          role="tabpanel"
          aria-label={model.name}
          tabIndex={0}
          hidden={activeModel !== model.id}
          className="se-4 mt-6 bg-page p-6 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 md:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12 lg:items-center">
            <div className="se-3 relative aspect-[16/9] overflow-hidden bg-ink">
              {model.videoUrl ? (
                <video
                  src={model.videoUrl}
                  poster={model.image.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={model.image.src}
                  alt={model.image.alt}
                  width={model.image.width}
                  height={model.image.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain bg-white"
                />
              )}
              <div className="pointer-events-none absolute bottom-3 left-3 z-10">
                <span className="se-1 bg-ink/80 px-3 py-1.5 type-micro uppercase font-semibold text-white/90 backdrop-blur-md">
                  {model.name} · JUBO
                </span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-eyebrow text-ink-muted">{model.eyebrow}</span>
                <span className="se-1 bg-lime-soft px-2.5 py-0.5 type-micro font-semibold text-lime-soft-ink">
                  Оригинал Испания
                </span>
              </div>
              <h3 className="type-title-large mt-3 text-ink">{model.title}</h3>
              <p className="type-caption mt-1 text-ink-soft font-semibold">{model.tagline}</p>
              <p className="type-body mt-4 text-ink-soft">{model.description}</p>

              <div className="mt-6 border-y border-ink/10 py-5">
                <h4 className="type-eyebrow text-ink-muted mb-3">Технические спецификации:</h4>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {model.specs.map((item) => (
                    <div key={item.label} className="type-body-sm leading-snug">
                      <dt className="text-ink-muted type-caption">{item.label}</dt>
                      <dd className="font-semibold text-ink">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <ul className="mt-5 grid gap-2" aria-label={`Преимущества ${model.name}`}>
                {model.highlights.map((point) => (
                  <li key={point} className="type-body-sm flex items-start gap-2.5 text-ink-soft">
                    <span className="se-1 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check aria-hidden="true" size={13} strokeWidth={2.8} />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#cta-section"
                  onClick={() => onSelectModel?.(model.id)}
                  className="se-2 inline-flex items-center gap-2 bg-ink px-6 py-3.5 type-ui font-semibold text-white transition-all hover:bg-ink-hover focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <span>Запросить расчёт модели {model.name}</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DirectContactButtons({ onSelectChannel }: { onSelectChannel?: (channel: 'telegram' | 'vk' | 'phone') => void }) {
  const { requestContact } = useActionLayer()

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <a
        href="https://t.me/unlim_padel"
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackAnalytics({ name: 'direct_messenger_click', actionKind: 'telegram', objectType: 'lead' })
          onSelectChannel?.('telegram')
        }}
        className="se-3 flex items-center justify-between bg-[#229ED9]/10 p-5 transition-all hover:bg-[#229ED9]/15 border border-[#229ED9]/25 group"
      >
        <div className="flex items-center gap-3">
          <span className="se-2 flex h-10 w-10 items-center justify-center bg-[#229ED9] text-white">
            <Send size={18} />
          </span>
          <div>
            <span className="type-caption block text-[#229ED9] font-semibold">Написать в</span>
            <span className="type-title-compact text-ink">Telegram</span>
          </div>
        </div>
        <ArrowRight size={18} className="text-[#229ED9] transition-transform group-hover:translate-x-1" />
      </a>

      <a
        href="https://vk.com/unlim_padel"
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackAnalytics({ name: 'direct_messenger_click', actionKind: 'vk', objectType: 'lead' })
          onSelectChannel?.('vk')
        }}
        className="se-3 flex items-center justify-between bg-[#0077FF]/10 p-5 transition-all hover:bg-[#0077FF]/15 border border-[#0077FF]/25 group"
      >
        <div className="flex items-center gap-3">
          <span className="se-2 flex h-10 w-10 items-center justify-center bg-[#0077FF] text-white">
            <MessageCircle size={18} />
          </span>
          <div>
            <span className="type-caption block text-[#0077FF] font-semibold">Сообщество</span>
            <span className="type-title-compact text-ink">ВКонтакте</span>
          </div>
        </div>
        <ArrowRight size={18} className="text-[#0077FF] transition-transform group-hover:translate-x-1" />
      </a>

      <button
        type="button"
        onClick={() => {
          trackAnalytics({ name: 'direct_call_click', actionKind: 'phone', objectType: 'lead' })
          requestContact('phone')
          onSelectChannel?.('phone')
        }}
        className="se-3 flex items-center justify-between bg-lime/20 p-5 transition-all hover:bg-lime/30 border border-lime-deep/30 group text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="se-2 flex h-10 w-10 items-center justify-center bg-lime text-lime-ink">
            <Phone size={18} />
          </span>
          <div>
            <span className="type-caption block text-lime-soft-ink font-semibold">Связаться</span>
            <span className="type-title-compact text-ink">По телефону</span>
          </div>
        </div>
        <ArrowRight size={18} className="text-lime-soft-ink transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  )
}

function InlineLeadCalculatorForm({
  site,
  initialModel = 'infinity',
}: {
  site: SiteDTO
  initialModel?: ModelId
}) {
  const [preferredChannel, setPreferredChannel] = useState<'phone' | 'telegram' | 'vk'>('phone')
  const [selectedModel, setSelectedModel] = useState<string>(initialModel)
  const [courtCount, setCourtCount] = useState<string>('1')
  const [state, setState] = useState<'form' | 'sending' | 'success'>('form')
  const [error, setError] = useState('')
  const [key] = useState(
    () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
  const started = useRef(false)

  // Sync if initialModel changes
  React.useEffect(() => {
    if (initialModel) setSelectedModel(initialModel)
  }, [initialModel])

  const handleFocus = () => {
    if (!started.current) {
      started.current = true
      trackAnalytics({
        name: 'form_start',
        formType: 'consultation',
        objectType: 'court_landing_calculator',
        objectId: selectedModel,
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const name = String(data.name ?? '').trim()
    const contactValue = String(data.contactValue ?? '').trim()
    const city = String(data.city ?? '').trim()
    const userComment = String(data.comment ?? '').trim()

    const errors: string[] = []
    if (name.length < 2) errors.push('Укажите имя (минимум 2 символа).')
    if (!contactValue) errors.push('Укажите контактные данные для связи.')

    let phone = ''
    let telegram = ''
    let vk = ''

    if (preferredChannel === 'phone') {
      phone = contactValue
      if (!/^[+\d\s()-]{6,40}$/.test(phone)) errors.push('Проверьте корректность номера телефона.')
    } else if (preferredChannel === 'telegram') {
      telegram = contactValue
      if (!/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(telegram)) errors.push('Укажите корректный Telegram-логин (например, @username).')
    } else if (preferredChannel === 'vk') {
      vk = contactValue
      if (!/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(vk)) errors.push('Укажите логин или ID ВКонтакте.')
    }

    if (data.consent !== 'on') {
      errors.push('Необходимо подтвердить согласие на обработку персональных данных.')
    }

    if (errors.length > 0) {
      setError(errors.join(' '))
      trackAnalytics({
        name: 'form_error',
        formType: 'consultation',
        objectType: 'court_landing_calculator',
        objectId: selectedModel,
      })
      return
    }

    const fullComment = `Модель: ${selectedModel}. Количество кортов: ${courtCount}.${city ? ` Город: ${city}.` : ''}${
      userComment ? ` Пожелания: ${userComment}` : ''
    }`

    setState('sending')
    trackAnalytics({
      name: 'form_submit_attempt',
      formType: 'consultation',
      objectType: 'court_landing_calculator',
      objectId: selectedModel,
    })

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)

    try {
      const response = await fetch(site.contactConfirmation.leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          phone,
          telegram,
          vk,
          email: '',
          comment: fullComment,
          consent: true,
          type: 'consultation',
          sourcePage,
          sourceEntity: `Корт JUBO: ${selectedModel} (${courtCount} шт.)`,
          idempotencyKey: key,
          analytics: analyticsServerContext(),
        }),
      })

      const result = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean }
      if (response.ok && result.ok) {
        setState('success')
        trackAnalytics({
          name: 'form_submit_success',
          formType: 'consultation',
          objectType: 'court_landing_calculator',
          objectId: selectedModel,
        })
      } else {
        setState('form')
        setError(result.error ?? 'Не удалось отправить заявку. Попробуйте ещё раз.')
        trackAnalytics({
          name: 'form_error',
          formType: 'consultation',
          objectType: 'court_landing_calculator',
          objectId: selectedModel,
        })
      }
    } catch {
      setState('form')
      setError('Связь прервалась. Проверьте интернет и повторите отправку — дубликат не создастся.')
      trackAnalytics({
        name: 'form_error',
        formType: 'consultation',
        objectType: 'court_landing_calculator',
        objectId: selectedModel,
      })
    } finally {
      window.clearTimeout(timeout)
    }
  }

  if (state === 'success') {
    return (
      <div className="se-4 bg-white p-8 md:p-12 text-center" role="status">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime text-lime-ink">
          <Check size={32} strokeWidth={2.8} />
        </div>
        <h3 className="type-title-large mt-6 text-ink">Заявка на расчёт корта принята</h3>
        <p className="type-body mt-3 max-w-[540px] mx-auto text-ink-soft">
          Инженер UNLIM свяжется с вами по указанному каналу ({preferredChannel === 'telegram' ? 'Telegram' : preferredChannel === 'vk' ? 'VK' : 'телефону'}), уточнит параметры площадки и подготовит детальную заводскую спецификацию JUBO.
        </p>
        <Button className="mt-8" onClick={() => setState('form')}>
          Отправить ещё одну заявку
        </Button>
      </div>
    )
  }

  const inputClass =
    'se-2 min-h-12 w-full bg-page px-4 type-body-sm placeholder:text-ink-soft/45 border border-ink/10 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2'

  return (
    <form onSubmit={handleSubmit} onFocusCapture={handleFocus} noValidate className="se-4 bg-white p-6 md:p-10">
      <div className="mb-6">
        <span className="type-eyebrow text-ink-muted">Быстрый расчёт сметы под объект</span>
        <h3 className="type-title-card mt-1 text-ink">Параметры площадки и связь</h3>
      </div>

      <div className="grid gap-5">
        <div>
          <span className="type-caption mb-2 block font-semibold text-ink">1. Куда отправить расчёт и связаться:</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreferredChannel('phone')}
              className={cn(
                'se-2 flex items-center justify-center gap-2 py-3 px-3 type-ui font-semibold transition-colors cursor-pointer',
                preferredChannel === 'phone'
                  ? 'bg-ink text-white'
                  : 'bg-surface-subtle text-ink-soft hover:bg-surface-muted'
              )}
            >
              <Phone size={16} />
              <span>Звонок</span>
            </button>
            <button
              type="button"
              onClick={() => setPreferredChannel('telegram')}
              className={cn(
                'se-2 flex items-center justify-center gap-2 py-3 px-3 type-ui font-semibold transition-colors cursor-pointer',
                preferredChannel === 'telegram'
                  ? 'bg-[#229ED9] text-white'
                  : 'bg-surface-subtle text-ink-soft hover:bg-surface-muted'
              )}
            >
              <Send size={16} />
              <span>Telegram</span>
            </button>
            <button
              type="button"
              onClick={() => setPreferredChannel('vk')}
              className={cn(
                'se-2 flex items-center justify-center gap-2 py-3 px-3 type-ui font-semibold transition-colors cursor-pointer',
                preferredChannel === 'vk'
                  ? 'bg-[#0077FF] text-white'
                  : 'bg-surface-subtle text-ink-soft hover:bg-surface-muted'
              )}
            >
              <MessageCircle size={16} />
              <span>VK</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="type-caption grid gap-1.5 text-ink font-semibold">
            Ваше имя *
            <input
              className={inputClass}
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Как к вам обращаться"
            />
          </label>

          <label className="type-caption grid gap-1.5 text-ink font-semibold">
            {preferredChannel === 'phone'
              ? 'Номер телефона *'
              : preferredChannel === 'telegram'
              ? 'Telegram логин *'
              : 'VK логин или ссылка *'}
            <input
              className={inputClass}
              name="contactValue"
              type={preferredChannel === 'phone' ? 'tel' : 'text'}
              autoComplete={preferredChannel === 'phone' ? 'tel' : 'off'}
              required
              maxLength={80}
              placeholder={
                preferredChannel === 'phone'
                  ? '+7 (999) 000-00-00'
                  : preferredChannel === 'telegram'
                  ? '@username'
                  : 'vk.com/username или id'
              }
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="type-caption grid gap-1.5 text-ink font-semibold">
            Модель корта
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={inputClass}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.eyebrow})
                </option>
              ))}
              <option value="consultation">Помочь с выбором модели</option>
            </select>
          </label>

          <label className="type-caption grid gap-1.5 text-ink font-semibold">
            Количество кортов
            <select
              value={courtCount}
              onChange={(e) => setCourtCount(e.target.value)}
              className={inputClass}
            >
              <option value="1">1 корт</option>
              <option value="2-3">2–3 корта</option>
              <option value="4-6">4–6 кортов</option>
              <option value="7+">7+ кортов (большой клуб)</option>
            </select>
          </label>

          <label className="type-caption grid gap-1.5 text-ink font-semibold">
            Город / локация
            <input
              className={inputClass}
              name="city"
              placeholder="Москва, СПб, Сочи..."
              maxLength={100}
            />
          </label>
        </div>

        <label className="type-caption grid gap-1.5 text-ink font-semibold">
          Комментарий к площадке (необязательно)
          <textarea
            className={cn(inputClass, 'min-h-20 py-3')}
            name="comment"
            maxLength={1000}
            placeholder="Indoor ангар или улица, готовность основания, желаемые сроки монтажа..."
          />
        </label>

        <label className="absolute -left-[10000px]" aria-hidden="true">
          Компания
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>

        <label className="type-body-sm flex items-start gap-3 cursor-pointer text-ink-soft">
          <input
            type="checkbox"
            name="consent"
            required
            defaultChecked
            className="mt-1 h-5 w-5 shrink-0 accent-lime cursor-pointer"
          />
          <span>
            {site.contactConfirmation.consentLabel} ·{' '}
            <a href={site.contactConfirmation.policyHref} target="_blank" rel="noreferrer" className="underline hover:text-ink">
              политика конфиденциальности
            </a>
          </span>
        </label>

        {error && (
          <p role="alert" className="type-body-sm font-semibold text-danger">
            {error}
          </p>
        )}

        <Button type="submit" loading={state === 'sending'} size="lg" fullWidth>
          Получить расчёт и спецификацию корта
        </Button>
      </div>
    </form>
  )
}

export function PadelCourtZakazPage({ site }: { site: SiteDTO }) {
  const [activeModelForForm, setActiveModelForForm] = useState<ModelId>('infinity')

  return (
    <SiteFrame site={site} backLink={{ href: '/' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                name: site.brandName,
                url: 'https://unlimpadel.ru',
                description: 'Официальный дистрибьютор падел-кортов JUBO в России.',
              },
              {
                '@type': 'Product',
                name: 'Падел-корты JUBO под ключ',
                image: heroImage.src,
                description:
                  'Продажа, прямые поставки с завода в Валенсии и сертифицированный монтаж падел-кортов JUBO в РФ под ключ: Infinity, Super Panoramic, Xtrem.',
                brand: { '@type': 'Brand', name: 'JUBO Padel' },
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'RUB',
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    priceType: 'https://schema.org/InvoicePrice',
                    unitText: 'корт под ключ',
                  },
                },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://unlimpadel.ru/' },
                  { '@type': 'ListItem', position: 2, name: 'Корты JUBO под ключ', item: 'https://unlimpadel.ru/padel-court-zakaz' },
                ],
              },
            ],
          }),
        }}
      />

      {/* 1. HERO-ШАПКА В СТИЛЕ PAGE-VIEW (/blog) С ВЕРТИКАЛЬНЫМИ СИЛОВЫМИ ЛИНИЯМИ */}
      <header className="page-hero relative overflow-hidden pb-12 pt-28 text-white md:pb-16 md:pt-36">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage.src})` }}
        />
        <video
          src="https://jubopadel.com/wp-content/uploads/2026/05/Header-Super-Pano-2400-1080-H265.webm"
          poster={heroImage.src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,.52)_0%,rgba(3,5,8,.84)_68%,rgba(3,5,8,.98)_100%)]" />

        <div className="container-page relative z-10">
          <div className="pt-6 sm:pt-10">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-md border border-white/15">
              <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
              <span className="type-eyebrow tracking-wider text-white/90">
                Официальный дистрибьютор JUBO Padel в РФ
              </span>
            </div>

            <h1 className="type-section mt-5 max-w-[960px] text-white font-semibold leading-[1.05] md:text-5xl lg:text-6xl">
              Падел корт купить под ключ — цена, строительство, монтаж
            </h1>

            <p className="type-editorial mt-5 max-w-[840px] text-white/75">
              UNLIM — официальный представитель испанского производителя <strong>JUBO Padel</strong> в России.
              Подберём конфигурацию корта, организуем прямую поставку с фабрики в Валенсии и выполним
              сертифицированный монтаж под ключ с гарантией.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#cta-section"
                className="se-2 inline-flex items-center justify-center gap-2.5 bg-lime px-7 py-4 type-ui font-semibold text-lime-ink transition-colors hover:bg-lime-hover focus-visible:outline-2 focus-visible:outline-focus"
              >
                <span>Получить расчёт сметы</span>
                <ArrowRight size={18} />
              </a>

              <a
                href="#models-section"
                className="se-2 inline-flex items-center justify-center gap-2 bg-white/10 px-6 py-4 type-ui font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/15"
              >
                <span>Выбрать модель кортов</span>
              </a>
            </div>

            {/* Swiss-сетка силовых линий первого экрана */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 md:grid-cols-4 md:gap-6">
              <div className="border-l border-white/20 pl-4">
                <span className="type-micro uppercase tracking-wider text-lime font-semibold">01 / Прямой импорт</span>
                <p className="type-body-sm mt-1 font-semibold text-white">Прямой контракт с JUBO (Испания)</p>
                <p className="type-caption mt-0.5 text-white/55">Таможня, сертификаты, логистика</p>
              </div>

              <div className="border-l border-white/20 pl-4">
                <span className="type-micro uppercase tracking-wider text-lime font-semibold">02 / 6 моделей</span>
                <p className="type-body-sm mt-1 font-semibold text-white">От клубных до ураганных (260 км/ч)</p>
                <p className="type-caption mt-0.5 text-white/55">Infinity, Super Panoramic, Xtrem</p>
              </div>

              <div className="border-l border-white/20 pl-4">
                <span className="type-micro uppercase tracking-wider text-lime font-semibold">03 / Монтаж по РФ</span>
                <p className="type-body-sm mt-1 font-semibold text-white">Собственные сертифицированные бригады</p>
                <p className="type-caption mt-0.5 text-white/55">Лазерная юстировка стекла 12 мм</p>
              </div>

              <div className="border-l border-white/20 pl-4">
                <span className="type-micro uppercase tracking-wider text-lime font-semibold">04 / Склад и ТО</span>
                <p className="type-body-sm mt-1 font-semibold text-white">Запасные стекла и комплектующие</p>
                <p className="type-caption mt-0.5 text-white/55">Оперативный сервис без простоя кортов</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <article>
        {/* 2. СТАТУС ДИСТРИБЬЮТОРА И ГАРАНТИИ (ПЕРВАЯ ПОЛОВИНА СТРАНИЦЫ) */}
        <section className="container-page py-16 md:py-24 border-b border-ink/10" aria-labelledby="distributor-title">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div>
              <span className="type-eyebrow text-ink-muted">Официальный дистрибьютор</span>
              <h2 id="distributor-title" className="type-section mt-3 text-ink">
                Прямые поставки JUBO в Россию без посредников
              </h2>
              <p className="type-body mt-5 text-ink-soft leading-relaxed">
                UNLIM является официальным авторизованным дистрибьютором испанского бренда <strong>JUBO Padel</strong> на
                территории РФ. Мы не просто продаём металлоконструкции — мы берем на себя полный цикл инженерной реализации
                падел-клуба: от адаптации проекта под российские снеговые и ветровые нагрузки до шеф-монтажа и сервисного обслуживания.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <span className="se-1 bg-surface-muted px-3 py-1.5 type-caption font-semibold text-ink">
                  FIP Compliant (Международная федерация)
                </span>
                <span className="se-1 bg-surface-muted px-3 py-1.5 type-caption font-semibold text-ink">
                  Eurocodes 1 & 3
                </span>
                <span className="se-1 bg-surface-muted px-3 py-1.5 type-caption font-semibold text-ink">
                  UNE 147201:2024
                </span>
                <span className="se-1 bg-surface-muted px-3 py-1.5 type-caption font-semibold text-ink">
                  ISO 12944 (C4/C5)
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {distributorAdvantages.map((adv, idx) => (
                <Reveal key={adv.index} delay={idx * 0.08}>
                  <div className="se-3 bg-white p-6 border-l-2 border-ink h-full">
                    <span className="type-micro font-semibold text-ink-muted">{adv.index}</span>
                    <h3 className="type-title-card mt-2 text-ink">{adv.title}</h3>
                    <p className="type-body-sm mt-3 text-ink-soft leading-relaxed">{adv.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. ЧТО ВХОДИТ В УСЛУГИ ПОД КЛЮЧ: 5 ЭТАПОВ */}
        <section className="container-page py-16 md:py-24" aria-labelledby="turnkey-title">
          <div className="mb-12 max-w-[760px]">
            <span className="type-eyebrow text-ink-muted">Полный цикл реализации</span>
            <h2 id="turnkey-title" className="type-section mt-3 text-ink">
              Что входит в строительство и монтаж корта под ключ
            </h2>
            <p className="type-body mt-4 text-ink-soft">
              Мы фиксируем состав работ и техническую спецификацию в договоре до начала поставки. Вы получаете готовый к игре
              объект без непредвиденных доплат и скрытых этапов.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {turnkeySteps.map((step, idx) => (
              <Reveal key={step.number} delay={idx * 0.08} className="h-full">
                <div className="se-3 flex flex-col justify-between bg-white p-6 border-t-2 border-ink/20 h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="se-2 flex h-10 w-10 items-center justify-center bg-surface-muted text-ink">
                        <step.icon size={20} />
                      </span>
                      <span className="type-price text-ink/30">{step.number}</span>
                    </div>
                    <h3 className="type-title-card mt-6 text-ink">{step.title}</h3>
                    <p className="type-body-sm mt-3 text-ink-soft leading-relaxed">{step.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4. ЦЕНА КОРТА И ФАКТОРЫ СМЕТЫ */}
        <section className="container-page pb-16 md:pb-24" aria-labelledby="price-factors-title">
          <div className="se-5 overflow-hidden bg-white p-6 md:p-12 lg:p-14 border border-ink/10">
            <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <span className="type-eyebrow text-ink-muted">Честное ценообразование</span>
                <h2 id="price-factors-title" className="type-section mt-3 text-ink">
                  Из чего складывается реальная стоимость падел-корта
                </h2>
                <p className="type-body mt-5 text-ink-soft leading-relaxed">
                  Универсальная цена «корт от 2 млн рублей» не отражает реальную стоимость запуска площадки.
                  Мы формируем прозрачную смету под конкретный объект: тип площадки (indoor или outdoor), класс ветровой
                  нагрузки, состояние фундамента, комплектацию света и логистику до вашего города.
                </p>
                <div className="mt-8">
                  <a
                    href="#cta-section"
                    className="se-2 inline-flex items-center gap-2 bg-ink px-6 py-3.5 type-ui font-semibold text-white transition-colors hover:bg-ink-hover"
                  >
                    <span>Запросить детальный сметный расчёт</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>

              <ul className="grid gap-2.5 sm:grid-cols-2" aria-label="Факторы стоимости падел-корта">
                {priceFactors.map((factor) => (
                  <li
                    key={factor.label}
                    className="se-2 bg-surface-subtle p-4 border-l border-ink/15 flex flex-col justify-center"
                  >
                    <span className="type-body-sm font-semibold text-ink">{factor.label}</span>
                    <span className="type-caption mt-0.5 text-ink-muted">{factor.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5. ИНФОГРАФИКА ТЕХНОЛОГИЙ JUBO */}
        <section className="mesh-dark py-16 text-white md:py-24" aria-labelledby="tech-title">
          <div className="container-page">
            <div className="grid gap-6 lg:grid-cols-[1fr_.8fr] lg:items-end">
              <div>
                <span className="type-eyebrow text-white/50">Инженерные инновации</span>
                <h2 id="tech-title" className="type-section mt-3 text-white">
                  Технологии и стандарты JUBO
                </h2>
              </div>
              <p className="type-body text-white/65 lg:justify-self-end">
                Европейский стандарт безопасности и долговечности. Каждая деталь спроектирована с расчётом на многолетнюю
                клубную эксплуатацию без коррозии, деформаций и люфтов.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {technologies.map((tech, idx) => (
                <Reveal key={tech.title} delay={idx * 0.07}>
                  <div className="se-3 bg-white/8 p-6 backdrop-blur-md border border-white/10 h-full">
                    <div className="flex items-center justify-between">
                      <span className="se-2 flex h-11 w-11 items-center justify-center bg-white/10 text-lime">
                        <tech.icon size={22} />
                      </span>
                      <span className="type-micro uppercase font-semibold text-white/45 tracking-wider">
                        {tech.tag}
                      </span>
                    </div>
                    <h3 className="type-title-card mt-6 text-white">{tech.title}</h3>
                    <p className="type-body-sm mt-3 text-white/65 leading-relaxed">{tech.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ГАЛЕРЕЯ КЛУБНЫХ РЕАЛИЗАЦИЙ JUBO */}
        <section className="container-page py-16 md:py-24" aria-labelledby="gallery-title">
          <div className="mb-10 max-w-[760px]">
            <span className="type-eyebrow text-ink-muted">Реализованные комплексы</span>
            <h2 id="gallery-title" className="type-section mt-3 text-ink">
              Как корты JUBO выглядят в реальных клубных проектах
            </h2>
            <p className="type-body mt-4 text-ink-soft">
              Панорамные светопрозрачные конструкции без лишних стоек визуально расширяют клубное пространство и обеспечивают
              высокую зрелищность матчей для гостей и зрителей.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {galleryImages.map((image, idx) => (
              <Reveal key={image.src} delay={idx * 0.1}>
                <figure className="group">
                  <div className="se-4 aspect-[16/9] overflow-hidden bg-control border border-ink/10">
                    <img
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <figcaption className="type-caption mt-3 text-ink-muted flex items-center justify-between">
                    <span>{image.caption}</span>
                    <span className="type-micro text-ink-soft/60">Фото: JUBO Padel</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. МОДЕЛЬНЫЙ РЯД КОРТОВ JUBO (ТАБЫ ПЕРЕД CTA) */}
        <section id="models-section" className="bg-white py-16 md:py-24 border-t border-ink/10" aria-labelledby="models-title">
          <div className="container-page">
            <div className="grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
              <div>
                <span className="type-eyebrow text-ink-muted">Линейка кортов JUBO</span>
                <h2 id="models-title" className="type-section mt-3 max-w-[720px] text-ink">
                  Выберите модель корта под условия вашей площадки
                </h2>
              </div>
              <p className="type-body max-w-[620px] text-ink-soft lg:justify-self-end">
                Сравните технические параметры, тип остекления, ветровую стойкость и конструктивные особенности каждой модели.
              </p>
            </div>

            <div className="mt-10">
              <CourtModelTabs onSelectModel={(modelId) => setActiveModelForForm(modelId)} />
            </div>
          </div>
        </section>

        {/* 7. CTA БЛОК: ПРЯМАЯ СВЯЗЬ И ИНТЕРАКТИВНЫЙ РАСЧЁТ СМЕТЫ */}
        <section id="cta-section" className="bg-page py-16 md:py-24 border-t border-ink/10" aria-labelledby="cta-heading">
          <div className="container-page">
            <div className="mb-10 text-center max-w-[780px] mx-auto">
              <span className="type-eyebrow text-ink-muted">Связь с официальным дистрибьютором</span>
              <h2 id="cta-heading" className="type-section mt-3 text-ink">
                Рассчитать проект падел-корта под ключ
              </h2>
              <p className="type-body mt-4 text-ink-soft">
                Напишите нам напрямую в мессенджер для быстрой консультации или оставьте параметры площадки — инженер UNLIM
                подготовит подробную смету и спецификацию оборудования.
              </p>
            </div>

            {/* Быстрые кнопки связи в 1 клик */}
            <div className="mb-10">
              <DirectContactButtons onSelectChannel={() => {}} />
            </div>

            {/* Интерактивная форма расчёта */}
            <div className="mx-auto max-w-[880px]">
              <InlineLeadCalculatorForm site={site} initialModel={activeModelForForm} />
            </div>
          </div>
        </section>
      </article>
    </SiteFrame>
  )
}

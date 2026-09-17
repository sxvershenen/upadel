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
import { motion } from 'framer-motion'

import { SiteFrame } from '../components/SiteFrame'
import { Tabs } from '../components/ui/Tabs'
import { Button, ButtonLink } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Typography } from '../components/ui/Typography'
import { SurfaceCard } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { SplitTextReveal } from '../components/ui/SplitTextReveal'
import { springSoft } from '../lib/motion'
import { cn } from '../utils/cn'
import { analyticsServerContext, trackAnalytics } from '../analytics/AnalyticsTracker'
import { useActionLayer } from '../actions/ActionLayer'

const sourcePage = '/padel-court-zakaz'

/**
 * Typographic helper: attaches Russian prepositions and short conjunctions
 * with non-breaking spaces (\u00A0) to prevent orphaned words at line breaks.
 */
export function typograph(text: string): string {
  const shortWord = /^(в|во|и|к|ко|с|со|у|о|об|от|до|за|на|по|из|без|для|при|под|над|не|ни|а|но|да)$/i
  const parts = text.split(/(\s+)/)
  for (let i = 0; i < parts.length - 2; i += 2) {
    const clean = parts[i].replace(/^[«"(\s]+|[»"),.!?:;\s]+$/g, '')
    if (shortWord.test(clean)) {
      parts[i + 1] = '\u00A0'
    }
  }
  return parts.join('')
}

export const heroImage = {
  src: 'https://jubopadel.com/wp-content/uploads/2025/01/JGC06036-2048x1365.jpg',
  alt: 'Панорамные падел-корты JUBO в спортивном клубе мирового уровня',
  width: 2048,
  height: 1365,
}

export const heroMetrics = [
  {
    number: '01',
    tag: 'Прямой импорт',
    title: 'Прямой контракт с JUBO (Испания)',
    caption: 'Таможня, сертификаты, логистика',
  },
  {
    number: '02',
    tag: '6 моделей',
    title: 'От клубных до ураганных (260 км/ч)',
    caption: 'Infinity, Super Panoramic, Xtrem',
  },
  {
    number: '03',
    tag: 'Монтаж по РФ',
    title: 'Собственные сертифицированные бригады',
    caption: 'Лазерная юстировка стекла 12 мм',
  },
  {
    number: '04',
    tag: 'Склад и ТО',
    title: 'Запасные стекла и комплектующие',
    caption: 'Оперативный сервис без простоя кортов',
  },
] as const

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
    text: 'Выезд инженера или детальный аудит площадки: геометрия зала, качество бетонного основания, снеговые и ветровые нагрузки, высоты потолков и коммуникации.',
  },
  {
    icon: Settings2,
    number: '02',
    title: 'Подбор модели и кастомизация',
    text: 'Выбор конструкции под задачи клуба, подбор цвета металлокаркаса по шкале RAL, освещения (4×200W или 8×200W), спортивного газона FIP и брендинга.',
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
    text: 'Сборка силового металлокаркаса, вакуумная посадка закалённого стекла 12 мм, бесшовная стыковка сетки заподлицо, укладка газона и засыпка кварцевым песком.',
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
    text: 'Инновационный стальной сплав с цинково-алюминиево-магниевым слоем. Стойкость к коррозии в 10 раз выше обычной оцинковки, выдерживает агрессивный климат и дорожные реагенты.',
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
      src: 'https://jubopadel.com/wp-content/uploads/2026/05/supportinfinitypk-1024x576.png',
      alt: 'Панорамный падел-корт JUBO Infinity без угловых стоек',
      width: 1024,
      height: 576,
    },
    specs: [
      { label: 'Остекление', value: '12 мм закалённое FIP (18 панелей, 108 м²)' },
      { label: 'Силовой каркас', value: '4 колонны 160×80×3 мм + 8 опорных ласт 3 м' },
      { label: 'Антикоррозия', value: 'Сталь Magnelis® C4 / C5 по ISO 12944' },
      { label: 'Сетка', value: 'Электросварная 50×50×4 мм, заподлицо со стеклом' },
      { label: 'Крепёж', value: 'Нержавеющая сталь AISI 316, втулки с УФ-защитой' },
      { label: 'Ветростойкость', value: 'Сертифицирована по Eurocode 1 (до 140 км/ч)' },
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
      src: 'https://jubopadel.com/wp-content/uploads/2026/05/superpanoramic-1024x576.png',
      alt: 'Падел-корт JUBO Super Panoramic для профессиональных турниров',
      width: 1024,
      height: 576,
    },
    specs: [
      { label: 'Остекление', value: '12 мм закалённое с полированной еврофаской' },
      { label: 'Силовой каркас', value: 'Усиленный периметр без центральных колонн' },
      { label: 'Антикоррозия', value: 'Защитное покрытие Magnelis® C4 / C5' },
      { label: 'Сетка', value: 'Трёхслойная 50×50×4 мм, заподлицо со стеклом' },
      { label: 'Крепёж', value: 'Нержавеющая сталь AISI 316, скруглённые головки' },
      { label: 'Ветростойкость', value: 'Сертифицирована по UNE 147201:2024 и Eurocodes' },
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
      src: 'https://jubopadel.com/wp-content/uploads/2026/05/panoramic-1024x576.png',
      alt: 'Панорамный падел-корт JUBO Panoramic для спортивных клубов',
      width: 1024,
      height: 576,
    },
    specs: [
      { label: 'Остекление', value: '10 мм или 12 мм закалённое безопасное стекло' },
      { label: 'Силовой каркас', value: 'Колонны 100×50×3 мм без вертикальных перемычек на торцах' },
      { label: 'Антикоррозия', value: 'Антикоррозийный грунт + Qualisteelcoat®' },
      { label: 'Сетка', value: '50×50×4 мм со сглаженными кромками' },
      { label: 'Крепёж', value: 'Оцинкованные метизы 8.8 / AISI 304' },
      { label: 'Ветростойкость', value: 'Стандарт Eurocode (indoor / outdoor)' },
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
      src: 'https://jubopadel.com/wp-content/uploads/2026/05/visionpro-glass-1024x576.png',
      alt: 'Падел-корт JUBO Vision Pro с усиленным каркасом',
      width: 1024,
      height: 576,
    },
    specs: [
      { label: 'Остекление', value: '10 мм или 12 мм закалённое монолитное стекло' },
      { label: 'Силовой каркас', value: 'Усиленные стойки 120×60×3 мм с рёбрами жесткости' },
      { label: 'Антикоррозия', value: 'Qualisteelcoat® C4 / C5 против износа' },
      { label: 'Сетка', value: 'Антивандальная электросварная 50×50×4 мм' },
      { label: 'Крепёж', value: 'Нержавеющие метизы AISI 316' },
      { label: 'Ветростойкость', value: 'Высокая конструктивная жёсткость для 24/7' },
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
      src: 'https://jubopadel.com/wp-content/uploads/2026/05/infinity20264_2.120-1-1024x565.png',
      alt: 'Мобильный переносной падел-корт JUBO Infinity Tournament',
      width: 1024,
      height: 565,
    },
    specs: [
      { label: 'Остекление', value: '12 мм закалённое соревновательное стекло FIP' },
      { label: 'Силовой каркас', value: 'Самонесущая автономная рама без постоянных анкеров' },
      { label: 'Антикоррозия', value: 'Порошковое термопокрытие по ISO 12944' },
      { label: 'Сетка', value: 'Электросварная турнирная 50×50×4 мм заподлицо' },
      { label: 'Крепёж', value: 'Быстросъёмные узлы AISI 316 для оперативной сборки' },
      { label: 'Ветростойкость', value: '— (мобильный pop-up корт для закрытых арен и залов)' },
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
      src: 'https://jubopadel.com/wp-content/uploads/2026/05/xtrem-1024x576.jpg',
      alt: 'Ветростойкий падел-корт JUBO Infinity Xtrem для побережий и крыш',
      width: 1024,
      height: 576,
    },
    specs: [
      { label: 'Остекление', value: '12 мм закалённое с усиленными эластичными прокладками' },
      { label: 'Силовой каркас', value: 'Утолщённый треугольный контур 150×70×3 мм + усиленные узлы' },
      { label: 'Антикоррозия', value: 'Qualisteelcoat® C5VH для морского воздуха и соли' },
      { label: 'Сетка', value: '50×50×4 мм с усиленным узлом натяжения' },
      { label: 'Крепёж', value: 'Нержавеющая сталь AISI 316 (морской класс)' },
      { label: 'Ветростойкость', value: 'До 260 км/ч (160 mph) — ураганная категория' },
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

  const handleTabChange = (val: string) => {
    const id = val as ModelId
    setActiveModel(id)
    onSelectModel?.(id)
  }

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
        onChange={handleTabChange}
      />

      <SurfaceCard tone="white" interactive={false} className="mt-6 p-6 md:p-10 border border-ink/5">
        {models.map((model) => {
          const isSelected = activeModel === model.id
          return (
            <div
              key={model.id}
              id={`court-model-panel-${model.id}`}
              role="tabpanel"
              aria-label={model.name}
              tabIndex={0}
              hidden={!isSelected}
              className={cn(
                isSelected ? 'block' : 'hidden',
                'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2'
              )}
            >
              {isSelected ? (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springSoft}
                  className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-12 lg:items-start"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-white">
                    <img
                      src={model.image.src}
                      alt={model.image.alt}
                      width={model.image.width}
                      height={model.image.height}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain object-top"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="muted">{model.eyebrow}</Badge>
                      <Badge tone="dark">JUBO · Испания</Badge>
                    </div>

                    <Typography as="h3" role="title-large" className="mt-3 font-semibold text-ink">
                      {typograph(model.title)}
                    </Typography>

                    <Typography role="caption" tone="muted" className="mt-1 font-semibold">
                      {typograph(model.tagline)}
                    </Typography>

                    <Typography role="body" tone="subtle" className="mt-4">
                      {typograph(model.description)}
                    </Typography>

                    <div className="mt-6 border-y border-ink/10 py-5">
                      <Typography role="eyebrow" tone="muted" className="mb-3">
                        {typograph('Технические спецификации:')}
                      </Typography>
                      <dl className="grid gap-2.5 sm:grid-cols-2">
                        {model.specs.map((item) => (
                          <div key={item.label} className="type-body-sm leading-snug">
                            <dt className="text-ink-muted type-caption">{item.label}</dt>
                            <dd className="font-semibold text-ink">{typograph(item.value)}</dd>
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
                          <span>{typograph(point)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-12 lg:items-start">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-white">
                    <img
                      src={model.image.src}
                      alt={model.image.alt}
                      width={model.image.width}
                      height={model.image.height}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain object-top"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="muted">{model.eyebrow}</Badge>
                      <Badge tone="dark">JUBO · Испания</Badge>
                    </div>

                    <Typography as="h3" role="title-large" className="mt-3 font-semibold text-ink">
                      {typograph(model.title)}
                    </Typography>

                    <Typography role="caption" tone="muted" className="mt-1 font-semibold">
                      {typograph(model.tagline)}
                    </Typography>

                    <Typography role="body" tone="subtle" className="mt-4">
                      {typograph(model.description)}
                    </Typography>

                    <div className="mt-6 border-y border-ink/10 py-5">
                      <Typography role="eyebrow" tone="muted" className="mb-3">
                        {typograph('Технические спецификации:')}
                      </Typography>
                      <dl className="grid gap-2.5 sm:grid-cols-2">
                        {model.specs.map((item) => (
                          <div key={item.label} className="type-body-sm leading-snug">
                            <dt className="text-ink-muted type-caption">{item.label}</dt>
                            <dd className="font-semibold text-ink">{typograph(item.value)}</dd>
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
                          <span>{typograph(point)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </SurfaceCard>
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
      if (!/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(telegram)) {
        errors.push('Укажите корректный Telegram-логин (например, @username).')
      }
    } else if (preferredChannel === 'vk') {
      vk = contactValue
      if (!/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(vk)) {
        errors.push('Укажите логин или ID ВКонтакте.')
      }
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
      <SurfaceCard tone="white" interactive={false} className="p-8 md:p-12 text-left" role="status">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-lime-ink">
          <Check size={28} strokeWidth={2.8} />
        </div>
        <Typography as="h3" role="title-large" className="mt-6 text-ink">
          {typograph('Заявка на расчёт корта принята')}
        </Typography>
        <Typography role="body" tone="subtle" className="mt-3 max-w-[540px]">
          {typograph(
            `Инженер UNLIM свяжется с вами по указанному каналу (${
              preferredChannel === 'telegram' ? 'Telegram' : preferredChannel === 'vk' ? 'VK' : 'телефону'
            }), уточнит параметры площадки и подготовит детальную заводскую спецификацию JUBO.`
          )}
        </Typography>
        <div className="mt-8">
          <Button variant="neutral" size="md" onClick={() => setState('form')}>
            {typograph('Отправить ещё одну заявку')}
          </Button>
        </div>
      </SurfaceCard>
    )
  }

  const inputClass =
    'se-2 min-h-12 w-full bg-page px-4 type-body-sm placeholder:text-ink-soft/45 border border-ink/10 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 transition-colors'

  return (
    <SurfaceCard tone="white" interactive={false} className="p-6 md:p-8 border border-ink/5">
      <form onSubmit={handleSubmit} onFocusCapture={handleFocus} noValidate>
        <div className="mb-6">
          <Typography role="eyebrow" tone="muted">
            {typograph('Параметры площадки и смета')}
          </Typography>
          <Typography as="h3" role="title-card" className="mt-1 font-semibold text-ink">
            {typograph('Заполните данные для расчёта')}
          </Typography>
        </div>

        <div className="grid gap-5">
          <div>
            <Typography role="caption" tone="default" className="mb-2 block font-semibold">
              {typograph('1. Куда направить предварительную смету:')}
            </Typography>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPreferredChannel('phone')}
                className={cn(
                  'se-2 flex items-center gap-2 py-2 px-3.5 type-ui font-medium transition-colors cursor-pointer',
                  preferredChannel === 'phone'
                    ? 'bg-ink text-white'
                    : 'bg-control text-ink-soft hover:bg-control-hover'
                )}
              >
                <Phone size={15} />
                <span>Звонок</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredChannel('telegram')}
                className={cn(
                  'se-2 flex items-center gap-2 py-2 px-3.5 type-ui font-medium transition-colors cursor-pointer',
                  preferredChannel === 'telegram'
                    ? 'bg-ink text-white'
                    : 'bg-control text-ink-soft hover:bg-control-hover'
                )}
              >
                <Send size={15} />
                <span>Telegram</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredChannel('vk')}
                className={cn(
                  'se-2 flex items-center gap-2 py-2 px-3.5 type-ui font-medium transition-colors cursor-pointer',
                  preferredChannel === 'vk'
                    ? 'bg-ink text-white'
                    : 'bg-control text-ink-soft hover:bg-control-hover'
                )}
              >
                <MessageCircle size={15} />
                <span>ВКонтакте</span>
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Typography as="label" role="caption" className="grid gap-1.5 font-semibold text-ink">
              {typograph('Ваше имя *')}
              <input
                className={inputClass}
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                placeholder="Как к вам обращаться"
              />
            </Typography>

            <Typography as="label" role="caption" className="grid gap-1.5 font-semibold text-ink">
              {typograph(
                preferredChannel === 'phone'
                  ? 'Номер телефона *'
                  : preferredChannel === 'telegram'
                  ? 'Telegram логин *'
                  : 'VK логин или ссылка *'
              )}
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
            </Typography>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Typography as="label" role="caption" className="grid gap-1.5 font-semibold text-ink">
              {typograph('Модель корта')}
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
            </Typography>

            <Typography as="label" role="caption" className="grid gap-1.5 font-semibold text-ink">
              {typograph('Количество кортов')}
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
            </Typography>

            <Typography as="label" role="caption" className="grid gap-1.5 font-semibold text-ink">
              {typograph('Город / локация')}
              <input
                className={inputClass}
                name="city"
                placeholder="Москва, СПб, Сочи..."
                maxLength={100}
              />
            </Typography>
          </div>

          <Typography as="label" role="caption" className="grid gap-1.5 font-semibold text-ink">
            {typograph('Комментарий к объекту (необязательно)')}
            <textarea
              className={cn(inputClass, 'min-h-20 py-3')}
              name="comment"
              maxLength={1000}
              placeholder="Indoor ангар или открытая площадка, готовность основания, сроки..."
            />
          </Typography>

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

          <div>
            <Button type="submit" variant="primary" size="lg" loading={state === 'sending'} fullWidth>
              {typograph('Получить расчёт и спецификацию корта')}
            </Button>
          </div>
        </div>
      </form>
    </SurfaceCard>
  )
}

export function PadelCourtZakazPage({ site }: { site: SiteDTO }) {
  const [activeModelForForm, setActiveModelForForm] = useState<ModelId>('infinity')
  const { requestContact } = useActionLayer()

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

      {/* 1. HERO-ШАПКА: ЧИСТОЕ ВИДЕО С ПОСТЕРОМ, БЕЗ НАЛОЖЕНИЯ КАРТИНКИ */}
      <header className="page-hero relative overflow-hidden pb-12 pt-28 text-white md:pb-16 md:pt-36 bg-ink">
        <video
          src="https://jubopadel.com/wp-content/uploads/2026/05/Header-Super-Pano-2400-1080-H265.webm"
          poster={heroImage.src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,.58)_0%,rgba(3,5,8,.84)_65%,rgba(3,5,8,.98)_100%)]" />

        <div className="container-page relative z-10">
          <div className="pt-6 sm:pt-10">
            <Badge tone="glass" className="mb-5">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-lime animate-pulse" />
              {typograph('Официальный дистрибьютор JUBO Padel в РФ')}
            </Badge>

            <Typography as="h1" role="hero" className="max-w-[960px] text-white font-semibold leading-[1.05]">
              <SplitTextReveal
                text="Падел корт купить под ключ — цена, строительство, монтаж"
                animateOnMount
              />
            </Typography>

            <Typography role="editorial" className="mt-5 max-w-[840px] text-white/80">
              {typograph(
                'UNLIM — официальный представитель испанского производителя JUBO Padel в России. Подберём конфигурацию корта, организуем прямую поставку с фабрики в Валенсии и выполним сертифицированный монтаж под ключ с гарантией.'
              )}
            </Typography>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink
                href="#cta-section"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
              >
                {typograph('Получить расчёт сметы')}
              </ButtonLink>

              <ButtonLink
                href="#models-section"
                variant="glass"
                size="lg"
              >
                {typograph('Выбрать модель корта')}
              </ButtonLink>
            </div>

            {/* Swiss-сетка силовых линий первого экрана */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 md:grid-cols-4 md:gap-6">
              {heroMetrics.map((metric) => (
                <div key={metric.number} className="space-y-1">
                  <Typography role="micro" className="uppercase tracking-wider text-lime font-semibold">
                    {metric.number} / {metric.tag}
                  </Typography>
                  <Typography role="body-small" className="font-semibold text-white">
                    {typograph(metric.title)}
                  </Typography>
                  <Typography role="caption" className="text-white/60">
                    {typograph(metric.caption)}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <article>
        {/* 2. СТАТУС ДИСТРИБЬЮТОРА И ГАРАНТИИ */}
        <section className="container-page py-16 md:py-24 border-b border-ink/10" aria-labelledby="distributor-title">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div>
              <Typography role="eyebrow" tone="muted">
                {typograph('Официальный дистрибьютор')}
              </Typography>
              <Typography as="h2" id="distributor-title" role="section" className="mt-3 text-ink">
                {typograph('Прямые поставки JUBO в Россию без посредников')}
              </Typography>
              <Typography role="body" tone="subtle" className="mt-5 leading-relaxed">
                {typograph(
                  'UNLIM является официальным авторизованным дистрибьютором испанского бренда JUBO Padel на территории РФ. Мы не просто продаём металлоконструкции — мы берем на себя полный цикл инженерной реализации падел-клуба: от адаптации проекта под российские снеговые и ветровые нагрузки до шеф-монтажа и сервисного обслуживания.'
                )}
              </Typography>

              <div className="mt-7 flex flex-wrap gap-2">
                <Badge tone="muted">FIP Compliant (Международная федерация)</Badge>
                <Badge tone="muted">Eurocodes 1 & 3</Badge>
                <Badge tone="muted">UNE 147201:2024</Badge>
                <Badge tone="muted">ISO 12944 (C4/C5)</Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {distributorAdvantages.map((adv, idx) => (
                <Reveal key={adv.index} delay={idx * 0.08} className="h-full">
                  <SurfaceCard tone="white" interactive={false} className="p-6 h-full border border-ink/5">
                    <Typography role="micro" tone="muted" className="font-semibold">
                      {adv.index}
                    </Typography>
                    <Typography as="h3" role="title-card" className="mt-2 font-semibold text-ink">
                      {typograph(adv.title)}
                    </Typography>
                    <Typography role="body-small" tone="subtle" className="mt-3 leading-relaxed">
                      {typograph(adv.text)}
                    </Typography>
                  </SurfaceCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. ЧТО ВХОДИТ В УСЛУГИ ПОД КЛЮЧ: 5 ЭТАПОВ */}
        <section className="container-page py-16 md:py-24" aria-labelledby="turnkey-title">
          <div className="mb-12 max-w-[760px]">
            <Typography role="eyebrow" tone="muted">
              {typograph('Полный цикл реализации')}
            </Typography>
            <Typography as="h2" id="turnkey-title" role="section" className="mt-3 text-ink">
              {typograph('Что входит в строительство и монтаж корта под ключ')}
            </Typography>
            <Typography role="body" tone="subtle" className="mt-4">
              {typograph(
                'Мы фиксируем состав работ и техническую спецификацию в договоре до начала поставки. Вы получаете готовый к игре объект без непредвиденных доплат и скрытых этапов.'
              )}
            </Typography>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {turnkeySteps.map((step, idx) => (
              <Reveal key={step.number} delay={idx * 0.08} className="h-full">
                <SurfaceCard tone="white" interactive={false} className="flex flex-col justify-between p-6 h-full border border-ink/5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="se-2 flex h-10 w-10 items-center justify-center bg-surface-muted text-ink">
                        <step.icon size={20} />
                      </span>
                      <Typography role="price" tone="muted">
                        {step.number}
                      </Typography>
                    </div>
                    <Typography as="h3" role="title-card" className="mt-6 font-semibold text-ink">
                      {typograph(step.title)}
                    </Typography>
                    <Typography role="body-small" tone="subtle" className="mt-3 leading-relaxed">
                      {typograph(step.text)}
                    </Typography>
                  </div>
                </SurfaceCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4. ЦЕНА КОРТА И ФАКТОРЫ СМЕТЫ */}
        <section className="container-page pb-16 md:pb-24" aria-labelledby="price-factors-title">
          <SurfaceCard tone="white" interactive={false} className="p-6 md:p-12 lg:p-14 border border-ink/5">
            <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <Typography role="eyebrow" tone="muted">
                  {typograph('Честное ценообразование')}
                </Typography>
                <Typography as="h2" id="price-factors-title" role="section" className="mt-3 text-ink">
                  {typograph('Из чего складывается реальная стоимость падел-корта')}
                </Typography>
                <Typography role="body" tone="subtle" className="mt-5 leading-relaxed">
                  {typograph(
                    'Универсальная цена «корт от 2 млн рублей» не отражает реальную стоимость запуска площадки. Мы формируем прозрачную смету под конкретный объект: тип площадки (indoor или outdoor), класс ветровой нагрузки, состояние фундамента, комплектацию света и логистику до вашего города.'
                  )}
                </Typography>
                <div className="mt-8">
                  <ButtonLink href="#cta-section" variant="dark" size="md" icon={<ArrowRight size={16} />}>
                    {typograph('Запросить детальный сметный расчёт')}
                  </ButtonLink>
                </div>
              </div>

              <ul className="grid gap-2.5 sm:grid-cols-2" aria-label="Факторы стоимости падел-корта">
                {priceFactors.map((factor) => (
                  <li
                    key={factor.label}
                    className="se-2 bg-surface-subtle p-4 border border-ink/5 flex flex-col justify-center"
                  >
                    <Typography role="body-small" className="font-semibold text-ink">
                      {typograph(factor.label)}
                    </Typography>
                    <Typography role="caption" tone="muted" className="mt-0.5">
                      {typograph(factor.detail)}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          </SurfaceCard>
        </section>

        {/* 5. ИНФОГРАФИКА ТЕХНОЛОГИЙ JUBO (ФОНОВОЕ ФОТО + СТРОГО МОНОХРОМ БЕЗ АКЦЕНТНЫХ ЦВЕТОВ) */}
        <section className="relative isolate overflow-hidden py-16 text-white md:py-24 bg-ink" aria-labelledby="tech-title">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://jubopadel.com/wp-content/uploads/2026/05/showroom-aereal-1536x848.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-ink/90 backdrop-blur-xs" />

          <div className="container-page relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_.8fr] lg:items-end">
              <div>
                <Typography role="eyebrow" tone="inverse-subtle">
                  {typograph('Инженерные инновации')}
                </Typography>
                <Typography as="h2" id="tech-title" role="section" tone="inverse" className="mt-3">
                  {typograph('Технологии и стандарты JUBO')}
                </Typography>
              </div>
              <Typography role="body" tone="inverse-subtle" className="lg:justify-self-end">
                {typograph(
                  'Европейский стандарт безопасности и долговечности. Каждая деталь спроектирована с расчётом на многолетнюю клубную эксплуатацию без коррозии, деформаций и люфтов.'
                )}
              </Typography>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {technologies.map((tech, idx) => (
                <Reveal key={tech.title} delay={idx * 0.07} className="h-full">
                  <div className="se-3 bg-white/[0.07] p-6 backdrop-blur-md border border-white/10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="se-2 flex h-11 w-11 items-center justify-center bg-white/10 text-white">
                          <tech.icon size={22} />
                        </span>
                        <Badge tone="glass" className="text-white/70">
                          {tech.tag}
                        </Badge>
                      </div>
                      <Typography as="h3" role="title-card" tone="inverse" className="mt-6 font-semibold">
                        {typograph(tech.title)}
                      </Typography>
                      <Typography role="body-small" tone="inverse-subtle" className="mt-3 leading-relaxed">
                        {typograph(tech.text)}
                      </Typography>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ГАЛЕРЕЯ КЛУБНЫХ РЕАЛИЗАЦИЙ JUBO */}
        <section className="container-page py-16 md:py-24" aria-labelledby="gallery-title">
          <div className="mb-10 max-w-[760px]">
            <Typography role="eyebrow" tone="muted">
              {typograph('Реализованные комплексы')}
            </Typography>
            <Typography as="h2" id="gallery-title" role="section" className="mt-3 text-ink">
              {typograph('Как корты JUBO выглядят в реальных клубных проектах')}
            </Typography>
            <Typography role="body" tone="subtle" className="mt-4">
              {typograph(
                'Панорамные светопрозрачные конструкции без лишних стоек визуально расширяют клубное пространство и обеспечивают высокую зрелищность матчей для гостей и зрителей.'
              )}
            </Typography>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {galleryImages.map((image, idx) => (
              <Reveal key={image.src} delay={idx * 0.1}>
                <SurfaceCard tone="white" interactive={false} className="p-3 overflow-hidden border border-ink/5">
                  <figure className="group">
                    <div className="se-3 aspect-[16/9] overflow-hidden bg-control">
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
                    <figcaption className="mt-3 px-1 flex items-center justify-between">
                      <Typography role="caption" tone="muted">
                        {typograph(image.caption)}
                      </Typography>
                      <Typography role="micro" tone="subtle">
                        Фото: JUBO Padel
                      </Typography>
                    </figcaption>
                  </figure>
                </SurfaceCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. МОДЕЛЬНЫЙ РЯД КОРТОВ JUBO: СЕКЦИЯ BG-PAGE, ТАБЫ НА БЕЛОМ SURFACE-CARD */}
        <section id="models-section" className="bg-page py-16 md:py-24 border-t border-ink/10" aria-labelledby="models-title">
          <div className="container-page">
            <div className="grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
              <div>
                <Typography role="eyebrow" tone="muted">
                  {typograph('Линейка кортов JUBO')}
                </Typography>
                <Typography as="h2" id="models-title" role="section" className="mt-3 max-w-[720px] text-ink">
                  {typograph('Выберите модель корта под условия вашей площадки')}
                </Typography>
              </div>
              <Typography role="body" tone="subtle" className="max-w-[620px] lg:justify-self-end">
                {typograph(
                  'Сравните технические параметры, тип остекления, ветровую стойкость и конструктивные особенности каждой модели в единой таблице характеристик.'
                )}
              </Typography>
            </div>

            <div className="mt-10">
              <CourtModelTabs onSelectModel={(modelId) => setActiveModelForForm(modelId)} />
            </div>
          </div>
        </section>

        {/* 7. CTA БЛОК: ШВЕЙЦАРСКИЙ ЛЕВООРИЕНТИРОВАННЫЙ СТИЛЬ С ЛАКОНИЧНЫМИ КНОПКАМИ */}
        <section id="cta-section" className="bg-page py-16 md:py-24 border-t border-ink/10" aria-labelledby="cta-heading">
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
              {/* Левая колонка: швейцарская типографика, лаконичные кнопки, гарантии */}
              <div>
                <Typography role="eyebrow" tone="muted">
                  {typograph('Связь с официальным дистрибьютором')}
                </Typography>
                <Typography as="h2" id="cta-heading" role="section" className="mt-3 text-ink">
                  {typograph('Рассчитать проект падел-корта под ключ')}
                </Typography>
                <Typography role="body" tone="subtle" className="mt-4 leading-relaxed">
                  {typograph(
                    'Напишите нам напрямую в удобный мессенджер для быстрой консультации или отправьте параметры площадки через форму — инженер UNLIM подготовит подробную заводскую смету JUBO.'
                  )}
                </Typography>

                {/* Лаконичные швейцарские кнопки мессенджеров */}
                <div className="mt-8 flex flex-wrap items-center gap-2.5">
                  <ButtonLink
                    href="https://t.me/unlim_padel"
                    target="_blank"
                    rel="noreferrer"
                    variant="neutral"
                    size="md"
                    icon={<Send size={15} />}
                    iconPosition="left"
                    onClick={() => {
                      trackAnalytics({ name: 'direct_messenger_click', actionKind: 'telegram', objectType: 'lead' })
                    }}
                  >
                    Telegram
                  </ButtonLink>

                  <ButtonLink
                    href="https://vk.com/unlim_padel"
                    target="_blank"
                    rel="noreferrer"
                    variant="neutral"
                    size="md"
                    icon={<MessageCircle size={15} />}
                    iconPosition="left"
                    onClick={() => {
                      trackAnalytics({ name: 'direct_messenger_click', actionKind: 'vk', objectType: 'lead' })
                    }}
                  >
                    ВКонтакте
                  </ButtonLink>

                  <Button
                    variant="neutral"
                    size="md"
                    icon={<Phone size={15} />}
                    iconPosition="left"
                    onClick={() => {
                      trackAnalytics({ name: 'direct_call_click', actionKind: 'phone', objectType: 'lead' })
                      requestContact('phone')
                    }}
                  >
                    По телефону
                  </Button>
                </div>

                {/* Гарантии и факты */}
                <div className="mt-10 space-y-3.5 border-t border-ink/10 pt-8">
                  <div className="flex items-center gap-3">
                    <span className="se-1 flex h-6 w-6 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check size={14} strokeWidth={2.8} />
                    </span>
                    <Typography role="body-small" tone="subtle">
                      {typograph('Прямой контракт с роботизированным заводом JUBO в Валенсии')}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="se-1 flex h-6 w-6 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check size={14} strokeWidth={2.8} />
                    </span>
                    <Typography role="body-small" tone="subtle">
                      {typograph('Прозрачная смета с фиксированной стоимостью оборудования и шеф-монтажа')}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="se-1 flex h-6 w-6 shrink-0 items-center justify-center bg-lime text-lime-ink">
                      <Check size={14} strokeWidth={2.8} />
                    </span>
                    <Typography role="body-small" tone="subtle">
                      {typograph('Сертифицированный монтаж с гарантией производителя по всей территории РФ')}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Правая колонка: форма расчёта */}
              <div>
                <InlineLeadCalculatorForm site={site} initialModel={activeModelForForm} />
              </div>
            </div>
          </div>
        </section>
      </article>
    </SiteFrame>
  )
}

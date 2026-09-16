import type { ActionDTO, SiteDTO } from '@unlim/content-contract'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  Factory,
  Layers3,
  Phone,
  Ruler,
  Settings2,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react'
import React, { useState } from 'react'

import { ContentAction } from '../components/ContentAction'
import { SiteFrame } from '../components/SiteFrame'
import { Tabs } from '../components/ui/Tabs'
import { PageHeader } from '../thematic/PageHeader'
import { cn } from '../utils/cn'

const sourcePage = '/padel-courts'
const consultationAction: ActionDTO = {
  mode: 'lead-form',
  leadType: 'consultation',
  label: 'Получить расчёт',
}
const phoneAction: ActionDTO = { mode: 'phone', label: 'Позвонить' }

const heroImage = {
  src: 'https://jubopadel.com/wp-content/uploads/2025/01/JGC06036-2048x1365.jpg',
  alt: 'Панорамные падел-корты JUBO в интерьере спортивного клуба',
  width: 2048,
  height: 1365,
}

const galleryImages = [
  {
    src: 'https://jubopadel.com/wp-content/uploads/2026/05/showroom-aereal-1536x848.jpg',
    alt: 'Комплекс открытых и крытых падел-кортов JUBO, вид сверху',
    width: 1536,
    height: 848,
  },
  {
    src: 'https://jubopadel.com/wp-content/uploads/2023/09/header-18-1024x569.png',
    alt: 'Линия падел-кортов JUBO в крытом клубе',
    width: 1024,
    height: 569,
  },
] as const

const projectSteps = [
  {
    icon: ClipboardCheck,
    title: 'Задача и площадка',
    text: 'Уточняем формат проекта, количество кортов, размещение внутри или снаружи, готовность основания и условия эксплуатации.',
  },
  {
    icon: Ruler,
    title: 'Подбор конфигурации',
    text: 'Сопоставляем требования с моделями JUBO, вариантами конструкции, покрытия, освещения, доступов и фирменного оформления.',
  },
  {
    icon: Settings2,
    title: 'Спецификация и смета',
    text: 'Фиксируем согласованную комплектацию. Стоимость рассчитывается под объект — без неподтверждённых усреднённых обещаний.',
  },
  {
    icon: Truck,
    title: 'Поставка',
    text: 'Согласовываем состав поставки, логистику и требования к приёмке компонентов на площадке.',
  },
  {
    icon: Wrench,
    title: 'Монтаж',
    text: 'Команда UNLIM выполняет монтаж корта и проходит с заказчиком итоговую проверку согласованной конфигурации.',
  },
] as const

const priceFactors = [
  'модель и версия конструкции',
  'количество кортов',
  'indoor- или outdoor-размещение',
  'состояние основания и доступность площадки',
  'покрытие, свет и дополнительное оснащение',
  'цвета, брендинг и другие опции персонализации',
  'маршрут поставки и условия монтажа',
] as const

const technologies = [
  {
    icon: Layers3,
    title: 'Закалённое стекло 12 мм',
    text: 'В Super Panoramic используется закалённое стекло с полированными кромками. Стекло и сетка образуют переход без выступающих кромок.',
  },
  {
    icon: ShieldCheck,
    title: 'Защита металла',
    text: 'Стальная конструкция имеет покрытие Magnelis®. Для Super Panoramic заявлена защита C4 и опция C5 для более агрессивной среды.',
  },
  {
    icon: Factory,
    title: 'Точное производство',
    text: 'Элементы изготавливаются с применением лазерной и роботизированной обработки; сборочные компоненты выполнены из нержавеющей стали.',
  },
  {
    icon: Sparkles,
    title: 'Открытая панорама',
    text: 'У Super Panoramic нет угловых стоек. Усиленная конструкция сохраняет обзор для игроков и зрителей.',
  },
  {
    icon: BadgeCheck,
    title: 'Сертифицированная конструкция',
    text: 'JUBO указывает сертификацию UNE 147201:2024 и расчёт по критериям Eurocode, включая подтверждённую работу при ветровой нагрузке.',
  },
  {
    icon: Check,
    title: 'Детали игровой зоны',
    text: 'Электросварная сетка, открытые доступы и скруглённые стойки сетки рассчитаны на аккуратную и безопасную организацию пространства.',
  },
] as const

const models = [
  {
    id: 'infinity',
    name: 'Infinity',
    eyebrow: 'Премиальная панорама',
    title: 'Выразительная конструкция для флагманского проекта',
    description: 'Патентованная панорамная система JUBO без металлических профилей в углах. Разработана для профессиональных объектов, где важны обзор, визуальная идентичность и гибкая персонализация.',
    points: ['панорамная конструкция', 'варианты для разных условий размещения', 'настройка цвета, света, покрытия и брендинга'],
    image: { src: 'https://jubopadel.com/wp-content/uploads/2023/07/fondoAzul.377.png', alt: 'Панорамный падел-корт JUBO Infinity', width: 1648, height: 822 },
  },
  {
    id: 'super-panoramic',
    name: 'Super Panoramic',
    eyebrow: 'Минимум визуальных барьеров',
    title: 'Открытый обзор без угловых стоек',
    description: 'Сертифицированный корт с усиленным периметром, разработанный для профессиональных падел-проектов. Доступен в стационарной и переносной конфигурации.',
    points: ['закалённое стекло 12 мм', 'покрытие Magnelis® и защита C4 / опционально C5', 'две версии конструкции'],
    image: { src: 'https://jubopadel.com/wp-content/uploads/2023/08/super_panoraic_inicio.png', alt: 'Падел-корт JUBO Super Panoramic без угловых стоек', width: 1648, height: 822 },
  },
  {
    id: 'panoramic',
    name: 'Panoramic',
    eyebrow: 'Панорамный стандарт',
    title: 'Широкий обзор и усиленный периметр',
    description: 'Модель без внутренних металлических стоек в зоне панорамного остекления. Подходит для клубов и других профессиональных объектов, которым нужен открытый вид на игру.',
    points: ['панорамное остекление', 'усиленная конструкция', 'стационарная и переносная конфигурации'],
    image: { src: 'https://jubopadel.com/wp-content/uploads/2023/08/panoramic_presentation.png', alt: 'Панорамный падел-корт JUBO Panoramic', width: 1648, height: 822 },
  },
  {
    id: 'vision-pro',
    name: 'Vision Pro',
    eyebrow: 'Жёсткая конструкция',
    title: 'Для интенсивной клубной эксплуатации',
    description: 'Обновлённая версия Vision с усиленными стойками, сеткой и опорными элементами. Разработана для объектов, где приоритетны стабильность конструкции и долговечность.',
    points: ['усиленная жёсткая система', 'стекло вровень с сеткой', 'защита C4 / опционально C5'],
    image: { src: 'https://jubopadel.com/wp-content/uploads/2023/08/presentation_vision.png', alt: 'Падел-корт JUBO Vision Pro с усиленной конструкцией', width: 1648, height: 822 },
  },
  {
    id: 'infinity-tournament',
    name: 'Infinity Tournament',
    eyebrow: 'Временные площадки',
    title: 'Переносная система для турниров и событий',
    description: 'Pop-up конфигурация семейства Infinity, разработанная для монтажа и демонтажа без постоянного крепления к основанию. Подходит для турниров, выставок и временных локаций.',
    points: ['переносной базовый комплект', 'без постоянного анкерования', 'персонализация под событие и партнёров'],
    image: { src: 'https://jubopadel.com/wp-content/uploads/2024/07/destacada.png', alt: 'Турнирный падел-корт JUBO Infinity Tournament', width: 1580, height: 736 },
  },
  {
    id: 'infinity-xtrem',
    name: 'Infinity Xtrem',
    eyebrow: 'Открытые ветровые зоны',
    title: 'Усиленная Infinity для сложных условий',
    description: 'Высокопрочная версия панорамной системы Infinity для проектов с повышенными ветровыми нагрузками — например, на открытых, прибрежных или экспонированных площадках.',
    points: ['усиленный панорамный периметр', 'динамическое распределение нагрузок', 'подбор по инженерным условиям объекта'],
    image: { src: 'https://jubopadel.com/wp-content/uploads/2025/05/3-4.png', alt: 'Усиленный панорамный падел-корт JUBO Infinity Xtrem', width: 1920, height: 1080 },
  },
] as const

type ModelId = (typeof models)[number]['id']

export function CourtModelTabs() {
  const [activeModel, setActiveModel] = useState<ModelId>(models[0].id)

  return <div>
    <Tabs
      aria-label="Модели кортов JUBO"
      className="no-scrollbar w-full"
      layoutId="court-model-tabs"
      tabs={models.map((model) => ({ id: model.id, label: model.name, panelId: `court-model-panel-${model.id}` }))}
      value={activeModel}
      onChange={setActiveModel}
    />

    {models.map((model) => <div
      key={model.id}
      id={`court-model-panel-${model.id}`}
      role="tabpanel"
      aria-label={model.name}
      tabIndex={0}
      hidden={activeModel !== model.id}
      className="se-4 mt-5 bg-page p-6 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 md:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div className="se-3 aspect-video overflow-hidden bg-white">
          <img
            src={model.image.src}
            alt={model.image.alt}
            width={model.image.width}
            height={model.image.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <p className="type-eyebrow text-ink-muted">{model.eyebrow}</p>
          <h3 className="type-title-large mt-3 text-ink">{model.title}</h3>
          <p className="type-body mt-4 max-w-[720px] text-ink-soft">{model.description}</p>
          <ul className="mt-6 grid gap-3" aria-label={`Особенности ${model.name}`}>
            {model.points.map((point) => <li key={point} className="type-body-sm flex items-center gap-3 leading-snug text-ink-soft">
              <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-[#f1f1f1] text-ink"><Check aria-hidden="true" size={15} strokeWidth={2.4} /></span>
              <span>{point}</span>
            </li>)}
          </ul>
        </div>
      </div>
    </div>)}
  </div>
}

function ActionPair({ entity, inverse = false }: { entity: string; inverse?: boolean }) {
  return <div className="flex flex-col gap-3 sm:flex-row">
    <ContentAction
      action={consultationAction}
      sourcePage={sourcePage}
      sourceEntity={entity}
      size="lg"
      icon={<ArrowRight aria-hidden="true" size={18} />}
      className="w-full sm:w-auto"
    />
    <ContentAction
      action={phoneAction}
      sourcePage={sourcePage}
      sourceEntity={entity}
      variant={inverse ? 'neutral' : 'glass'}
      size="lg"
      icon={<Phone aria-hidden="true" size={18} />}
      iconPosition="left"
      className={cn('w-full sm:w-auto', inverse && '!bg-control !text-ink')}
    />
  </div>
}

export function PadelCourtsLanding({ site }: { site: SiteDTO }) {
  return <SiteFrame site={site}>
    <PageHeader
      page={{
        eyebrow: 'Официальные корты JUBO в России',
        title: 'Падел корт купить под ключ — цена, строительство, монтаж',
        intro: 'UNLIM — дистрибьютор JUBO в РФ. Подберём модель и комплектацию под вашу площадку, организуем поставку и выполним монтаж корта.',
        hero: { media: { url: heroImage.src, alt: heroImage.alt, width: heroImage.width, height: heroImage.height, mimeType: 'image/jpeg' }, grayscale: false },
      }}
      actions={<><ActionPair entity="Первый экран — корты JUBO" /><p className="type-caption mt-4 max-w-[560px] text-white/45">Итоговая цена зависит от модели, площадки, комплектации, логистики и состава монтажных работ.</p></>}
    />
    <article>
      <section className="container-page py-16 md:py-24" aria-labelledby="service-title">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="type-eyebrow text-ink-muted">Проект под ключ</p>
            <h2 id="service-title" className="type-section mt-3">Что входит в работу над кортом</h2>
            <p className="type-body mt-5 max-w-[540px] text-ink-soft">Состав проекта фиксируется до заказа. Так модель, опции, требования к площадке и монтажу остаются частью одной согласованной спецификации.</p>
          </div>
          <ol className="grid gap-3 md:grid-cols-2">
            {projectSteps.map((step, index) => <li key={step.title} className={cn('se-3 bg-white p-6', index === projectSteps.length - 1 && 'md:col-span-2')}>
              <div className="flex items-center justify-between gap-4">
                <span className="se-2 flex h-11 w-11 items-center justify-center bg-surface-muted text-ink-soft"><step.icon aria-hidden="true" size={20} /></span>
                <span className="type-caption text-ink-muted">0{index + 1}</span>
              </div>
              <h3 className="type-title-card mt-6">{step.title}</h3>
              <p className="type-body-sm mt-3 text-ink-soft">{step.text}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="container-page pb-16 md:pb-24" aria-labelledby="price-title">
        <div className="se-5 overflow-hidden bg-white p-6 md:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <p className="type-eyebrow text-ink-muted">Цена корта</p>
              <h2 id="price-title" className="type-section mt-3">Расчёт начинается с параметров проекта</h2>
              <p className="type-body mt-5 max-w-[600px] text-ink-soft">Универсальная цена «за корт» не показывает реальную стоимость готового объекта. Мы рассчитываем предложение по выбранной модели и фактическим условиям площадки.</p>
              <div className="mt-7"><ContentAction action={consultationAction} sourcePage={sourcePage} sourceEntity="Факторы цены" variant="dark" size="lg" icon={<ArrowRight aria-hidden="true" size={18} />} /></div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2" aria-label="Факторы стоимости падел-корта">
              {priceFactors.map((factor) => <li key={factor} className="se-2 flex items-center gap-3 bg-surface-subtle p-4 type-body-sm leading-snug text-ink-soft">
                <span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-[#f1f1f1] text-ink"><Check aria-hidden="true" size={15} strokeWidth={2.4} /></span>
                <span>{factor}</span>
              </li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="mesh-dark py-16 text-white md:py-24" aria-labelledby="technology-title">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="type-eyebrow text-white/45">Технологии JUBO</p>
              <h2 id="technology-title" className="type-section mt-3 text-white">Super Panoramic: конструкция и характеристики</h2>
            </div>
            <p className="type-body max-w-[680px] text-white/60 lg:justify-self-end">Пример технического подхода JUBO. Точная спецификация и применимость опций подтверждаются для выбранной модели и условий конкретной площадки.</p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((item) => <div key={item.title} className="se-3 bg-white/8 p-6">
              <span className="se-2 flex h-11 w-11 items-center justify-center bg-white/10 text-white/70"><item.icon aria-hidden="true" size={20} /></span>
              <h3 className="type-title-compact mt-6 text-white">{item.title}</h3>
              <p className="type-body-sm mt-3 text-white/60">{item.text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-24" aria-labelledby="gallery-title">
        <div className="mb-9 max-w-[760px]">
          <p className="type-eyebrow text-ink-muted">Визуальный ориентир</p>
          <h2 id="gallery-title" className="type-section mt-3">Как корты работают в клубном проекте</h2>
          <p className="type-body mt-4 text-ink-soft">Панорамные конструкции сохраняют обзор на игру и помогают объединить корты, зрительские зоны и клубную инфраструктуру в одном пространстве.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {galleryImages.map((image) => <figure key={image.src} className="group">
            <div className="se-4 aspect-[16/9] overflow-hidden bg-control">
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
            </div>
            <figcaption className="type-caption mt-3 text-ink-muted">Фото: JUBO Padel</figcaption>
          </figure>)}
        </div>
      </section>

      <section className="bg-white py-16 md:py-24" aria-labelledby="models-title">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="type-eyebrow text-ink-muted">Модельный ряд</p>
              <h2 id="models-title" className="type-section mt-3 max-w-[720px] text-ink">Выберите отправную точку для проекта</h2>
            </div>
            <p className="type-body max-w-[620px] text-ink-soft lg:justify-self-end">Финальный выбор зависит от площадки, ветровых условий, режима эксплуатации и требований к внешнему виду.</p>
          </div>
          <div className="mt-9"><CourtModelTabs /></div>
          <div className="mt-8 flex flex-col justify-between gap-6 border-t border-ink/10 pt-8 lg:flex-row lg:items-center">
            <p className="type-body max-w-[680px] text-ink-soft">Расскажите о площадке — подготовим вопросы для расчёта и предложим подходящую конфигурацию JUBO.</p>
            <ActionPair entity="Модельный ряд JUBO" inverse />
          </div>
        </div>
      </section>
    </article>
  </SiteFrame>
}

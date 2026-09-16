'use client'

import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { AdminPageFrame } from './AdminPageFrame'
import { AdminSegmentedControl } from './AdminSegmentedControl'
import { readAnalyticsReport, requestAnalyticsReport, type AnalyticsReportQuery } from './analyticsReportCache'
import './analytics.scss'

type KPI = { value: number; comparison: number; changePercent: number | null }
type Group = { name: string; browsers: number; sessions: number; targetSessions: number; actions: number; leads: number; activeMs: number }
export type Report = {
  kpis: Record<'browsers' | 'sessions' | 'targetSessions' | 'actions' | 'leads', KPI>
  trend: Array<{ date: string; browsers: number; sessions: number; actions: number; leads: number }>
  funnel: Array<{ name: string; sessions: number }>
  topPages: Group[]
  audience: { visitorType: Group[]; device: Group[]; language: Group[]; averageActiveSeconds: number; sessionsPerBrowser: number }
  interactions: Record<'forms' | 'coaches' | 'tournaments' | 'articles' | 'contacts', Group[]>
  sources: { channels: Group[]; campaigns: Group[]; referrers: Group[]; firstChannels: Group[]; firstCampaigns: Group[] }
  health: { status: 'ok' | 'empty'; lastUpdated: string | null; collectorError: null }
  definitions: Record<string, string>
}

const DAY = 86_400_000
const tabs = ['Обзор', 'Аудитория', 'Взаимодействия', 'Источники'] as const
const interactionLabels = { forms: 'Формы', coaches: 'Тренеры', tournaments: 'Турниры', articles: 'Статьи', contacts: 'Контакты' } as const
const interactionKeys = Object.keys(interactionLabels) as Array<keyof typeof interactionLabels>
const groupLabels: Record<string, string> = {
  new: 'Новые', returning: 'Вернувшиеся', desktop: 'Компьютер', mobile: 'Телефон', tablet: 'Планшет',
  ru: 'Русский', en: 'Английский', direct: 'Прямой', referral: 'Переходы', campaign: 'Кампании', social: 'Соцсети',
  'paid-search': 'Платный поиск', gift: 'Подарочный сертификат', trial: 'Пробная тренировка', booking: 'Бронирование',
  phone: 'Телефон', email: 'Email', telegram: 'Telegram', vk: 'VK',
}
function moscowYesterday(): string { return new Date(Date.now() + 3 * 60 * 60_000 - DAY).toISOString().slice(0, 10) }
function range(days: number) { const to = moscowYesterday(); return { from: new Date(Date.parse(`${to}T00:00:00Z`) - (days - 1) * DAY).toISOString().slice(0, 10), to } }
function rangeDays(period: { from: string; to: string }): number { return Math.round((Date.parse(`${period.to}T00:00:00Z`) - Date.parse(`${period.from}T00:00:00Z`)) / DAY) + 1 }
function number(value: number): string { return new Intl.NumberFormat('ru-RU').format(value) }
function delta(kpi: KPI): string { return kpi.changePercent === null ? 'нет базы для %' : `${kpi.changePercent > 0 ? '+' : ''}${kpi.changePercent}%` }
function group(name: string, browsers: number, sessions: number, actions: number, leads = 0): Group {
  return { name, browsers, sessions, targetSessions: Math.round(sessions * .18), actions, leads, activeMs: sessions * 64_000 }
}

function demoReport(period: { from: string; to: string }): Report {
  const days = Math.max(1, rangeDays(period))
  const trend = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.parse(`${period.from}T00:00:00Z`) + index * DAY).toISOString().slice(0, 10)
    const browsers = 42 + (index * 17 % 31) + Math.round(Math.sin(index / 2) * 8)
    return { date, browsers, sessions: Math.round(browsers * 1.32), actions: Math.round(browsers * .74), leads: index % 4 === 0 ? 2 : 1 }
  })
  const browsers = trend.reduce((sum, point) => sum + point.browsers, 0)
  const sessions = trend.reduce((sum, point) => sum + point.sessions, 0)
  const actions = trend.reduce((sum, point) => sum + point.actions, 0)
  const leads = trend.reduce((sum, point) => sum + point.leads, 0)
  const previous = Math.round(browsers * .91)
  const kpi = (value: number, comparison = Math.max(1, Math.round(value * .91))): KPI => ({ value, comparison, changePercent: Math.round((value - comparison) / comparison * 1000) / 10 })
  return {
    kpis: { browsers: kpi(browsers, previous), sessions: kpi(sessions), targetSessions: kpi(Math.round(sessions * .18)), actions: kpi(actions), leads: kpi(leads) },
    trend,
    funnel: [
      { name: 'Просмотр формы', sessions: Math.round(sessions * .3) },
      { name: 'Начало формы', sessions: Math.round(sessions * .18) },
      { name: 'Попытка отправки', sessions: Math.round(sessions * .08) },
      { name: 'Сохранённое обращение', sessions: leads },
    ],
    topPages: [group('/', 680, 892, 410, 12), group('/prices', 314, 386, 209, 9), group('/training', 247, 301, 176, 5), group('/tournaments', 181, 224, 118, 3)],
    audience: {
      visitorType: [group('Новые', 701, 762, 384, 14), group('Вернувшиеся', 296, 451, 276, 15)],
      device: [group('Телефон', 648, 792, 438, 20), group('Компьютер', 302, 371, 202, 8), group('Планшет', 47, 50, 20, 1)],
      language: [group('Русский', 934, 1_136, 642, 28), group('Английский', 63, 77, 18, 1)],
      averageActiveSeconds: 74,
      sessionsPerBrowser: 1.22,
    },
    interactions: {
      forms: [group('Пробная тренировка', 128, 146, 93, 17), group('Подарочный сертификат', 72, 81, 44, 8)],
      coaches: [group('Анна Коваль', 94, 112, 67), group('Артём Волков', 81, 96, 58)],
      tournaments: [group('Riga Open', 104, 121, 76), group('Weekend Cup', 63, 71, 39)],
      articles: [group('Как выбрать ракетку', 89, 102, 48), group('Правила падела', 71, 83, 37)],
      contacts: [group('Телефон', 84, 91, 91, 7), group('Telegram', 42, 46, 46, 3)],
    },
    sources: {
      channels: [group('Прямой', 408, 496, 267, 11), group('Поиск', 291, 354, 198, 9), group('Соцсети', 184, 226, 126, 6), group('Переходы', 114, 137, 71, 3)],
      campaigns: [group('autumn-open', 112, 139, 81, 5), group('trial-training', 83, 97, 54, 4)],
      referrers: [group('google.com', 244, 296, 169, 8), group('vk.com', 139, 164, 91, 4)],
      firstChannels: [group('Поиск', 326, 401, 214, 10), group('Прямой', 319, 389, 207, 9), group('Соцсети', 211, 254, 141, 7)],
      firstCampaigns: [group('trial-training', 96, 118, 66, 5), group('autumn-open', 87, 104, 59, 4)],
    },
    health: { status: 'empty', lastUpdated: null, collectorError: null },
    definitions: { browsers: 'Демо: уникальные браузеры.', sessions: 'Демо: сессии.', leads: 'Демо: сохранённые обращения.', targetSessions: 'Демо: сессии с целевым действием.' },
  }
}

function Metric({ label, metric, help }: { label: string; metric: KPI; help?: string }) {
  return <article className="analytics-card" title={help}><span>{label}</span><strong>{number(metric.value)}</strong><small>{delta(metric)} · было {number(metric.comparison)}</small></article>
}
function GroupTable({ rows, first = 'Срез' }: { rows: Group[]; first?: string }) {
  if (!rows.length) return <p className="analytics-empty">За этот период данных нет.</p>
  return <div className="analytics-table-wrap"><table><thead><tr><th>{first}</th><th>Браузеры</th><th>Сессии</th><th>Действия</th><th>Обращения</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name}><td>{groupLabels[row.name] ?? row.name}</td><td>{number(row.browsers)}</td><td>{number(row.sessions)}</td><td>{number(row.actions)}</td><td>{number(row.leads)}</td></tr>)}</tbody></table></div>
}

const shortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const fullDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

function formatDate(value: string, format: Intl.DateTimeFormat): string {
  return format.format(new Date(`${value}T00:00:00Z`)).replace('.', '')
}

function trendChange(points: Report['trend'], index: number): string {
  if (index === 0) return 'Первая точка периода'
  const previous = points[index - 1].browsers
  const difference = points[index].browsers - previous
  if (difference === 0) return 'Без изменений к предыдущему дню'
  if (previous === 0) return `+${number(difference)} к предыдущему дню`
  const percent = Math.round(Math.abs(difference / previous) * 100)
  return `${difference > 0 ? '+' : '−'}${number(Math.abs(difference))} · ${difference > 0 ? '+' : '−'}${percent}% к предыдущему дню`
}

function niceScale(maximum: number): { maximum: number; ticks: number[] } {
  const roughStep = Math.max(1, maximum / 4)
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / magnitude
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
  const scaleMaximum = Math.max(step, Math.ceil(maximum / step) * step)
  return { maximum: scaleMaximum, ticks: Array.from({ length: Math.round(scaleMaximum / step) + 1 }, (_, index) => index * step) }
}

function Trend({ points }: { points: Report['trend'] }) {
  const titleId = useId()
  const descriptionId = useId()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  useEffect(() => setActiveIndex(null), [points])
  const width = 760
  const height = 284
  const plot = { top: 18, right: 18, bottom: 44, left: 58 }
  const plotWidth = width - plot.left - plot.right
  const plotHeight = height - plot.top - plot.bottom
  const { maximum, ticks } = niceScale(Math.max(1, ...points.map((point) => point.browsers)))

  if (!points.length) return <p className="analytics-empty">За этот период данных для графика нет.</p>

  const x = (index: number) => points.length === 1 ? plot.left + plotWidth / 2 : plot.left + index * plotWidth / (points.length - 1)
  const y = (value: number) => plot.top + (1 - value / maximum) * plotHeight
  const coordinates = points.map((point, index) => ({ x: x(index), y: y(point.browsers) }))
  const line = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${coordinates.at(-1)?.x} ${plot.top + plotHeight} L ${coordinates[0].x} ${plot.top + plotHeight} Z`
  const labelCount = Math.min(6, points.length)
  const dateIndexes = labelCount === 1
    ? [0]
    : Array.from(new Set(Array.from({ length: labelCount }, (_, index) => Math.round(index * (points.length - 1) / (labelCount - 1)))))
  const activePoint = activeIndex === null ? null : points[activeIndex]
  const activeCoordinate = activeIndex === null ? null : coordinates[activeIndex]
  const average = Math.round(points.reduce((sum, point) => sum + point.browsers, 0) / points.length)
  const peak = Math.max(...points.map((point) => point.browsers))

  const selectFromPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = (event.clientX - bounds.left) / bounds.width * width
    const ratio = Math.max(0, Math.min(1, (pointerX - plot.left) / plotWidth))
    setActiveIndex(points.length === 1 ? 0 : Math.round(ratio * (points.length - 1)))
  }

  const moveSelection = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'Home') return setActiveIndex(0)
    if (event.key === 'End') return setActiveIndex(points.length - 1)
    const current = activeIndex ?? points.length - 1
    setActiveIndex(Math.max(0, Math.min(points.length - 1, current + (event.key === 'ArrowLeft' ? -1 : 1))))
  }

  const tooltipWidth = 206
  const tooltipHeight = 62
  const tooltipX = activeCoordinate ? Math.max(plot.left, Math.min(width - tooltipWidth - plot.right, activeCoordinate.x - tooltipWidth / 2)) : 0
  const tooltipY = activeCoordinate ? (activeCoordinate.y > plot.top + 84 ? activeCoordinate.y - tooltipHeight - 14 : activeCoordinate.y + 14) : 0

  return <div className="analytics-chart">
    <div className="analytics-chart-summary" aria-hidden="true"><span>В среднем <strong>{number(average)}</strong> в день</span><span>Пик <strong>{number(peak)}</strong></span></div>
    <div
      className="analytics-chart-interactive"
      role="group"
      tabIndex={0}
      onBlur={() => setActiveIndex(null)}
      onFocus={() => setActiveIndex((current) => current ?? points.length - 1)}
      onKeyDown={moveSelection}
      aria-label="Интерактивный график уникальных браузеров. Используйте стрелки влево и вправо для просмотра значений по дням."
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        onPointerDown={selectFromPointer}
        onPointerMove={selectFromPointer}
        onPointerLeave={(event) => { if (event.pointerType !== 'touch') setActiveIndex(null) }}
      >
        <title id={titleId}>Уникальные браузеры по дням</title>
        <desc id={descriptionId}>Значения от {formatDate(points[0].date, fullDate)} до {formatDate(points.at(-1)!.date, fullDate)}. Среднее {number(average)} в день, максимум {number(peak)}.</desc>
        <g className="analytics-chart-grid">
          {[...ticks].reverse().map((tick) => <g key={tick}><line x1={plot.left} x2={width - plot.right} y1={y(tick)} y2={y(tick)} /><text x={plot.left - 10} y={y(tick)}>{number(tick)}</text></g>)}
        </g>
        <g className="analytics-chart-dates">{dateIndexes.map((index) => <text key={points[index].date} x={x(index)} y={height - 13}>{formatDate(points[index].date, shortDate)}</text>)}</g>
        <path className="analytics-chart-area" d={area} />
        <path className="analytics-chart-line" d={line} />
        <g className="analytics-chart-points">{coordinates.map((coordinate, index) => <circle key={points[index].date} className={activeIndex === index ? 'active' : ''} cx={coordinate.x} cy={coordinate.y} r={activeIndex === index ? 5 : 2.5} />)}</g>
        {activePoint && activeCoordinate && <g className="analytics-chart-tooltip" aria-hidden="true">
          <line x1={activeCoordinate.x} x2={activeCoordinate.x} y1={plot.top} y2={plot.top + plotHeight} />
          <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx="6" />
          <text x={tooltipX + 12} y={tooltipY + 20}>{formatDate(activePoint.date, fullDate)}</text>
          <text className="analytics-chart-tooltip-value" x={tooltipX + 12} y={tooltipY + 40}>{number(activePoint.browsers)} браузеров</text>
          <text className="analytics-chart-tooltip-change" x={tooltipX + 12} y={tooltipY + 54}>{trendChange(points, activeIndex!)}</text>
        </g>}
      </svg>
      <span className="analytics-visually-hidden" aria-live="polite">{activePoint ? `${formatDate(activePoint.date, fullDate)}: ${number(activePoint.browsers)} браузеров. ${trendChange(points, activeIndex!)}.` : ''}</span>
    </div>
  </div>
}

export function AnalyticsView() {
  const initial = useMemo(() => range(30), [])
  const [period, setPeriod] = useState(initial); const [compare, setCompare] = useState('previous'); const [channel, setChannel] = useState('all'); const [device, setDevice] = useState('all')
  const [tab, setTab] = useState<(typeof tabs)[number]>('Обзор'); const [interaction, setInteraction] = useState<keyof typeof interactionLabels>('forms')
  const [report, setReport] = useState<Report | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [stale, setStale] = useState(false); const [maintenance, setMaintenance] = useState('')
  const load = useCallback(async () => {
    const query: AnalyticsReportQuery = { ...period, compare: compare as AnalyticsReportQuery['compare'], channel, device }
    const cached = readAnalyticsReport<Report>(query)
    setError('')
    if (cached) {
      setReport(cached.value)
      setLoading(false)
      setStale(!cached.fresh)
    } else {
      setLoading(true)
      setStale(false)
    }
    try {
      const value = await requestAnalyticsReport<Report>(query)
      setReport(value)
      setStale(false)
    } catch {
      if (!cached) setReport(null)
      setError('Сборщик или отчёт временно недоступен. Это не означает нулевые показатели.')
      if (!cached) setStale(false)
    } finally { setLoading(false) }
  }, [period, compare, channel, device])
  useEffect(() => { void load() }, [load])
  const optimize = async (mode: 'preview' | 'run') => {
    if (mode === 'run' && !confirm('Запустить безопасную агрегацию и очистку данных, срок хранения которых истёк?')) return
    setMaintenance('Выполняется…')
    try { const response = await fetch('/api/admin/analytics/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) }); const data = await response.json() as Record<string, unknown>; setMaintenance(response.ok ? JSON.stringify(data, null, 2) : 'Операция остановлена без удаления непроверенных данных.'); if (mode === 'run') void load() } catch { setMaintenance('Не удалось связаться с сервером.') }
  }
  const isEmpty = report?.health.status === 'empty'
  const isDemo = isEmpty && channel === 'all' && device === 'all'
  const visibleReport = useMemo(() => isDemo ? demoReport(period) : report, [isDemo, period, report])
  const selectedRange = [7, 30, 90].find((days) => {
    const candidate = range(days)
    return period.from === candidate.from && period.to === candidate.to
  })

  return <AdminPageFrame className="analytics-view">
    <header className="admin-page-title-band"><div><h1>Аналитика</h1><p>Собственные события сайта · часовой пояс Москва</p></div><div className={`analytics-health${isDemo ? ' demo' : ''}${stale ? ' stale' : ''}`}>{error ? 'Ошибка получения' : stale ? 'Данные обновляются' : isDemo ? 'Демо-данные' : isEmpty ? 'Данных нет' : 'Данные актуальны'}<small>{stale ? 'Показываем сохранённый отчёт' : isDemo ? 'Показываем пример до появления реальных событий' : isEmpty ? 'Измените период или фильтры' : visibleReport?.health.lastUpdated ? `Обновлено ${new Date(visibleReport.health.lastUpdated).toLocaleString('ru-RU')}` : 'Агрегация ещё не выполнялась'}</small></div></header>
    <AdminSegmentedControl className="analytics-tabs" ariaLabel="Разделы аналитики" items={tabs} onChange={setTab} value={tab} />
    <section className="analytics-controls" aria-label="Период и фильтры"><AdminSegmentedControl className="analytics-range" items={[7, 30, 90]} formatLabel={(days) => `${days} дней`} onChange={(days) => setPeriod(range(days))} value={selectedRange} /><label>С <input type="date" value={period.from} onChange={(event) => setPeriod((value) => ({ ...value, from: event.target.value }))} /></label><label>По <input type="date" value={period.to} onChange={(event) => setPeriod((value) => ({ ...value, to: event.target.value }))} /></label><label>Сравнить<select value={compare} onChange={(event) => setCompare(event.target.value)}><option value="previous">с прошлым периодом</option><option value="year">год к году</option></select></label><label>Канал<select value={channel} onChange={(event) => setChannel(event.target.value)}><option value="all">Все</option><option value="direct">Прямой</option><option value="referral">Переходы</option><option value="campaign">Кампании</option><option value="paid-search">Платный поиск</option><option value="social">Соцсети</option></select></label><label>Устройство<select value={device} onChange={(event) => setDevice(event.target.value)}><option value="all">Все</option><option value="desktop">Компьютер</option><option value="mobile">Телефон</option><option value="tablet">Планшет</option></select></label></section>
    {loading && <p className="analytics-empty">Загружаем отчёт…</p>}{error && <p role="alert" className="analytics-error">{error}</p>}
    {!loading && visibleReport && <>
      {tab === 'Обзор' && <><section className="analytics-kpis"><Metric label="Уникальные браузеры" metric={visibleReport.kpis.browsers} help={visibleReport.definitions.browsers} /><Metric label="Сессии" metric={visibleReport.kpis.sessions} help={visibleReport.definitions.sessions} /><Metric label="Сессии с целевым действием" metric={visibleReport.kpis.targetSessions} help={visibleReport.definitions.targetSessions} /><Metric label="Всего действий" metric={visibleReport.kpis.actions} /><Metric label="Сохранённые обращения" metric={visibleReport.kpis.leads} help={visibleReport.definitions.leads} /></section><section className="analytics-grid"><article className="analytics-panel"><h2>Посетители по дням</h2><Trend points={visibleReport.trend} /></article><article className="analytics-panel"><h2>Воронка</h2><ol className="analytics-funnel">{visibleReport.funnel.map((step) => <li key={step.name}><span>{step.name}</span><strong>{number(step.sessions)}</strong></li>)}</ol></article></section><section className="analytics-panel"><h2>Популярные страницы</h2><GroupTable rows={visibleReport.topPages} first="Страница" /></section></>}
      {tab === 'Аудитория' && <><section className="analytics-kpis"><article className="analytics-card"><span>Среднее активное время</span><strong>{number(visibleReport.audience.averageActiveSeconds)} сек</strong><small>Только видимая и недавно активная вкладка</small></article><article className="analytics-card"><span>Частота визитов</span><strong>{visibleReport.audience.sessionsPerBrowser}</strong><small>Сессий на распознанный браузер за период</small></article></section><section className="analytics-grid"><article className="analytics-panel"><h2>Новые и вернувшиеся</h2><GroupTable rows={visibleReport.audience.visitorType} /></article><article className="analytics-panel"><h2>Устройства</h2><GroupTable rows={visibleReport.audience.device} /></article></section><section className="analytics-panel"><h2>Язык аудитории</h2><GroupTable rows={visibleReport.audience.language} /></section><p className="analytics-note">География не показывается: MVP не сохраняет IP и пока не использует доверенный гео-провайдер.</p></>}
      {tab === 'Взаимодействия' && <><AdminSegmentedControl className="analytics-selector" items={interactionKeys} formatLabel={(key) => interactionLabels[key]} onChange={setInteraction} value={interaction} /><section className="analytics-panel"><h2>{interactionLabels[interaction]}</h2><GroupTable rows={visibleReport.interactions[interaction]} first="Объект" /></section></>}
      {tab === 'Источники' && <><section className="analytics-grid"><article className="analytics-panel"><h2>Текущий канал</h2><GroupTable rows={visibleReport.sources.channels} first="Канал" /></article><article className="analytics-panel"><h2>Первый рекламный канал</h2><GroupTable rows={visibleReport.sources.firstChannels} first="Канал" /></article></section><section className="analytics-grid"><article className="analytics-panel"><h2>Текущие UTM-кампании</h2><GroupTable rows={visibleReport.sources.campaigns} first="Кампания" /></article><article className="analytics-panel"><h2>Первые UTM-кампании</h2><GroupTable rows={visibleReport.sources.firstCampaigns} first="Кампания" /></article></section><section className="analytics-panel"><h2>Домены переходов</h2><GroupTable rows={visibleReport.sources.referrers} first="Домен" /></section></>}
    </>}
    <details className="analytics-maintenance"><summary>Хранение и обслуживание</summary><p>Автоматическая задача выполняет ту же безопасную процедуру. Ручной запуск нужен для проверки или внеплановой оптимизации.</p><div><button type="button" onClick={() => void optimize('preview')}>Показать объём</button><button type="button" onClick={() => void optimize('run')}>Оптимизировать старые данные</button></div>{maintenance && <pre>{maintenance}</pre>}</details>
  </AdminPageFrame>
}

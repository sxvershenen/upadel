import type { ServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import './dashboardOverview.scss'

type LeadRow = { createdAt?: string; email?: string | null; id: number | string; name?: string; type?: string }

const leadLabels: Record<string, string> = { gift: 'Подарочный сертификат', trial: 'Пробная тренировка', membership: 'Абонемент', consultation: 'Консультация', other: 'Другое' }

export async function DashboardOverview({ payload }: ServerProps) {
  const adminRoute = payload.config.routes.admin
  try {
    const [newLeads, publishedArticles, upcomingTournaments, mediaCount, recentLeads] = await Promise.all([
      payload.count({ collection: 'leads', overrideAccess: true, where: { status: { equals: 'new' } } }),
      payload.count({ collection: 'articles', overrideAccess: true, where: { _status: { equals: 'published' } } }),
      payload.count({ collection: 'tournaments', overrideAccess: true, where: { and: [{ _status: { equals: 'published' } }, { lifecycle: { in: ['upcoming', 'active'] } }] } }),
      payload.count({ collection: 'media', overrideAccess: true }),
      payload.find({ collection: 'leads', depth: 0, limit: 5, sort: '-createdAt', overrideAccess: true }),
    ])
    const leads = recentLeads.docs as unknown as LeadRow[]
    const link = (path: `/${string}`) => formatAdminURL({ adminRoute, path })
    return <section className="dashboard-overview" aria-labelledby="dashboard-overview-title">
      <div className="dashboard-overview__header"><div><p className="dashboard-overview__eyebrow">Рабочий стол</p><h1 id="dashboard-overview-title">Обзор клуба</h1><p className="dashboard-overview__description">Состояние контента и новые обращения в одном месте.</p></div><a className="dashboard-overview__primary" href={link('/analytics')}>Открыть аналитику</a></div>
      <div className="dashboard-overview__stats"><a href={link('/collections/leads?where[status][equals]=new')}><span>Новые обращения</span><strong>{newLeads.totalDocs}</strong><small>требуют ответа</small></a><a href={link('/collections/articles')}><span>Опубликованные статьи</span><strong>{publishedArticles.totalDocs}</strong><small>материалов в блоге</small></a><a href={link('/collections/tournaments')}><span>Активные турниры</span><strong>{upcomingTournaments.totalDocs}</strong><small>предстоящих и текущих</small></a><a href={link('/collections/media')}><span>Медиафайлы</span><strong>{mediaCount.totalDocs}</strong><small>в библиотеке</small></a></div>
      <div className="dashboard-overview__leads"><div className="dashboard-overview__section-heading"><div><p className="dashboard-overview__eyebrow">CRM</p><h2>Последние обращения</h2></div><a href={link('/collections/leads')}>Все обращения →</a></div>{leads.length ? <ul>{leads.map((lead) => <li key={String(lead.id)}><a href={link(`/collections/leads/${lead.id}`)}><span><strong>{lead.name || 'Без имени'}</strong><small>{leadLabels[lead.type ?? 'other'] ?? 'Обращение'}{lead.email ? ` · ${lead.email}` : ''}</small></span><time dateTime={lead.createdAt}>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('ru-RU') : '—'}</time></a></li>)}</ul> : <p className="dashboard-overview__empty">Новых обращений пока нет.</p>}</div>
    </section>
  } catch {
    return <section className="dashboard-overview dashboard-overview--error" role="alert"><h1>Обзор клуба временно недоступен</h1><p>Откройте разделы через меню — данные не изменены.</p></section>
  }
}

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, SetStepNav } from '@payloadcms/ui'
import type { AdminViewServerProps, VisibleEntities } from 'payload'
import { redirect } from 'next/navigation.js'
import { formatAdminURL } from 'payload/shared'

import { AnalyticsViewClient } from './AnalyticsViewClient'

export async function AnalyticsView(props: AdminViewServerProps) {
  const { initPageResult } = props
  const { req, permissions } = initPageResult
  const { config } = req.payload
  const { user } = req
  const adminRoute = config.routes.admin

  if (!user) redirect(formatAdminURL({ adminRoute, path: '/login' }))
  if (permissions.canAccessAdmin !== true) redirect(formatAdminURL({ adminRoute, path: '/unauthorized' }))

  const visibleEntities: VisibleEntities = {
    collections: [...initPageResult.visibleEntities.collections],
    globals: [...initPageResult.visibleEntities.globals],
  }

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={props.params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={props.searchParams}
      user={user}
      viewActions={props.viewActions}
      viewType="analytics"
      visibleEntities={visibleEntities}
    >
      <SetStepNav nav={[{ label: 'Настройки' }, { label: 'Аналитика' }]} />
      <Gutter className="admin-custom-view-gutter">
        <AnalyticsViewClient />
      </Gutter>
    </DefaultTemplate>
  )
}

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, SetStepNav } from '@payloadcms/ui'
import type { AdminViewServerProps, VisibleEntities } from 'payload'
import { redirect } from 'next/navigation.js'
import { formatAdminURL } from 'payload/shared'

import { PageMapViewClient } from './PageMapViewClient'

export async function PageMapView(props: AdminViewServerProps) {
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
      viewType="pageMap"
      visibleEntities={visibleEntities}
    >
      <SetStepNav nav={[{ label: 'Контент' }, { label: 'Карта страниц' }]} />
      <Gutter className="admin-custom-view-gutter">
        <PageMapViewClient />
      </Gutter>
    </DefaultTemplate>
  )
}

'use client'

import { ServerFunctionsContext, useDocumentDrawer, useServerFunctions } from '@payloadcms/ui'
import { useMemo } from 'react'

import './homepageAdmin.scss'

export function withGlobalEditorParams<T extends { collectionSlug: string; paramsOverride?: unknown; overrideEntityVisibility?: boolean }>(args: T, globalSlug: string): T {
  if (args.collectionSlug !== globalSlug || args.paramsOverride) return args
  return { ...args, paramsOverride: { segments: ['globals', globalSlug] }, overrideEntityVisibility: true }
}

function NativeGlobalEditor({ globalSlug, title }: { globalSlug: string; title: string }) {
  const serverFunctions = useServerFunctions()
  const adaptedFunctions = useMemo(() => ({
    ...serverFunctions,
    renderDocument: (args: Parameters<typeof serverFunctions.renderDocument>[0]) => serverFunctions.renderDocument(withGlobalEditorParams(args, globalSlug)),
  }), [globalSlug, serverFunctions])
  const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
    // Payload's drawer hook is collection-typed but its server renderer resolves globals too.
    collectionSlug: globalSlug as never,
    overrideEntityVisibility: true,
  })

  return (
    <ServerFunctionsContext.Provider value={adaptedFunctions}>
      <DocumentDrawerToggler aria-label={`Редактировать: ${title}`} className="homepage-admin-panel__record">Открыть редактор</DocumentDrawerToggler>
      <DocumentDrawer />
    </ServerFunctionsContext.Provider>
  )
}

function GlobalEditorPanel({ globalSlug, title, description }: { globalSlug: string; title: string; description: string }) {
  return (
    <section className="homepage-admin-panel" aria-label={title}>
      <header className="homepage-admin-panel__header">
        <div><h3>{title}</h3><p>{description}</p></div>
        <NativeGlobalEditor globalSlug={globalSlug} title={title} />
      </header>
    </section>
  )
}

export function PolicyGlobalEditorPanel() {
  return <GlobalEditorPanel globalSlug="policy-page" title="Политика конфиденциальности" description="Юридический документ сохраняет собственные черновики и публикацию." />
}

export function OfertaGlobalEditorPanel() {
  return <GlobalEditorPanel globalSlug="oferta-page" title="Публичная оферта" description="Юридический документ сохраняет собственные черновики и публикацию." />
}

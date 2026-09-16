'use client'

import { useDocumentInfo } from '@payloadcms/ui'

import { UsageList } from './UsageList'
import { useMediaUsage } from './useMediaUsage'
import './adminCards.scss'

export function MediaUsageField() {
  const { id } = useDocumentInfo()
  const { error, loading, usage } = useMediaUsage(id == null ? [] : [id])
  return <section className="media-usage-field" aria-busy={loading}><h3>Использование</h3>{loading && <p aria-live="polite">Проверяем связи…</p>}{error && <p role="alert">{error}</p>}{!loading && !error && <UsageList usage={usage} />}</section>
}

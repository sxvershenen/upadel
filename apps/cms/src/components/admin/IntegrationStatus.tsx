"use client";
import { useEffect, useState } from 'react'

import { createAdminRequestCache } from './adminRequestCache'
import { useAdminFieldVisibility } from './adminFieldVisibility'

const statusCache = createAdminRequestCache<string>({ maxEntries: 1, ttlMs: 60_000 })

export function IntegrationStatus() {
  const [fieldRef, visible] = useAdminFieldVisibility<HTMLDivElement>()
  const [text, setText] = useState('Проверяем конфигурацию…')
  useEffect(() => {
    if (!visible) return
    let cancelled = false
    const cached = statusCache.read('booking')
    if (cached?.fresh) setText(cached.value)
    void statusCache.request('booking', async () => {
      const response = await fetch('/api/admin/integrations/status')
      if (!response.ok) throw new Error('status')
      const data = await response.json() as { booking?: { status?: string } }
      return data.booking?.status ?? 'Статус недоступен'
    }).then((nextText) => {
      if (!cancelled) setText(nextText)
    }).catch(() => {
      if (!cancelled) setText('Статус недоступен')
    })
    return () => { cancelled = true }
  }, [visible])
  return <div ref={fieldRef} className="field-description" role="status"><strong>Состояние адаптера:</strong> {text}</div>
}

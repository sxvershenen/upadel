'use client'

import { useEffect, useMemo, useState } from 'react'

import type { MediaUsage } from '../../lib/mediaUsage'

type MediaPreview = { alt: string; filename?: null | string; mimeType?: null | string; thumbnailURL?: null | string }

export function useMediaUsage(ids: Array<number | string>) {
  const key = useMemo(() => [...new Set(ids.map(String))].sort().join(','), [ids])
  const [state, setState] = useState<{ error?: string; loading: boolean; media: Record<string, MediaPreview>; usage: MediaUsage[] }>({ loading: true, media: {}, usage: [] })

  useEffect(() => {
    const controller = new AbortController()
    if (!key) {
      setState({ loading: false, media: {}, usage: [] })
      return () => controller.abort()
    }
    setState((current) => ({ ...current, error: undefined, loading: true }))
    fetch('/api/admin/media-usage', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: key.split(',') }),
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json() as Promise<{ media: Record<string, MediaPreview>; usage: MediaUsage[] }>
    }).then((result) => setState({ ...result, loading: false })).catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setState({ error: `Не удалось загрузить данные: ${error instanceof Error ? error.message : String(error)}`, loading: false, media: {}, usage: [] })
    })
    return () => controller.abort()
  }, [key])

  return state
}

'use client'

import type { MediaUsage } from '../../lib/mediaUsage'

export function UsageList({ usage }: { usage: MediaUsage[] }) {
  if (usage.length === 0) return <span className="media-usage-state media-usage-state--unused">Не используется</span>
  return <div className="media-usage"><span className="media-usage-state media-usage-state--used">Используется · {usage.length}</span><ul>{usage.map((item) => <li key={`${item.mediaID}-${item.href}-${item.location}`}><a href={item.href}>{item.location}</a>{item.state === 'draft-only' && <span className="media-usage-draft">Только черновик</span>}{item.state === 'version' && <span className="media-usage-draft">Сохранённая версия</span>}</li>)}</ul></div>
}

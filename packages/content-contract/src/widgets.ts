export type WidgetKind = 'vivacrm-script' | 'iframe'

/** Accept installation snippets, but expose only the validated URL. */
export function widgetURL(value: unknown, kind: WidgetKind): string | null {
  if (kind !== 'iframe' && kind !== 'vivacrm-script') return null
  if (typeof value !== 'string') return null
  const input = value.trim()
  const tag = kind === 'iframe' ? 'iframe' : 'script'
  const markup = input.match(new RegExp(`^<${tag}\\s+([^<>]*)>\\s*</${tag}>$`, 'i'))
  const source = markup ? markup[1].match(/(?:^|\s)src\s*=\s*(["'])([^"']+)\1/i)?.[2] : input
  if (!source) return null
  try {
    const url = new URL(source)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    if (kind === 'vivacrm-script' && (url.hostname !== 'supadb.vivacrm.ru' || url.port || !/^\/storage\/v1\/object\/public\/widgets\/[a-f0-9-]{36}\.js$/i.test(url.pathname) || url.search || url.hash)) return null
    if (kind === 'iframe' && (url.hostname === 'localhost' || /^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^\[/.test(url.hostname))) return null
    return url.toString()
  } catch { return null }
}

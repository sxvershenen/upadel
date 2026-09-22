import type { Payload } from 'payload'

type RichNode = {
  checked?: boolean
  children?: unknown[]
  fields?: Record<string, unknown>
  format?: number
  listType?: string
  relationTo?: string
  start?: number
  tag?: string
  text?: string
  type?: string
  url?: string
  value?: unknown
}

type PublicMedia = {
  alt?: unknown
  caption?: unknown
  height?: unknown
  id?: unknown
  mimeType?: unknown
  sizes?: {
    card?: {
      height?: unknown
      mimeType?: unknown
      url?: unknown
      width?: unknown
    } | null
  } | null
  url?: unknown
  width?: unknown
}

const headingClasses = {
  h2: 'type-title-large',
  h3: 'type-title-card',
  h4: 'type-title-compact',
} as const

export const escapeArticleHTML = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

function safeLink(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  if ((value.startsWith('/') && !value.startsWith('//')) || value.startsWith('#')) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : null
  } catch {
    return null
  }
}

function safeMediaURL(value: unknown, origin: string): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value, origin)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (url.pathname.startsWith('/api/media/file/')) return new URL(url.pathname + url.search, origin).toString()
    return url.toString()
  } catch {
    return null
  }
}

function positiveDimension(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : null
}

function mediaID(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) return String((value as { id: unknown }).id)
  return null
}

function visitNodes(value: unknown, callback: (node: RichNode) => void): void {
  if (!value || typeof value !== 'object') return
  const node = value as RichNode
  callback(node)
  for (const child of node.children ?? []) visitNodes(child, callback)
}

async function resolveMedia(value: { root?: unknown }, payload: Payload): Promise<Map<string, PublicMedia>> {
  const resolved = new Map<string, PublicMedia>()
  const unresolved = new Set<string>()
  visitNodes(value.root, (node) => {
    if (node.type !== 'upload' || node.relationTo !== 'media') return
    const id = mediaID(node.value)
    if (!id) return
    if (node.value && typeof node.value === 'object' && 'url' in node.value) resolved.set(id, node.value as PublicMedia)
    else unresolved.add(id)
  })

  const ids = [...unresolved].filter((id) => !resolved.has(id) && /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= 2_147_483_647)
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100)
    const result = await payload.find({ collection: 'media', depth: 0, pagination: false, overrideAccess: true, where: { id: { in: batch } } })
    for (const doc of result.docs) resolved.set(String(doc.id), doc as unknown as PublicMedia)
  }
  return resolved
}

function renderUpload(node: RichNode, media: Map<string, PublicMedia>, origin: string): string {
  if (node.relationTo !== 'media') return ''
  const id = mediaID(node.value)
  const doc = id ? media.get(id) : null
  if (!doc || typeof doc.mimeType !== 'string') return ''

  const originalURL = safeMediaURL(doc.url, origin)
  const fields = node.fields ?? {}
  const caption = typeof fields.caption === 'string' ? fields.caption : typeof doc.caption === 'string' ? doc.caption : ''
  if (doc.mimeType === 'video/mp4' || doc.mimeType === 'video/webm') {
    if (!originalURL) return ''
    const video = `<video controls preload="metadata"><source src="${escapeArticleHTML(originalURL)}" type="${escapeArticleHTML(doc.mimeType)}">Ваш браузер не поддерживает видео.</video>`
    return `<figure class="article-prose__media article-prose__media--video">${video}${caption ? `<figcaption class="type-body-sm">${escapeArticleHTML(caption)}</figcaption>` : ''}</figure>`
  }
  if (!doc.mimeType.startsWith('image/')) return ''

  const card = doc.sizes?.card
  const cardURL = safeMediaURL(card?.url, origin)
  const imageURL = originalURL ?? cardURL
  if (!imageURL) return ''

  const alt = typeof fields.alt === 'string' ? fields.alt : typeof doc.alt === 'string' ? doc.alt : ''
  const width = positiveDimension(originalURL ? doc.width : card?.width)
  const height = positiveDimension(originalURL ? doc.height : card?.height)
  const dimensions = `${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}`
  const source = cardURL
    ? `<source media="(max-width: ${positiveDimension(card?.width) ?? 1200}px)" srcset="${escapeArticleHTML(cardURL)}"${typeof card?.mimeType === 'string' ? ` type="${escapeArticleHTML(card.mimeType)}"` : ''}>`
    : ''
  const picture = `<picture>${source}<img data-progressive-native="loading" src="${escapeArticleHTML(imageURL)}" alt="${escapeArticleHTML(alt)}"${dimensions} loading="lazy" decoding="async"></picture>`
  return `<figure class="article-prose__media">${picture}${caption ? `<figcaption class="type-body-sm">${escapeArticleHTML(caption)}</figcaption>` : ''}</figure>`
}

export async function articleContentHTML(
  value: { root?: unknown },
  options: { origin: string; payload: Payload },
): Promise<string> {
  const media = await resolveMedia(value, options.payload)

  const render = (input: unknown, parent?: RichNode): string => {
    if (!input || typeof input !== 'object') return ''
    const node = input as RichNode
    if (node.type === 'text') {
      let text = escapeArticleHTML(node.text ?? '')
      const format = typeof node.format === 'number' ? node.format : 0
      if (format & 16) text = `<code>${text}</code>`
      if (format & 8) text = `<u>${text}</u>`
      if (format & 4) text = `<s>${text}</s>`
      if (format & 2) text = `<em>${text}</em>`
      if (format & 1) text = `<strong>${text}</strong>`
      if (format & 32) text = `<sub>${text}</sub>`
      if (format & 64) text = `<sup>${text}</sup>`
      return text
    }
    if (node.type === 'upload') return renderUpload(node, media, options.origin)
    if (node.type === 'horizontalrule') return '<hr>'
    if (node.type === 'linebreak') return '<br>'

    const children = (node.children ?? []).map((child) => render(child, node)).join('')
    if (node.type === 'root') return children
    if (node.type === 'paragraph') return `<p>${children}</p>`
    if (node.type === 'heading') {
      const tag = node.tag && node.tag in headingClasses ? node.tag as keyof typeof headingClasses : null
      return tag ? `<${tag} class="${headingClasses[tag]}">${children}</${tag}>` : `<p>${children}</p>`
    }
    if (node.type === 'quote') return `<blockquote>${children}</blockquote>`
    if (node.type === 'list') {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      const start = tag === 'ol' && Number.isInteger(node.start) && (node.start ?? 0) > 1 ? ` start="${node.start}"` : ''
      const className = node.listType === 'check' ? ' class="article-prose__checklist"' : ''
      return `<${tag}${start}${className}>${children}</${tag}>`
    }
    if (node.type === 'listitem') {
      if (parent?.listType === 'check') return `<li class="article-prose__check-item" role="checkbox" aria-readonly="true" aria-checked="${node.checked === true ? 'true' : 'false'}">${children}</li>`
      return `<li>${children}</li>`
    }
    if (node.type === 'link' || node.type === 'autolink') {
      const href = safeLink(node.fields?.url ?? node.url)
      if (!href) return children
      const newTab = node.fields?.newTab === true
      return `<a href="${escapeArticleHTML(href)}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${children}</a>`
    }
    return children
  }

  return render(value.root)
}

import { parseThematicPageDTO, type ThematicPageDTO } from '@unlim/content-contract'

export type ThematicPageKind = ThematicPageDTO['kind']
export class PageLoadError extends Error { constructor(message: string, readonly status?: number) { super(message) } }

export async function loadPage(cmsURL: string | undefined, kind: ThematicPageKind, previewSecret?: string | null): Promise<ThematicPageDTO> {
  if (!cmsURL) throw new PageLoadError('CMS_URL is required to render public pages.')
  const url = new URL(`/api/public/page/${kind}`, cmsURL)
  if (previewSecret) { url.searchParams.set('preview', '1'); url.searchParams.set('secret', previewSecret) }
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new PageLoadError(`CMS ${kind} page projection failed with HTTP ${response.status}.`, response.status)
  return parseThematicPageDTO(await response.json())
}

import { parsePadelCourtZakazPageDTO, parseThematicPageDTO, type PadelCourtZakazPageDTO, type ThematicPageDTO } from '@unlim/content-contract'
import { CMSReadError, requestCMS } from './requestCMS'

export type ThematicPageKind = ThematicPageDTO['kind']
export class PageLoadError extends Error { constructor(message: string, readonly status = 503) { super(message) } }

async function requestPage<T>(cmsURL: string | undefined, kind: string, parse: (value: unknown) => T, previewSecret?: string | null): Promise<T> {
  if (!cmsURL) throw new PageLoadError('CMS_URL is required to render public pages.')
  const url = new URL(`/api/public/page/${kind}`, cmsURL)
  if (previewSecret) { url.searchParams.set('preview', '1'); url.searchParams.set('secret', previewSecret) }
  try { return await requestCMS(url, parse, { preview: Boolean(previewSecret) }) }
  catch (error) { throw new PageLoadError('Page content is unavailable.', error instanceof CMSReadError ? error.status : 503) }
}

export const loadPage = (cmsURL: string | undefined, kind: ThematicPageKind, previewSecret?: string | null): Promise<ThematicPageDTO> =>
  requestPage(cmsURL, kind, parseThematicPageDTO, previewSecret)
export const loadPadelCourtZakazPage = (cmsURL: string | undefined, previewSecret?: string | null): Promise<PadelCourtZakazPageDTO> =>
  requestPage(cmsURL, 'padel-court-zakaz', parsePadelCourtZakazPageDTO, previewSecret)

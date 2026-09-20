import { parseCatalogDTO, parseDetailDTO, type CatalogDTO, type DetailDTO } from '@unlim/content-contract'

type Kind = CatalogDTO['kind']
export class CatalogLoadError extends Error { constructor(message: string, readonly status?: number) { super(message) } }

async function requestCMS<T>(cmsURL: string | undefined, kind: Kind, options: { previewSecret?: string | null; slug?: string }, parse: (value: unknown) => T): Promise<T> {
  if (!cmsURL) throw new CatalogLoadError('CMS_URL is required to render catalog pages.')
  const url = new URL(`/api/public/catalog/${kind}`, cmsURL)
  if (options.slug) url.searchParams.set('slug', options.slug)
  if (options.previewSecret) { url.searchParams.set('preview', '1'); url.searchParams.set('secret', options.previewSecret) }
  const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
  if (!response.ok) throw new CatalogLoadError(`CMS ${kind} projection failed with HTTP ${response.status}.`, response.status)
  return parse(await response.json())
}

export const loadCatalog = (cmsURL: string | undefined, kind: Kind, previewSecret?: string | null): Promise<CatalogDTO> =>
  requestCMS(cmsURL, kind, { previewSecret }, parseCatalogDTO)

export const loadDetail = (cmsURL: string | undefined, kind: Kind, slug: string, previewSecret?: string | null): Promise<DetailDTO> =>
  requestCMS(cmsURL, kind, { previewSecret, slug }, parseDetailDTO)

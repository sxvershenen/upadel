import { catalogQueryParams, parseCatalogDTO, parseDetailDTO, type CatalogDTO, type CatalogQuery, type DetailDTO } from '@unlim/content-contract'
import { CMSReadError, requestCMS } from './requestCMS'

type Kind = CatalogDTO['kind']
export class CatalogLoadError extends Error { constructor(message: string, readonly status = 503) { super(message) } }

async function requestCatalog<T>(cmsURL: string | undefined, kind: Kind, options: { previewSecret?: string | null; slug?: string; query?: CatalogQuery }, parse: (value: unknown) => T): Promise<T> {
  if (!cmsURL) throw new CatalogLoadError('CMS_URL is required to render catalog pages.')
  const url = new URL(`/api/public/catalog/${kind}`, cmsURL)
  if (options.query) url.search = catalogQueryParams(options.query).toString()
  if (options.slug) url.searchParams.set('slug', options.slug)
  if (options.previewSecret) { url.searchParams.set('preview', '1'); url.searchParams.set('secret', options.previewSecret) }
  try { return await requestCMS(url, parse, { preview: Boolean(options.previewSecret) }) }
  catch (error) { throw new CatalogLoadError('Catalog content is unavailable.', error instanceof CMSReadError ? error.status : 503) }
}

export const loadCatalog = (cmsURL: string | undefined, kind: Kind, previewSecret?: string | null, query?: CatalogQuery): Promise<CatalogDTO> =>
  requestCatalog(cmsURL, kind, { previewSecret, query }, parseCatalogDTO)
export const loadDetail = (cmsURL: string | undefined, kind: Kind, slug: string, previewSecret?: string | null): Promise<DetailDTO> =>
  requestCatalog(cmsURL, kind, { previewSecret, slug }, parseDetailDTO)

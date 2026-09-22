import { parseHomepageDTO, type HomepageDTO } from '@unlim/content-contract'
import { CMSReadError, requestCMS } from './requestCMS'

export class HomepageLoadError extends Error {
  constructor(message: string, readonly status = 503) { super(message) }
}

export async function loadHomepage(options: { cmsURL: string | undefined; previewSecret?: string | null }): Promise<HomepageDTO> {
  const { cmsURL, previewSecret } = options
  if (!cmsURL) throw new HomepageLoadError('CMS_URL is required to render the public website.')
  const endpoint = new URL('/api/public/homepage', cmsURL)
  if (previewSecret) { endpoint.searchParams.set('preview', 'homepage'); endpoint.searchParams.set('secret', previewSecret) }
  try { return await requestCMS(endpoint, parseHomepageDTO, { preview: Boolean(previewSecret) }) }
  catch (error) { throw new HomepageLoadError('Homepage content is unavailable.', error instanceof CMSReadError ? error.status : 503) }
}

import { parseHomepageDTO, type HomepageDTO } from '@unlim/content-contract'

export class HomepageLoadError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
  }
}

export async function loadHomepage(options: { cmsURL: string | undefined; previewSecret?: string | null }): Promise<HomepageDTO> {
  const { cmsURL, previewSecret } = options
  if (!cmsURL) throw new HomepageLoadError('CMS_URL is required to render the public website.')

  const endpoint = new URL('/api/public/homepage', cmsURL)
  if (previewSecret) {
    endpoint.searchParams.set('preview', 'homepage')
    endpoint.searchParams.set('secret', previewSecret)
  }

  let response: Response
  try {
    response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
  } catch (error) {
    throw new HomepageLoadError(`Unable to reach CMS at ${endpoint.origin}: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (!response.ok) throw new HomepageLoadError(`CMS homepage projection failed with HTTP ${response.status}.`, response.status)
  return parseHomepageDTO(await response.json())
}

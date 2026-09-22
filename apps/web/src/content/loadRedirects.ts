import { createCMSReader } from './requestCMS'

type Redirect = { sourcePath: string; destinationPath: string; status: 301 | 302 }
const read = createCMSReader({ timeoutMs: 1_500 })
const internalPath = (value: unknown): value is string => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\\\x00-\x20]/.test(value)
export async function loadRedirects(cmsURL: string): Promise<Map<string, Redirect>> {
  return read(new URL('/api/public/redirects', cmsURL), (input) => {
    if (!input || typeof input !== 'object' || !('redirects' in input) || !Array.isArray(input.redirects)) throw new Error('Invalid redirect map.')
    return new Map(input.redirects.map((item: Redirect) => {
      if (!internalPath(item.sourcePath) || !internalPath(item.destinationPath) || ![301, 302].includes(item.status)) throw new Error('Invalid redirect.')
      return [item.sourcePath, item]
    }))
  }, { fallback: false })
}

export type PayloadPublicURLConfig = {
  csrf?: string[]
  serverURL?: string
}

function httpOrigin(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : null
  } catch {
    return null
  }
}

export function payloadPublicURLConfig(env: { PUBLIC_CMS_URL?: string; PUBLIC_WEB_URL?: string }): PayloadPublicURLConfig {
  const serverURL = httpOrigin(env.PUBLIC_CMS_URL)
  if (!serverURL) return {}

  const csrf = [...new Set([httpOrigin(env.PUBLIC_CMS_URL), httpOrigin(env.PUBLIC_WEB_URL)].filter((value): value is string => Boolean(value)))]
  return {
    serverURL,
    csrf,
  }
}

export function publicContentOrigin(requestOrigin: string, configured = process.env.PUBLIC_CONTENT_URL): string {
  return httpOrigin(configured) ?? requestOrigin
}

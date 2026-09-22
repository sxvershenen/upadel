import { loadRedirects } from './content/loadRedirects'
import { isIP } from 'node:net'
import { defineMiddleware } from "astro:middleware";

const cmsURL = import.meta.env.CMS_URL;
if (!cmsURL) throw new Error("CMS_URL is required to load redirects.");
const cmsProxyURL = import.meta.env.CMS_PROXY_URL;

function secureHeaders(response: Response): Response {
  if (response.headers.get('content-type')?.includes('text/html')) response.headers.set('Cache-Control', 'no-store')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (import.meta.env.PROD) response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  return response
}

export const onRequest = defineMiddleware(async (context, next) => {
  const proxyPath = context.url.pathname.startsWith('/api/media/file/') || context.url.pathname === '/api/public/leads' || context.url.pathname === '/api/public/analytics'
  if (cmsProxyURL && proxyPath) {
    const target = new URL(context.url.pathname + context.url.search, cmsProxyURL)
    const headers = new Headers(context.request.headers)
    headers.delete('host')
    headers.delete('content-length')
    headers.delete('x-forwarded-for')
    // Production Nginx overwrites forwarded addresses before the Astro adapter reads them.
    const address = context.clientAddress
    headers.set('x-real-ip', isIP(address) ? address : '')
    const method = context.request.method
    const body = method === 'GET' || method === 'HEAD' ? undefined : context.request.body
    let upstream: Response
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      upstream = await fetch(target, { method, headers, body, duplex: 'half', redirect: 'manual', signal: controller.signal } as RequestInit)
    } catch { return secureHeaders(new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } })) }
    finally { clearTimeout(timer) }
    const responseHeaders = new Headers(upstream.headers)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length')
    return secureHeaders(new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders }))
  }
  if (context.url.pathname.startsWith('/api/') || context.url.pathname.startsWith('/_astro/') || /\.[a-z0-9]+$/i.test(context.url.pathname)) return secureHeaders(await next())
  const redirects = await loadRedirects(cmsURL).catch(() => new Map())
  const redirect = redirects.get(context.url.pathname.replace(/\/+$/, "") || "/");
  if (!redirect) return secureHeaders(await next());
  return secureHeaders(new Response(null, { status: redirect.status, headers: { Location: redirect.destinationPath, "Cache-Control": "no-store" } }));
});

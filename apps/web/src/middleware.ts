import { defineMiddleware } from "astro:middleware";

const cmsURL = import.meta.env.CMS_URL;
if (!cmsURL) throw new Error("CMS_URL is required to load redirects.");
const cmsProxyURL = import.meta.env.CMS_PROXY_URL;
const redirectMap = fetch(new URL("/api/public/redirects", cmsURL)).then(async (response) => {
  if (!response.ok) return new Map<string, { sourcePath: string; destinationPath: string; status: 301 | 302 }>();
  const data = await response.json() as { redirects: Array<{ sourcePath: string; destinationPath: string; status: 301 | 302 }> };
  return new Map(data.redirects.map((item) => [item.sourcePath, item]));
}).catch(() => new Map<string, { sourcePath: string; destinationPath: string; status: 301 | 302 }>());

function secureHeaders(response: Response): Response {
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
    const method = context.request.method
    const body = method === 'GET' || method === 'HEAD' ? undefined : await context.request.arrayBuffer()
    const upstream = await fetch(target, { method, headers, body, redirect: 'manual' })
    const responseHeaders = new Headers(upstream.headers)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length')
    return secureHeaders(new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders }))
  }
  const redirect = (await redirectMap).get(context.url.pathname.replace(/\/+$/, "") || "/");
  if (!redirect) return secureHeaders(await next());
  return secureHeaders(new Response(null, { status: redirect.status, headers: { Location: redirect.destinationPath, "Cache-Control": redirect.status === 301 ? "public, max-age=3600" : "no-store" } }));
});

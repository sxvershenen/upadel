export const prerender = true;
export async function GET() {
  const origin = import.meta.env.PUBLIC_SITE_URL ?? "http://127.0.0.1:4321";
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /preview/\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${new URL("/sitemap.xml", origin)}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

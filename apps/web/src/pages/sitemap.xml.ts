import {
  escapeXML,
  includeSitemapURL,
  sitemapCanonicalURL,
} from "../seo/sitemap";
export async function GET() {
  const cms = import.meta.env.CMS_URL;
  if (!cms) throw new Error("CMS_URL is required for sitemap.");
  const origin = import.meta.env.PUBLIC_SITE_URL ?? "http://127.0.0.1:4321";
  const response = await fetch(new URL("/api/public/seo-index", cms));
  if (!response.ok) throw new Error(`SEO index failed: ${response.status}`);
  const data = (await response.json()) as {
    urls: Array<{ path: string; lastmod?: string; canonical?: string | null }>;
  };
  const urls = data.urls.filter((entry) => includeSitemapURL(entry, origin));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((entry) => `<url><loc>${escapeXML(sitemapCanonicalURL(entry.path, origin))}</loc>${entry.lastmod ? `<lastmod>${escapeXML(new Date(entry.lastmod).toISOString())}</lastmod>` : ""}</url>`).join("")}</urlset>`;
  return new Response(xml, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600", "Content-Type": "application/xml; charset=utf-8" },
  });
}

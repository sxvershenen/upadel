import { defineMiddleware } from "astro:middleware";

const cmsURL = import.meta.env.CMS_URL;
if (!cmsURL) throw new Error("CMS_URL is required to load redirects.");
const redirectMap = fetch(new URL("/api/public/redirects", cmsURL)).then(async (response) => {
  if (!response.ok) throw new Error(`Unable to load redirects: HTTP ${response.status}.`);
  const data = await response.json() as { redirects: Array<{ sourcePath: string; destinationPath: string; status: 301 | 302 }> };
  return new Map(data.redirects.map((item) => [item.sourcePath, item]));
});

export const onRequest = defineMiddleware(async (context, next) => {
  const redirect = (await redirectMap).get(context.url.pathname.replace(/\/+$/, "") || "/");
  if (!redirect) return next();
  return new Response(null, { status: redirect.status, headers: { Location: redirect.destinationPath, "Cache-Control": redirect.status === 301 ? "public, max-age=3600" : "no-store" } });
});

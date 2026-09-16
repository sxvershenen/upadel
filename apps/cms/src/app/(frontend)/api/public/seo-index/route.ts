import {
  codeDefinedRouteRegistry,
  dynamicRouteRegistry,
  publicRouteRegistry,
} from "@unlim/content-contract";
import config from "@payload-config";
import { getPayload } from "payload";
export const dynamic = "force-dynamic";
type IndexDocument = {
  slug?: string;
  updatedAt?: string;
  _status?: string;
  isActive?: boolean;
  seo?: { robots?: string; canonical?: string | null };
};
export async function GET() {
  try {
    const payload = await getPayload({ config });
    const redirects = await payload.find({
      collection: "redirects",
      depth: 0,
      pagination: false,
      overrideAccess: true,
      where: { enabled: { equals: true } },
    });
    const excluded = new Set(redirects.docs.map((x) => x.sourcePath));
    const fixed = (
      await Promise.all(
        publicRouteRegistry.map(async (r) => {
          const d = (await payload.findGlobal({
            slug: r.globalSlug,
            draft: false,
            depth: 0,
            overrideAccess: true,
          } as never)) as unknown as IndexDocument;
          return d._status === "published" &&
            d.seo?.robots === "index-follow" &&
            !excluded.has(r.path)
            ? {
                path: r.path,
                lastmod: d.updatedAt,
                canonical: d.seo?.canonical,
              }
            : null;
        }),
      )
    ).filter(Boolean);
    const dynamic = (
      await Promise.all(
        dynamicRouteRegistry.map(async (r) => {
          const result = (await payload.find({
            collection: r.collection,
            draft: false,
            depth: 0,
            pagination: false,
            overrideAccess: true,
            where: {
              and: [
                { _status: { equals: "published" } },
                { "seo.robots": { equals: "index-follow" } },
                ...(r.collection === "coaches"
                  ? [{ isActive: { equals: true } }]
                  : []),
              ],
            },
          } as never)) as unknown as { docs: IndexDocument[] };
          return result.docs
            .filter(
              (d): d is IndexDocument & { slug: string } =>
                typeof d.slug === "string" &&
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug),
            )
            .map((d) => ({
              path: `${r.parent}/${encodeURIComponent(d.slug)}`,
              lastmod: d.updatedAt,
              canonical: d.seo?.canonical,
            }))
            .filter((x) => !excluded.has(x.path));
        }),
      )
    ).flat();
    const codeDefined = codeDefinedRouteRegistry
      .filter((route) => route.robots === "index-follow" && !excluded.has(route.path))
      .map((route) => ({ path: route.path, canonical: route.canonical }));
    return Response.json(
      { urls: [...fixed, ...codeDefined, ...dynamic] },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=300" } },
    );
  } catch {
    return Response.json(
      { error: "SEO index unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

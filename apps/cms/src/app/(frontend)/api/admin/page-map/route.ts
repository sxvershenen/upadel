import {
  codeDefinedRouteRegistry,
  dynamicRouteRegistry,
  publicRouteRegistry,
} from "@unlim/content-contract";
import config from "@payload-config";
import { getPayload } from "payload";
import { formatAdminURL } from "payload/shared";
import { resolvePageMapStatus } from "@/pageMap/status";
import { normalizePagePath, normalizePageSegment } from "@/pageMap/pages";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
const mediaField = {
  articles: "previewImage",
  coaches: "photo",
  tournaments: "image",
} as const;
type PublicDocument = {
  id: number | string;
  slug?: string;
  title?: string;
  name?: string;
  _status?: string;
  seo?: {
    title?: string;
    description?: string;
    robots?: string;
    socialImage?: unknown;
  };
  previewImage?: unknown;
  photo?: unknown;
  image?: unknown;
  parentPath?: string;
  path?: string;
  template?: string;
};

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const denied = await requireAdmin(payload, request.headers);
  if (denied) return denied;
  try {
    const publicBase = process.env.PUBLIC_WEB_URL;
    const adminRoute = payload.config.routes.admin;
    const fixed = await Promise.all(
      publicRouteRegistry.map(async (route) => {
        const [doc, publishedDoc] = (await Promise.all([
          payload.findGlobal({
            slug: route.globalSlug,
            draft: true,
            depth: 1,
            overrideAccess: true,
          } as never),
          payload.findGlobal({
            slug: route.globalSlug,
            draft: false,
            depth: 0,
            overrideAccess: true,
          } as never),
        ])) as unknown as [PublicDocument, PublicDocument];
        const hasPublished = publishedDoc._status === "published";
        const seo = doc.seo ?? {};
        const issues = [
          !seo.title && "Нет SEO title",
          !seo.description && "Нет description",
          !seo.socialImage && "Нет social image",
        ].filter(Boolean);
        const previewBase = process.env.PUBLIC_WEB_URL;
        let preview: string | null = null;
        if (previewBase && process.env.PREVIEW_SECRET) {
          const url = new URL(
            route.path === "/"
              ? "/preview/homepage"
              : ["/blog", "/coaches", "/tournaments"].includes(route.path)
                ? "/preview/catalog"
                : "/preview/page",
            previewBase,
          );
          if (route.path === "/") url.searchParams.set("preview", "homepage");
          else url.searchParams.set("type", route.path.slice(1));
          url.searchParams.set("secret", process.env.PREVIEW_SECRET);
          preview = url.toString();
        }
        return {
          path: route.path,
          parent: route.parent,
          template: route.template,
          title: doc.title ?? seo.title ?? "Главная",
          status: resolvePageMapStatus(doc._status, hasPublished),
          robots: seo.robots ?? "index-follow",
          issues,
          edit: formatAdminURL({
            adminRoute,
            path: `/globals/${route.globalSlug}`,
          }),
          public:
            publicBase && hasPublished
              ? new URL(route.path, publicBase).toString()
              : null,
          preview,
        };
      }),
    );
    const codeDefined = await Promise.all(codeDefinedRouteRegistry.map(async (route) => {
      const globalSlug = "globalSlug" in route ? route.globalSlug : null;
      const [draftDoc, publishedDoc] = globalSlug
        ? (await Promise.all([
            payload.findGlobal({ slug: globalSlug, draft: true, depth: 0, overrideAccess: true, showHiddenFields: false } as never),
            payload.findGlobal({ slug: globalSlug, draft: false, depth: 0, overrideAccess: true, showHiddenFields: false } as never),
          ])) as unknown as [PublicDocument, PublicDocument]
        : [null, null];
      const hasPublished = globalSlug ? publishedDoc?._status === "published" : true;
      const seo = draftDoc?.seo ?? {};
      let preview: string | null = null;
      if (globalSlug && process.env.PUBLIC_WEB_URL && process.env.PREVIEW_SECRET) {
        const url = new URL("/preview/page", process.env.PUBLIC_WEB_URL);
        url.searchParams.set("type", route.template);
        url.searchParams.set("secret", process.env.PREVIEW_SECRET);
        preview = url.toString();
      }
      return {
        path: route.path,
        parent: route.parent,
        template: route.template,
        title: draftDoc?.title ?? route.title,
        status: globalSlug ? resolvePageMapStatus(draftDoc?._status, hasPublished) : "published",
        robots: seo.robots ?? route.robots,
        issues: globalSlug
          ? [
              !draftDoc?.title && "Нет названия CMS-страницы",
              !seo.title && "Нет SEO title",
              !seo.description && "Нет description",
              !seo.socialImage && "Нет social image",
            ].filter(Boolean)
          : [
              !route.title && "Нет SEO title",
              !route.description && "Нет description",
              !route.socialImage && "Нет social image",
            ].filter(Boolean),
        edit: globalSlug ? formatAdminURL({ adminRoute, path: `/globals/${globalSlug}` }) : "",
        public: publicBase && hasPublished ? new URL(route.path, publicBase).toString() : null,
        preview,
      };
    }));
    const dynamicRows = (
      await Promise.all(
        dynamicRouteRegistry.map(async (route) => {
          const [result, publishedResult] = (await Promise.all([
            payload.find({
              collection: route.collection,
              draft: true,
              depth: 1,
              pagination: false,
              overrideAccess: true,
              sort: "slug",
            } as never),
            payload.find({
              collection: route.collection,
              draft: false,
              depth: 0,
              pagination: false,
              overrideAccess: true,
              where: { _status: { equals: "published" } },
            } as never),
          ])) as unknown as [
            { docs: PublicDocument[] },
            { docs: PublicDocument[] },
          ];
          const publishedIDs = new Set(
            publishedResult.docs.map((item) => String(item.id)),
          );
          return result.docs.flatMap((doc) => {
            if (!doc.slug) return [];
            const hasPublished = publishedIDs.has(String(doc.id));
            const seo = doc.seo ?? {};
            const media = doc[mediaField[route.collection]];
            const issues = [
              !seo.title && "Нет SEO title",
              !seo.description && "Нет description",
              !seo.socialImage && "Нет social image",
              media &&
                typeof media === "object" &&
                (!("alt" in media) || !(media as { alt?: string }).alt) &&
                "Нет alt у основного изображения",
            ].filter(Boolean);
            const path = `${route.parent}/${encodeURIComponent(doc.slug)}`;
            let preview: string | null = null;
            if (route.collection === "articles" && process.env.PUBLIC_WEB_URL && process.env.PREVIEW_SECRET) {
              const previewURL = new URL("/preview/article", process.env.PUBLIC_WEB_URL);
              previewURL.searchParams.set("slug", doc.slug);
              previewURL.searchParams.set("secret", process.env.PREVIEW_SECRET);
              preview = previewURL.toString();
            }
            return [
              {
                path,
                parent: route.parent,
                template: route.template,
                title: doc.title ?? doc.name,
                status: resolvePageMapStatus(doc._status, hasPublished),
                robots: seo.robots ?? "index-follow",
                issues,
                edit: formatAdminURL({
                  adminRoute,
                  path: `/collections/${route.collection}/${doc.id}`,
                }),
                public:
                  publicBase && hasPublished
                    ? new URL(path, publicBase).toString()
                    : null,
                preview,
              },
            ];
          });
        }),
      )
    ).flat();
    const [pageResult, publishedPageResult] = (await Promise.all([
      payload.find({
        collection: "pages",
        draft: true,
        depth: 1,
        pagination: false,
        overrideAccess: true,
        sort: "path",
      } as never),
      payload.find({
        collection: "pages",
        draft: false,
        depth: 0,
        pagination: false,
        overrideAccess: true,
        where: { _status: { equals: "published" } },
      } as never),
    ])) as unknown as [
      { docs: PublicDocument[] },
      { docs: PublicDocument[] },
    ];
    const publishedPageIDs = new Set(publishedPageResult.docs.map((item) => String(item.id)));
    const pageRows = pageResult.docs.flatMap((doc) => {
      if (!doc.path || !doc.parentPath) return [];
      const seo = doc.seo ?? {};
      return [{
        path: doc.path,
        parent: doc.parentPath,
        template: doc.template ?? "code-defined-page",
        title: doc.title ?? doc.path,
        status: resolvePageMapStatus(doc._status, publishedPageIDs.has(String(doc.id))),
        robots: seo.robots ?? "index-follow",
        issues: [
          "Публичный шаблон ещё не реализован",
          !seo.title && "Нет SEO title",
          !seo.description && "Нет description",
          !seo.socialImage && "Нет social image",
        ].filter(Boolean),
        edit: formatAdminURL({ adminRoute, path: `/collections/pages/${doc.id}` }),
        public: null,
        preview: null,
      }];
    });
    return Response.json(
      { rows: [...fixed, ...codeDefined, ...dynamicRows, ...pageRows] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Page map is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const denied = await requireAdmin(payload, request.headers);
  if (denied) return denied;

  let input: Record<string, unknown>;
  try {
    input = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Некорректные данные страницы." }, { status: 400 });
  }

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const slug = normalizePageSegment(input.slug);
  const parentPath = normalizePagePath(input.parentPath);
  if (!title || title.length > 120 || !slug || !parentPath) {
    return Response.json(
      { error: "Укажите название, родителя и URL-сегмент латиницей." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const doc = await payload.create({
      collection: "pages",
      draft: true,
      overrideAccess: true,
      data: { title, slug, parentPath, _status: "draft" },
    } as never) as unknown as PublicDocument;
    return Response.json({
      row: {
        path: doc.path,
        parent: doc.parentPath,
        template: doc.template ?? "code-defined-page",
        title: doc.title ?? title,
        status: "draft-only",
        robots: doc.seo?.robots ?? "index-follow",
        issues: ["Публичный шаблон ещё не реализован", "Нет SEO title", "Нет description", "Нет social image"],
        edit: formatAdminURL({ adminRoute: payload.config.routes.admin, path: `/collections/pages/${doc.id}` }),
        public: null,
        preview: null,
      },
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    const rawMessage = cause instanceof Error ? cause.message : "";
    const message = [
      "Выберите существующий родительский путь.",
      "URL-сегмент должен содержать",
      "Этот путь зарезервирован системой.",
      "Путь страницы стабилен.",
      "Родительская страница больше не существует.",
      "Путь ",
    ].some((prefix) => rawMessage.startsWith(prefix)) ? rawMessage : "Не удалось создать страницу.";
    return Response.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}

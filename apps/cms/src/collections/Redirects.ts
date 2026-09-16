import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { authenticated } from "../fields/access";

export function normalizeRedirectPath(value: unknown): string {
  if (typeof value !== "string") return "";
  const path = value.trim().replace(/\/{2,}/g, "/");
  if (!path.startsWith("/") || path.includes("?") || path.includes("#"))
    return "";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}
export async function validateRedirectTraversal(
  sourcePath: string,
  destinationPath: string,
  nextPath: (path: string) => Promise<string | null>,
  maxDepth = 6,
): Promise<true | string> {
  if (!sourcePath || !destinationPath || sourcePath === destinationPath)
    return "Источник и назначение должны быть разными допустимыми путями.";
  let cursor = destinationPath;
  const seen = new Set([sourcePath]);
  for (let depth = 0; depth < maxDepth; depth += 1) {
    if (seen.has(cursor)) return "Цикл редиректов запрещён.";
    seen.add(cursor);
    const next = await nextPath(cursor);
    if (!next) return true;
    cursor = next;
  }
  return "Цепочка редиректов не должна превышать шесть переходов.";
}
const validatePath = (value: unknown) => {
  const path = normalizeRedirectPath(value);
  if (!path)
    return "Укажите путь от корня без query и hash, например /old-page.";
  if (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/api" ||
    path.startsWith("/api/")
  )
    return "Служебные пути /admin и /api запрещены.";
  return true;
};
const validateRedirect: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data;
  const sourcePath = normalizeRedirectPath(
    data.sourcePath ?? originalDoc?.sourcePath,
  );
  const destinationPath = normalizeRedirectPath(
    data.destinationPath ?? originalDoc?.destinationPath,
  );
  data.sourcePath = sourcePath;
  data.destinationPath = destinationPath;
  const traversal = await validateRedirectTraversal(
    sourcePath,
    destinationPath,
    async (cursor) => {
      const next = await req.payload.find({
        collection: "redirects",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: {
          and: [
            { sourcePath: { equals: cursor } },
            { enabled: { equals: true } },
          ],
        },
      });
      const doc = next.docs.find(
        (item) => String(item.id) !== String(originalDoc?.id ?? ""),
      );
      return doc?.destinationPath ?? null;
    },
  );
  if (traversal !== true) throw new Error(traversal);
  return data;
};
export const Redirects: CollectionConfig = {
  slug: "redirects",
  labels: { singular: "Редирект", plural: "Редиректы" },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => (req.user ? true : { enabled: { equals: true } }),
    update: authenticated,
  },
  admin: {
    defaultColumns: [
      "sourcePath",
      "destinationPath",
      "statusCode",
      "enabled",
      "updatedAt",
    ],
    description:
      "Редиректы загружаются Astro один раз при запуске и начинают действовать после следующего restart/deploy (обычно вместе с build).",
    group: "SEO",
    hidden: true,
    useAsTitle: "sourcePath",
  },
  fields: [
    {
      name: "sourcePath",
      type: "text",
      label: "Исходный путь",
      required: true,
      unique: true,
      index: true,
      validate: validatePath,
    },
    {
      name: "destinationPath",
      type: "text",
      label: "Новый путь",
      required: true,
      validate: validatePath,
    },
    {
      name: "statusCode",
      type: "select",
      label: "Код",
      required: true,
      defaultValue: "301",
      options: [
        { label: "301 — постоянный", value: "301" },
        { label: "302 — временный", value: "302" },
      ],
    },
    {
      name: "enabled",
      type: "checkbox",
      label: "Активен",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    { name: "note", type: "textarea", label: "Комментарий", maxLength: 500 },
  ],
  hooks: { beforeValidate: [validateRedirect] },
};

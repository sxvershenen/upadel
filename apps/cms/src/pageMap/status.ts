export type PageMapStatus = "published" | "draft-only" | "draft-with-published";
export function resolvePageMapStatus(
  latestStatus: unknown,
  hasPublished: boolean,
): PageMapStatus {
  if (latestStatus === "published") return "published";
  return hasPublished ? "draft-with-published" : "draft-only";
}

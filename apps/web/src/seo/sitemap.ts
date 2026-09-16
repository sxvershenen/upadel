export const escapeXML = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
export const sitemapCanonicalURL = (path: string, origin: string) =>
  new URL(path === "/" ? "/" : `${path}/`, origin).toString();
export const includeSitemapURL = (
  entry: { path: string; canonical?: string | null },
  origin: string,
) =>
  !entry.canonical ||
  entry.canonical === sitemapCanonicalURL(entry.path, origin);

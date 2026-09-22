import { projectionCache, publicProjectionError } from '@/content/projectionCache'
import config from "@payload-config";
import { getPayload } from "payload";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const payload = await getPayload({ config });
    const result = await projectionCache.read('redirects', () => payload.find({
      collection: "redirects",
      depth: 0,
      pagination: false,
      overrideAccess: false,
      where: { enabled: { equals: true } },
      sort: "sourcePath",
    }));
    return Response.json(
      {
        redirects: result.docs.map(
          ({ sourcePath, destinationPath, statusCode }) => ({
            sourcePath,
            destinationPath,
            status: Number(statusCode),
          }),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return publicProjectionError(error, 'redirects')
  }
}

import config from "@payload-config";
import { getPayload } from "payload";
import { notifyAndRecord } from "@/notifications/leadNotifications";
import { requireAdmin } from "@/lib/adminAuth";
export const dynamic = "force-dynamic";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getPayload({ config });
  const denied = await requireAdmin(payload, request.headers);
  if (denied) return denied;
  const { id } = await params;
  if (!/^\d+$/.test(id))
    return Response.json({ error: "Invalid lead." }, { status: 400 });
  try {
    const lead = await payload.findByID({
      collection: "leads",
      id,
      overrideAccess: true,
    });
    const result = await notifyAndRecord(payload, lead);
    return Response.json(
      {
        ok: true,
        status: result.notificationStatus,
        result: result.notificationResult,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Retry failed." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

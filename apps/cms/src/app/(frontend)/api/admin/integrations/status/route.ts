import { bookingReadiness } from '@/integrations/validation';
import config from "@payload-config";
import { getPayload } from "payload";
import { requireAdmin } from "@/lib/adminAuth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const denied = await requireAdmin(payload, request.headers);
  if (denied) return denied;
  const site = await payload.findGlobal({
    slug: "site-settings",
    draft: false,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  });
  const statusLabels = { disabled: 'Отключено', 'ready-external': 'Готово: внешняя ссылка', 'ready-widget': 'Готово: виджет VivaCRM', 'missing-config': 'Не настроено: проверьте поля интеграции', 'integration-not-implemented': 'Конфигурация найдена, сетевой адаптер ещё не реализован' };
  const integration = (value: Parameters<typeof bookingReadiness>[0]) => { const result = bookingReadiness(value); return { ready: result.ready, status: statusLabels[result.status] }; };
  return Response.json(
    {
      booking: integration(site.booking ?? {}),
      account: integration(site.account ?? {}),
      notifications: {
        telegram: Boolean(
          site.leadNotifications?.telegramEnabled &&
          (process.env.TELEGRAM_BOT_TOKEN ||
            site.leadNotifications.telegramBotToken) &&
          (process.env.TELEGRAM_CHAT_ID ||
            site.leadNotifications.telegramChatID),
        ),
        vk: Boolean(
          site.leadNotifications?.vkEnabled &&
          (process.env.VK_ACCESS_TOKEN ||
            site.leadNotifications.vkAccessToken) &&
          (process.env.VK_PEER_ID || site.leadNotifications.vkPeerID),
        ),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

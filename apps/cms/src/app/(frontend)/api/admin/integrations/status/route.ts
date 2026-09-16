import config from "@payload-config";
import { getPayload } from "payload";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user)
    return Response.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const site = await payload.findGlobal({
    slug: "site-settings",
    draft: false,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  });
  const booking = site.booking;
  const env = booking?.credentialEnvironmentVariable;
  const ready =
    booking?.mode === "external-link" ? Boolean(booking.externalURL) : false;
  const status =
    booking?.mode === "disabled"
      ? "Отключено"
      : booking?.mode === "external-link"
        ? ready
          ? "Готово: внешняя ссылка"
          : "Не настроено: укажите URL"
        : booking?.providerAdapter &&
            booking.providerAccountID &&
            env &&
            process.env[env]
          ? "Конфигурация найдена, но сетевой адаптер ещё не реализован"
          : "Не настроено: проверьте adapter, account ID и environment secret";
  return Response.json(
    {
      booking: { ready, status },
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

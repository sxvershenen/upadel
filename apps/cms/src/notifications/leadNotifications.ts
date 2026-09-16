import type { Payload } from "payload";
import type { Lead, SiteSetting } from "../payload-types";

type Delivery = {
  notificationStatus: Lead["notificationStatus"];
  notifiedAt: string | null;
  notificationResult: string;
};
export async function deliverOnlyForNewLead<T>(duplicate: boolean, deliver: () => Promise<T>): Promise<T | null> {
  return duplicate ? null : deliver();
}
const clean = (value: unknown) =>
  String(value ?? "")
    .replace(/[<>\r\n]+/g, " ")
    .slice(0, 300);
export function formatLeadNotificationMessage(lead: Lead): string {
  const source = [clean(lead.sourcePage), clean(lead.sourceEntity)].filter(Boolean).join(" · ");
  return [
    `Новое обращение: ${clean(lead.type)}`,
    `Имя: ${clean(lead.name)}`,
    lead.phone && `Телефон: ${clean(lead.phone)}`,
    lead.email && `Email: ${clean(lead.email)}`,
    lead.telegram && `Telegram: ${clean(lead.telegram)}`,
    lead.vk && `VK: ${clean(lead.vk)}`,
    `Источник: ${source}`,
  ]
    .filter(Boolean)
    .join("\n");
}
const timeoutFetch = async (
  url: string,
  init: RequestInit,
  fetcher: typeof fetch,
  timeoutMs: number,
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } finally {
    clearTimeout(timer);
  }
};

export async function deliverLeadNotifications(
  payload: Payload,
  lead: Lead,
  fetcher: typeof fetch = fetch,
  timeoutMs = 5_000,
): Promise<Delivery> {
  const site = (await payload.findGlobal({
    slug: "site-settings",
    draft: false,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  })) as SiteSetting;
  const cfg = site.leadNotifications;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN || cfg?.telegramBotToken;
  const telegramChat = process.env.TELEGRAM_CHAT_ID || cfg?.telegramChatID;
  const vkToken = process.env.VK_ACCESS_TOKEN || cfg?.vkAccessToken;
  const vkPeer = process.env.VK_PEER_ID || cfg?.vkPeerID;
  const tasks: Array<{ name: string; run: () => Promise<void> }> = [];
  const message = formatLeadNotificationMessage(lead);
  // Telegram requires the token in its Bot API path. The path is never logged, returned, or persisted.
  if (cfg?.telegramEnabled && telegramToken && telegramChat)
    tasks.push({
      name: "Telegram",
      run: () =>
        timeoutFetch(
          `https://api.telegram.org/bot${encodeURIComponent(telegramToken)}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: telegramChat, text: message }),
          },
          fetcher,
          timeoutMs,
        ),
    });
  if (cfg?.vkEnabled && vkToken && vkPeer)
    tasks.push({
      name: "VK",
      run: () =>
        timeoutFetch(
          "https://api.vk.com/method/messages.send",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              access_token: vkToken,
              peer_id: vkPeer,
              random_id: "0",
              message,
              v: cfg.vkAPIVersion || "5.199",
            }),
          },
          fetcher,
          timeoutMs,
        ),
    });
  if (!tasks.length)
    return {
      notificationStatus: "not-configured",
      notifiedAt: null,
      notificationResult: "Каналы уведомлений выключены или не настроены.",
    };
  const results = await Promise.all(
    tasks.map(async ({ name, run }) => {
      try {
        await run();
        return `${name}: отправлено`;
      } catch (error) {
        return `${name}: ${error instanceof DOMException && error.name === "AbortError" ? "таймаут" : "ошибка доставки"}`;
      }
    }),
  );
  const sent = results.filter((item) => item.endsWith("отправлено")).length;
  return {
    notificationStatus:
      sent === tasks.length ? "sent" : sent ? "partial" : "failed",
    notifiedAt: new Date().toISOString(),
    notificationResult: results.join("; ").slice(0, 500),
  };
}

export async function notifyAndRecord(
  payload: Payload,
  lead: Lead,
  fetcher: typeof fetch = fetch,
): Promise<Delivery> {
  const result = await deliverLeadNotifications(payload, lead, fetcher);
  await payload.update({
    collection: "leads",
    id: lead.id,
    overrideAccess: true,
    data: result,
  });
  return result;
}

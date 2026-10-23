import type { SiteDTO } from "@unlim/content-contract";
import { useEffect } from "react";
import { ANALYTICS_CONSENT_KEY } from "./identity";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
  }
}
const loaded = new Set<string>();
const initialized = new Set<string>();
export const shouldLoadExternalVendor = (consent: string | null, enabled: boolean, id?: string | null) => consent === "accepted" && enabled && Boolean(id);
export const shouldLoadMetricaScript = (analyticsEnabled: boolean, enabled: boolean, id?: string | null) => analyticsEnabled && enabled && Boolean(id);
export const shouldInitializeMetrica = (consent: string | null, analyticsEnabled: boolean, enabled: boolean, id?: string | null) => consent === "accepted" && shouldLoadMetricaScript(analyticsEnabled, enabled, id);
export const shouldReloadForVendorRevoke = (wasAccepted: boolean, vendorLoaded: boolean) => wasAccepted && vendorLoaded;
export const shouldInitializeVendor = (initializedKeys: ReadonlySet<string>, key: string) => !initializedKeys.has(key)
function loadScript(id: string, src: string) {
  if (loaded.has(id) || document.getElementById(id)) return;
  loaded.add(id);
  const node = document.createElement("script");
  node.id = id;
  node.async = true;
  node.src = src;
  document.head.appendChild(node);
}
function preloadScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const node = document.createElement("link");
  node.id = id;
  node.rel = "preload";
  node.as = "script";
  node.href = src;
  document.head.appendChild(node);
}

export function ExternalAnalytics({
  vendors,
  analyticsEnabled,
}: {
  vendors: SiteDTO["analytics"]["vendors"];
  analyticsEnabled: boolean;
}) {
  useEffect(() => {
    const metrica = vendors.yandexMetrica;
    if (!analyticsEnabled) return;
    if (shouldLoadMetricaScript(analyticsEnabled, metrica.enabled, metrica.counterId)) {
      preloadScript("unlim-yandex-metrica-preload", "https://mc.yandex.ru/metrika/tag.js");
    }

    const load = () => {
      const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
      if (
        shouldInitializeMetrica(consent, analyticsEnabled, metrica.enabled, metrica.counterId) &&
        shouldInitializeVendor(initialized, `ym:${metrica.counterId}`)
      ) {
        initialized.add(`ym:${metrica.counterId}`);
        window.ym ??= (...args: unknown[]) => {
          const queue = window.ym as unknown as { a?: unknown[] };
          queue.a ??= [];
          queue.a.push(args);
        };
        (window.ym as unknown as { l?: number }).l ??= Date.now();
        window.dataLayer ??= [];
        window.ym?.(Number(metrica.counterId), "init", {
          ssr: true,
          clickmap: true,
          ecommerce: "dataLayer",
          referrer: document.referrer,
          url: location.href,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: metrica.webvisor,
        });
        loadScript("unlim-yandex-metrica", "https://mc.yandex.ru/metrika/tag.js");
        let previousUrl = location.href;
        document.addEventListener("swup:page:view", () => {
          const referer = previousUrl;
          previousUrl = location.href;
          window.ym?.(Number(metrica.counterId), "hit", location.href, {
            title: document.title,
            referer,
          });
        });
      }
      const ga4 = vendors.ga4;
      if (
        shouldLoadExternalVendor(consent, ga4.enabled, ga4.measurementId) &&
        ga4.measurementId &&
        shouldInitializeVendor(initialized, `ga4:${ga4.measurementId}`)
      ) {
        initialized.add(`ga4:${ga4.measurementId}`);
        window.dataLayer ??= [];
        window.gtag ??= (...args: unknown[]) => window.dataLayer!.push(args);
        loadScript(
          "unlim-ga4",
          `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4.measurementId)}`,
        );
        window.gtag("js", new Date());
        window.gtag("config", ga4.measurementId);
      }
    };
    load();
    const consent = (event: Event) => {
      if ((event as CustomEvent).detail === "accepted") load();
    };
    addEventListener("unlim:analytics-consent", consent);
    return () => removeEventListener("unlim:analytics-consent", consent);
  }, [analyticsEnabled, vendors]);
  return null;
}

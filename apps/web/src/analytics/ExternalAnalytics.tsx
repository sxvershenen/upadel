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

export function ExternalAnalytics({
  vendors,
}: {
  vendors: SiteDTO["analytics"]["vendors"];
}) {
  useEffect(() => {
    const load = () => {
      if (localStorage.getItem(ANALYTICS_CONSENT_KEY) !== "accepted") return;
      const metrica = vendors.yandexMetrica;
      if (
        shouldLoadExternalVendor(localStorage.getItem(ANALYTICS_CONSENT_KEY), metrica.enabled, metrica.counterId) &&
        shouldInitializeVendor(initialized, `ym:${metrica.counterId}`)
      ) {
        initialized.add(`ym:${metrica.counterId}`);
        window.ym ??= (...args: unknown[]) => {
          const queue = window.ym as unknown as { a?: unknown[] };
          queue.a ??= [];
          queue.a.push(args);
        };
        loadScript(
          "unlim-yandex-metrica",
          "https://mc.yandex.ru/metrika/tag.js",
        );
        window.ym(Number(metrica.counterId), "init", {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: metrica.webvisor,
        });
      }
      const ga4 = vendors.ga4;
      if (
        shouldLoadExternalVendor(localStorage.getItem(ANALYTICS_CONSENT_KEY), ga4.enabled, ga4.measurementId) &&
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
  }, [vendors]);
  return null;
}

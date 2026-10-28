import type { SiteDTO } from "@unlim/content-contract";
import { initializeMetricaGoals } from "./metrica";
import { hasAnalyticsPreference, readAnalyticsPreferences, type AnalyticsPreferences } from "./consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
    __unlimYandexMetricaInitialized?: string;
  }
}
const loaded = new Set<string>();
const initialized = new Set<string>();
export const shouldLoadExternalVendor = (consent: boolean, enabled: boolean, id?: string | null) => consent && enabled && Boolean(id);
export const shouldLoadMetricaScript = (analyticsEnabled: boolean, enabled: boolean, id?: string | null) => analyticsEnabled && enabled && Boolean(id);
export const shouldInitializeMetrica = (_mode: SiteDTO["analytics"]["mode"], consent: AnalyticsPreferences | null, analyticsEnabled: boolean, enabled: boolean, id?: string | null) => hasAnalyticsPreference(consent, "yandexMetrica") && shouldLoadMetricaScript(analyticsEnabled, enabled, id);
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
export function initializeExternalAnalytics({
  vendors,
  analyticsEnabled,
  analyticsMode,
}: {
  vendors: SiteDTO["analytics"]["vendors"];
  analyticsEnabled: boolean;
  analyticsMode: SiteDTO["analytics"]["mode"];
}) {
    const cleanupGoals = initializeMetricaGoals({ mode: analyticsEnabled ? analyticsMode : 'disabled', vendors, endpoint: "", schemaVersion: 1 });
    const metrica = vendors.yandexMetrica;
    if (!analyticsEnabled) return cleanupGoals;
    const load = () => {
      const consent = readAnalyticsPreferences(localStorage);
      if (
        shouldInitializeMetrica(analyticsMode, consent, analyticsEnabled, metrica.enabled, metrica.counterId) &&
        shouldInitializeVendor(initialized, `ym:${metrica.counterId}`)
      ) {
        initialized.add(`ym:${metrica.counterId}`);
        if (window.__unlimYandexMetricaInitialized !== metrica.counterId) {
          window.ym ??= (...args: unknown[]) => {
            const queue = window.ym as unknown as { a?: unknown[] };
            queue.a ??= [];
            queue.a.push(args);
          };
          (window.ym as unknown as { l?: number }).l ??= Date.now();
          window.dataLayer ??= [];
          window.ym?.(Number(metrica.counterId), "init", {
            clickmap: true,
            ecommerce: "dataLayer",
            referrer: document.referrer,
            url: location.href,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: metrica.webvisor,
          });
          window.__unlimYandexMetricaInitialized = String(metrica.counterId);
          loadScript("unlim-yandex-metrica", "https://mc.yandex.ru/metrika/tag.js");
        }
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
        shouldLoadExternalVendor(hasAnalyticsPreference(consent, "ga4"), ga4.enabled, ga4.measurementId) &&
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
    const consent = () => load();
    addEventListener("unlim:analytics-consent", consent);
    return () => { cleanupGoals(); removeEventListener("unlim:analytics-consent", consent); };
}

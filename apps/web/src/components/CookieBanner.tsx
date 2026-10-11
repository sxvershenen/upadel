import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Settings2 } from "lucide-react";
import { springSheet } from "../lib/motion";
import { Button, IconButton } from "./ui/Button";
import { CheckboxField } from "./ui/CheckboxField";
import { useSite } from "../content/ContentContext";
import { ANALYTICS_CONSENT_KEY, resetAnalyticsStorage } from "../analytics/identity";
import { shouldReloadForVendorRevoke } from "../analytics/ExternalAnalytics";

export function CookieBanner() {
  const site = useSite();
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (site.analytics.mode !== "consent-required") return;
    if (!localStorage.getItem(ANALYTICS_CONSENT_KEY)) {
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, [site.analytics.mode]);

  useEffect(() => {
    const openSettings = () => {
      setAnalyticsEnabled(false);
      setSettingsOpen(true);
      setVisible(true);
    };
    window.addEventListener("unlim:open-cookie-settings", openSettings);
    return () => window.removeEventListener("unlim:open-cookie-settings", openSettings);
  }, []);

  function accept() {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
    window.dispatchEvent(new CustomEvent("unlim:analytics-consent", { detail: "accepted" }));
    setVisible(false);
    setSettingsOpen(false);
  }

  function reject() {
    const hadAcceptedVendors = shouldReloadForVendorRevoke(
      localStorage.getItem(ANALYTICS_CONSENT_KEY) === "accepted",
      Boolean(document.getElementById("unlim-yandex-metrica") || document.getElementById("unlim-ga4")),
    );
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "rejected");
    resetAnalyticsStorage(localStorage);
    window.dispatchEvent(new CustomEvent("unlim:analytics-consent", { detail: "rejected" }));
    setVisible(false);
    setSettingsOpen(false);
    if (hadAcceptedVendors) window.location.reload();
  }

  function saveSettings() {
    if (analyticsEnabled) accept();
    else reject();
  }

  function toggleSettings() {
    if (!settingsOpen) setAnalyticsEnabled(false);
    setSettingsOpen((open) => !open);
  }

  if (site.analytics.mode !== "consent-required") return null;

  const noticeText = site.footer.cookieNotice.text;

  const settingsPanel = (id: string) => (
    <AnimatePresence initial={false}>
      {settingsOpen && (
        <motion.div
          id={id}
          role="region"
          aria-label="Настройки cookies"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="mt-3 border-t border-white/15 pt-3">
            <CheckboxField
              tone="inverse"
              controlPosition="end"
              labelSize="caption"
              reveal={false}
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
              label={<span>Разрешить аналитику <span className="mt-0.5 block text-white/50">Статистика посещений.</span></span>}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={springSheet}
            className="fixed inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 mx-auto hidden max-w-[680px] sm:block md:bottom-6"
          >
            <div className="se-3 flex flex-col items-start gap-4 bg-ink px-5 py-4 text-white sm:flex-row sm:items-start">
              <span className="se-1 mt-0.5 flex h-9 w-9 shrink-0 items-start justify-center bg-white/10 pt-1">
                <Cookie size={17} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-line font-sans text-[12px] leading-[1.45] text-white/80">{noticeText}</p>
                {settingsPanel("cookie-desktop-settings")}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="neutral"
                  size="sm"
                  icon={<Settings2 size={15} />}
                  iconPosition="left"
                  iconDivider={false}
                  aria-expanded={settingsOpen}
                  aria-controls="cookie-desktop-settings"
                  onClick={toggleSettings}
                >
                  {site.footer.cookieNotice.rejectLabel}
                </Button>
                <Button variant="primary" size="sm" onClick={settingsOpen ? saveSettings : accept}>
                  {settingsOpen ? "ОК" : site.footer.cookieNotice.acceptLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-0 top-[calc(var(--page-gutter)+env(safe-area-inset-top))] z-50 mx-auto w-full max-w-[var(--container-page)] px-[var(--page-gutter)] sm:hidden"
          >
            <div className="se-3 bg-ink px-5 py-4 text-white shadow-xl">
              <p className="whitespace-pre-line font-sans text-[12px] leading-[1.45] text-white/80">
                {noticeText}
              </p>
              {settingsPanel("cookie-mobile-settings")}
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <IconButton
                variant="neutral"
                size="sm"
                aria-label="Настройки cookies"
                aria-expanded={settingsOpen}
                aria-controls="cookie-mobile-settings"
                onClick={toggleSettings}
                className="bg-ink text-white hover:bg-ink-hover"
              >
                <Settings2 aria-hidden="true" size={16} />
              </IconButton>
              <Button variant="primary" size="sm" reveal={false} onClick={settingsOpen ? saveSettings : accept}>
                ОК
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function CookiePreferencesButton() {
  const site = useSite();
  if (site.analytics.mode !== "consent-required") return null;
  return <button type="button" onClick={() => window.dispatchEvent(new Event("unlim:open-cookie-settings"))} className="transition-colors hover:text-white/70">{site.footer.cookieNotice.manageLabel}</button>;
}

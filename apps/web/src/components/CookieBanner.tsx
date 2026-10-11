import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Settings2 } from "lucide-react";
import { springSheet } from "../lib/motion";
import { Button } from "./ui/Button";
import { useSite } from "../content/ContentContext";
import { ANALYTICS_CONSENT_KEY, resetAnalyticsStorage } from '../analytics/identity'
import { shouldReloadForVendorRevoke } from '../analytics/ExternalAnalytics'

export function CookieBanner() {
  const site = useSite();
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  useEffect(() => {
    if (site.analytics.mode !== 'consent-required') return
    const stored = localStorage.getItem(ANALYTICS_CONSENT_KEY)
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, [site.analytics.mode]);

  useEffect(() => {
    const openSettings = () => {
      setAnalyticsEnabled(localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted')
      setSettingsOpen(window.matchMedia('(max-width: 639px)').matches)
      setVisible(true)
    }
    window.addEventListener('unlim:open-cookie-settings', openSettings)
    return () => window.removeEventListener('unlim:open-cookie-settings', openSettings)
  }, [])

  function accept() {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
    window.dispatchEvent(new CustomEvent('unlim:analytics-consent', { detail: 'accepted' }))
    setVisible(false);
  }

  function reject() {
    const hadAcceptedVendors = shouldReloadForVendorRevoke(localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted', Boolean(document.getElementById('unlim-yandex-metrica') || document.getElementById('unlim-ga4')))
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'rejected')
    resetAnalyticsStorage(localStorage)
    window.dispatchEvent(new CustomEvent('unlim:analytics-consent', { detail: 'rejected' }))
    setVisible(false)
    if (hadAcceptedVendors) window.location.reload()
  }

  function saveMobileChoice() {
    if (analyticsEnabled) accept()
    else reject()
    setSettingsOpen(false)
  }

  if (site.analytics.mode !== 'consent-required') return null

  const noticeText = site.analytics.vendors.yandexMetrica.enabled
    ? `${site.footer.cookieNotice.text} При согласии загружается Яндекс.Метрика.`
    : site.footer.cookieNotice.text

  return (
    <>
      <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={springSheet}
          className="fixed inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 mx-auto hidden max-w-[560px] sm:block md:bottom-6"
        >
          <div className="se-3 flex flex-col items-start gap-4 bg-ink px-5 py-4 text-white sm:flex-row sm:items-center">
            <span className="se-1 flex h-9 w-9 shrink-0 items-center justify-center bg-white/10">
              <Cookie size={17} />
            </span>
            <p className="type-body-sm flex-1 leading-snug text-white/70">
              {noticeText}
            </p>
            <div className="flex shrink-0 flex-wrap gap-2"><Button variant="neutral" size="sm" onClick={reject}>{site.footer.cookieNotice.rejectLabel}</Button><Button variant="primary" size="sm" onClick={accept}>{site.footer.cookieNotice.acceptLabel}</Button></div>
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
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed right-3 top-[calc(76px+env(safe-area-inset-top))] z-50 w-[min(292px,calc(100vw-24px))] sm:hidden"
          >
            <div className="se-3 bg-ink p-3 text-white shadow-xl">
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 text-[12px] leading-[1.4] text-white/75">
                  {site.footer.cookieNotice.text} Не хотите обработки данных? Измените настройки браузера.
                </p>
                <button
                  type="button"
                  aria-label="Настройки cookies"
                  aria-expanded={settingsOpen}
                  aria-controls="cookie-mobile-settings"
                  onClick={() => {
                    if (!settingsOpen) setAnalyticsEnabled(localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted')
                    setSettingsOpen((open) => !open)
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/10 text-white/80 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime"
                >
                  <Settings2 aria-hidden="true" size={16} />
                </button>
                <Button variant="primary" size="sm" reveal={false} onClick={settingsOpen ? saveMobileChoice : accept} className="h-8 min-w-10 px-3 text-[12px]">
                  ОК
                </Button>
              </div>

              <AnimatePresence initial={false}>
                {settingsOpen && (
                  <motion.div
                    id="cookie-mobile-settings"
                    role="region"
                    aria-label="Настройки cookies"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 border-t border-white/15 pt-3">
                      <p className="mb-2 text-[11px] font-semibold text-white">Настройки cookies</p>
                      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-white/85">
                        <input
                          type="checkbox"
                          checked={analyticsEnabled}
                          onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                          className="h-4 w-4 accent-lime"
                        />
                        Разрешить аналитику
                      </label>
                      <p className="mt-2 text-[10px] leading-snug text-white/55">
                        Необходимые cookies нужны для работы сайта. Отключить cookies можно в настройках браузера.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function CookiePreferencesButton() {
  const site = useSite()
  if (site.analytics.mode !== 'consent-required') return null
  return <button type="button" onClick={() => window.dispatchEvent(new Event('unlim:open-cookie-settings'))} className="transition-colors hover:text-white/70">{site.footer.cookieNotice.manageLabel}</button>
}

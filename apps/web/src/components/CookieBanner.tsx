import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { springSheet } from "../lib/motion";
import { Button } from "./ui/Button";
import { useSite } from "../content/ContentContext";
import { ANALYTICS_CONSENT_KEY, resetAnalyticsStorage } from '../analytics/identity'
import { shouldReloadForVendorRevoke } from '../analytics/ExternalAnalytics'

export function CookieBanner() {
  const site = useSite();
  const [visible, setVisible] = useState(false);
  const [hasChoice, setHasChoice] = useState(false)

  useEffect(() => {
    if (site.analytics.mode !== 'consent-required') return
    const stored = localStorage.getItem(ANALYTICS_CONSENT_KEY)
    setHasChoice(Boolean(stored))
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, [site.analytics.mode]);

  function accept() {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
    window.dispatchEvent(new CustomEvent('unlim:analytics-consent', { detail: 'accepted' }))
    setHasChoice(true)
    setVisible(false);
  }

  function reject() {
    const hadAcceptedVendors = shouldReloadForVendorRevoke(localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted', Boolean(document.getElementById('unlim-yandex-metrica') || document.getElementById('unlim-ga4')))
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'rejected')
    resetAnalyticsStorage(localStorage)
    window.dispatchEvent(new CustomEvent('unlim:analytics-consent', { detail: 'rejected' }))
    setHasChoice(true)
    setVisible(false)
    if (hadAcceptedVendors) window.location.reload()
  }

  if (site.analytics.mode !== 'consent-required') return null

  return (
    <><AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={springSheet}
          className="fixed inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 mx-auto max-w-[560px] md:bottom-6"
        >
          <div className="se-3 flex flex-col items-start gap-4 bg-ink px-5 py-4 text-white sm:flex-row sm:items-center">
            <span className="se-1 flex h-9 w-9 shrink-0 items-center justify-center bg-white/10">
              <Cookie size={17} />
            </span>
            <p className="type-body-sm flex-1 leading-snug text-white/70">
              {site.footer.cookieNotice.text}
            </p>
            <div className="flex shrink-0 flex-wrap gap-2"><Button variant="neutral" size="sm" onClick={reject}>{site.footer.cookieNotice.rejectLabel}</Button><Button variant="primary" size="sm" onClick={accept}>{site.footer.cookieNotice.acceptLabel}</Button></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>{hasChoice && !visible && <button type="button" onClick={() => setVisible(true)} className="fixed bottom-[calc(82px+env(safe-area-inset-bottom))] left-3 z-30 rounded-full bg-white/90 px-3 py-2 type-caption text-ink backdrop-blur md:bottom-3" aria-label={site.footer.cookieNotice.manageLabel}>{site.footer.cookieNotice.manageLabel}</button>}</>
  );
}

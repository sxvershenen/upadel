import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { springSheet } from "../lib/motion";
import { Button } from "./ui/Button";
import { useSite } from "../content/ContentContext";
import { ANALYTICS_CONSENT_KEY } from "../analytics/identity";
import { cookieNoticeParts } from "./cookieNoticeText";

export function CookieBanner() {
  const site = useSite();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (site.analytics.mode !== "consent-required") return;
    if (!localStorage.getItem(ANALYTICS_CONSENT_KEY)) setVisible(true);
  }, [site.analytics.mode]);

  function accept() {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
    window.dispatchEvent(new CustomEvent("unlim:analytics-consent", { detail: "accepted" }));
    setVisible(false);
  }

  if (site.analytics.mode !== "consent-required") return null;

  const { before, linked, after } = cookieNoticeParts(site.footer.cookieNotice.text);
  const privacyHref = site.footer.legalLinks.find(({ label, href }) => /политик/i.test(label) || href === "/policy")?.href ?? "/policy";
  const notice = <>{before}{linked && <a href={privacyHref} className="font-medium text-lime underline decoration-lime/40 underline-offset-2 transition-colors hover:text-lime-hover hover:decoration-lime focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2">{linked}</a>}{after}</>;

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
                <p className="whitespace-pre-line font-sans text-[12px] leading-[1.45] text-white/80">{notice}</p>
              </div>
              <div className="flex shrink-0">
                <Button variant="primary" size="sm" onClick={accept}>
                  {site.footer.cookieNotice.acceptLabel}
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
              <p className="whitespace-pre-line font-sans text-[12px] leading-[1.45] text-white/80">{notice}</p>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="primary" size="sm" reveal={false} onClick={accept}>
                {site.footer.cookieNotice.acceptLabel}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

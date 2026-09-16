import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { springSheet } from "../lib/motion";
import { Button } from "./ui/Button";

const KEY = "unlim-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(KEY, "accepted");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={springSheet}
          className="fixed inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 mx-auto max-w-[560px] md:bottom-6"
        >
          <div className="se-3 flex flex-col items-start gap-4 bg-ink px-5 py-4 text-white shadow-card-lg sm:flex-row sm:items-center">
            <span className="se-1 flex h-9 w-9 shrink-0 items-center justify-center bg-white/10">
              <Cookie size={17} />
            </span>
            <p className="type-body-sm flex-1 leading-snug text-white/70">
              Используем cookies, чтобы бронирование и подбор тренировок работали быстрее.
            </p>
            <Button variant="primary" size="sm" onClick={accept} className="shrink-0">
              Хорошо
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

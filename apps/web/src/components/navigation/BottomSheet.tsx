import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const presenceVariants = {
  closed: { opacity: 0.999, transition: { when: "afterChildren" as const, duration: 0.01 } },
  open: { opacity: 1, transition: { when: "beforeChildren" as const, duration: 0.01 } },
};
const backdropVariants = {
  closed: { opacity: 0, transition: { duration: 0.2 } },
  open: { opacity: 1, transition: { duration: 0.2 } },
};
const sheetVariants = {
  closed: { y: "100%", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const } },
  open: { y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const } },
};

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch || dialogRef.current?.scrollTop !== 0) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (deltaY > 64 && deltaY > Math.abs(deltaX) * 1.25) onClose();
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={presenceVariants}
          className="fixed inset-0 z-[70] md:hidden"
        >
          <motion.button
            data-cool-mode="off"
            type="button"
            aria-label="Закрыть"
            variants={backdropVariants}
            onClick={onClose}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : "Диалог"}
            onKeyDown={trapFocus}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            variants={sheetVariants}
            className="se-sheet absolute inset-x-0 bottom-0 z-10 max-h-[82svh] overflow-x-hidden overflow-y-auto bg-white pb-[calc(24px+env(safe-area-inset-bottom))] pt-3"
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ink/15" />
            <div className="flex items-center justify-between px-6 pb-2 pt-2">
              <span id={title ? titleId : undefined} className="type-title-card font-semibold text-ink">{title}</span>
              <motion.button
                ref={closeRef}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label="Закрыть"
                className="se-1 flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-control text-ink focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
              >
                <X size={16} />
              </motion.button>
            </div>
            <div className="px-6 pt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

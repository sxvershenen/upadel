import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { IconButton } from "./Button";

const presenceVariants = {
  closed: { opacity: 0.999, transition: { when: "afterChildren" as const, duration: 0.01 } },
  open: { opacity: 1, transition: { when: "beforeChildren" as const, duration: 0.01 } },
};
const backdropVariants = {
  closed: { opacity: 0, transition: { duration: 0.22 } },
  open: { opacity: 1, transition: { duration: 0.2 } },
};
const surfaceVariants = {
  closed: { opacity: 0, y: 28, transition: { duration: 0.26, ease: [0.4, 0, 1, 1] as const } },
  open: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Dialog({ open, onClose, title, children, scrollable = true, mobileTall = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; scrollable?: boolean; mobileTall?: boolean }) {
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
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", escape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled):not([tabindex="-1"]), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    const scroller = dialogRef.current?.querySelector<HTMLElement>('.dialog-scroll');
    if (!start || !touch || (scroller?.scrollTop ?? 0) > 0) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (deltaY > 64 && deltaY > Math.abs(deltaX) * 1.25) onClose();
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence initial={false}>
      {open && <motion.div initial="closed" animate="open" exit="closed" variants={presenceVariants} className="fixed inset-0 z-[100] flex items-end justify-center p-0 md:items-center md:p-6">
        <motion.button data-cool-mode="off" type="button" aria-label="Закрыть диалог" onClick={onClose} variants={backdropVariants} className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]" />
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={trapFocus}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          variants={surfaceVariants}
          className={`dialog-surface relative z-10 flex w-full flex-col overflow-hidden bg-white md:max-w-[780px] md:p-6 ${mobileTall ? 'max-h-[100svh] p-4 pt-3 md:max-h-[96svh]' : scrollable ? 'max-h-[92svh] p-5 md:max-h-[96svh]' : 'max-h-none p-5'}`}
        >
          <div className="mx-auto mb-2 h-1.5 w-10 shrink-0 rounded-full bg-ink/15 md:hidden" />
          <div className={`${mobileTall ? 'mb-3' : 'mb-4'} flex shrink-0 items-start justify-between gap-4 md:mb-5`}>
            <h2 id={titleId} className="type-title-card text-ink">{title}</h2>
            <IconButton ref={closeRef} data-cool-mode="off" size="sm" aria-label="Закрыть" onClick={onClose}><X size={17} /></IconButton>
          </div>
          <div className={scrollable ? "dialog-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1" : "overflow-visible"}>{children}</div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>,
    document.body,
  );
}

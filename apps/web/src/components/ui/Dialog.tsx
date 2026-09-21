import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { IconButton } from "./Button";

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
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

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence initial={false}>
      {open && <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 md:items-center md:p-6">
        <motion.button data-cool-mode="off" type="button" aria-label="Закрыть диалог" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]" />
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={trapFocus}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          exit={{ y: 16 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="dialog-surface relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden bg-white p-5 md:max-h-[96svh] md:max-w-[780px] md:p-6"
        >
          <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
            <h2 id={titleId} className="type-title-card text-ink">{title}</h2>
            <IconButton ref={closeRef} data-cool-mode="off" size="sm" aria-label="Закрыть" onClick={onClose}><X size={17} /></IconButton>
          </div>
          <div className="dialog-scroll min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
        </motion.div>
      </div>}
    </AnimatePresence>,
    document.body,
  );
}

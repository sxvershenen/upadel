import { useId, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { springSoft } from "../../lib/motion";
import { cn } from "../../utils/cn";

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const instanceId = useId();

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const isOpen = open === i;
        const triggerId = `${instanceId}-trigger-${i}`;
        const panelId = `${instanceId}-panel-${i}`;
        return (
          <div
            key={`${item.q}-${i}`}
            data-reveal
            style={{ "--reveal-delay": `${i * 0.05}s`, "--reveal-y": "14px" } as CSSProperties}
            className="border-b border-ink/10 first:border-t"
          >
            <button
              id={triggerId}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2"
            >
              <span className="type-body font-medium text-ink">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={springSoft}
                className={cn(
                  "se-1 flex h-8 w-8 shrink-0 items-center justify-center",
                  isOpen ? "bg-ink text-white" : "bg-control text-ink",
                )}
              >
                <Plus size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={springSoft}
                  className="overflow-hidden"
                >
                  <p className="type-body-sm pb-5 pr-10 text-ink-soft">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

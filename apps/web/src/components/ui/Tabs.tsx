import React, { useId, useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { springLayout } from "../../lib/motion";
import { springSnappy, tapScaleSm } from "../../lib/motion";
import { cn } from "../../utils/cn";

export function Tabs<T extends string>({ tabs, value, onChange, className, fullWidth = false, layoutId = "tab-indicator", "aria-label": ariaLabel = "Разделы" }: {
  tabs: { id: T; label: string; panelId?: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  fullWidth?: boolean;
  layoutId?: string;
  "aria-label"?: string;
}) {
  const instanceId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const indicatorId = `${layoutId}-${instanceId}`;

  function selectAt(index: number) {
    const next = (index + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") { event.preventDefault(); selectAt(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); selectAt(index - 1); }
    if (event.key === "Home") { event.preventDefault(); selectAt(0); }
    if (event.key === "End") { event.preventDefault(); selectAt(tabs.length - 1); }
  }

  return <div role="tablist" aria-label={ariaLabel} className={cn("se-2 inline-flex max-w-full items-center gap-1 overflow-x-auto bg-control p-1", fullWidth && "w-full [&>button]:flex-1 [&>button]:text-center", className)}>
    {tabs.map((tab, index) => {
      const active = tab.id === value;
      return <motion.button
        key={tab.id}
        ref={(node) => { refs.current[index] = node; }}
        role="tab"
        type="button"
        aria-selected={active}
        aria-controls={tab.panelId}
        tabIndex={active ? 0 : -1}
        onClick={() => onChange(tab.id)}
        onKeyDown={(event) => handleKeyDown(event, index)}
        whileHover={{ y: -1 }}
        whileTap={tapScaleSm}
        transition={springSnappy}
        className={cn("se-1 type-ui relative shrink-0 px-4 py-2.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2", active ? "text-white" : "text-ink-soft hover:text-ink")}
      >
        {active && <motion.span layoutId={indicatorId} className="se-1 absolute inset-0 bg-ink" transition={springLayout} />}
        <span className="relative z-10">{tab.label}</span>
      </motion.button>;
    })}
  </div>;
}

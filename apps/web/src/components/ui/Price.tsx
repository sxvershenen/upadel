import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + "\u00A0₽";
}

export interface PriceProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  value: number | string;
  oldValue?: number | string;
  suffix?: ReactNode;
  tone?: "dark" | "light";
  size?: "compact" | "standard";
}

function display(value: number | string) { return typeof value === "number" ? formatRub(value) : value; }

export function Price({ label, value, oldValue, suffix, tone = "dark", size = "standard", className, ...props }: PriceProps) {
  const light = tone === "light";
  return <div className={cn("flex flex-col gap-0.5", className)} {...props}>
    {label && <span className={cn("type-caption", light ? "text-white/60" : "text-ink-soft")}>{label}</span>}
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={cn(size === "standard" ? "type-price" : "type-title-dense", "font-semibold", light ? "text-white" : "text-ink")}>{display(value)}</span>
      {oldValue !== undefined && <span className={cn("type-ui line-through", light ? "text-white/50" : "text-ink-soft/60")}>{display(oldValue)}</span>}
      {suffix && <span className={cn("type-ui", light ? "text-white/60" : "text-ink-soft")}>{suffix}</span>}
    </div>
  </div>;
}

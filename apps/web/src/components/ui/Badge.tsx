import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export type BadgeTone = "dark" | "light" | "lime" | "lime-soft" | "sunset" | "gold" | "muted" | "glass" | "outline-light" | "outline-dark";

const toneClasses: Record<BadgeTone, string> = {
  dark: "bg-ink text-white",
  light: "bg-white text-ink",
  lime: "bg-lime text-lime-ink",
  "lime-soft": "bg-lime-soft text-lime-soft-ink",
  sunset: "bg-sunset-soft text-sunset-soft-ink",
  gold: "bg-gold text-gold-ink",
  muted: "bg-surface-muted text-ink-soft",
  glass: "glass-overlay text-white",
  "outline-light": "glass-overlay text-white",
  "outline-dark": "bg-surface-muted text-ink-soft",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

export function Badge({
  children,
  tone = "light",
  icon,
  className,
  ...nativeProps
}: BadgeProps) {
  return (
    <span
      className={cn(
        "se-1 type-caption inline-flex self-start items-center gap-1.5 whitespace-nowrap px-3 py-1.5 font-medium leading-none",
        toneClasses[tone],
        className,
      )}
      {...nativeProps}
    >
      {icon}
      {children}
    </span>
  );
}

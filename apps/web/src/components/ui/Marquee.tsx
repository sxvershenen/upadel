import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Marquee({
  children,
  className,
  reverse,
  gapClass,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  gapClass?: string;
}) {
  const gap = gapClass ?? "gap-10";
  const trackPadding = gap === "gap-4 md:gap-7" ? "pr-4 md:pr-7" : "pr-10";
  return (
    <div className={cn("no-scrollbar relative flex overflow-hidden", className)}>
      <div
        className={cn("flex min-w-max shrink-0 animate-marquee items-center", gap, trackPadding)}
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn("flex min-w-max shrink-0 animate-marquee items-center", gap, trackPadding)}
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

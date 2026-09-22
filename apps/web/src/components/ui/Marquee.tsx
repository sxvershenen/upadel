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
  const copies = Array.from({ length: 4 });
  return (
    <div className={cn("no-scrollbar relative flex overflow-hidden", className)}>
      <div
        className="flex w-max min-w-max shrink-0 animate-marquee"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {copies.map((_, index) => <div key={index} aria-hidden={index > 0} inert={index > 0 ? true : undefined} className={cn("flex shrink-0 items-center", gap, trackPadding)}>{children}</div>)}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { SplitTextReveal } from "./SplitTextReveal";

export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
  titleClassName,
  light,
  actionClassName,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  light?: boolean;
  actionClassName?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span
            className={cn(
              "type-eyebrow font-medium",
              light ? "text-white/60" : "text-ink-muted",
            )}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={cn(
            "type-section font-semibold",
            light ? "text-white" : "text-ink",
            titleClassName,
          )}
        >
          {typeof title === "string" ? <SplitTextReveal text={title} /> : title}
        </h2>
      </div>
      {action && <div className={cn("ml-auto flex shrink-0 items-center gap-3", actionClassName)}>{action}</div>}
    </div>
  );
}

import React, { type ReactNode } from "react";
import type { ActionDTO } from "@unlim/content-contract";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { ContentAction } from "../ContentAction";
import { SplitTextReveal } from "./SplitTextReveal";

export function SectionAction({ action, children, className }: { action: ActionDTO; children?: ReactNode; className?: string }) {
  return <ContentAction action={action} variant="neutral" size="sm" icon={<ArrowUpRight size={15} />} iconDivider={false} className={cn("text-ink-soft hover:text-ink", className)}>{children ?? action.label}</ContentAction>;
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
  titleClassName,
  titleId,
  light,
  actionClassName,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  titleId?: string;
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
          id={titleId}
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

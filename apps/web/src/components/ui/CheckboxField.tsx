import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";
import { revealAttributes, type RevealConfig } from "./revealAttributes";

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: ReactNode;
  labelSize?: "body" | "caption";
  tone?: "default" | "inverse";
  controlPosition?: "start" | "end";
  reveal?: RevealConfig;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(({ label, error, labelSize = "body", tone = "default", controlPosition = "start", reveal = true, className, ...props }, ref) => <div {...revealAttributes(reveal)}>
  <label className={cn(labelSize === "caption" ? "type-caption" : "type-body-sm", "flex cursor-pointer items-center gap-3", controlPosition === "end" && "flex-row-reverse justify-between", tone === "inverse" ? "text-white/80" : "text-ink-soft")}>
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      <input ref={ref} type="checkbox" className={cn("peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0", className)} {...props} />
      <span aria-hidden="true" className={cn("se-1 flex h-5 w-5 items-center justify-center text-lime-ink transition-colors peer-checked:bg-lime peer-checked:[&>svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2", tone === "inverse" ? "border border-white/20 bg-white/10 peer-focus-visible:outline-lime" : "bg-control peer-focus-visible:outline-focus")}>
        <Check size={13} strokeWidth={3} className="opacity-0 transition-opacity" />
      </span>
    </span>
    <span>{label}</span>
  </label>
  {error && <p role="alert" className="type-caption mt-1.5 text-danger">{error}</p>}
</div>);
CheckboxField.displayName = "CheckboxField";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  description?: ReactNode;
  error?: ReactNode;
  suffix?: ReactNode;
  tone?: "light" | "dark";
  fieldClassName?: string;
  containerClassName?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ id: suppliedId, label, description, error, suffix, tone = "light", className, fieldClassName, containerClassName, disabled, "aria-describedby": suppliedDescribedBy, "aria-invalid": suppliedInvalid, ...nativeProps }, ref) => {
    const generatedId = useId();
    const id = suppliedId ?? `field-${generatedId}`;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [suppliedDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") || undefined;
    const dark = tone === "dark";

    return <div className={cn("flex flex-col", containerClassName)}>
      <label htmlFor={id} className={cn("type-caption mb-2 font-medium", dark ? "text-white/70" : "text-ink-soft")}>{label}</label>
      <div className={cn(
        "se-2 flex h-[var(--control-md)] items-center gap-2 border px-4 transition-colors focus-within:border-[var(--color-focus)] focus-within:ring-2 focus-within:ring-[var(--color-focus)]/20",
        dark ? "border-white/20 bg-white/10 text-white" : "border-ink/10 bg-white text-ink",
        error && (dark ? "border-red-300" : "border-[var(--color-danger)]"),
        disabled && "cursor-not-allowed opacity-50",
        fieldClassName,
      )}>
        <input ref={ref} id={id} disabled={disabled} aria-invalid={error ? true : suppliedInvalid} aria-describedby={describedBy} className={cn("type-ui w-full bg-transparent font-medium outline-none placeholder:opacity-45 disabled:cursor-not-allowed", dark ? "text-white" : "text-ink", className)} {...nativeProps} />
        {suffix && <span className={cn("type-ui shrink-0 font-medium", dark ? "text-white/60" : "text-ink-soft")}>{suffix}</span>}
      </div>
      {description && <p id={descriptionId} className={cn("type-caption mt-1.5", dark ? "text-white/55" : "text-ink-soft")}>{description}</p>}
      {error && <p id={errorId} role="alert" className={cn("type-caption mt-1.5", dark ? "text-red-200" : "text-danger")}>{error}</p>}
    </div>;
  },
);
Field.displayName = "Field";

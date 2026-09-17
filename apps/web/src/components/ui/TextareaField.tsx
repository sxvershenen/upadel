import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: ReactNode;
  error?: ReactNode;
  tone?: "light" | "dark";
  labelVisibility?: "visible" | "sr-only";
  containerClassName?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ id: suppliedId, label, description, error, tone = "light", labelVisibility = "visible", className, containerClassName, disabled, "aria-describedby": suppliedDescribedBy, "aria-invalid": suppliedInvalid, ...nativeProps }, ref) => {
    const generatedId = useId();
    const id = suppliedId ?? `textarea-${generatedId}`;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [suppliedDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") || undefined;
    const dark = tone === "dark";

    return <div className={cn("flex flex-col", containerClassName)}>
      <label htmlFor={id} className={cn("type-caption mb-2 font-medium", labelVisibility === "sr-only" && "sr-only", dark ? "text-white/70" : "text-ink-soft")}>{label}</label>
      <textarea
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={error ? true : suppliedInvalid}
        aria-describedby={describedBy}
        className={cn(
          "se-2 min-h-24 w-full resize-y bg-control px-4 py-3 type-ui font-medium outline-none placeholder:text-ink-soft/75 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          dark ? "bg-white/10 text-white placeholder:text-white/65" : "text-ink",
          error && (dark ? "outline-2 outline-red-300" : "outline-2 outline-[var(--color-danger)]"),
          className,
        )}
        {...nativeProps}
      />
      {description && <p id={descriptionId} className={cn("type-caption mt-1.5", dark ? "text-white/55" : "text-ink-soft")}>{description}</p>}
      {error && <p id={errorId} role="alert" className={cn("type-caption mt-1.5", dark ? "text-red-200" : "text-danger")}>{error}</p>}
    </div>;
  },
);
TextareaField.displayName = "TextareaField";

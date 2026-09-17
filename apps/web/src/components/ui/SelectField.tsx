import { ChevronDown } from "lucide-react";
import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { revealAttributes, type RevealConfig } from "./revealAttributes";

export type SelectFieldOption = { value: string; label: string };

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label: string;
  options: SelectFieldOption[];
  description?: ReactNode;
  error?: ReactNode;
  labelVisibility?: "visible" | "sr-only";
  containerClassName?: string;
  reveal?: RevealConfig;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ id: suppliedId, label, options, description, error, labelVisibility = "visible", reveal = true, className, containerClassName, disabled, "aria-describedby": suppliedDescribedBy, "aria-invalid": suppliedInvalid, ...nativeProps }, ref) => {
    const generatedId = useId();
    const id = suppliedId ?? `select-${generatedId}`;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [suppliedDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    return <div {...revealAttributes(reveal)} className={cn("flex flex-col", containerClassName)}>
      <label htmlFor={id} className={cn("type-caption mb-2 font-medium text-ink-soft", labelVisibility === "sr-only" && "sr-only")}>{label}</label>
      <div className={cn("se-2 relative flex h-[var(--control-md)] items-center bg-control text-ink transition-colors focus-within:outline-2 focus-within:outline-[var(--color-focus)] focus-within:outline-offset-2", error && "outline-2 outline-[var(--color-danger)]", disabled && "cursor-not-allowed opacity-50")}>
        <select ref={ref} id={id} disabled={disabled} aria-invalid={error ? true : suppliedInvalid} aria-describedby={describedBy} className={cn("h-full w-full appearance-none bg-transparent px-4 pr-10 type-ui font-medium outline-none disabled:cursor-not-allowed", className)} {...nativeProps}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" size={17} className="pointer-events-none absolute right-3.5 text-ink-soft" />
      </div>
      {description && <p id={descriptionId} className="type-caption mt-1.5 text-ink-soft">{description}</p>}
      {error && <p id={errorId} role="alert" className="type-caption mt-1.5 text-danger">{error}</p>}
    </div>;
  },
);
SelectField.displayName = "SelectField";

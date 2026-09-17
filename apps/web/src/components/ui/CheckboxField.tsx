import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: ReactNode;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(({ label, error, className, ...props }, ref) => <div>
  <label className="type-body-sm flex cursor-pointer items-start gap-3 text-ink-soft">
    <input ref={ref} type="checkbox" className={cn("mt-1 h-5 w-5 shrink-0 accent-lime", className)} {...props} />
    <span>{label}</span>
  </label>
  {error && <p role="alert" className="type-caption mt-1.5 text-danger">{error}</p>}
</div>);
CheckboxField.displayName = "CheckboxField";

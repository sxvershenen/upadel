import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: ReactNode;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(({ label, error, className, ...props }, ref) => <div>
  <label className="type-body-sm flex cursor-pointer items-start gap-3 text-ink-soft">
    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
      <input ref={ref} type="checkbox" className={cn("peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0", className)} {...props} />
      <span aria-hidden="true" className="se-1 flex h-5 w-5 items-center justify-center bg-control text-lime-ink transition-colors peer-checked:bg-lime peer-checked:[&>svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2">
        <Check size={13} strokeWidth={3} className="opacity-0 transition-opacity" />
      </span>
    </span>
    <span className="pt-0.5">{label}</span>
  </label>
  {error && <p role="alert" className="type-caption mt-1.5 text-danger">{error}</p>}
</div>);
CheckboxField.displayName = "CheckboxField";

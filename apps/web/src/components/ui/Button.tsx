import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../utils/cn";
import { springSnappy, tapScale } from "../../lib/motion";

export type ButtonVariant = "primary" | "secondary" | "neutral" | "glass" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-lime text-lime-ink hover:bg-lime-hover",
  secondary: "bg-white text-ink hover:bg-white/90",
  neutral: "bg-control text-ink hover:bg-control-hover",
  glass: "glass text-white hover:bg-white/20",
  dark: "bg-ink text-white hover:bg-ink-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-[var(--control-sm)] gap-1.5 px-4 type-ui",
  md: "h-[var(--control-md)] gap-2 px-5 type-ui",
  lg: "h-[var(--control-lg)] gap-2.5 px-7 type-body",
};

const baseClasses = "se-2 relative inline-flex select-none items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

type SharedButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  iconDivider?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children">, SharedButtonProps { children?: ReactNode; }

function ButtonContents({ children, icon, iconPosition = "right", iconDivider = true, loading, iconOnly = false }: Pick<ButtonProps, "children" | "icon" | "iconPosition" | "iconDivider" | "loading" | "iconOnly">) {
  const renderedIcon = loading ? <LoaderCircle aria-hidden="true" size={17} className="animate-spin" /> : icon;
  if (iconOnly) return <span className="inline-flex shrink-0 items-center justify-center">{renderedIcon}</span>;
  return <>
    {renderedIcon && iconPosition === "left" && <><span className="inline-flex shrink-0 items-center justify-center">{renderedIcon}</span>{iconDivider && <span aria-hidden="true" className="h-5 w-px shrink-0 bg-current/25" />}</>}
    <span>{children}</span>
    {renderedIcon && iconPosition === "right" && <span className="inline-flex shrink-0 items-center gap-2.5">{iconDivider && <span aria-hidden="true" className="h-5 w-px shrink-0 bg-current/25" />}<span className="inline-flex shrink-0 items-center justify-center">{renderedIcon}</span></span>}
  </>;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", icon, iconPosition, iconDivider, fullWidth, loading = false, iconOnly, className, children, disabled, type = "button", ...nativeProps }, ref) => {
    const unavailable = disabled || loading;
    return <motion.button ref={ref} type={type} disabled={unavailable} aria-busy={loading || undefined} whileHover={unavailable ? undefined : { scale: 1.025 }} whileTap={unavailable ? undefined : tapScale} transition={springSnappy} className={cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)} {...nativeProps}>
      <ButtonContents icon={icon} iconPosition={iconPosition} iconDivider={iconDivider} loading={loading} iconOnly={iconOnly}>{children}</ButtonContents>
    </motion.button>;
  },
);
Button.displayName = "Button";

export interface ButtonLinkProps extends Omit<HTMLMotionProps<"a">, "children">, Omit<SharedButtonProps, "loading"> { children?: ReactNode; }

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ variant = "primary", size = "md", icon, iconPosition, iconDivider, fullWidth, iconOnly, className, children, ...nativeProps }, ref) => <motion.a ref={ref} data-button-link="true" whileHover={{ scale: 1.025 }} whileTap={tapScale} transition={springSnappy} className={cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)} {...nativeProps}>
    <ButtonContents icon={icon} iconPosition={iconPosition} iconDivider={iconDivider} iconOnly={iconOnly}>{children}</ButtonContents>
  </motion.a>,
);
ButtonLink.displayName = "ButtonLink";

export interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> { variant?: ButtonVariant; size?: "sm" | "md"; children?: ReactNode; }

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "neutral", size = "md", children, disabled, type = "button", ...nativeProps }, ref) => <motion.button ref={ref} type={type} disabled={disabled} whileHover={disabled ? undefined : { scale: 1.05 }} whileTap={disabled ? undefined : tapScale} transition={springSnappy} className={cn("se-2 inline-flex shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-35", size === "sm" ? "h-[var(--control-sm)] w-[var(--control-sm)]" : "h-[var(--control-md)] w-[var(--control-md)]", variantClasses[variant], className)} {...nativeProps}>{children}</motion.button>,
);
IconButton.displayName = "IconButton";

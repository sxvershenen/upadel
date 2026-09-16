import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { springSnappy, tapScale } from "../../lib/motion";

export function ArrowAction({
  tone = "dark",
  size = "md",
  className,
  cardHover = false,
}: {
  tone?: "dark" | "light" | "glass";
  size?: "sm" | "md";
  className?: string;
  cardHover?: boolean;
}) {
  const toneClasses = {
    dark: "bg-ink text-white hover:bg-lime hover:text-ink",
    light: "bg-white text-ink shadow-card hover:bg-lime hover:text-ink",
    glass: "glass-overlay text-white hover:bg-lime hover:text-ink",
  }[tone];
  const cardHoverClasses = cardHover ? "group-hover/card:!bg-lime group-hover/card:!text-ink" : "";
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        "arrow-action se-2 inline-flex shrink-0 items-center justify-center transition-colors",
        dim,
        toneClasses,
        cardHoverClasses,
        className,
      )}
      whileHover={cardHover ? undefined : { scale: 1.08, rotate: 8 }}
      whileTap={cardHover ? undefined : tapScale}
      transition={springSnappy}
    >
      <ArrowUpRight size={size === "sm" ? 16 : 18} strokeWidth={2} />
    </motion.span>
  );
}

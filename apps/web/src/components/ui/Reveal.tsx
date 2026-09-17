import React, { type ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";
import { springSoft } from "../../lib/motion";

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...springSoft, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { springSoft } from "../../lib/motion";
import { useSsrReveal } from "./useSsrReveal";

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  fade = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  fade?: boolean;
}) {
  const { ref, controls } = useSsrReveal<HTMLDivElement>("-80px", false);

  return (
    <motion.div
      ref={ref}
      initial="visible"
      animate={controls}
      variants={{ hidden: { opacity: fade ? 0 : 1, y }, show: { opacity: 1, y: 0 } }}
      transition={{ ...springSoft, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

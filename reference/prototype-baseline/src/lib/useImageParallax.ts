import { useScroll, useTransform, type MotionValue } from "framer-motion";
import type { RefObject } from "react";

/**
 * Returns a vertical travel percentage relative to the moving layer.
 * Pair 11% with `.parallax-layer` and 17% with `.parallax-layer-wide` so the
 * image keeps at least a 3% container-height safety margin at both extremes.
 */
export function useImageParallax(ref: RefObject<HTMLElement | null>, distance = 11): MotionValue<string> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return useTransform(scrollYProgress, [0, 1], [`-${distance}%`, `${distance}%`]);
}

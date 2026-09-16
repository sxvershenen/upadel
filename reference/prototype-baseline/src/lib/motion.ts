import type { Transition } from "framer-motion";

/** System spring — fast, precise, slightly elastic. Not cartoon bounce. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.8,
};

export const springLayout: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

export const springSheet: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 32,
  mass: 1,
};

export const tapScale = { scale: 0.97 };
export const tapScaleSm = { scale: 0.98 };

export const revealUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { ...springSoft, delay: 0 } },
};

export const revealContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

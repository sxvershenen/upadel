import type { CSSProperties } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Mousewheel } from "swiper/modules";

/** Horizontal gestures leave vertical scrolling free; the release snaps with a spring curve. */
export const horizontalSwiperProps = {
  modules: [Mousewheel],
  grabCursor: true,
  touchStartPreventDefault: false,
  speed: 520,
  style: {
    "--swiper-wrapper-transition-timing-function": "cubic-bezier(.2, 1.25, .35, 1)",
  } as CSSProperties,
  onBeforeInit: (swiper: SwiperType) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) swiper.params.speed = 0;
  },
  mousewheel: {
    forceToAxis: true,
    releaseOnEdges: true,
    sensitivity: 0.8,
    thresholdDelta: 4,
    thresholdTime: 40,
  },
};

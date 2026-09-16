import { Mousewheel } from "swiper/modules";

/** Horizontal trackpad/touch behavior that releases vertical page scrolling. */
export const horizontalSwiperProps = {
  modules: [Mousewheel],
  grabCursor: true,
  touchStartPreventDefault: false,
  mousewheel: {
    forceToAxis: true,
    releaseOnEdges: true,
    sensitivity: 0.8,
    thresholdDelta: 4,
    thresholdTime: 40,
  },
};

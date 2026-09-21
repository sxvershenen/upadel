import { useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

export function useMobileSwipeHint(swiperRef: { current: SwiperType | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.matchMedia("(max-width: 1023px)").matches || navigator.maxTouchPoints > 0) return;

    let played = false;
    let forwardTimer: number | undefined;
    let returnTimer: number | undefined;
    let transitionResetTimer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const swiper = swiperRef.current;
        if (!entry.isIntersecting || played || !swiper || swiper.slides.length < 2) return;

        played = true;
        const startTranslate = swiper.getTranslate();
        const hintDistance = Math.min(180, Math.max(130, swiper.width * 0.45));
        forwardTimer = window.setTimeout(() => {
          swiper.setTransition(650);
          swiper.setTranslate(startTranslate - hintDistance);
          returnTimer = window.setTimeout(() => {
            swiper.setTransition(650);
            swiper.setTranslate(startTranslate);
            transitionResetTimer = window.setTimeout(() => swiper.setTransition(0), 680);
          }, 820);
        }, 250);
      },
      { threshold: 0.45 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (forwardTimer) window.clearTimeout(forwardTimer);
      if (returnTimer) window.clearTimeout(returnTimer);
      if (transitionResetTimer) window.clearTimeout(transitionResetTimer);
    };
  }, [swiperRef]);

  return containerRef;
}

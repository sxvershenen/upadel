import { useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

export function useMobileSwipeHint(swiperRef: { current: SwiperType | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.matchMedia("(max-width: 1023px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let played = false;
    let forwardTimer: number | undefined;
    let returnTimer: number | undefined;
    let transitionResetTimer: number | undefined;
    let retryTimer: number | undefined;
    let retries = 0;
    let visible = false;

    const play = () => {
      const swiper = swiperRef.current;
      if (!visible || played) return;
      if (!swiper || swiper.slides.length < 2) {
        if (retries < 25) {
          retries += 1;
          retryTimer = window.setTimeout(play, 80);
        }
        return;
      }

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
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) play();
      },
      { threshold: 0.45 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (forwardTimer) window.clearTimeout(forwardTimer);
      if (returnTimer) window.clearTimeout(returnTimer);
      if (transitionResetTimer) window.clearTimeout(transitionResetTimer);
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [swiperRef]);

  return containerRef;
}

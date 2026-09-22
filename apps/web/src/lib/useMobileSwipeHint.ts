import { useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

/** A visual nudge that never changes Swiper's translate or active slide. */
export function useMobileSwipeHint(swiperRef: { current: SwiperType | null }, hintKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.matchMedia("(max-width: 1023px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let played = false;
    let visible = false;
    let retryTimer: number | undefined;
    let finishTimer: number | undefined;
    let retries = 0;

    const stop = () => {
      played = true;
      window.clearTimeout(retryTimer);
      window.clearTimeout(finishTimer);
      container.classList.remove("swiper-hint-playing");
    };

    const play = () => {
      if (!visible || played) return;
      const swiper = swiperRef.current;
      if (!swiper?.initialized || swiper.slides.length < 2) {
        if (retries++ < 25) retryTimer = window.setTimeout(play, 80);
        return;
      }

      played = true;
      container.classList.add("swiper-hint-playing");
      finishTimer = window.setTimeout(() => container.classList.remove("swiper-hint-playing"), 1450);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
    }, { threshold: 0.45 });

    observer.observe(container);
    container.addEventListener("pointerdown", stop, { capture: true, passive: true });
    return () => {
      observer.disconnect();
      container.removeEventListener("pointerdown", stop, true);
      stop();
    };
  }, [hintKey, swiperRef]);

  return containerRef;
}

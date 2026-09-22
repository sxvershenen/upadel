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
    let wrapper: HTMLElement | null = null;
    let retries = 0;

    const finish = (event: AnimationEvent) => {
      if (event.target !== wrapper || event.animationName !== "swiper-swipe-hint") return;
      container.classList.remove("swiper-hint-playing");
      wrapper?.removeEventListener("animationend", finish);
    };

    const stop = () => {
      played = true;
      window.clearTimeout(retryTimer);
      wrapper?.removeEventListener("animationend", finish);
      container.classList.remove("swiper-hint-playing");
    };

    const play = () => {
      if (!visible || played) return;
      const swiper = swiperRef.current;
      wrapper = container.querySelector(":scope > .swiper > .swiper-wrapper");
      if (!swiper?.initialized || swiper.slides.length < 2 || !wrapper) {
        if (retries++ < 25) retryTimer = window.setTimeout(play, 80);
        return;
      }

      played = true;
      wrapper.addEventListener("animationend", finish);
      container.classList.add("swiper-hint-playing");
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
    }, { threshold: 0.45 });

    observer.observe(container);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [hintKey, swiperRef]);

  return containerRef;
}

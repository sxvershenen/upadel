import { useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

const playedSwipeHints = new Set<string>();

export function useMobileSwipeHint(swiperRef: { current: SwiperType | null }, hintKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || playedSwipeHints.has(hintKey) || !window.matchMedia("(max-width: 1023px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let played = false;
    let forwardTimer: number | undefined;
    let returnTimer: number | undefined;
    let transitionResetTimer: number | undefined;
    let retryTimer: number | undefined;
    let retries = 0;
    let visible = false;

    const clearHintTimers = () => {
      if (forwardTimer) window.clearTimeout(forwardTimer);
      if (returnTimer) window.clearTimeout(returnTimer);
      if (transitionResetTimer) window.clearTimeout(transitionResetTimer);
      if (retryTimer) window.clearTimeout(retryTimer);
      forwardTimer = undefined;
      returnTimer = undefined;
      transitionResetTimer = undefined;
      retryTimer = undefined;
    };

    const stopHintForInteraction = () => {
      clearHintTimers();
      const swiper = swiperRef.current;
      if (!swiper) return;
      const transform = getComputedStyle(swiper.wrapperEl).transform;
      const match = transform.match(/^matrix(3d)?\((.+)\)$/);
      const values = match?.[2]?.split(',').map(Number);
      const renderedTranslate = values ? values[match?.[1] ? 12 : 4] : swiper.getTranslate();
      swiper.setTransition(0);
      swiper.setTranslate(Number.isFinite(renderedTranslate) ? renderedTranslate : swiper.getTranslate());
      swiper.updateProgress();
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
      swiper.allowClick = true;
      played = true;
      playedSwipeHints.add(hintKey);
    };

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
      playedSwipeHints.add(hintKey);
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
    // Cancel before Swiper handles the same pointer. In the bubble phase the
    // hint transition and the user's drag can both write wrapper transforms.
    container.addEventListener('pointerdown', stopHintForInteraction, { capture: true, passive: true });

    return () => {
      observer.disconnect();
      container.removeEventListener('pointerdown', stopHintForInteraction, true);
      clearHintTimers();
    };
  }, [hintKey, swiperRef]);

  return containerRef;
}

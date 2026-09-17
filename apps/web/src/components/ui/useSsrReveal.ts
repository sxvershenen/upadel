import { useEffect, useRef } from "react";
import { useAnimationControls } from "framer-motion";

export function useSsrReveal<T extends HTMLElement>(margin = "-80px", disabled = false) {
  const ref = useRef<T>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let disposed = false;

    const showImmediately = () => {
      observer?.disconnect();
      controls.stop();
      controls.set("show");
    };

    const onPreferenceChange = () => {
      if (preference.matches) showImmediately();
    };

    preference.addEventListener("change", onPreferenceChange);

    const rect = element.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;

    if (!disabled && !preference.matches && !visible && element.getClientRects().length > 0 && "IntersectionObserver" in window) {
      try {
        observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();

          if (preference.matches) {
            showImmediately();
          } else {
            void controls.start("show").catch(() => {
              if (!disposed) showImmediately();
            });
          }
        }, { rootMargin: Math.min(window.innerWidth, window.innerHeight) <= 160 ? "0px" : margin });

        observer.observe(element);
        controls.set("hidden");
      } catch {
        showImmediately();
      }
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      preference.removeEventListener("change", onPreferenceChange);
      controls.stop();
    };
  }, [controls, disabled, margin]);

  return { ref, controls };
}

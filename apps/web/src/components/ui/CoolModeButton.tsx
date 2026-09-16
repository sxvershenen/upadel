import { useEffect, type ReactNode } from "react";

function spawnCoolBalls(originX: number, originY: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const count = 4;
  for (let i = 0; i < count; i += 1) {
    const ball = document.createElement("span");
    ball.className = "cool-ball";
    ball.dataset.coolParticle = "true";
    ball.style.position = "fixed";
    ball.style.left = `${originX}px`;
    ball.style.top = `${originY}px`;
    ball.style.zIndex = "9999";
    ball.style.willChange = "transform, opacity";
    document.body.appendChild(ball);

    const vx = (Math.random() - 0.5) * 220;
    const initialVy = -70 - Math.random() * 90;
    const gravity = 150 + Math.random() * 100;
    const rotate = (Math.random() - 0.5) * 520;
    const duration = 950 + Math.random() * 450;
    ball.dataset.coolDuration = `${Math.round(duration)}`;
    const point = (progress: number) => {
      const x = vx * progress;
      const y = initialVy * progress + gravity * progress * progress;
      return `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotate * progress}deg) scale(${progress < 0.15 ? 0.35 + progress * 4.33 : 1 - Math.max(0, progress - 0.72) * 0.5})`;
    };

    const animation = ball.animate(
      [
        { transform: point(0), opacity: 0, offset: 0 },
        { transform: point(0.12), opacity: 1, offset: 0.12 },
        { transform: point(0.55), opacity: 1, offset: 0.55 },
        { transform: point(0.78), opacity: 0.88, offset: 0.78 },
        { transform: point(1), opacity: 0, offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.18,.7,.25,1)", fill: "forwards" },
    );
    animation.onfinish = () => ball.remove();
    animation.oncancel = () => ball.remove();
  }
}

/** One delegated listener for native buttons and ButtonLink. */
export function CoolModeEffects() {
  useEffect(() => {
    function burst(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const action = target?.closest<HTMLElement>('button, a[data-button-link="true"]');
      if (!action || action.dataset.coolMode === "off") return;
      if (action instanceof HTMLButtonElement && action.disabled) return;
      if (action.getAttribute("aria-disabled") === "true") return;

      const rect = action.getBoundingClientRect();
      const keyboardActivation = event.detail === 0 || (event.clientX === 0 && event.clientY === 0);
      const x = keyboardActivation ? rect.left + rect.width / 2 : event.clientX;
      const y = keyboardActivation ? rect.top + rect.height / 2 : event.clientY;
      spawnCoolBalls(x, y);
    }

    document.addEventListener("click", burst, true);
    return () => document.removeEventListener("click", burst, true);
  }, []);

  return null;
}

/** @deprecated Cool Mode is global. Use data-cool-mode="off" to opt out. */
export function CoolModeButton({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

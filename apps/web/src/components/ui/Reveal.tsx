import React from "react";
import type { CSSProperties, ReactNode } from "react";

export function Reveal({
  children,
  delay,
  y = 26,
  className,
  fade = true,
  eager = false,
  scope = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  fade?: boolean;
  eager?: boolean;
  scope?: boolean;
}) {
  const style = { "--gsap-reveal-delay": `${delay ?? 0}s`, "--gsap-reveal-y": `${y}px` } as CSSProperties;
  return <div data-gsap-reveal="true" data-gsap-reveal-scope={scope ? "true" : undefined} data-gsap-reveal-delay-explicit={delay === undefined ? undefined : "true"} data-gsap-reveal-eager={eager ? "true" : undefined} data-gsap-reveal-fade={fade ? undefined : "false"} data-gsap-reveal-y={y} style={style} className={className}>{children}</div>;
}

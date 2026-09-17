import type { CSSProperties, ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  fade = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  fade?: boolean;
}) {
  const style = { "--gsap-reveal-delay": `${delay}s`, "--gsap-reveal-y": `${y}px` } as CSSProperties;
  return <div data-gsap-reveal="true" data-gsap-reveal-fade={fade ? undefined : "false"} data-gsap-reveal-y={y} style={style} className={className}>{children}</div>;
}

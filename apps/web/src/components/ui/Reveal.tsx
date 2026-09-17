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
  const style = { "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` } as CSSProperties;
  return <div data-reveal={true} data-reveal-fade={fade ? undefined : "false"} style={style} className={className}>{children}</div>;
}

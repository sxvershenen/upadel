import type { MediaDTO } from '@unlim/content-contract'
import React, { useRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";
import { springSoft } from "../../lib/motion";
import { useImageParallax } from "../../lib/useImageParallax";
import { revealAttributes, type RevealConfig } from "./revealAttributes";
import { ProgressiveImage } from "./ProgressiveImage";

const cardVariants = { rest: { y: 0, scale: 1 }, hover: { y: -5, scale: 1.012 } };
const imageVariants = { rest: { scale: 1.04 }, hover: { scale: 1.095 } };

const meshMap = {
  indigo: "mesh-indigo", "deep-blue": "mesh-deep-blue", dark: "mesh-dark", lime: "mesh-lime", "lime-soft": "mesh-lime-soft", sky: "mesh-sky", lavender: "mesh-lavender", sunset: "mesh-sunset", "navy-gold": "mesh-navy-gold",
} as const;
export type MeshTone = keyof typeof meshMap;

const meshTextTone: Record<MeshTone, string> = {
  indigo: "text-white", "deep-blue": "text-white", dark: "text-white", "navy-gold": "text-white", lavender: "text-white", lime: "text-[#2a4a06]", "lime-soft": "text-[#2a4a06]", sky: "text-[#0b3a5c]", sunset: "text-[#7c2d12]",
};

type SurfaceCardProps = HTMLMotionProps<"div"> & {
  tone?: "white" | "glass" | MeshTone;
  interactive?: boolean;
  reveal?: RevealConfig;
};

export function SurfaceCard({ tone = "white", interactive = true, reveal = true, className, children, style, ...props }: SurfaceCardProps) {
  const isMesh = tone in meshMap;
  const toneClass = tone === "white" ? "bg-white text-ink" : tone === "glass" ? "glass text-white" : cn("relative isolate overflow-hidden", meshMap[tone as MeshTone], meshTextTone[tone as MeshTone]);
  const revealProps = revealAttributes(reveal, style, true);
  return <motion.div
    {...props}
    {...revealProps}
    data-gsap-reveal-boundary="true"
    initial={interactive ? "rest" : undefined}
    whileHover={interactive ? "hover" : undefined}
    variants={interactive ? cardVariants : undefined}
    transition={interactive ? springSoft : undefined}
    className={cn("group/card se-3", interactive && "card-spring cursor-pointer", isMesh && "group/mesh", toneClass, className)}
  >{children}</motion.div>;
}

export function WhiteCard({ className, children, as: _as, interactive = true, ...props }: HTMLMotionProps<"div"> & { as?: "div"; interactive?: boolean; reveal?: RevealConfig }) {
  return <SurfaceCard tone="white" interactive={interactive} className={className} {...props}>{children}</SurfaceCard>;
}

export function MeshCard({ tone, className, children, interactive = true, ...props }: Omit<SurfaceCardProps, "tone"> & { tone: MeshTone }) {
  return <SurfaceCard tone={tone} interactive={interactive} className={className} {...props}>{children}</SurfaceCard>;
}

export function GlassCard({ className, children, interactive = true, ...props }: Omit<SurfaceCardProps, "tone">) {
  return <SurfaceCard tone="glass" interactive={interactive} className={cn("transform-gpu", className)} {...props}>{children}</SurfaceCard>;
}

/** @deprecated Use MeshCard tone="dark". */
export function DarkMeshCard(props: Omit<SurfaceCardProps, "tone">) {
  return <MeshCard tone="dark" {...props} />;
}

export type ImageOverlay = "overlay-lime" | "overlay-blue" | "overlay-cyan" | "overlay-violet" | "overlay-sunset" | "overlay-emerald" | "overlay-dark";
export interface ImageCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  media?: MediaDTO | null;
  sizes?: string;
  src: string;
  alt: string;
  overlay: ImageOverlay;
  imgClassName?: string;
  children?: ReactNode;
  interactive?: boolean;
  loading?: "eager" | "lazy";
}

/** Full-bleed image card with a mandatory colorized overlay. */
export function ImageCard({ src, alt, media, sizes = "(min-width: 1024px) 50vw, 100vw", overlay, className, children, imgClassName, interactive = true, loading = "lazy", reveal = true, style, ...props }: ImageCardProps & { loading?: "eager" | "lazy"; reveal?: RevealConfig }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageY = useImageParallax(imageRef, interactive ? 11 : 0);
  const revealProps = revealAttributes(reveal, style, true);
  return <motion.div
    {...props}
    {...revealProps}
    data-gsap-reveal-boundary="true"
    data-image-card="true"
    initial={interactive ? "rest" : undefined}
    whileHover={interactive ? "hover" : undefined}
    variants={interactive ? cardVariants : undefined}
    transition={interactive ? springSoft : undefined}
    className={cn("group/card group se-3 relative isolate flex flex-col overflow-hidden text-white", interactive && "card-spring cursor-pointer", className)}
  >
    <div ref={imageRef} data-parallax-viewport className="parallax-viewport absolute inset-0 z-0">
      <motion.div
        initial={interactive ? { clipPath: "inset(0 0 12% 0)" } : undefined}
        whileInView={interactive ? { clipPath: "inset(0 0 0% 0)" } : undefined}
        viewport={interactive ? { once: true, amount: 0.2 } : undefined}
        transition={interactive ? { duration: 0.9, ease: [0.22, 1, 0.36, 1] } : undefined}
        style={interactive ? { y: imageY } : undefined}
        data-parallax-layer
        className="parallax-layer overflow-hidden"
      >
        <ProgressiveImage media={media} sizes={sizes} src={src} alt={alt} loading={loading} className={cn("h-full w-full object-cover", imgClassName)} variants={interactive ? imageVariants : undefined} transition={springSoft} />
      </motion.div>
    </div>
    <div data-image-overlay={overlay} className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
    <div className="relative z-10 flex h-full flex-col">{children}</div>
  </motion.div>;
}

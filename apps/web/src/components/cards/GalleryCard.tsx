import type { MediaDTO } from '@unlim/content-contract'
import { useRef } from "react";
import { motion } from "framer-motion";
import { springSoft } from "../../lib/motion";
import { useImageParallax } from "../../lib/useImageParallax";
import { revealAttributes, type RevealConfig } from "../ui/revealAttributes";
import { ProgressiveImage } from "../ui/ProgressiveImage";

export function GalleryCard({ src, media, alt = "Момент из жизни клуба", onOpen, reveal = true }: { src: string; media?: MediaDTO; alt?: string; onOpen?: () => void; reveal?: RevealConfig }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageY = useImageParallax(imageRef, 11);
  return <motion.button type="button" aria-label={onOpen ? `Открыть изображение: ${alt}` : undefined} disabled={!onOpen} onClick={onOpen} {...revealAttributes(reveal, undefined, true)} initial="rest" whileHover={onOpen ? "hover" : "rest"} variants={{ rest: { y: 0, scale: 1 }, hover: { y: -4, scale: 1.012 } }} transition={springSoft} className={`card-spring se-3 h-[190px] w-[240px] shrink-0 overflow-hidden text-left md:h-[250px] md:w-[320px] ${onOpen ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2" : "cursor-default"}`}>
    <div ref={imageRef} data-parallax-viewport className="parallax-viewport relative h-full w-full"><motion.div data-parallax-layer style={{ y: imageY }} className="parallax-layer overflow-hidden"><ProgressiveImage media={media} sizes="(min-width: 768px) 320px, 240px" src={src} alt={alt} loading="lazy" variants={{ rest: { scale: 1.08 }, hover: { scale: 1.16 } }} transition={springSoft} className="h-full w-full object-cover" /></motion.div></div>
  </motion.button>;
}

import { useRef } from "react";
import { motion } from "framer-motion";
import { springSoft } from "../../lib/motion";
import { useImageParallax } from "../../lib/useImageParallax";

export function GalleryCard({ src, alt = "Момент из жизни клуба" }: { src: string; alt?: string }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageY = useImageParallax(imageRef, 11);
  return <motion.div initial="rest" whileHover="hover" variants={{ rest: { y: 0, scale: 1 }, hover: { y: -4, scale: 1.012 } }} transition={springSoft} className="card-spring se-3 h-[190px] w-[240px] shrink-0 overflow-hidden md:h-[250px] md:w-[320px]">
    <div ref={imageRef} data-parallax-viewport className="parallax-viewport relative h-full w-full"><motion.div data-parallax-layer style={{ y: imageY }} className="parallax-layer overflow-hidden"><motion.img src={src} alt={alt} loading="lazy" variants={{ rest: { scale: 1.08 }, hover: { scale: 1.16 } }} transition={springSoft} className="h-full w-full object-cover" /></motion.div></div>
  </motion.div>;
}

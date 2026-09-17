import { useRef } from "react";
import { motion } from "framer-motion";
import { CourtCard } from "../components/cards/CourtCards";
import { useContent } from "../content/ContentContext";
import { useImageParallax } from "../lib/useImageParallax";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SplitTextReveal } from "../components/ui/SplitTextReveal";

const columnClasses = {
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
} as const;
const cardDelays = [0, 0.08, 0.12, 0.16];

export function Courts() {
  const { home, entities } = useContent();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const backgroundY = useImageParallax(backgroundRef, 17);
  return <section className="relative overflow-hidden py-24 md:py-32">
    <div ref={backgroundRef} data-parallax-viewport className="parallax-viewport absolute inset-0"><motion.div data-parallax-layer style={{ y: backgroundY }} className="parallax-layer-wide overflow-hidden">{home.courtsSection.background && <img src={home.courtsSection.background.url} alt={home.courtsSection.backgroundAlt} className="h-full w-full scale-110 object-cover" />}</motion.div></div>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,10,.82)_0%,rgba(4,6,10,.72)_45%,rgba(4,6,10,.86)_100%)]" />
    <div className="container-page relative z-10">
      <Reveal><SectionHeader light title={<><SplitTextReveal text={home.courtsSection.titleLineOne} className="block" /><SplitTextReveal text={home.courtsSection.titleLineTwo} className="block" /></>} className="mb-12" /></Reveal>
      <div className="grid gap-4 lg:grid-cols-12">{entities.courts.map((court, index) => { const columns = court.cardVariant === "panoramic" ? 7 : court.cardVariant === "metrics" ? 5 : 6; return <Reveal key={court.id} delay={cardDelays[index]} className={columnClasses[columns]}><CourtCard court={court} /></Reveal> })}</div>
    </div>
  </section>;
}

import { Compass } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "../components/ui/Reveal";
import { ContentAction } from "../components/ContentAction";
import { useContent } from "../content/ContentContext";
import { ArrowAction } from "../components/ui/ArrowAction";
import { springSoft } from "../lib/motion";

const meshClasses: Record<string, string> = {
  indigo: "mesh-indigo", "deep-blue": "mesh-deep-blue", dark: "mesh-dark", lime: "mesh-lime",
  "lime-soft": "mesh-lime-soft", sky: "mesh-sky", lavender: "mesh-lavender", sunset: "mesh-sunset", "navy-gold": "mesh-navy-gold",
};

export function MethodistBanner() {
  const { home } = useContent();
  const banner = home.methodistBanner;
  return (
    <section className="container-page pb-20 md:pb-28">
      <Reveal>
        <motion.div initial="rest" whileHover="hover" variants={{ rest: { y: 0, scale: 1 }, hover: { y: -5, scale: 1.012 } }} transition={springSoft} className={`se-4 ${meshClasses[banner.meshTone] ?? "mesh-lavender"} relative isolate flex flex-col overflow-hidden p-6 text-white md:p-8`}>
          <motion.img
            src={banner.decorativeMedia?.url}
            alt=""
            aria-hidden="true"
            variants={{ rest: { scale: 1, rotate: 0, y: 0 }, hover: { scale: 1.05, rotate: 4, y: -7 } }}
            transition={springSoft}
            className="pointer-events-none absolute -bottom-28 right-[-8%] z-0 h-[230px] w-auto opacity-95 md:right-[10%] md:h-[290px]"
          />
          <span className="se-1 absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center bg-white/15 md:right-8 md:top-8">
            <Compass size={20} />
          </span>
          <div className="relative z-10 flex max-w-[720px] flex-col gap-4 pr-14 md:pr-20">
            <h3 className="type-title-large font-semibold text-white">
              {banner.title}
            </h3>
            <p className="type-body-sm text-white/70">
              {banner.description}
            </p>
          </div>
          <ContentAction action={banner.action} variant="secondary" size="lg" className="absolute bottom-8 right-8 z-10 hidden !bg-white !text-ink hover:!bg-white md:flex" />
          <ArrowAction
            tone="glass"
            size="md"
            className="absolute bottom-6 right-6 z-10 !bg-white/15 !text-white md:hidden"
          />
        </motion.div>
      </Reveal>
    </section>
  );
}

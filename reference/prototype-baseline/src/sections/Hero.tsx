import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { CalendarCheck, Play, Star, Users } from "lucide-react";
import { images } from "../data/images";
import { Button } from "../components/ui/Button";
import { SplitTextReveal } from "../components/ui/SplitTextReveal";
import { revealContainer, revealUp } from "../lib/motion";
import { springSoft } from "../lib/motion";
import { cn } from "../utils/cn";

gsap.registerPlugin(ScrollTrigger);

const heroCtaReveal = (delay: number) => ({
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { ...springSoft, delay } },
});

function SocialProof({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...revealUp.show.transition, delay: 0.4 }}
      className={cn("glass-overlay se-3 flex min-h-[52px] items-center gap-3 px-3.5 py-2 text-white", className)}
    >
      <div className="flex -space-x-2.5">
        {[images.coach1, images.coach2, images.coach3].map((src, i) => (
          <img key={i} src={src} alt="" className="h-8 w-8 rounded-full object-cover" />
        ))}
      </div>
      <div className="h-7 w-px bg-white/20" />
      <div className="flex flex-col gap-0.5">
        <div className="type-caption flex items-center gap-1 font-semibold text-white">
          <Star size={12} className="fill-[#c2f542] text-[#c2f542]" />
          4.9 · 500+ игроков
        </div>
        <div className="type-micro flex items-center gap-1 text-white/60">
          <Users size={11} /> Рейтинг клуба на Новой Риге
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !sectionRef.current || !imgRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { scale: 1.08 },
        {
          scale: 1.28,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="top" ref={sectionRef} className="relative h-[100svh] min-h-[720px] w-full overflow-hidden bg-ink">
      <img
        ref={imgRef}
        src={images.hero}
        alt="Игрок в падел выполняет удар на панорамном корте"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(3,5,8,.98) 0%, rgba(3,5,8,.86) 18%, rgba(3,5,8,.52) 56%, rgba(3,5,8,.32) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 86% 12%, rgba(194,245,66,.14) 0%, transparent 42%)",
        }}
      />

      <div className="container-page absolute inset-x-0 top-5 z-10 md:hidden">
        <a href="#top" className="flex items-start gap-2.5 leading-none text-white">
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime shadow-[0_0_12px_rgba(194,245,66,.75)]" />
          <span className="flex flex-col">
            <span className="type-ui font-semibold text-white">UNLIM RIGA PADEL</span>
            <span className="type-micro mt-0.5 text-white/55">Новорижское шоссе 3к1</span>
          </span>
        </a>
      </div>

      <div className="container-page absolute inset-x-0 top-[84px] z-10 md:hidden">
        <SocialProof className="w-fit max-w-full" />
      </div>

      <div className="container-page relative z-10 flex h-full flex-col justify-end pb-[calc(104px+env(safe-area-inset-bottom))] pt-32 sm:pb-9 lg:pb-12">
        <motion.div
          variants={revealContainer}
          initial="hidden"
          animate="show"
          className="flex max-w-[980px] flex-col"
        >
          <motion.h1
            variants={revealUp}
            className="type-hero font-semibold text-white"
          >
            <SplitTextReveal text="Первая тренировка" animateOnMount />
            <br />
            <SplitTextReveal text="за" animateOnMount />{" "}
            <motion.span
              initial={{ opacity: 0, y: "0.5em", filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...revealUp.show.transition, delay: 0.28 }}
              className="text-[#c2f542]"
            >
              1 990 ₽
            </motion.span>
          </motion.h1>
          <motion.p variants={revealUp} className="type-hero-lead mt-7 max-w-[900px] text-white/75">
            Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным
            покрытием Mondo Super XN и клубным лаунжем.
          </motion.p>
          <motion.div variants={revealUp} className="mt-8 flex flex-nowrap items-center gap-2 sm:gap-3">
            <motion.div initial="hidden" animate="show" variants={heroCtaReveal(0.02)} className="flex-1 sm:flex-none">
              <Button variant="primary" size="lg" icon={<CalendarCheck size={17} />} className="w-full px-5 sm:w-auto">
                Забронировать
              </Button>
            </motion.div>
            <motion.div initial="hidden" animate="show" variants={heroCtaReveal(0.14)} className="flex-1 sm:flex-none">
              <Button variant="glass" size="lg" icon={<Play size={17} />} className="w-full px-5 sm:w-auto">
                Пробное занятие
              </Button>
            </motion.div>
            <SocialProof className="hidden md:flex" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={revealUp}
          className="mt-8 hidden grid-cols-2 gap-y-6 border-t border-white/15 pt-6 text-white sm:grid sm:grid-cols-4 sm:gap-y-0 sm:pt-7"
        >
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springSoft, delay: 0.08 }} className="flex flex-col gap-1 sm:border-r sm:border-white/15 sm:pl-0 sm:first:pr-8">
            <strong className="type-title-large font-semibold text-white">2 корта</strong>
            <span className="type-caption text-white/55">Jubo Super Panoramic</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springSoft, delay: 0.16 }} className="flex flex-col gap-1 sm:border-r sm:border-white/15 sm:px-8">
            <strong className="type-title-large font-semibold text-white">11.5 м</strong>
            <span className="type-caption text-white/55">Высота до балок</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springSoft, delay: 0.24 }} className="flex flex-col gap-1 sm:border-r sm:border-white/15 sm:px-8">
            <strong className="type-title-large font-semibold text-white">+21°C</strong>
            <span className="type-caption text-white/55">Климат-контроль круглый год</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springSoft, delay: 0.32 }} className="flex flex-col gap-1 sm:pl-8">
            <strong className="type-title-large font-semibold text-white">30 сек</strong>
            <span className="type-caption text-white/55">Мгновенное бронирование</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarCheck, MapPin, Play, Star, Users } from "lucide-react";
import { ContentAction } from "../components/ContentAction";
import { useContent } from "../content/ContentContext";
import { SplitTextReveal } from "../components/ui/SplitTextReveal";
import { cn } from "../utils/cn";
import type { MediaDTO } from "@unlim/content-contract";

gsap.registerPlugin(ScrollTrigger);

function HeroBackgroundMedia({ media, poster, className, setRef }: { media: MediaDTO; poster?: MediaDTO | null; className?: string; setRef?: (node: HTMLImageElement | HTMLVideoElement | null) => void }) {
  const classes = cn("absolute inset-0 h-full w-full object-cover", className);
  return media.mimeType.startsWith("video/")
    ? <video ref={setRef} data-hero-parallax-media={setRef ? "" : undefined} autoPlay muted loop playsInline poster={poster?.url} className={classes}><source src={media.url} type={media.mimeType} /></video>
    : <img ref={setRef} data-hero-parallax-media={setRef ? "" : undefined} src={media.url} alt={media.alt} className={classes} />;
}

function SocialProof({ className }: { className?: string }) {
  const { home } = useContent();
  return (
    <div
      data-hero-social-proof=""
      className={cn("glass-overlay se-3 flex min-h-[52px] items-center gap-3 px-3.5 py-2 text-white", className)}
    >
      <div className="flex -space-x-2.5">
        {home.hero.socialProof.coachPhotos.map((media) => (
          <img key={media.url} src={media.url} alt="" className="h-8 w-8 rounded-full object-cover" />
        ))}
      </div>
      <div className="h-7 w-px bg-white/20" />
      <div className="flex flex-col gap-0.5">
        <div className="type-caption flex items-center gap-1 font-semibold text-white">
          <Star size={12} className="fill-[#c2f542] text-[#c2f542]" />
          {home.hero.socialProof.ratingLabel}
        </div>
        <div className="type-micro flex items-center gap-1 text-white/60">
          <Users size={11} /> {home.hero.socialProof.caption}
        </div>
      </div>
    </div>
  );
}

function HeroAddress({ className }: { className?: string }) {
  const { site } = useContent();
  const content = <><MapPin size={16} className="shrink-0 text-lime" /><span className="flex flex-col"><span className="type-micro text-white/50">{site.contacts.labels.address}</span><span className="type-caption font-semibold text-white">{site.contacts.address}</span></span></>;
  return site.contacts.address ? site.contacts.directionsURL ? <a href={site.contacts.directionsURL} target="_blank" rel="noreferrer" className={cn("glass-overlay se-2 flex items-center gap-2.5 px-3.5 py-2.5 text-left", className)}>{content}</a> : <div className={cn("glass-overlay se-2 flex items-center gap-2.5 px-3.5 py-2.5 text-left", className)}>{content}</div> : null;
}

export function Hero() {
  const { home, site } = useContent();
  const hero = home.hero;
  const replaceBrand = Boolean(site.brandLogo) && site.brandLogoMode === "replace";
  const sectionRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !sectionRef.current || !mediaRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mediaRef.current,
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
      {hero.desktopMedia && <HeroBackgroundMedia media={hero.desktopMedia} poster={hero.desktopPoster} setRef={(node) => { mediaRef.current = node; }} className={hero.mobileMedia ? "hidden md:block" : undefined} />}
      {hero.mobileMedia && <HeroBackgroundMedia media={hero.mobileMedia} poster={hero.mobilePoster} className="md:hidden" />}
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
        <a href="#top" className="flex items-center gap-2.5 leading-none text-white">
          {site.brandLogo && site.brandLogoMode !== "text" ? <img src={site.brandLogo.url} alt={site.brandName} className={replaceBrand ? "h-9 max-w-[150px] object-contain" : "h-7 w-7 object-contain"} /> : <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime" />}
          {(!replaceBrand || !site.brandLogo) && <span className="flex flex-col">
            <span className="text-[14px] font-semibold tracking-[0] text-white">{site.brandName}</span>
            <span className="type-micro text-white/55">{site.headerSubtitle}</span>
          </span>}
        </a>
      </div>

      {replaceBrand && <HeroAddress className="absolute right-4 top-20 z-10 md:bottom-8 md:right-8 md:top-auto" />}

      <div className="container-page absolute inset-x-0 top-[84px] z-10 md:hidden">
        <SocialProof className="w-fit max-w-full" />
      </div>

      <div className="container-page relative z-10 flex h-full flex-col justify-end pb-[calc(104px+env(safe-area-inset-bottom))] pt-32 sm:pb-9 lg:pb-12">
        <div className="flex max-w-[980px] flex-col">
          <h1 className="type-hero font-semibold text-white">
            <SplitTextReveal text={hero.titleLine} animateOnMount />
            <br />
            <SplitTextReveal text={hero.titleConnector} animateOnMount />{" "}
            <span data-hero-accent="" className="inline-block text-[#c2f542]">
              {hero.titleAccent}
            </span>
          </h1>
          <p data-hero-description="" className="type-hero-lead mt-7 max-w-[900px] text-white/75">
            {hero.description}
          </p>
          <div className="mt-8 flex flex-nowrap items-center gap-2 sm:gap-3">
            <div data-hero-cta="primary" className="flex-1 sm:flex-none">
              <ContentAction action={hero.primaryAction} variant="primary" size="lg" icon={<CalendarCheck size={17} />} className="w-full min-w-0 whitespace-nowrap px-4 !leading-none text-[14px] sm:w-auto sm:px-5 sm:text-base" />
            </div>
            <div data-hero-cta="secondary" className="flex-1 sm:flex-none">
              <ContentAction action={hero.secondaryAction} variant="glass" size="lg" icon={<Play size={17} />} className="w-full min-w-0 whitespace-nowrap px-4 !leading-none text-[14px] sm:w-auto sm:px-5 sm:text-base">Попробовать</ContentAction>
            </div>
            <SocialProof className="hidden md:flex" />
          </div>
        </div>

        <div className="mt-8 hidden grid-cols-2 gap-y-6 border-t border-white/15 pt-6 text-white sm:grid sm:grid-cols-4 sm:gap-y-0 sm:pt-7">
          {hero.stats.map((stat, index) => <div data-hero-stat="" key={stat.label} className={cn("flex flex-col gap-1", index < hero.stats.length - 1 ? "sm:border-r sm:border-white/15 sm:px-8 first:pl-0 first:pr-8" : "sm:pl-8")}><strong className="type-title-large font-semibold text-white">{stat.value}</strong><span className="type-caption text-white/55">{stat.label}</span></div>)}
        </div>
      </div>
    </section>
  );
}

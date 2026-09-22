import { useState, type CSSProperties } from "react";
import { CalendarCheck, MapPin, Play, Star, Users } from "lucide-react";
import { ContentAction } from "../components/ContentAction";
import { useContent } from "../content/ContentContext";
import { SplitTextReveal } from "../components/ui/SplitTextReveal";
import { cn } from "../utils/cn";
import { defaultHeroTint, defaultHeroTitleFontSize, type HeroTintDeviceDTO, type MediaDTO } from "@unlim/content-contract";
import { ProgressiveImage } from "../components/ui/ProgressiveImage";

export function resolveHeroParallaxTarget<T>(mobile: boolean, desktopTarget: T | null, mobileTarget: T | null) {
  return mobile ? mobileTarget ?? desktopTarget : desktopTarget ?? mobileTarget;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function blackAlpha(opacity: number): string {
  const alpha = Math.round(clamp(opacity, 0, 100) * 255 / 100).toString(16).padStart(2, "0");
  return alpha === "00" ? "rgb(0 0 0 / 0%)" : `#000000${alpha}`;
}

export function heroTintGradient(device: HeroTintDeviceDTO): string {
  const stops = [device.stop1, device.stop2, device.stop3]
    .map(({ opacity, position }) => `${blackAlpha(opacity)} ${clamp(position, 0, 200)}%`)
    .join(", ");
  return `radial-gradient(ellipse 80% 60% at ${clamp(device.centerX, 0, 100)}% ${clamp(device.centerY, 0, 100)}%, ${stops})`;
}

function HeroBackgroundMedia({ media, poster, className }: { media: MediaDTO; poster?: MediaDTO | null; className?: string }) {
  const classes = cn("absolute inset-0 h-full w-full object-cover", className);
  return media.mimeType.startsWith("video/")
    ? <video data-hero-parallax-media="" autoPlay muted loop playsInline poster={poster?.url} className={classes}><source src={media.url} type={media.mimeType} /></video>
    : <ProgressiveImage data-hero-parallax-media="" media={media} sizes="100vw" loading="eager" fetchPriority="high" decoding="async" className={classes} />;
}

function HeroBackground({ desktop, mobile, desktopPoster, mobilePoster }: { desktop?: MediaDTO | null; mobile?: MediaDTO | null; desktopPoster?: MediaDTO | null; mobilePoster?: MediaDTO | null }) {
  if (desktop && mobile && desktop.mimeType.startsWith("image/") && mobile.mimeType.startsWith("image/")) {
    return <picture>
      <source media="(max-width: 767px)" srcSet={mobile.srcSet ?? mobile.url} sizes="100vw" />
      <ProgressiveImage data-hero-parallax-media="" media={desktop} sizes="100vw" loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
    </picture>;
  }
  return <>
    {desktop && <HeroBackgroundMedia media={desktop} poster={desktopPoster} className={mobile ? "hidden md:block" : undefined} />}
    {mobile && <HeroBackgroundMedia media={mobile} poster={mobilePoster} className="md:hidden" />}
  </>;
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
          <ProgressiveImage key={media.url} src={media.url} alt="" className="h-8 w-8 rounded-full object-cover" />
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
  const tint = hero.tint ?? defaultHeroTint;
  const titleFontSize = hero.titleFontSize ?? defaultHeroTitleFontSize;
  const replaceBrand = Boolean(site.brandLogo) && site.brandLogoMode === "replace";
  const [brandLogoFailed, setBrandLogoFailed] = useState(false);

  return (
    <section id="top" data-hero-parallax-root="" className="relative isolate h-[100svh] min-h-[720px] w-full overflow-hidden bg-ink">
      <HeroBackground desktop={hero.desktopMedia} mobile={hero.mobileMedia} desktopPoster={hero.desktopPoster} mobilePoster={hero.mobilePoster} />
      <div data-hero-tint="desktop" className="absolute inset-0 hidden md:block" style={{ background: heroTintGradient(tint.desktop) }} />
      <div data-hero-tint="mobile" className="absolute inset-0 md:hidden" style={{ background: heroTintGradient(tint.mobile) }} />

      <div className="container-page absolute inset-x-0 top-8 z-10 md:hidden">
        <a href="#top" className="flex items-center gap-2.5 leading-none text-white">
          {site.brandLogo && site.brandLogoMode !== "text" && !brandLogoFailed ? <img src={site.brandLogo.url} alt={site.brandName} onError={() => setBrandLogoFailed(true)} className={replaceBrand ? "h-9 max-w-[150px] object-contain" : "h-7 w-7 object-contain"} /> : <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime" />}
          {(!replaceBrand || !site.brandLogo || brandLogoFailed) && <span className="flex flex-col">
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
          <div
            data-hero-title=""
            className="type-hero font-semibold text-white"
            style={{
              '--hero-title-font-size-mobile': `${titleFontSize.mobile}px`,
              '--hero-title-font-size-desktop': `${titleFontSize.desktop}px`,
            } as CSSProperties}
          >
            <SplitTextReveal text={hero.titleLine} animateOnMount />{" "}
            <br />
            <SplitTextReveal text={hero.titleConnector} animateOnMount />{" "}
            <span data-hero-accent="" className="inline-block text-[#c2f542]">
              {hero.titleAccent}
            </span>
          </div>
          <div data-hero-description="" className="type-hero-lead mt-7 max-w-[900px] text-white/75">
            <h1 className="inline">{hero.seoHeading}</h1>{hero.description ? <>{" "}<span>{hero.description}</span></> : null}
          </div>
          <div data-hide-icons-narrow className="mt-8 flex flex-nowrap items-center gap-2 sm:gap-3">
            <div data-hero-cta="primary" className="min-w-0 flex-1 sm:flex-none">
              <ContentAction reveal={false} action={hero.primaryAction} variant="primary" size="lg" icon={<CalendarCheck size={17} />} className="w-full min-w-0 whitespace-nowrap px-4 !leading-none text-[14px] sm:w-auto sm:px-5 sm:text-base" />
            </div>
            <div data-hero-cta="secondary" className="min-w-0 flex-1 sm:flex-none">
              <ContentAction reveal={false} action={hero.secondaryAction} variant="glass" size="lg" icon={<Play size={17} />} className="w-full min-w-0 whitespace-nowrap px-4 !leading-none text-[14px] sm:w-auto sm:px-5 sm:text-base">Попробовать</ContentAction>
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

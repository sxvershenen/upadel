import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect, useMemo, useRef, type ComponentType } from "react";
import { CookieBanner } from "./components/CookieBanner";
import { Hero } from "./sections/Hero";
import { CoolModeEffects } from "./components/ui/CoolModeButton";
import { ContentProvider } from "./content/ContentContext";
import type { HomeSectionKey, HomepageDTO } from "@unlim/content-contract";
import { visibleHomepageSections } from "./content/sections";
import { AnalyticsTracker } from './analytics/AnalyticsTracker'
import { ExternalAnalytics } from './analytics/ExternalAnalytics'
import { MainContentReady } from './components/MainContentReady'
import { disconnectDeferredSectionObservers, waitUntilSectionIsNear, type DeferredObserverCleanup } from './deferredSectionLifecycle'

type AppProps = {
  content: HomepageDTO;
  view?: "home" | "ui-kit";
};

type SectionModule = Promise<{ default: ComponentType }>;

function deferredSection(key: string, load: () => SectionModule, cleanups: Set<DeferredObserverCleanup>) {
  return lazy(() => typeof window === "undefined" ? load() : waitUntilSectionIsNear(key, cleanups).then(load));
}

function createSectionComponents(cleanups: Set<DeferredObserverCleanup>): Record<HomeSectionKey, ComponentType> {
  return {
    hero: Hero,
    benefits: deferredSection("benefits", () => import("./sections/Benefits").then(({ Benefits }) => ({ default: Benefits })), cleanups),
    offers: deferredSection("offers", () => import("./sections/Offers").then(({ Offers }) => ({ default: Offers })), cleanups),
    courts: deferredSection("courts", () => import("./sections/Courts").then(({ Courts }) => ({ default: Courts })), cleanups),
    pricing: deferredSection("pricing", () => import("./sections/Pricing").then(({ Pricing }) => ({ default: Pricing })), cleanups),
    coaches: deferredSection("coaches", () => import("./sections/Coaches").then(({ Coaches }) => ({ default: Coaches })), cleanups),
    "methodist-banner": deferredSection("methodist-banner", () => import("./sections/MethodistBanner").then(({ MethodistBanner }) => ({ default: MethodistBanner })), cleanups),
    tournaments: deferredSection("tournaments", () => import("./sections/Tournaments").then(({ Tournaments }) => ({ default: Tournaments })), cleanups),
    gallery: deferredSection("gallery", () => import("./sections/Gallery").then(({ Gallery }) => ({ default: Gallery })), cleanups),
    blog: deferredSection("blog", () => import("./sections/Blog").then(({ Blog }) => ({ default: Blog })), cleanups),
    "reviews-faq": deferredSection("reviews-faq", () => import("./sections/ReviewsFAQ").then(({ ReviewsFAQ }) => ({ default: ReviewsFAQ })), cleanups),
  }
}

const DeferredUiKitPage = lazy(() => import("./ui-kit/UiKitPage").then(({ UiKitPage }) => ({ default: UiKitPage })));

export default function App({ content, view = "home" }: AppProps) {
  const deferredObserverCleanups = useRef(new Set<DeferredObserverCleanup>())
  const sectionComponents = useMemo(() => createSectionComponents(deferredObserverCleanups.current), [])
  const DeferredFooter = useMemo(() => deferredSection("footer", () => import("./sections/Footer").then(({ Footer }) => ({ default: Footer })), deferredObserverCleanups.current), [])

  useEffect(() => {
    const disconnect = () => disconnectDeferredSectionObservers(deferredObserverCleanups.current)
    document.addEventListener('astro:before-swap', disconnect, { once: true })
    return () => document.removeEventListener('astro:before-swap', disconnect)
  }, [])

  function handleAppClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const anchor = target.closest("a[href^='#']") as HTMLAnchorElement | null;
    if (anchor) {
      const href = anchor.getAttribute("href") ?? "";
      const id = href.slice(1);
      const destination = id ? document.getElementById(id) : null;
      if (destination) {
        event.preventDefault();
        destination.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(window.history.state, "", href);
        return;
      }
    }

  }

  if (view === "ui-kit") {
    return <ContentProvider content={content}><MotionConfig reducedMotion="user"><CoolModeEffects /><main><Suspense fallback={null}><DeferredUiKitPage /></Suspense><MainContentReady /></main></MotionConfig></ContentProvider>;
  }

  return (
    <ContentProvider content={content}>
    <MotionConfig reducedMotion="user">
    <AnalyticsTracker analytics={content.site.analytics} />
    <ExternalAnalytics vendors={content.site.analytics.vendors} />
    <CoolModeEffects />
    <div className="min-h-screen bg-page text-ink" onClickCapture={handleAppClick}>
      <main>
        {visibleHomepageSections(content.sections).map((key) => {
          const Section = sectionComponents[key];
          if (key === "hero") return <Section key={key} />;
          return <div key={key} data-home-section={key}>{key === "pricing" && <div id="training" />}<Suspense fallback={null}><Section /></Suspense></div>;
        })}
        <MainContentReady />
      </main>

      <div data-home-section="footer"><Suspense fallback={null}><DeferredFooter /></Suspense></div>

      <CookieBanner />
    </div>
    </MotionConfig>
    </ContentProvider>
  );
}

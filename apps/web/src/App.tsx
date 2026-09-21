import { MotionConfig } from "framer-motion";
import { lazy, Suspense, type ComponentType } from "react";
import { CookieBanner } from "./components/CookieBanner";
import { Hero } from "./sections/Hero";
import { CoolModeEffects } from "./components/ui/CoolModeButton";
import { ContentProvider } from "./content/ContentContext";
import type { HomeSectionKey, HomepageDTO } from "@unlim/content-contract";
import { visibleHomepageSections } from "./content/sections";
import { AnalyticsTracker } from './analytics/AnalyticsTracker'
import { ExternalAnalytics } from './analytics/ExternalAnalytics'
import { MainContentReady } from './components/MainContentReady'

type AppProps = {
  content: HomepageDTO;
  view?: "home" | "ui-kit";
};

type SectionModule = Promise<{ default: ComponentType }>;

function waitUntilSectionIsNear(key: string) {
  if (typeof window === "undefined") return Promise.resolve();
  const section = document.querySelector<HTMLElement>(`[data-home-section="${key}"]`);
  if (!section || !("IntersectionObserver" in window)) return Promise.resolve();
  const rect = section.getBoundingClientRect();
  if (rect.bottom >= -600 && rect.top <= window.innerHeight + 900) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      resolve();
    }, { rootMargin: "900px 0px" });
    observer.observe(section);
  });
}

function deferredSection(key: string, load: () => SectionModule) {
  return lazy(() => typeof window === "undefined" ? load() : waitUntilSectionIsNear(key).then(load));
}

const sectionComponents: Record<HomeSectionKey, ComponentType> = {
  hero: Hero,
  benefits: deferredSection("benefits", () => import("./sections/Benefits").then(({ Benefits }) => ({ default: Benefits }))),
  offers: deferredSection("offers", () => import("./sections/Offers").then(({ Offers }) => ({ default: Offers }))),
  courts: deferredSection("courts", () => import("./sections/Courts").then(({ Courts }) => ({ default: Courts }))),
  pricing: deferredSection("pricing", () => import("./sections/Pricing").then(({ Pricing }) => ({ default: Pricing }))),
  coaches: deferredSection("coaches", () => import("./sections/Coaches").then(({ Coaches }) => ({ default: Coaches }))),
  "methodist-banner": deferredSection("methodist-banner", () => import("./sections/MethodistBanner").then(({ MethodistBanner }) => ({ default: MethodistBanner }))),
  tournaments: deferredSection("tournaments", () => import("./sections/Tournaments").then(({ Tournaments }) => ({ default: Tournaments }))),
  gallery: deferredSection("gallery", () => import("./sections/Gallery").then(({ Gallery }) => ({ default: Gallery }))),
  blog: deferredSection("blog", () => import("./sections/Blog").then(({ Blog }) => ({ default: Blog }))),
  "reviews-faq": deferredSection("reviews-faq", () => import("./sections/ReviewsFAQ").then(({ ReviewsFAQ }) => ({ default: ReviewsFAQ }))),
};

const DeferredFooter = deferredSection("footer", () => import("./sections/Footer").then(({ Footer }) => ({ default: Footer })));
const DeferredUiKitPage = lazy(() => import("./ui-kit/UiKitPage").then(({ UiKitPage }) => ({ default: UiKitPage })));

export default function App({ content, view = "home" }: AppProps) {
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
        window.history.replaceState(null, "", href);
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

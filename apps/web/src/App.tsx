import { MotionConfig } from "framer-motion";
import { CookieBanner } from "./components/CookieBanner";
import { Hero } from "./sections/Hero";
import { Benefits } from "./sections/Benefits";
import { Offers } from "./sections/Offers";
import { Courts } from "./sections/Courts";
import { Pricing } from "./sections/Pricing";
import { Coaches } from "./sections/Coaches";
import { MethodistBanner } from "./sections/MethodistBanner";
import { Tournaments } from "./sections/Tournaments";
import { Gallery } from "./sections/Gallery";
import { Blog } from "./sections/Blog";
import { ReviewsFAQ } from "./sections/ReviewsFAQ";
import { Footer } from "./sections/Footer";
import { CoolModeEffects } from "./components/ui/CoolModeButton";
import { UiKitPage } from "./ui-kit/UiKitPage";
import { ContentProvider } from "./content/ContentContext";
import type { HomeSectionKey, HomepageDTO } from "@unlim/content-contract";
import { visibleHomepageSections } from "./content/sections";
import { AnalyticsTracker } from './analytics/AnalyticsTracker'
import { ExternalAnalytics } from './analytics/ExternalAnalytics'

type AppProps = {
  content: HomepageDTO;
  view?: "home" | "ui-kit";
};

const sectionComponents: Record<HomeSectionKey, React.ComponentType> = {
  hero: Hero,
  benefits: Benefits,
  offers: Offers,
  courts: Courts,
  pricing: Pricing,
  coaches: Coaches,
  "methodist-banner": MethodistBanner,
  tournaments: Tournaments,
  gallery: Gallery,
  blog: Blog,
  "reviews-faq": ReviewsFAQ,
};

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
    return <ContentProvider content={content}><MotionConfig reducedMotion="user"><CoolModeEffects /><UiKitPage /></MotionConfig></ContentProvider>;
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
          return key === "pricing" ? <div key={key}><div id="training" /><Section /></div> : <Section key={key} />;
        })}
      </main>

      <Footer />

      <CookieBanner />
    </div>
    </MotionConfig>
    </ContentProvider>
  );
}

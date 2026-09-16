import { MotionConfig } from "framer-motion";
import { DesktopHeader } from "./components/navigation/DesktopHeader";
import { MobileBottomNav } from "./components/navigation/MobileBottomNav";
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
import { UiKitPage } from "./pages/UiKitPage";

export default function App() {
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

  if (new URLSearchParams(window.location.search).get("view") === "ui-kit") {
    return <MotionConfig reducedMotion="user"><CoolModeEffects /><UiKitPage /></MotionConfig>;
  }

  return (
    <MotionConfig reducedMotion="user">
    <CoolModeEffects />
    <div className="min-h-screen bg-page text-ink" onClickCapture={handleAppClick}>
      <DesktopHeader />

      <main>
        <Hero />
        <Benefits />
        <Offers />
        <Courts />
        <div id="training" />
        <Pricing />
        <Coaches />
        <MethodistBanner />
        <Tournaments />
        <Gallery />
        <Blog />
        <ReviewsFAQ />
      </main>

      <Footer />

      <MobileBottomNav />
      <CookieBanner />
    </div>
    </MotionConfig>
  );
}

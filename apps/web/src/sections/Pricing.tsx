import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Swiper as SwiperType } from "swiper";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Tabs } from "../components/ui/Tabs";
import { Reveal } from "../components/ui/Reveal";
import { PricingRent } from "./pricing/PricingRent";
import { PricingTraining } from "./pricing/PricingTraining";
import { PricingMemberships } from "./pricing/PricingMemberships";
import { MobileSwiperNav } from "../components/ui/MobileSwiperNav";
import { useContent } from "../content/ContentContext";

type TabId = "rent" | "training" | "memberships";

export function Pricing() {
  const { home } = useContent();
  const pricingTabs = [
    { id: "rent" as const, label: home.pricingSection.rentTabLabel, panelId: "pricing-panel" },
    { id: "training" as const, label: home.pricingSection.trainingTabLabel, panelId: "pricing-panel" },
    { id: "memberships" as const, label: home.pricingSection.membershipsTabLabel, panelId: "pricing-panel" },
  ];
  const [active, setActive] = useState<TabId>(home.pricingSection.defaultTab);
  const [pricingSwiper, setPricingSwiper] = useState<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#training") setActive("training");
  }, []);

  const syncPricingSwiper = useCallback((swiper: SwiperType) => {
    setPricingSwiper(swiper);
    setAtStart(swiper.isBeginning);
    setAtEnd(swiper.isEnd);
  }, []);

  const changeTab = (next: TabId) => {
    setPricingSwiper(null);
    setAtStart(true);
    setAtEnd(false);
    setActive(next);
  };

  return (
    <section id="pricing" className="container-page py-20 md:py-28">
      <Reveal>
        <SectionHeader
          eyebrow={home.pricingSection.eyebrow}
          title={home.pricingSection.title}
          titleClassName="max-w-[225px] md:max-w-none"
          action={
            <div className="flex items-center gap-2">
              <MobileSwiperNav
                className="md:hidden"
                atStart={atStart || !pricingSwiper}
                atEnd={atEnd || !pricingSwiper}
                onPrev={() => pricingSwiper?.slidePrev()}
                onNext={() => pricingSwiper?.slideNext()}
              />
              <Tabs className="hidden md:inline-flex" layoutId="pricing-tabs-desktop" tabs={pricingTabs} value={active} onChange={changeTab} />
            </div>
          }
          className="mb-4 md:mb-10"
        />
      </Reveal>

      <div className="mb-10 md:hidden">
        <Tabs fullWidth layoutId="pricing-tabs-mobile" tabs={pricingTabs} value={active} onChange={changeTab} />
      </div>

      <motion.div
        id="pricing-panel"
        data-gsap-reveal-boundary="true"
        role="tabpanel"
        tabIndex={0}
        layout="size"
        transition={{ layout: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] } }}
        className="relative grid overflow-visible"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={active}
            className="col-start-1 row-start-1 w-full"
            initial={{ y: 8 }}
            animate={{ y: 0 }}
            exit={{ y: -6 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {active === "rent" && <PricingRent onSwiperChange={syncPricingSwiper} />}
            {active === "training" && <PricingTraining onSwiperChange={syncPricingSwiper} />}
            {active === "memberships" && <PricingMemberships onSwiperChange={syncPricingSwiper} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

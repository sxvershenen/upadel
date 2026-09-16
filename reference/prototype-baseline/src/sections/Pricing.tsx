import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Swiper as SwiperType } from "swiper";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Tabs } from "../components/ui/Tabs";
import { Reveal } from "../components/ui/Reveal";
import { PricingRent } from "./pricing/PricingRent";
import { PricingTraining } from "./pricing/PricingTraining";
import { PricingMemberships } from "./pricing/PricingMemberships";
import { MobileSwiperNav } from "../components/ui/MobileSwiperNav";

type TabId = "rent" | "training" | "memberships";

const tabs: { id: TabId; label: string }[] = [
  { id: "rent", label: "Аренда" },
  { id: "training", label: "Тренировки" },
  { id: "memberships", label: "Абонементы" },
];

const pricingTabs = tabs.map((tab) => ({ ...tab, panelId: "pricing-panel" }));

export function Pricing() {
  const [active, setActive] = useState<TabId>(() =>
    typeof window !== "undefined" && window.location.hash === "#training" ? "training" : "rent",
  );
  const [pricingSwiper, setPricingSwiper] = useState<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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
          eyebrow="Тарифы"
          title="Цены и абонементы"
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
        <Tabs layoutId="pricing-tabs-mobile" tabs={pricingTabs} value={active} onChange={changeTab} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          id="pricing-panel"
          role="tabpanel"
          tabIndex={0}
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
        >
          {active === "rent" && <PricingRent onSwiperChange={syncPricingSwiper} />}
          {active === "training" && <PricingTraining onSwiperChange={syncPricingSwiper} />}
          {active === "memberships" && <PricingMemberships onSwiperChange={syncPricingSwiper} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

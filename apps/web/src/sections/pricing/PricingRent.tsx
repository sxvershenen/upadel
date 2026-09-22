import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { RentalRateCard } from "../../components/cards/RentPricingCards";
import { useContent } from "../../content/ContentContext";
import { horizontalSwiperProps } from "../../lib/swiper";
import { useMobileSwipeHint } from "../../lib/useMobileSwipeHint";

export function PricingRent({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const { entities } = useContent();
  const standardRates = entities.rentalRates.filter(({ cardVariant }) => cardVariant === "rate");
  const trial = entities.rentalRates.find(({ cardVariant }) => cardVariant === "trial");
  const standards = entities.rentalRates.find(({ cardVariant }) => cardVariant === "standards");
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeHintRef = useMobileSwipeHint(swiperRef, "home-pricing-rent");
  return <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(320px,1fr)_minmax(190px,auto)]">
    {standardRates.map((rate) => <div key={rate.id} className="hidden lg:col-span-4 lg:row-start-1 lg:block"><RentalRateCard rate={rate} /></div>)}
    {trial && <div className="hidden lg:col-span-8 lg:row-start-2 lg:block"><RentalRateCard rate={trial} layout="wide" /></div>}
    <div ref={swipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper); }} onSlideChange={(swiper) => onSwiperChange?.(swiper)} onResize={(swiper) => onSwiperChange?.(swiper)} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{[...standardRates, ...(trial ? [trial] : [])].map((rate) => <SwiperSlide key={rate.id} className="!h-auto"><RentalRateCard rate={rate} layout="compact" /></SwiperSlide>)}</Swiper></div>
    {standards && <div className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1"><RentalRateCard rate={standards} /></div>}
  </div>;
}

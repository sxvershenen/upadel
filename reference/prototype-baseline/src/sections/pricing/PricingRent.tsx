import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { RentDayCard, RentPrimeCard, RentStandardsCard, RentTrialCard } from "../../components/cards/RentPricingCards";
import { Reveal } from "../../components/ui/Reveal";
import { horizontalSwiperProps } from "../../lib/swiper";
import { useMobileSwipeHint } from "../../lib/useMobileSwipeHint";

export function PricingRent({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeHintRef = useMobileSwipeHint(swiperRef);
  return <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(320px,1fr)_minmax(190px,auto)]">
    <Reveal className="hidden lg:col-span-4 lg:row-start-1 lg:block"><RentDayCard /></Reveal>
    <Reveal delay={0.06} className="hidden lg:col-span-4 lg:row-start-1 lg:block"><RentPrimeCard /></Reveal>
    <Reveal delay={0.1} className="hidden lg:col-span-8 lg:row-start-2 lg:block"><RentTrialCard /></Reveal>
    <div ref={swipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper); }} onSlideChange={(swiper) => onSwiperChange?.(swiper)} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5"><SwiperSlide className="!h-auto"><RentDayCard /></SwiperSlide><SwiperSlide className="!h-auto"><RentPrimeCard /></SwiperSlide><SwiperSlide className="!h-auto"><RentTrialCard /></SwiperSlide></Swiper></div>
    <Reveal delay={0.14} className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1"><RentStandardsCard /></Reveal>
  </div>;
}

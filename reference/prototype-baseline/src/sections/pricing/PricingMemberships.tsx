import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { membershipCardComponents } from "../../components/cards/MembershipCards";
import { Reveal } from "../../components/ui/Reveal";
import { horizontalSwiperProps } from "../../lib/swiper";
import { useMobileSwipeHint } from "../../lib/useMobileSwipeHint";

export function PricingMemberships({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeHintRef = useMobileSwipeHint(swiperRef);
  return <div>
    <Reveal className="hidden gap-4 lg:grid lg:grid-cols-4">{membershipCardComponents.map(({ id, Component }, index) => <Reveal key={id} delay={index * 0.08}><Component /></Reveal>)}</Reveal>
    <div ref={swipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper); }} onSlideChange={(swiper) => onSwiperChange?.(swiper)} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{membershipCardComponents.map(({ id, Component }) => <SwiperSlide key={id} className="!h-auto"><Component /></SwiperSlide>)}</Swiper></div>
  </div>;
}

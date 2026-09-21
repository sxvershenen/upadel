import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { MembershipCard } from "../../components/cards/MembershipCards";
import { useContent } from "../../content/ContentContext";
import { Reveal } from "../../components/ui/Reveal";
import { horizontalSwiperProps } from "../../lib/swiper";
import { useMobileSwipeHint } from "../../lib/useMobileSwipeHint";

export function PricingMemberships({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const { entities } = useContent();
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeHintRef = useMobileSwipeHint(swiperRef);
  return <div>
    <Reveal className="hidden gap-4 lg:grid lg:grid-cols-4">{entities.memberships.map((membership, index) => <Reveal key={membership.id} delay={index * 0.08}><MembershipCard membership={membership} /></Reveal>)}</Reveal>
    <div ref={swipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper); }} onSlideChange={(swiper) => onSwiperChange?.(swiper)} onResize={(swiper) => onSwiperChange?.(swiper)} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{entities.memberships.map((membership) => <SwiperSlide key={membership.id} className="!h-auto"><MembershipCard membership={membership} /></SwiperSlide>)}</Swiper></div>
  </div>;
}

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { TrainingCard, trainings } from "../../components/cards/TrainingCard";
import { Reveal } from "../../components/ui/Reveal";
import { useMobileSwipeHint } from "../../lib/useMobileSwipeHint";
import { horizontalSwiperProps } from "../../lib/swiper";

export function PricingTraining({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeHintRef = useMobileSwipeHint(swiperRef);
  return <div>
    <Reveal className="hidden gap-4 md:grid md:grid-cols-3">{trainings.map((training, index) => <Reveal key={training.id} delay={index * 0.08}><TrainingCard training={training} /></Reveal>)}</Reveal>
    <div ref={swipeHintRef} className="-mx-5 md:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper); }} onSlideChange={(swiper) => onSwiperChange?.(swiper)} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{trainings.map((training) => <SwiperSlide key={training.id} className="!h-auto"><TrainingCard training={training} /></SwiperSlide>)}</Swiper></div>
  </div>;
}

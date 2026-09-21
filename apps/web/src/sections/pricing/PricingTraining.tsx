import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { TrainingCard } from "../../components/cards/TrainingCard";
import { useContent } from "../../content/ContentContext";
import { Reveal } from "../../components/ui/Reveal";
import { useMobileSwipeHint } from "../../lib/useMobileSwipeHint";
import { horizontalSwiperProps } from "../../lib/swiper";

export function PricingTraining({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const { entities } = useContent();
  const trainings = entities.trainingPrograms;
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeHintRef = useMobileSwipeHint(swiperRef, "home-pricing");
  return <div>
    <Reveal className="hidden gap-4 md:grid md:grid-cols-3">{trainings.map((training, index) => <Reveal key={training.id} delay={index * 0.08}><TrainingCard training={training} /></Reveal>)}</Reveal>
    <div ref={swipeHintRef} className="-mx-5 md:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper); }} onSlideChange={(swiper) => onSwiperChange?.(swiper)} onResize={(swiper) => onSwiperChange?.(swiper)} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{trainings.map((training) => <SwiperSlide key={training.id} className="!h-auto"><TrainingCard training={training} interactive={false} /></SwiperSlide>)}</Swiper></div>
  </div>;
}

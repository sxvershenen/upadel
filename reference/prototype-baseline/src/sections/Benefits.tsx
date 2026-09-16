import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import {
  benefitCardComponents,
  ChillCard,
  CoachesMetricCard,
  KidsCard,
  LockersCard,
  OnlineBookingCard,
  ParkingCard,
  ShowerCard,
} from "../components/cards/BenefitCards";
import { MobileSwiperNav } from "../components/ui/MobileSwiperNav";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeader } from "../components/ui/SectionHeader";
import { horizontalSwiperProps } from "../lib/swiper";
import { useMobileSwipeHint } from "../lib/useMobileSwipeHint";

export function Benefits() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swipeHintRef = useMobileSwipeHint(swiperRef);

  return <section className="container-page py-20 md:py-28">
    <Reveal><div className="mb-10 max-w-[760px] md:mb-12"><SectionHeader eyebrow="Преимущества клуба" title="Всё для игры и отдыха" titleClassName="max-w-[240px] md:max-w-none" action={<MobileSwiperNav className="lg:hidden" atStart={atStart} atEnd={atEnd} onPrev={() => swiperRef.current?.slidePrev()} onNext={() => swiperRef.current?.slideNext()} />} /></div></Reveal>

    <Reveal className="hidden gap-4 lg:grid lg:grid-cols-4 lg:grid-rows-2 lg:auto-rows-[minmax(320px,22vw)] xl:gap-5">
      <Reveal className="lg:col-span-1 lg:row-span-1"><ParkingCard /></Reveal>
      <Reveal delay={0.05} className="lg:col-span-1 lg:row-span-1"><LockersCard /></Reveal>
      <Reveal delay={0.1} className="lg:col-span-1 lg:row-span-1"><ShowerCard /></Reveal>
      <Reveal delay={0.15} className="lg:col-span-1 lg:row-span-1"><ChillCard /></Reveal>
      <Reveal delay={0.2} className="lg:col-span-1 lg:row-span-1"><OnlineBookingCard /></Reveal>
      <Reveal delay={0.25} className="lg:col-span-1 lg:row-span-1"><CoachesMetricCard /></Reveal>
      <Reveal delay={0.3} className="lg:col-span-2 lg:row-span-1"><KidsCard /></Reveal>
    </Reveal>

    <div ref={swipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} onSlideChange={(swiper) => { setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{benefitCardComponents.map(({ id, Component }) => <SwiperSlide key={id} className="!h-auto"><div className="h-full min-h-[320px]"><Component /></div></SwiperSlide>)}</Swiper></div>
  </section>;
}

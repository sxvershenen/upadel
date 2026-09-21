import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { BenefitCard } from "../components/cards/BenefitCards";
import { useContent } from "../content/ContentContext";
import { MobileSwiperNav } from "../components/ui/MobileSwiperNav";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeader } from "../components/ui/SectionHeader";
import { horizontalSwiperProps } from "../lib/swiper";
import { useMobileSwipeHint } from "../lib/useMobileSwipeHint";

export function Benefits() {
  const { home } = useContent();
  const cards = home.benefits.cards;
  const swiperRef = useRef<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swipeHintRef = useMobileSwipeHint(swiperRef, "home-benefits");

  return <section className="container-page py-20 md:py-28">
    <Reveal><div className="mb-10 max-w-[760px] md:mb-12"><SectionHeader eyebrow={home.benefits.eyebrow} title={home.benefits.title} titleClassName="max-w-[240px] md:max-w-none" action={<MobileSwiperNav className="lg:hidden" atStart={atStart} atEnd={atEnd} onPrev={() => swiperRef.current?.slidePrev()} onNext={() => swiperRef.current?.slideNext()} />} /></div></Reveal>

    <Reveal className="hidden gap-4 lg:grid lg:grid-cols-4 lg:grid-rows-2 lg:auto-rows-[minmax(320px,22vw)] xl:gap-5">
      {cards.map((card, index) => <Reveal key={card.id} delay={index * 0.05} className={card.variant === "kids-wide" ? "lg:col-span-2 lg:row-span-1" : "lg:col-span-1 lg:row-span-1"}><BenefitCard benefit={card} /></Reveal>)}
    </Reveal>

    <div ref={swipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} onSlideChange={(swiper) => { setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} onResize={(swiper) => { setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{cards.map((card) => <SwiperSlide key={card.id} className="!h-auto"><div className="h-full min-h-[320px]"><BenefitCard benefit={card} /></div></SwiperSlide>)}</Swiper></div>
  </section>;
}

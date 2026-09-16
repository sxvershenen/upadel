import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { tournaments } from "../data/content";
import { TournamentCard } from "../components/cards/TournamentCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { MobileSwiperNav } from "../components/ui/MobileSwiperNav";
import { useMobileSwipeHint } from "../lib/useMobileSwipeHint";
import { horizontalSwiperProps } from "../lib/swiper";

export function Tournaments() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swipeHintRef = useMobileSwipeHint(swiperRef);
  return <section id="tournaments" className="container-page py-20 md:py-28">
    <Reveal><SectionHeader eyebrow="Соревнования" title="Турниры и лиги" titleClassName="max-w-[220px] md:max-w-none" action={<MobileSwiperNav className="md:hidden" atStart={atStart} atEnd={atEnd} onPrev={() => swiperRef.current?.slidePrev()} onNext={() => swiperRef.current?.slideNext()} />} className="mb-10" /></Reveal>
    <Reveal className="hidden gap-4 md:grid md:grid-cols-3">{tournaments.map((tournament, index) => <Reveal key={tournament.id} delay={index * 0.08}><TournamentCard tournament={tournament} /></Reveal>)}</Reveal>
    <div ref={swipeHintRef} className="-mx-5 md:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} onSlideChange={(swiper) => { setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{tournaments.map((tournament) => <SwiperSlide key={tournament.id} className="!h-auto"><TournamentCard tournament={tournament} /></SwiperSlide>)}</Swiper></div>
  </section>;
}

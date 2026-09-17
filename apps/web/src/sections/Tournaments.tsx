import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { useContent } from "../content/ContentContext";
import { TournamentCard } from "../components/cards/TournamentCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { MobileSwiperNav } from "../components/ui/MobileSwiperNav";
import { useMobileSwipeHint } from "../lib/useMobileSwipeHint";
import { horizontalSwiperProps } from "../lib/swiper";
import { ButtonLink } from "../components/ui/Button";

export function Tournaments() {
  const { home, entities } = useContent();
  const swiperRef = useRef<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swipeHintRef = useMobileSwipeHint(swiperRef);
  return <section id="tournaments" className="container-page py-20 md:py-28">
    <Reveal><SectionHeader eyebrow={home.tournamentsSection.eyebrow} title={home.tournamentsSection.title} titleClassName="max-w-[150px] md:max-w-none" action={<div className="flex shrink-0 flex-col items-end gap-2"><ButtonLink href="/tournaments" variant="neutral" size="sm" icon={<ArrowRight size={15} />} iconDivider={false}>Все</ButtonLink><MobileSwiperNav className="md:hidden" atStart={atStart} atEnd={atEnd} onPrev={() => swiperRef.current?.slidePrev()} onNext={() => swiperRef.current?.slideNext()} /></div>} className="mb-10 !flex-nowrap items-start gap-3" /></Reveal>
    <Reveal className="hidden gap-4 md:grid md:grid-cols-3">{entities.tournaments.map((tournament, index) => <Reveal key={tournament.id} delay={index * 0.08}><TournamentCard tournament={tournament} /></Reveal>)}</Reveal>
    <div ref={swipeHintRef} className="-mx-5 md:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} onSlideChange={(swiper) => { setAtStart(swiper.isBeginning); setAtEnd(swiper.isEnd); }} slidesPerView={1} spaceBetween={12} className="swiper-breathe !px-5">{entities.tournaments.map((tournament) => <SwiperSlide key={tournament.id} className="!h-auto"><TournamentCard tournament={tournament} /></SwiperSlide>)}</Swiper></div>
  </section>;
}

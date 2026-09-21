import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "../content/ContentContext";
import { IconButton } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { useMobileSwipeHint } from "../lib/useMobileSwipeHint";
import { horizontalSwiperProps } from "../lib/swiper";
import { CoachCard } from "../components/cards/CoachCard";

export function Coaches() {
  const { home, entities } = useContent();
  const swiperRef = useRef<SwiperType | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swipeHintRef = useMobileSwipeHint(swiperRef);

  return (
    <section id="coaches" className="container-page py-20 md:py-28">
      <Reveal>
        <SectionHeader
          eyebrow={home.coachesSection.eyebrow}
          title={home.coachesSection.title}
          action={
            <div className="flex items-center gap-2">
              <IconButton
                variant="neutral"
                size="sm"
                aria-label="Предыдущие тренеры"
                disabled={atStart}
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <ChevronLeft size={16} />
              </IconButton>
              <IconButton
                variant="neutral"
                size="sm"
                aria-label="Следующие тренеры"
                disabled={atEnd}
                onClick={() => swiperRef.current?.slideNext()}
              >
                <ChevronRight size={16} />
              </IconButton>
            </div>
          }
          className="mb-10"
        />
      </Reveal>

      <div ref={swipeHintRef} className="-mx-5 md:mx-0">
        <Reveal>
          <Swiper
            {...horizontalSwiperProps}
            onSwiper={(s) => (swiperRef.current = s)}
            onSlideChange={(s) => {
              setAtStart(s.isBeginning);
              setAtEnd(s.isEnd);
            }}
            onResize={(s) => { setAtStart(s.isBeginning); setAtEnd(s.isEnd); }}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 4 },
            }}
            className="swiper-breathe !px-5 md:!px-0"
          >
            {entities.coaches.map((coach) => (
              <SwiperSlide key={coach.id} className="!h-auto">
                <div>
                  <CoachCard coach={coach} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}

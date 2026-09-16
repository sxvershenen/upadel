import { Star, ArrowUpRight } from "lucide-react";
import { reviews, faqItems } from "../data/content";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { Accordion } from "../components/ui/Accordion";
import { ReviewCard } from "../components/cards/ReviewCard";

export function ReviewsFAQ() {
  const doubled = [...reviews, ...reviews];

  return (
    <section className="container-page py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <SectionHeader eyebrow="Отзывы" title="Что говорят игроки" className="mb-8" />
          </Reveal>

          <Reveal>
            <a
              href="https://yandex.ru/maps"
              target="_blank"
              rel="noreferrer"
              className="se-3 mb-6 flex items-center justify-between gap-4 bg-white p-5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="se-1 type-body flex h-11 w-11 items-center justify-center bg-[#fc3f1d] font-bold text-white">
                  Я
                </span>
                <div>
                  <div className="type-ui flex items-center gap-1 font-semibold text-ink">
                    <Star size={13} className="fill-amber-400 text-amber-400" /> 4.8 на Яндекс Картах
                  </div>
                  <div className="type-caption text-ink-soft">312 отзывов о клубе</div>
                </div>
              </div>
              <ArrowUpRight size={18} className="shrink-0 text-ink-soft" />
            </a>
          </Reveal>

          <Reveal>
            <div
              className="group relative h-[540px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
            >
              <div className="animate-reviews flex flex-col gap-4 group-hover:[animation-play-state:paused]">
                {doubled.map((r, i) => (
                  <ReviewCard key={i} review={r} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <SectionHeader eyebrow="Вопросы" title="Частые вопросы" className="mb-8" />
          </Reveal>
          <Reveal>
            <Accordion items={faqItems} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

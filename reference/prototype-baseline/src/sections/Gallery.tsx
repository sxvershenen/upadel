import { Camera } from "lucide-react";
import { images } from "../data/images";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { Marquee } from "../components/ui/Marquee";
import { GalleryCard } from "../components/cards/GalleryCard";

export function Gallery() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            eyebrow="Сообщество"
            title="Жизнь клуба"
            action={
              <Button variant="neutral" size="sm" icon={<Camera size={15} />} iconPosition="left" iconDivider={false}>
                Смотреть больше
              </Button>
            }
            className="mb-10"
          />
        </Reveal>
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        {[images.gallery.slice(0, 5), images.gallery.slice(5)].map((row, rowIndex) => (
          <Reveal key={rowIndex}>
            <Marquee
              reverse={rowIndex === 1}
              gapClass="gap-4 md:gap-7"
              className="marquee-breathe"
            >
              {row.map((src, i) => (
                <GalleryCard key={i} src={src} />
              ))}
            </Marquee>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

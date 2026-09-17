import { Camera } from "lucide-react";
import { useContent } from "../content/ContentContext";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
import { ContentAction } from "../components/ContentAction";
import { Marquee } from "../components/ui/Marquee";
import { GalleryCard } from "../components/cards/GalleryCard";

export function Gallery() {
  const { home, entities } = useContent();
  const rows = [entities.gallery.slice(0, 5), entities.gallery.slice(5)];
  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            eyebrow={home.gallerySection.eyebrow}
            title={home.gallerySection.title}
            action={
              <ContentAction action={home.gallerySection.action} variant="neutral" size="sm" icon={<Camera size={15} />} iconPosition="left" iconDivider={false}>Смотреть</ContentAction>
            }
            className="mb-10"
          />
        </Reveal>
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        {rows.map((row, rowIndex) => (
          <Reveal key={rowIndex}>
            <Marquee
              reverse={rowIndex === 1}
              gapClass="gap-4 md:gap-7"
              className="marquee-breathe"
            >
              {row.map((item) => (
                <GalleryCard key={item.id} src={item.media.url} />
              ))}
            </Marquee>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

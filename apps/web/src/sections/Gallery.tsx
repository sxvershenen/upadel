import { useContent } from "../content/ContentContext";
import { SectionAction, SectionHeader } from "../components/ui/SectionHeader";
import { Reveal } from "../components/ui/Reveal";
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
              <SectionAction action={home.gallerySection.action}>Смотреть</SectionAction>
            }
            className="mb-10"
          />
        </Reveal>
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        {rows.map((row, rowIndex) => (
          <Reveal key={rowIndex} scope={false}>
            <Marquee
              reverse={rowIndex === 1}
              gapClass="gap-4 md:gap-7"
              className="marquee-breathe"
            >
              {row.map((item, index) => (
                <GalleryCard key={item.id} media={item.media} src={item.media.url} reveal={{ delay: index * 0.06 }} />
              ))}
            </Marquee>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

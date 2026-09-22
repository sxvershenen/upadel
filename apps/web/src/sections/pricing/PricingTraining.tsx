import type { Swiper as SwiperType } from "swiper";
import { TrainingFormats } from "../../components/TrainingFormats";
import { useContent } from "../../content/ContentContext";

export function PricingTraining({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const { entities } = useContent();
  return <TrainingFormats programs={entities.trainingPrograms} onSwiperChange={onSwiperChange} />;
}

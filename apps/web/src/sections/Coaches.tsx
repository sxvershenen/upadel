import { useContent } from "../content/ContentContext";
import { CoachesSection } from "../components/CoachesSection";

export function Coaches() {
  const { home, entities } = useContent();
  return (
    <CoachesSection
      coaches={entities.coaches}
      eyebrow={home.coachesSection.eyebrow}
      title={home.coachesSection.title}
      sectionId="coaches"
      className="container-page py-20 md:py-28"
      headerClassName="mb-10"
    />
  );
}

import { PartyPopper, Trophy } from "lucide-react";
import { images } from "../../data/images";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { ImageCard } from "../ui/Card";

export const offers = [
  { id: "venue", image: images.offerTournament, overlay: "overlay-blue" as const, badge: "Турниры", icon: Trophy, title: "Площадка для турниров", description: "Профессиональные корты, инфраструктура и команда с опытом проведения соревнований любого масштаба." },
  { id: "event", image: images.offerEvent, overlay: "overlay-violet" as const, badge: "Мероприятия", icon: PartyPopper, title: "Ваше мероприятие", description: "Арендуйте площадку для корпоратива, закрытой тренировки, турнира, дня рождения или спортивной встречи — подберём формат и время под вашу задачу." },
] as const;
export type Offer = (typeof offers)[number];

export function OfferCard({ offer }: { offer: Offer }) {
  const Icon = offer.icon;
  return <ImageCard src={offer.image} alt={offer.title} overlay={offer.overlay} className="aspect-[4/3] md:aspect-[2/1]"><div className="flex h-full flex-col justify-between p-6 md:p-8"><div className="flex items-start justify-between"><Badge tone="outline-light" icon={<Icon size={13} />}>{offer.badge}</Badge><ArrowAction tone="glass" cardHover /></div><div className="max-w-[420px]"><h3 className="type-title-card text-white">{offer.title}</h3><p className="type-body-sm mt-2 text-white/80">{offer.description}</p></div></div></ImageCard>;
}

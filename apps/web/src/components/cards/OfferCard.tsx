import { PartyPopper, Trophy } from "lucide-react";
import type { HomepageDTO } from "@unlim/content-contract";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { ImageCard } from "../ui/Card";
import { ContentAction } from "../ContentAction";

export type Offer = HomepageDTO["home"]["offers"][number];
const icons = { Trophy, PartyPopper };

export function OfferCard({ offer }: { offer: Offer }) {
  const Icon = icons[offer.icon];
  if (!offer.image) return null;
  const fallbackAction = {
    mode: 'lead-form' as const,
    leadType: 'consultation' as const,
    label: offer.variant === 'tournament-venue' ? 'Обсудить турнир' : 'Обсудить мероприятие',
  }
  const action = offer.action.mode === 'none' ? fallbackAction : offer.action
  return <ImageCard loading="lazy" src={offer.image.url} alt={offer.image.alt} overlay={offer.overlay as import("../ui/Card").ImageOverlay} className="aspect-square md:aspect-[2/1]"><div className="flex h-full flex-col justify-between p-6 md:p-8"><div className="flex items-start justify-between"><Badge tone="outline-light" icon={<Icon size={13} />}>{offer.badge}</Badge><ArrowAction tone="glass" cardHover /></div><div className="max-w-[420px]"><h3 className="type-title-card text-white">{offer.title}</h3><p className="type-body-sm mt-2 text-white/80">{offer.description}</p><ContentAction action={action} sourcePage="/" sourceEntity={offer.title} variant="secondary" size="sm" className="mt-5" /></div></div></ImageCard>;
}

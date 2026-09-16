import { CalendarDays, Medal, PartyPopper, Trophy, Wallet } from "lucide-react";
import { tournaments } from "../../data/content";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { ImageCard, MeshCard, type ImageOverlay, type MeshTone } from "../ui/Card";
import { Price } from "../ui/Price";

export type Tournament = (typeof tournaments)[number];
const icons = { PartyPopper, Trophy, Medal } as const;

function MetaRow({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="type-caption flex items-center gap-2 text-white/75"><span className="shrink-0 text-white/75">{icon}</span><span>{text}</span></div>; }

function TournamentBody({ tournament }: { tournament: Tournament }) {
  const Icon = icons[tournament.icon as keyof typeof icons];
  return <div className="flex h-full flex-col p-6 md:p-7"><div className="flex items-start justify-between gap-3"><Badge tone="glass" icon={<Icon size={14} />}>{tournament.category}</Badge></div><div className="mt-auto"><h3 className="type-title-large text-white">{tournament.title}</h3><div className="mt-5 flex flex-col gap-2"><MetaRow icon={<CalendarDays size={14} />} text={tournament.date} /><MetaRow icon={<Medal size={14} />} text={tournament.format} /><MetaRow icon={<Wallet size={14} />} text={tournament.entryFee} /></div><p className="type-body-sm mt-5 text-white/80">{tournament.description}</p><div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-4"><Price label={tournament.prizeLabel} value={tournament.prize} tone="light" /><ArrowAction tone="glass" size="sm" cardHover /></div></div></div>;
}

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  if (tournament.type === "image") return <ImageCard src={tournament.image} alt={tournament.title} overlay={tournament.overlay as ImageOverlay} className="aspect-[3/4] h-full"><TournamentBody tournament={tournament} /></ImageCard>;
  return <MeshCard tone={tournament.mesh as MeshTone} className="aspect-[3/4] h-full"><TournamentBody tournament={tournament} /></MeshCard>;
}

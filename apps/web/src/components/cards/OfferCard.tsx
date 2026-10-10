import React from 'react';
import { PartyPopper, Trophy } from "lucide-react";
import type { HomepageDTO } from "@unlim/content-contract";
import { Badge } from "../ui/Badge";
import { MeshCard, type MeshTone } from "../ui/Card";
import { ProgressiveImage } from "../ui/ProgressiveImage";
import { Typography } from "../ui/Typography";
import { ContentAction } from "../ContentAction";

export type Offer = HomepageDTO["home"]["offers"][number];
const icons = { Trophy, PartyPopper };

export function OfferCard({ offer, wide = false }: { offer: Offer; wide?: boolean }) {
  const Icon = offer.icon ? icons[offer.icon] : null;
  const hasAction = offer.action.mode !== 'none' && Boolean(offer.action.label);
  return <MeshCard tone={(offer.meshTone ?? 'deep-blue') as MeshTone} interactive={false} reveal={false} data-offer-card className={`grid h-full overflow-hidden ${wide && offer.image ? 'md:grid-cols-2' : ''}`}>
    <div className="flex min-h-[300px] flex-col justify-between gap-10 p-6 md:min-h-[360px] md:p-8 lg:p-10">
      {offer.badge && <div><Badge tone="outline-light" reveal={false} icon={Icon ? <Icon size={13} /> : undefined}>{offer.badge}</Badge></div>}
      <div className="max-w-[500px]">
        {offer.title && <Typography as="h3" role="title-card" reveal={false} className="text-white">{offer.title}</Typography>}
        {offer.description && <Typography role="body-small" reveal={false} className="mt-3 text-white">{offer.description}</Typography>}
        {hasAction && <ContentAction action={offer.action} sourcePage="/" sourceEntity={offer.title} variant="secondary" size="sm" className="mt-5" />}
      </div>
    </div>
    {offer.image && <div className={`relative min-h-[260px] ${wide ? 'md:min-h-0' : ''}`}><ProgressiveImage media={offer.image} alt={offer.image.alt} loading="lazy" sizes="(min-width: 1041px) 50vw, 100vw" className={`h-full w-full object-cover object-top ${wide ? 'md:absolute md:inset-0' : 'absolute inset-0'}`} /></div>}
  </MeshCard>;
}

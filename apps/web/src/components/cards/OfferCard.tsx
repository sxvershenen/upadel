import React from 'react';
import { PartyPopper, Trophy } from "lucide-react";
import type { HomepageDTO } from "@unlim/content-contract";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { ImageCard, MeshCard, imageOverlayForMesh, type MeshTone } from "../ui/Card";
import { Typography } from "../ui/Typography";
import { ContentAction } from "../ContentAction";

export type Offer = HomepageDTO["home"]["offers"][number];
const icons = { Trophy, PartyPopper };

export function OfferCard({ offer, wide = false }: { offer: Offer; wide?: boolean }) {
  const isEventOffer = offer.variant === 'event' || offer.variant === 'tournament-venue';
  const Icon = offer.icon ? icons[offer.icon] : null;
  const hasAction = !isEventOffer && offer.action.mode !== 'none' && Boolean(offer.action.label);
  const titleRole = wide ? 'section' : 'title-card';
  const descriptionRole = wide ? 'body' : 'body-small';
  const content = <div className="flex h-full flex-col justify-between gap-12 p-6 md:p-8">
    {isEventOffer && <ContentAction action={{ mode: 'phone', label: 'Связаться с клубом' }} mobileQuickActions aria-label="Ваше мероприятие — связаться с клубом" variant="primary" className="!absolute !inset-0 !z-20 !m-0 !h-full !w-full !cursor-pointer !bg-transparent !p-0 !text-transparent !shadow-none hover:!bg-transparent focus-visible:!outline-2 focus-visible:!outline-lime focus-visible:!outline-offset-4" />}
    <div className="flex items-start justify-between gap-4">
      {offer.badge ? <Badge tone="outline-light" reveal={false} icon={Icon ? <Icon size={13} className="shrink-0" /> : undefined} className="whitespace-normal leading-snug">{offer.badge}</Badge> : <span />}
      <ArrowAction tone="glass" cardHover />
    </div>
    <div className={wide ? 'max-w-[760px] md:max-w-[900px]' : 'max-w-[500px]'}>
      {offer.title && <Typography as="h3" role={titleRole} reveal={false} className="text-white">{offer.title}</Typography>}
      {offer.description && <Typography role={descriptionRole} reveal={false} className="mt-3 text-white/80">{offer.description}</Typography>}
      {hasAction && <ContentAction action={offer.action} sourcePage="/" sourceEntity={offer.title} variant="secondary" size="sm" className="mt-5" />}
    </div>
  </div>;
  return offer.image
    ? <ImageCard data-offer-card reveal={false} media={offer.image} src={offer.image.url} alt={offer.image.alt} sizes={`(min-width: 1041px) ${wide ? 100 : 50}vw, 100vw`} overlay={imageOverlayForMesh(offer.meshTone)} parallax className={`h-full w-full min-w-0 min-h-[300px] aspect-[4/3] ${isEventOffer ? '' : 'cursor-default'} ${wide ? 'offer-card--wide md:aspect-[4/1]' : 'md:aspect-[2/1]'}`}>{content}</ImageCard>
    : <MeshCard data-offer-card tone={(offer.meshTone ?? 'deep-blue') as MeshTone} reveal={false} className={`h-full w-full min-w-0 min-h-[300px] ${isEventOffer ? '' : 'cursor-default'}`}>{content}</MeshCard>;
}

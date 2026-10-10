import React from 'react';
import { OfferCard } from "../components/cards/OfferCard";
import { useContent } from "../content/ContentContext";
import { Reveal } from "../components/ui/Reveal";

export function Offers() {
  const { home } = useContent();
  if (home.offers.length === 0) return null;
  return <section data-offers-section className="container-page pb-24 pt-6 md:pb-36 md:pt-10"><div className={`grid gap-4 ${home.offers.length > 1 ? 'min-[1041px]:grid-cols-2' : ''}`}>{home.offers.map((offer, index) => <Reveal key={offer.id} delay={index * 0.08}><OfferCard offer={offer} wide={home.offers.length === 1} /></Reveal>)}</div></section>;
}

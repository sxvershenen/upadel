import { OfferCard, offers } from "../components/cards/OfferCard";
import { Reveal } from "../components/ui/Reveal";

export function Offers() {
  return <section className="container-page pb-24 pt-6 md:pb-36 md:pt-10"><div className="grid gap-4 md:grid-cols-2">{offers.map((offer, index) => <Reveal key={offer.id} delay={index * 0.08}><OfferCard offer={offer} /></Reveal>)}</div></section>;
}

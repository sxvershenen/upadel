import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { RentalRateCard } from "../../components/cards/RentPricingCards";
import { useContent } from "../../content/ContentContext";
import { horizontalSwiperProps } from "../../lib/swiper";
import { useMobileSwipeHint } from "../../lib/useMobileSwipeHint";

export function PricingRent({ onSwiperChange }: { onSwiperChange?: (swiper: SwiperType) => void }) {
  const { entities, home } = useContent();
  const standardRates = entities.rentalRates;
  const pricing = home.pricingSection;
  const offers = pricing.membershipOffer.enabled && pricing.membershipOffer.showOnHomepage ? [{ ...pricing.membershipOffer, id: 'homepage-membership-offer', cardVariant: 'membership-offer' as const, price: null, priceSuffix: null, badge: null, badgeTone: null, timeLabel: null, includedItems: [] }] : [];
  const standards = pricing.rentalStandards.enabled && pricing.rentalStandards.showOnHomepage ? { ...pricing.rentalStandards, id: 'homepage-rental-standards', cardVariant: 'standards' as const, price: null, priceLabel: null, priceSuffix: null, badge: null, badgeTone: null, action: { mode: 'none' as const }, includedItems: pricing.rentalStandards.includedItems } : undefined;
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeHintRef = useMobileSwipeHint(swiperRef, "home-pricing-rent");
  return <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(320px,1fr)_auto]">
    {standardRates.map((rate) => <div key={rate.id} className="hidden lg:col-span-4 lg:row-start-1 lg:block"><RentalRateCard rate={rate} /></div>)}
    <div ref={swipeHintRef} className="-mx-5 lg:hidden"><Swiper {...horizontalSwiperProps} onSwiper={(swiper) => { swiperRef.current = swiper; onSwiperChange?.(swiper); }} onSlideChange={(swiper) => onSwiperChange?.(swiper)} onResize={(swiper) => onSwiperChange?.(swiper)} slidesPerView={1} spaceBetween={12} className="swiper-breathe pricing-rent-swiper !px-5">{standardRates.map((rate) => <SwiperSlide key={rate.id} className="!h-auto"><RentalRateCard rate={rate} layout="compact" /></SwiperSlide>)}</Swiper></div>
    {offers.map((offer) => <div key={offer.id} className="lg:col-span-8 lg:row-start-2"><RentalRateCard rate={{ ...offer, action: pricing.membershipOffer.action }} layout="strip" /></div>)}
    {standards && <div className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1"><RentalRateCard rate={standards} /></div>}
  </div>;
}

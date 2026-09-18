export * from "../components/ui/Accordion";
export * from "../components/ui/ArrowAction";
export * from "../components/ui/Badge";
export * from "../components/ui/Button";
export * from "../components/ui/Card";
export * from "../components/ui/CoolModeButton";
export * from "../components/ui/Dialog";
export * from "../components/ui/Field";
export * from "../components/ui/Marquee";
export * from "../components/ui/MobileSwiperNav";
export * from "../components/ui/Price";
export * from "../components/ui/Reveal";
export * from "../components/ui/SectionHeader";
export * from "../components/ui/Select";
export * from "../components/ui/SelectField";
export * from "../components/ui/SplitTextReveal";
export * from "../components/ui/Tabs";
export * from "../components/ui/Typography";
export * from "../components/navigation/BottomSheet";
export * from "../components/cards/ArticleCard";
export * from "../components/cards/BenefitCards";
export * from "../components/cards/CoachCard";
export * from "../components/cards/CourtCards";
export * from "../components/cards/GalleryCard";
export * from "../components/cards/MembershipCards";
export * from "../components/cards/OfferCard";
export * from "../components/cards/RentPricingCards";
export * from "../components/cards/ReviewCard";
export * from "../components/cards/TournamentCard";
export * from "../components/cards/TrainingCard";

export const designSystemCatalog = {
  buttonVariants: ["primary", "secondary", "neutral", "glass", "dark"],
  buttonSizes: ["sm", "md", "lg"],
  controls: ["select", "select-field"],
  badgeTones: ["dark", "light", "lime", "lime-soft", "sunset", "gold", "muted", "glass", "outline-light", "outline-dark"],
  meshTones: ["indigo", "deep-blue", "dark", "lime", "lime-soft", "sky", "lavender", "sunset", "navy-gold"],
  typeRoles: ["micro", "caption", "ui", "body-small", "body", "editorial", "hero-lead", "title-compact", "title-dense", "title-card", "title-large", "price", "section", "hero", "eyebrow"],
  textTones: ["default", "muted", "subtle", "inverse", "inverse-strong", "inverse-muted", "inverse-subtle", "accent", "danger"],
} as const;

import { motion } from "framer-motion";
import { Coffee, CircleParking, LockKeyhole, ShieldCheck, ShowerHead, Smartphone, Smile, Sparkles } from "lucide-react";
import { images } from "../../data/images";
import { springSoft } from "../../lib/motion";
import { cn } from "../../utils/cn";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { ImageCard, MeshCard } from "../ui/Card";

const decorativeVariants = {
  rest: { scale: 1, rotate: 0, y: 0 },
  hover: { scale: 1.06, rotate: -4, y: -7 },
};

function FeatureIcon({ children, tone }: { children: React.ReactNode; tone: "lime" | "sky" | "sunset" }) {
  const toneClass = {
    lime: "bg-[rgb(124_185_16_/_41%)] text-white transition-colors group-hover/mesh:bg-[rgb(98_161_0_/_41%)]",
    sky: "bg-[rgb(52_151_223_/_41%)] text-white transition-colors group-hover/mesh:bg-[rgb(0_148_255_/_41%)]",
    sunset: "bg-[rgb(194_101_53_/_41%)] text-white transition-colors group-hover/mesh:bg-[rgb(222_78_24_/_41%)]",
  }[tone];
  return <span className={cn("se-2 flex h-12 w-12 items-center justify-center", toneClass)}>{children}</span>;
}

function FeatureArrow() {
  return <ArrowAction tone="glass" size="sm" cardHover className="!bg-[rgba(255,255,255,0.1)] !text-white !backdrop-blur-md group-hover/mesh:!bg-lime group-hover/mesh:!text-ink" />;
}

export function ChillCard() {
  return <ImageCard src={images.benefitsChill} alt="Чилл-зона и кофейня клуба Unlim Riga Padel" overlay="overlay-sunset" className="h-full min-h-[320px]"><div className="flex h-full flex-col justify-between p-6 md:p-7"><Badge tone="outline-light" icon={<Coffee size={13} />}>Атмосфера</Badge><div className="max-w-[390px]"><h3 className="type-title-card font-semibold text-white">Чилл-зона &amp; кофейня</h3><p className="type-body-sm mt-2 max-w-[360px] text-white">Панорамный вид на корт, спешелти кофе от шеф-бариста, смузи-бар и удобные зоны для отдыха и работы.</p></div></div></ImageCard>;
}

export function LockersCard() {
  return <ImageCard src={images.benefitsShower} alt="Премиальные раздевалки клуба" overlay="overlay-blue" imgClassName="object-[68%_center]" className="h-full min-h-[320px]"><div className="flex h-full flex-col justify-between p-6 md:p-7"><Badge tone="outline-light" icon={<LockKeyhole size={13} />}>Комфорт</Badge><div><h3 className="type-title-card font-semibold text-white">Раздевалки премиум</h3><p className="type-body-sm mt-2 text-white">Индивидуальные электронные замки, просторные шкафчики, фены и банный текстиль.</p></div></div></ImageCard>;
}

export function ShowerCard() {
  return <ImageCard src={images.benefitsShower} alt="Тропический душ клуба" overlay="overlay-cyan" imgClassName="object-[35%_center]" className="h-full min-h-[320px]"><div className="flex h-full flex-col justify-between p-6 md:p-7"><Badge tone="outline-light" icon={<ShowerHead size={13} />}>Релакс</Badge><div><h3 className="type-title-card font-semibold text-white">Тропический душ</h3><p className="type-body-sm mt-2 text-white">Матовые стекла, расслабляющий гидромассаж, премиальная косметика и мягкие хлопковые полотенца.</p></div></div></ImageCard>;
}

export function ParkingCard() {
  return <MeshCard tone="lime" className="flex h-full min-h-[320px] p-6 md:p-7"><motion.img src="/parking-sign.png" alt="" aria-hidden="true" variants={decorativeVariants} transition={springSoft} className="pointer-events-none absolute -bottom-20 -right-10 z-0 h-[300px] w-auto opacity-100" /><div className="relative z-10 flex h-full w-full flex-col"><div className="flex items-start justify-between gap-4"><span className="type-eyebrow max-w-[70%] text-[#527d0e]">50 мест у клуба</span><FeatureIcon tone="lime"><CircleParking size={23} strokeWidth={1.8} /></FeatureIcon></div><div className="absolute inset-x-0 bottom-0"><div className="max-w-[62%]"><h3 className="type-title-card text-[#244500]">Бесплатная парковка</h3><p className="type-body-sm mt-2 text-[#3f6212]">Охрана 24/7, шлагбаум и зарядки для электрокаров.</p></div></div></div></MeshCard>;
}

export function OnlineBookingCard() {
  return <MeshCard tone="sky" className="flex h-full min-h-[320px] p-6 md:p-7"><motion.img src="/booking-phone.png" alt="" aria-hidden="true" variants={decorativeVariants} transition={springSoft} className="booking-phone pointer-events-none absolute -bottom-16 -right-8 z-0 h-[240px] w-auto opacity-100" /><div className="relative z-10 flex h-full w-full flex-col"><div className="flex items-start justify-between gap-4"><span className="type-eyebrow max-w-[70%] text-[#2563a3]">Digital сервис</span><FeatureIcon tone="sky"><Smartphone size={21} strokeWidth={1.8} /></FeatureIcon></div><div className="absolute inset-x-0 bottom-0"><div className="max-w-[68%]"><h3 className="type-title-card text-[#0b3a5c]">Онлайн-бронь <span className="whitespace-nowrap">за 30 сек</span></h3><p className="type-body-sm mt-2 text-[#18527c]">Прямо с телефона — без звонков и ожидания подтверждения.</p></div></div><span className="absolute bottom-0 right-0"><FeatureArrow /></span></div></MeshCard>;
}

export function CoachesMetricCard() {
  return <MeshCard tone="sunset" className="flex h-full min-h-[320px] p-6 md:p-7"><motion.img src="/padel-racket.png" alt="" aria-hidden="true" variants={decorativeVariants} transition={springSoft} className="pointer-events-none absolute -bottom-20 -right-10 z-0 h-[330px] w-auto opacity-100" /><div className="relative z-10 flex h-full w-full flex-col"><div className="flex items-start justify-between gap-4"><span className="type-eyebrow max-w-[70%] text-[#a34d2c]">FIP &amp; WPT сертификаты</span><FeatureIcon tone="sunset"><Sparkles size={22} strokeWidth={1.8} /></FeatureIcon></div><div className="absolute inset-x-0 bottom-0"><div className="max-w-[68%]"><h3 className="type-title-card text-[#5c230f]">Опытные тренеры</h3><p className="type-body-sm mt-2 text-[#7c3f14]">Мастера спорта, призеры всероссийских турниров и методисты с авторскими программами прокачки техники.</p></div></div><span className="absolute bottom-0 right-0"><FeatureArrow /></span></div></MeshCard>;
}

export function KidsCard() {
  return <MeshCard tone="sky" className="flex h-full min-h-[320px] p-6 md:p-7"><motion.img src="/padel-ball.png" alt="" aria-hidden="true" variants={decorativeVariants} transition={springSoft} className="pointer-events-none absolute -bottom-16 -right-8 z-0 h-[300px] w-auto opacity-100" /><div className="relative z-10 flex h-full w-full flex-col"><div className="flex items-start justify-between gap-4"><span className="type-eyebrow max-w-[70%] text-[#2563a3]">Unlim Kids Academy</span><FeatureIcon tone="sky"><Smile size={22} strokeWidth={1.8} /></FeatureIcon></div><div className="my-8 max-w-[70%]"><h3 className="type-title-card text-[#0b3a5c]">Секции для детей с 5 лет</h3><p className="type-body-sm mt-2 max-w-[650px] text-[#18527c]">Бережная постановка правильной биомеханики, развитие координации, подвижности и командного духа в мини-группах до 4 человек.</p></div><div className="mt-auto flex items-center justify-between border-t border-[#2563a3]/20 pt-4"><span className="type-ui flex max-w-[64%] items-center gap-2 font-semibold text-[#18527c]"><ShieldCheck size={17} /> Облегченные детские ракетки Bullpadel</span><FeatureArrow /></div></div></MeshCard>;
}

export const benefitCardComponents = [
  { id: "parking", Component: ParkingCard, wide: false },
  { id: "lockers", Component: LockersCard, wide: false },
  { id: "shower", Component: ShowerCard, wide: false },
  { id: "chill", Component: ChillCard, wide: false },
  { id: "online", Component: OnlineBookingCard, wide: false },
  { id: "coaches", Component: CoachesMetricCard, wide: false },
  { id: "kids", Component: KidsCard, wide: true },
] as const;

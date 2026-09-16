import { Baby, User, Users } from "lucide-react";
import { images } from "../../data/images";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { ImageCard } from "../ui/Card";
import { Price } from "../ui/Price";

export const trainings = [
  { id: "individual", image: images.trainingIndividual, overlay: "overlay-blue" as const, icon: User, badge: "1 на 1", title: "Индивидуальная", description: "Персональная программа под ваш уровень: техника, тактика и разбор ошибок один на один с тренером.", price: 4900 },
  { id: "group", image: images.trainingGroup, overlay: "overlay-lime" as const, icon: Users, badge: "До 4-х", title: "Групповая", description: "Динамичные сборы с игроками похожего уровня — тактика в паре и живая соревновательная атмосфера.", price: 2900 },
  { id: "kids", image: images.trainingKids, overlay: "overlay-violet" as const, icon: Baby, badge: "От 5 лет", title: "Детская", description: "Игровой формат обучения: базовая техника, координация и первые матчи в компании сверстников.", price: 2500 },
] as const;
export type Training = (typeof trainings)[number];

export function TrainingCard({ training }: { training: Training }) {
  const Icon = training.icon;
  return <ImageCard src={training.image} alt={training.title} overlay={training.overlay} className="h-[500px] min-h-[500px]"><div className="flex h-full flex-col justify-between p-6 md:p-7"><div className="flex items-start justify-between"><Badge tone="outline-light" icon={<Icon size={13} />}>{training.badge}</Badge></div><div><h3 className="type-title-card text-white">{training.title}</h3><p className="type-body-sm mt-2 text-white">{training.description}</p><div className="mt-6 flex items-end justify-between border-t border-white/15 pt-4"><Price label="час от" value={training.price} tone="light" /><ArrowAction tone="glass" size="sm" cardHover /></div></div></div></ImageCard>;
}

import { useState } from "react";
import { Check, CreditCard, Crown, Gift } from "lucide-react";
import { cn } from "../../utils/cn";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { DarkMeshCard, MeshCard, WhiteCard } from "../ui/Card";
import { Field } from "../ui/Field";
import { Price } from "../ui/Price";

export function GiftMembershipCard() {
  const [amount, setAmount] = useState("5000");
  const numeric = Number(amount || 0);
  const invalid = numeric > 0 && (numeric < 1000 || numeric > 100000);
  return <MeshCard tone="lavender" className="flex h-[500px] min-h-[500px] flex-col justify-between p-6 text-white md:p-7"><div className="flex items-start justify-between"><span className="se-2 flex h-11 w-11 items-center justify-center bg-white/15 text-white"><Gift size={20} /></span></div><div className="mt-7"><h3 className="type-title-card text-white">Подарочный сертификат</h3><p className="type-body-sm mt-2 max-w-[300px] text-white/75">Можно использовать для оплаты аренды корта или тренировок.</p></div><div className="mt-6"><Field label="Введите сумму" tone="dark" inputMode="numeric" pattern="[0-9]*" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="0" suffix="₽" error={invalid ? "Сумма от 1 000 до 100 000 ₽" : undefined} /><Button variant="secondary" size="md" fullWidth className="mt-4">Подарить онлайн</Button></div></MeshCard>;
}

function MembershipFooter({ price, oldPrice, subline, tone = "dark", arrowClassName }: { price: number; oldPrice?: number; subline?: string; tone?: "dark" | "light"; arrowClassName?: string }) {
  return <div className={cn("mt-auto flex items-end justify-between border-t pt-5", tone === "dark" ? "border-ink/10" : "border-white/10")}><Price label={subline ?? "месяц за"} value={price} oldValue={oldPrice} tone={tone} /><ArrowAction tone={tone === "dark" ? "dark" : "glass"} cardHover className={arrowClassName} /></div>;
}

function CheckItem({ children, className = "bg-[#f1f1f1] text-ink", textClassName = "text-ink-soft" }: { children: React.ReactNode; className?: string; textClassName?: string }) { return <li className={cn("type-body-sm flex items-center gap-3 leading-snug", textClassName)}><span className={cn("se-1 flex h-7 w-7 shrink-0 items-center justify-center", className)}><Check size={15} strokeWidth={2.4} /></span><span>{children}</span></li>; }

export function MembershipSmallCard() {
  return <WhiteCard className="flex h-[500px] min-h-[500px] flex-col p-6 md:p-7"><div className="flex items-start justify-between gap-4"><span className="se-2 flex h-11 w-11 items-center justify-center bg-[#f1f1f1] text-ink"><CreditCard size={20} strokeWidth={1.8} /></span><Badge tone="muted">Пакет S</Badge></div><div className="mt-7 flex-1"><h3 className="type-title-card text-ink">Карта на 5 игр</h3><p className="type-body-sm mt-2 text-ink-soft">Удобный старт для регулярной игры</p><ul className="mt-7 flex flex-col gap-2"><CheckItem>Любой открытый корт</CheckItem><CheckItem>Перенос игр без сгорания</CheckItem><CheckItem>Срок действия — 60 дней</CheckItem><CheckItem>Бесплатные мячи и полотенца</CheckItem></ul></div><MembershipFooter price={7900} subline="1 580 ₽ за одну игру" /></WhiteCard>;
}

export function MembershipMediumCard() {
  return <div className="relative h-[500px] min-h-[500px] pt-1"><Badge tone="lime" className="se-full absolute -top-4 left-1/2 z-20 -translate-x-1/2 px-4 shadow-[0_8px_18px_-10px_rgba(116,185,16,.8)]">Хит сезона</Badge><WhiteCard className="flex h-full min-h-[500px] flex-col p-6 md:p-7"><div className="flex items-start justify-between gap-4"><span className="se-2 flex h-11 w-11 items-center justify-center bg-lime-soft text-lime-soft-ink"><CreditCard size={20} strokeWidth={1.8} /></span><Badge tone="lime-soft">Пакет M</Badge></div><div className="mt-7 flex-1"><h3 className="type-title-card text-ink">Карта на 10 игр</h3><p className="type-body-sm mt-2 text-ink-soft">Оптимально для активных игроков</p><ul className="mt-7 flex flex-col gap-2"><CheckItem className="bg-lime text-[#244500]">Приоритетная бронь корта за 14 дней</CheckItem><CheckItem className="bg-lime text-[#244500]">Бесплатные ракетки Varlion Maxima</CheckItem><CheckItem className="bg-lime text-[#244500]">1 гостевой визит в подарок</CheckItem><CheckItem className="bg-lime text-[#244500]">Срок действия — 90 дней</CheckItem><CheckItem className="bg-lime text-[#244500]">Заморозка до 14 дней</CheckItem></ul></div><MembershipFooter price={11900} subline="1 190 ₽ за одну игру" /></WhiteCard></div>;
}

export function MembershipResidentCard() {
  return <DarkMeshCard className="flex h-[500px] min-h-[500px] flex-col p-6 md:p-7"><div className="flex items-start justify-between gap-4"><span className="se-2 flex h-11 w-11 items-center justify-center bg-[#6e5416] text-gold"><Crown size={20} strokeWidth={1.8} /></span><Badge tone="gold">VIP Статус</Badge></div><div className="mt-7 flex-1"><h3 className="type-title-card text-white">Резидент клуба</h3><p className="type-body-sm mt-2 text-white/60">Полный безлимит и персональный сервис</p><ul className="mt-7 flex flex-col gap-2"><CheckItem className="bg-gold text-gold-ink" textClassName="text-white/80">Скидка 5% на бар и магазин</CheckItem><CheckItem className="bg-gold text-gold-ink" textClassName="text-white/80">Безлимит на все корты клуба</CheckItem><CheckItem className="bg-gold text-gold-ink" textClassName="text-white/80">Именной шкафчик в раздевалке</CheckItem><CheckItem className="bg-gold text-gold-ink" textClassName="text-white/80">Групповые тренировки включены</CheckItem><CheckItem className="bg-gold text-gold-ink" textClassName="text-white/80">Участие во всех турнирах Americano</CheckItem></ul></div><MembershipFooter price={40900} subline="в месяц / полный доступ" tone="light" arrowClassName="!bg-white !text-gold-ink group-hover/card:!bg-gold group-hover/card:!text-gold-ink" /></DarkMeshCard>;
}

export const membershipCardComponents = [
  { id: "gift", Component: GiftMembershipCard },
  { id: "s", Component: MembershipSmallCard },
  { id: "m", Component: MembershipMediumCard },
  { id: "l", Component: MembershipResidentCard },
] as const;

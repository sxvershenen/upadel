import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { springSoft } from "../../lib/motion";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MeshCard, WhiteCard } from "../ui/Card";
import { Price } from "../ui/Price";

const included = ["Ракетки и мячи без ограничений", "Полотенца и артезианская вода", "Комфортные раздевалки и душ", "Лаунж-пространство с кофе", "Фотозона с пьедесталом"];
const periodLabel = "type-eyebrow text-ink-soft";

export function RentDayCard() {
  return <WhiteCard className="flex h-full min-h-[360px] flex-col justify-between p-7 md:p-8"><div className="flex items-start justify-between gap-3"><span className={periodLabel}>Дневные часы</span><Badge tone="lime">Выгодно</Badge></div><div className="mt-6"><h3 className="type-title-large text-ink">Будни</h3><span className="type-ui mt-2 block text-ink-soft">08:00–17:00</span><p className="type-body-sm mt-4 max-w-[410px] text-ink-soft">Идеальное время для спокойной тренировки, отработки подачи и игры в светлое время суток без лишней суеты.</p></div><div className="mt-8 flex items-end justify-between border-t border-ink/10 pt-5"><Price label="стоимость" value={3500} suffix="/ час" /><ArrowAction tone="light" cardHover className="bg-surface-muted text-ink shadow-none" /></div></WhiteCard>;
}

export function RentPrimeCard() {
  return <WhiteCard className="flex h-full min-h-[360px] flex-col justify-between p-7 md:p-8"><div className="flex items-start justify-between gap-3"><span className={periodLabel}>Прайм-тайм</span><Badge tone="sunset">Популярно</Badge></div><div className="mt-6"><h3 className="type-title-large text-ink">Вечер и выходные</h3><span className="type-ui mt-2 block text-ink-soft">17:00–23:00, Сб–Вс целый день</span><p className="type-body-sm mt-4 max-w-[410px] text-ink-soft">Самая клубная атмосфера, музыка, открытый лаунж-бар и динамичные матчи с резидентами клуба.</p></div><div className="mt-8 flex items-end justify-between border-t border-ink/10 pt-5"><Price label="стоимость" value={5500} suffix="/ час" /><ArrowAction tone="light" cardHover className="bg-surface-muted text-ink shadow-none" /></div></WhiteCard>;
}

export function RentTrialCard() {
  return <MeshCard tone="deep-blue" className="relative flex h-full min-h-[240px] flex-col overflow-hidden p-7 text-white md:p-8"><motion.img src="/padel-racket.png" alt="" aria-hidden="true" variants={{ rest: { scale: 1, rotate: 7, y: 0 }, hover: { scale: 1.05, rotate: 3, y: -6 } }} transition={springSoft} className="pointer-events-none absolute -bottom-28 right-[9%] z-0 h-[300px] w-auto opacity-95" /><motion.img src="/padel-ball.png" alt="" aria-hidden="true" variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.08, y: -5 } }} transition={springSoft} className="pointer-events-none absolute -bottom-20 -right-6 z-0 h-[190px] w-auto opacity-95" /><div className="relative z-10 max-w-[82%] md:max-w-[60%]"><span className="type-eyebrow text-white/65">Специальное предложение</span><h3 className="type-title-large mt-4 text-white">Пробная тренировка за 1 990 ₽</h3><p className="type-body-sm mt-2 text-white/75">60 минут индивидуального внимания тренера + корт + профессиональная ракетка включены.</p><Button variant="primary" size="md" icon={<ArrowRight size={17} />} className="mt-5">Записаться на пробную</Button></div></MeshCard>;
}

export function RentStandardsCard() {
  return <MeshCard tone="dark" className="flex h-full min-h-[570px] flex-col p-7 md:p-8"><span className="type-eyebrow text-white/50">Премиальный сервис</span><h3 className="type-title-large mt-5 text-white">Стандарты Unlim Riga</h3><span className="type-ui mt-2 text-white/60">Включено в стоимость аренды</span><p className="type-body-sm mt-5 text-white/65">Никаких скрытых доплат. Каждый визит в клуб организован по стандарту премиального спортивного курорта.</p><ul className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-7">{included.map((item) => <li key={item} className="type-body-sm flex items-center gap-3 text-white/80"><span className="se-1 flex h-7 w-7 shrink-0 items-center justify-center bg-white/10 text-white/75"><Check size={15} /></span>{item}</li>)}</ul><Button variant="secondary" size="md" fullWidth icon={<ArrowRight size={17} />} iconDivider={false} className="mt-auto hover:!bg-lime hover:!text-ink">Забронировать корт сейчас</Button></MeshCard>;
}

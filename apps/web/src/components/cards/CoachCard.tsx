import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import type { HomepageDTO } from "@unlim/content-contract";
import { springSoft } from "../../lib/motion";
import { useImageParallax } from "../../lib/useImageParallax";
import { ArrowAction } from "../ui/ArrowAction";
import { Badge } from "../ui/Badge";
import { Button, ButtonLink } from "../ui/Button";
import { WhiteCard } from "../ui/Card";
import { Dialog } from "../ui/Dialog";
import { Price } from "../ui/Price";
import { Typography } from "../ui/Typography";
import type { RevealConfig } from "../ui/revealAttributes";

export type Coach = HomepageDTO["entities"]["coaches"][number];

export function CoachCard({ coach, loading = "eager", reveal = true }: { coach: Coach; loading?: "eager" | "lazy"; reveal?: RevealConfig }) {
  const [open, setOpen] = useState(false);
  const closeDialog = useCallback(() => setOpen(false), []);
  const photoRef = useRef<HTMLDivElement>(null);
  const photoY = useImageParallax(photoRef);

  return <>
    <button type="button" aria-haspopup="dialog" aria-label={`Открыть профиль тренера ${coach.name}`} onClick={() => setOpen(true)} className="block h-full w-full text-left focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-4">
      <WhiteCard reveal={reveal} className="flex h-full flex-col overflow-hidden p-4">
        <div ref={photoRef} data-parallax-viewport className="parallax-viewport se-2 relative aspect-[4/5] w-full">
          <motion.div data-parallax-layer style={{ y: photoY }} className="parallax-layer overflow-hidden">
            <motion.img src={coach.photo.url} alt={coach.photo.alt} loading={loading} className="h-full w-full object-cover" variants={{ rest: { scale: 1.04 }, hover: { scale: 1.095 } }} transition={springSoft} />
          </motion.div>
          <div className="absolute left-3 top-3"><Badge tone="glass" className="image-glass px-2.5"><Star size={12} className="fill-lime text-lime" /> {coach.rating} · {coach.reviewsCount}</Badge></div>
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">{coach.certificates.slice(0, 2).map((certificate) => <span key={certificate} className="se-1 type-micro image-glass flex items-center gap-1 px-2 py-1 text-white"><BadgeCheck size={11} /> {certificate}</span>)}</div>
        </div>
        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
          <h3 className="type-title-compact text-ink">{coach.name}</h3>
          <p className="type-body-sm mt-2 text-ink-soft/90">{coach.bio}</p>
          <div className="mt-4 flex items-end justify-between border-t border-ink/10 pt-4"><Price label="час от" value={coach.priceFrom} /><ArrowAction tone="light" size="sm" cardHover className="bg-surface-muted text-ink" /></div>
        </div>
      </WhiteCard>
    </button>

    <Dialog open={open} onClose={closeDialog} title={coach.name}>
      <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
        <img src={coach.photo.url} alt={coach.photo.alt} className="se-3 h-[175px] w-[140px] object-cover md:h-auto md:max-h-[360px] md:w-full" />
        <div className="flex flex-col">
          <Badge tone="lime">{coach.specialization}</Badge>
          <Typography role="body" tone="muted" className="mt-4">{coach.bio}</Typography>
        </div>
        <dl className="type-body-sm col-span-2 grid gap-3 border-y border-ink/10 py-4">
          <div className="flex justify-between gap-4"><dt className="text-ink-soft">Уровень</dt><dd className="text-right text-ink">{coach.level}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-soft">Опыт</dt><dd className="text-right text-ink">{coach.experience}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-soft">Языки</dt><dd className="text-right text-ink">{coach.languages}</dd></div>
        </dl>
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-4"><Price label="тренировка от" value={coach.priceFrom} /><div className="flex gap-2"><ButtonLink href={`/coaches/${coach.slug}`} variant="neutral">Подробнее</ButtonLink><Button onClick={closeDialog}>{coach.action.label ?? "Выбрать тренера"}</Button></div></div>
      </div>
    </Dialog>
  </>;
}

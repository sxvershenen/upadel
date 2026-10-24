import React, { useCallback, useRef, useState } from "react";
import type { HomepageDTO } from "@unlim/content-contract";
import { ArrowAction } from "../ui/ArrowAction";
import { ButtonLink } from "../ui/Button";
import { ContentAction } from "../ContentAction";
import { WhiteCard } from "../ui/Card";
import { Dialog } from "../ui/Dialog";
import { Price } from "../ui/Price";
import { Typography } from "../ui/Typography";
import { ProgressiveImage } from "../ui/ProgressiveImage";
import type { RevealConfig } from "../ui/revealAttributes";
import { CoachRentalNote } from "./CoachRentalNote";

export type Coach = HomepageDTO["entities"]["coaches"][number];

export function CoachCard({ coach, loading = "lazy", reveal = true }: { coach: Coach; loading?: "eager" | "lazy"; reveal?: RevealConfig }) {
  const [open, setOpen] = useState(false);
  const [modalPhotoSrc, setModalPhotoSrc] = useState(coach.photo.url);
  const closeDialog = useCallback(() => setOpen(false), []);
  const photoImageRef = useRef<HTMLImageElement>(null);
  const openDialog = useCallback(() => {
    const image = photoImageRef.current;
    setModalPhotoSrc(image?.currentSrc || image?.src || coach.photo.url);
    setOpen(true);
  }, [coach.photo.url]);

  return <>
    <button data-coach-card="true" type="button" aria-haspopup="dialog" aria-label={`Открыть профиль тренера ${coach.name}`} onClick={openDialog} className="block h-full w-full text-left focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-4">
      <WhiteCard data-coach-surface="true" reveal={reveal} className="flex h-full flex-col overflow-hidden p-4">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[var(--se-2)] bg-ink">
          <ProgressiveImage skeleton={false} ref={photoImageRef} media={coach.photo} sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" alt={coach.photo.alt} loading={loading} className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
          <h3 className="type-title-compact text-ink">{coach.name}</h3>
          <p className="type-body-sm mt-2 line-clamp-4 text-ink-soft/90">{coach.bio}</p>
          <div className="mt-4 border-t border-ink/10 pt-4"><div className="flex items-end justify-between"><Price label="тренировка от" value={coach.priceFrom} /><ArrowAction tone="light" size="sm" cardHover className="bg-surface-muted text-ink" /></div></div>
        </div>
      </WhiteCard>
    </button>

    <Dialog open={open} onClose={closeDialog} title={coach.name} scrollable={false}>
      <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
        <img
          src={modalPhotoSrc}
          width={coach.photo.width ?? undefined}
          height={coach.photo.height ?? undefined}
          alt={coach.photo.alt}
          loading="eager"
          decoding="sync"
          draggable={false}
          className="se-3 h-auto w-[140px] self-start object-contain md:max-h-[420px] md:w-full"
        />
        <div className="flex flex-col">
          <Typography role="body" tone="muted">{coach.bio}</Typography>
          <CoachRentalNote className="type-caption mt-3 text-ink-soft" />
          <p className="type-caption mt-3 font-medium leading-snug text-lime-deep">{coach.specialization}</p>
        </div>
        <dl className="type-body-sm col-span-2 grid gap-3 border-y border-ink/10 py-4">
          <div className="flex justify-between gap-4"><dt className="text-ink-soft">Уровень</dt><dd className="text-right text-ink">{coach.level}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-soft">Опыт</dt><dd className="text-right text-ink">{coach.experience}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-soft">Языки</dt><dd className="text-right text-ink">{coach.languages}</dd></div>
        </dl>
        <div className="col-span-2"><div className="flex items-end gap-3"><Price label="тренировка от" value={coach.priceFrom} size="compact" className="shrink-0" /><div className="ml-auto flex shrink-0 gap-2"><ButtonLink href={`/coaches/${coach.slug}`} variant="neutral" onClick={closeDialog}>Подробнее</ButtonLink><ContentAction action={coach.action} sourcePage="/coaches" sourceEntity={coach.name} onAction={closeDialog} modalDelayMs={300}>Выбрать</ContentAction></div></div></div>
      </div>
    </Dialog>
  </>;
}

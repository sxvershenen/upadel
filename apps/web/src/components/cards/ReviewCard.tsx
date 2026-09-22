import { Star } from "lucide-react";
import type { HomepageDTO } from "@unlim/content-contract";
import { cn } from "../../utils/cn";
import { WhiteCard } from "../ui/Card";
import { ProgressiveImage } from "../ui/ProgressiveImage";

export type Review = HomepageDTO["entities"]["reviews"][number];

export function ReviewCard({ review }: { review: Review }) {
  return <WhiteCard className="flex w-full flex-col gap-4 p-6">
    <div className="flex items-center gap-3">{review.avatar && <ProgressiveImage media={review.avatar} sizes="44px" alt={review.avatar.alt} loading="lazy" className="h-11 w-11 rounded-full object-cover" />}<div><div className="type-ui text-ink">{review.authorName}</div><div className="type-caption text-ink-soft">{review.authorMeta}</div></div></div>
    <p className="type-body-sm text-ink-soft">{review.text}</p>
    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={13} className={cn(index < review.rating ? "fill-amber-400 text-amber-400" : "text-ink/15")} />)}</div>
  </WhiteCard>;
}

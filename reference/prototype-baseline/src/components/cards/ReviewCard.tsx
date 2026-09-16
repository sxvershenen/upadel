import { Star } from "lucide-react";
import { reviews } from "../../data/content";
import { cn } from "../../utils/cn";
import { WhiteCard } from "../ui/Card";

export type Review = (typeof reviews)[number];

export function ReviewCard({ review }: { review: Review }) {
  return <WhiteCard className="flex w-full flex-col gap-4 p-6">
    <div className="flex items-center gap-3"><img src={review.avatar} alt={review.name} className="h-11 w-11 rounded-full object-cover" /><div><div className="type-ui text-ink">{review.name}</div><div className="type-caption text-ink-soft">{review.meta}</div></div></div>
    <p className="type-body-sm text-ink-soft">{review.text}</p>
    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={13} className={cn(index < review.rating ? "fill-amber-400 text-amber-400" : "text-ink/15")} />)}</div>
  </WhiteCard>;
}

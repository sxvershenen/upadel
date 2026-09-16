import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./Button";
import { cn } from "../../utils/cn";

export function MobileSwiperNav({
  atStart,
  atEnd,
  onPrev,
  onNext,
  className,
}: {
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <IconButton variant="neutral" size="sm" aria-label="Предыдущая карточка" disabled={atStart} onClick={onPrev}>
        <ChevronLeft size={16} />
      </IconButton>
      <IconButton variant="neutral" size="sm" aria-label="Следующая карточка" disabled={atEnd} onClick={onNext}>
        <ChevronRight size={16} />
      </IconButton>
    </div>
  );
}

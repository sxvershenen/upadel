import { CalendarCheck, Navigation, Phone } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Button, ButtonLink } from "../ui/Button";

export function PlayBottomSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Быстрые действия">
      <div className="flex flex-col gap-3">
        <Button variant="primary" size="lg" fullWidth icon={<CalendarCheck size={18} />} className="justify-between px-5 text-left">
          Забронировать корт
        </Button>
        <Button variant="neutral" size="lg" fullWidth icon={<Phone size={18} />} className="justify-between px-5 text-left">
          Позвонить в клуб
        </Button>
        <ButtonLink
          href="https://yandex.ru/maps"
          target="_blank"
          rel="noreferrer"
          variant="neutral"
          size="lg"
          fullWidth
          icon={<Navigation size={18} />}
          className="justify-between px-5"
        >
          Проложить маршрут
        </ButtonLink>
      </div>
    </BottomSheet>
  );
}

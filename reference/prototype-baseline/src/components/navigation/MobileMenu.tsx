import { MapPin, Phone, Mail, Send } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "../ui/Button";

const links = [
  { label: "Цены", href: "#pricing" },
  { label: "Тренировки", href: "#training" },
  { label: "Турниры", href: "#tournaments" },
  { label: "Тренеры", href: "#coaches" },
  { label: "Подарить", href: "#memberships" },
  { label: "О клубе", href: "#footer" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Меню">
      <nav className="grid grid-cols-2 gap-2 pb-5">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="se-1 type-ui bg-surface-subtle px-4 py-3 font-medium text-ink"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="se-2 type-body-sm flex flex-col gap-3 bg-surface-subtle p-4 text-ink-soft">
        <a href="https://yandex.ru/maps" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-ink">
          <MapPin size={16} className="shrink-0" /> Новорижское шоссе 3к1 · маршрут
        </a>
        <a href="tel:+79990000000" className="flex items-center gap-2.5">
          <Phone size={16} className="shrink-0" /> +7 999 000-00-00
        </a>
        <a href="mailto:hello@unlimriga.club" className="flex items-center gap-2.5">
          <Mail size={16} className="shrink-0" /> hello@unlimriga.club
        </a>
        <a href="https://t.me" target="_blank" rel="noreferrer" className="flex items-center gap-2.5">
          <Send size={16} className="shrink-0" /> Telegram-канал клуба
        </a>
      </div>

      <div className="mt-4">
        <Button variant="primary" size="lg" fullWidth onClick={onClose}>
          Забронировать корт
        </Button>
      </div>
    </BottomSheet>
  );
}

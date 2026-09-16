import { Phone, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { springSnappy, tapScale } from "../../lib/motion";

const navLinks = [
  { label: "Цены", href: "#pricing" },
  { label: "Тренировки", href: "#training" },
  { label: "Турниры", href: "#tournaments" },
  { label: "Подарить", href: "#memberships" },
  { label: "О клубе", href: "#footer" },
  { label: "Контакты", href: "#footer" },
];

export function DesktopHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 26, mass: 1.1 }}
      className="fixed inset-x-0 top-0 z-50 hidden justify-center md:flex"
    >
      <div className="se-top-2 mx-4 flex w-fit max-w-[calc(100%-2rem)] items-center justify-between gap-8 whitespace-nowrap bg-ink pl-7 pr-3 py-2.5 text-white shadow-[0_18px_36px_-24px_rgba(0,0,0,0.55)]">
        <a href="#top" className="flex items-start gap-2.5 leading-none">
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime shadow-[0_0_12px_rgba(194,245,66,.75)]" />
          <span className="flex flex-col">
            <span className="type-ui font-semibold text-white">UNLIM RIGA PADEL</span>
            <span className="type-micro mt-0.5 text-white/50">Новорижское шоссе 3к1</span>
          </span>
        </a>

        <nav className="flex items-center gap-0.5">
          {navLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ y: -1 }}
              transition={springSnappy}
              className="se-1 type-caption px-2.5 py-1.5 font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
            whileHover={{ scale: 1.08 }}
            whileTap={tapScale}
            transition={springSnappy}
            className="se-1 hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime lg:flex"
          >
            <Send size={14} />
          </motion.a>
          <motion.a
            href="https://vk.com"
            target="_blank"
            rel="noreferrer"
            aria-label="VK"
            whileHover={{ scale: 1.08 }}
            whileTap={tapScale}
            transition={springSnappy}
            className="se-1 type-micro hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 font-semibold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime lg:flex"
          >
            VK
          </motion.a>
          <motion.a
            href="tel:+79990000000"
            aria-label="Позвонить"
            whileHover={{ scale: 1.08 }}
            whileTap={tapScale}
            transition={springSnappy}
            className="se-1 flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
          >
            <Phone size={14} />
          </motion.a>
          <Button variant="primary" size="sm">
            Забронировать
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

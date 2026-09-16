import { useState } from "react";
import { Home, Dumbbell, Tag, Menu as MenuIcon } from "lucide-react";
import { motion } from "framer-motion";
import { springSnappy, tapScale } from "../../lib/motion";
import { PlayBottomSheet } from "./PlayBottomSheet";
import { MobileMenu } from "./MobileMenu";

const items = [
  { id: "home", label: "Главная", icon: Home, href: "#top" },
  { id: "training", label: "Тренировки", icon: Dumbbell, href: "#training" },
] as const;

const itemsRight = [
  { id: "pricing", label: "Цены", icon: Tag, href: "#pricing" },
  { id: "menu", label: "Меню", icon: MenuIcon, href: null },
] as const;

export function MobileBottomNav() {
  const [playOpen, setPlayOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 26, mass: 1.1, delay: 0.25 }}
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="mb-0 flex w-full items-center justify-between bg-ink px-3 pb-2 pt-2.5 shadow-[0_-12px_28px_-16px_rgba(0,0,0,0.5)]">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-1 text-white/60 transition-colors active:text-white"
            >
              <item.icon size={19} strokeWidth={1.8} />
              <span className="type-micro font-medium text-current">{item.label}</span>
            </a>
          ))}

          <div className="flex flex-1 items-center justify-center">
            <motion.button
              type="button"
              aria-label="Играть"
              onClick={() => setPlayOpen(true)}
              whileHover={{ scale: 1.06 }}
              whileTap={tapScale}
              transition={springSnappy}
            className="btn-shine se-2 -mt-6 flex h-14 w-14 items-center justify-center bg-lime text-lime-ink shadow-[0_10px_22px_-6px_rgba(194,245,66,0.65)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5.5c0-1.2 1.3-1.95 2.34-1.34l9.5 5.5a1.55 1.55 0 0 1 0 2.68l-9.5 5.5A1.55 1.55 0 0 1 7 16.34V5.5Z" />
              </svg>
            </motion.button>
          </div>

          {itemsRight.map((item) =>
            item.href ? (
              <a
                key={item.id}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-1 py-1 text-white/60 transition-colors active:text-white"
              >
                <item.icon size={19} strokeWidth={1.8} />
                <span className="type-micro font-medium text-current">{item.label}</span>
              </a>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex flex-1 flex-col items-center gap-1 py-1 text-white/60 transition-colors active:text-white"
              >
                <item.icon size={19} strokeWidth={1.8} />
                <span className="type-micro font-medium text-current">{item.label}</span>
              </button>
            ),
          )}
        </div>
      </motion.nav>

      <PlayBottomSheet open={playOpen} onClose={() => setPlayOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

import { useState } from "react";
import { Home, Dumbbell, Tag, Menu as MenuIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PlayBottomSheet } from "./PlayBottomSheet";
import { MobileMenu } from "./MobileMenu";
import { useSite } from "../../content/ContentContext";

const icons = { Home, Dumbbell, Tag };

export function MobileBottomNav() {
  const site = useSite();
  const items = site.mobileNavigation.slice(0, 2);
  const itemsRight = site.mobileNavigation.slice(2);
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
        <div className="mb-0 flex w-full items-center justify-between bg-ink px-3 pb-2 pt-2.5">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-1 text-white/60 transition-colors active:text-white"
            >
              {(() => { const Icon = icons[item.icon]; return <Icon size={19} strokeWidth={1.8} />; })()}
              <span className="type-micro font-medium text-current">{item.label}</span>
            </a>
          ))}

          <div className="flex flex-1 items-center justify-center">
            <motion.button
              type="button"
              aria-label={site.mobileActions.playLabel}
              onClick={() => setPlayOpen(true)}
            className="se-2 -mt-6 flex h-14 w-14 items-center justify-center bg-lime text-lime-ink"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5.5c0-1.2 1.3-1.95 2.34-1.34l9.5 5.5a1.55 1.55 0 0 1 0 2.68l-9.5 5.5A1.55 1.55 0 0 1 7 16.34V5.5Z" />
              </svg>
            </motion.button>
          </div>

          {itemsRight.map((item) => {
            const Icon = icons[item.icon];
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-1 py-1 text-white/60 transition-colors active:text-white"
              >
                <Icon size={19} strokeWidth={1.8} />
                <span className="type-micro font-medium text-current">{item.label}</span>
              </a>
            );
          })}
          <button type="button" onClick={() => setMenuOpen(true)} className="flex flex-1 flex-col items-center gap-1 py-1 text-white/60 transition-colors active:text-white"><MenuIcon size={19} strokeWidth={1.8} /><span className="type-micro font-medium text-current">{site.mobileActions.menuLabel}</span></button>
        </div>
      </motion.nav>

      <PlayBottomSheet open={playOpen} onClose={() => setPlayOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

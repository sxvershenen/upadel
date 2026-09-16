import { Phone, Send } from "lucide-react";
import { motion } from "framer-motion";
import { ContentAction } from "../ContentAction";
import { useHomeHref, useSite } from "../../content/ContentContext";
import { useActionLayer } from "../../actions/ActionLayer";

export function DesktopHeader() {
  const site = useSite();
  const homeHref = useHomeHref();
  const { requestContact } = useActionLayer();
  const telegram = site.footer.socialLinks.find(({ provider }) => provider === "telegram");
  const vk = site.footer.socialLinks.find(({ provider }) => provider === "vk");
  const showLogo = Boolean(site.brandLogo) && site.brandLogoMode !== "text";
  const replaceBrand = showLogo && site.brandLogoMode === "replace";
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 26, mass: 1.1 }}
      className="fixed inset-x-0 top-0 z-50 hidden justify-center md:flex"
    >
      <div className="se-top-2 mx-4 flex w-[960px] max-w-[calc(100%-2rem)] items-center justify-between gap-4 whitespace-nowrap bg-ink py-2.5 pl-7 pr-3 text-white">
        <a href={homeHref} className="flex items-center gap-2.5 leading-none">
          {showLogo ? <img src={site.brandLogo?.url} alt={site.brandName} className={replaceBrand ? "h-9 max-w-[150px] object-contain" : "h-7 w-7 object-contain"} /> : <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime" />}
          {!replaceBrand && <span className="flex flex-col">
            <span className="text-[14px] font-semibold tracking-[0] text-white">{site.brandName}</span>
            <span className="type-micro text-white/50">{site.headerSubtitle}</span>
          </span>}
        </a>

        <nav className="flex items-center gap-0.5">
          {site.desktopNavigation.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="se-1 type-caption px-2.5 py-1.5 font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {telegram && <motion.a
            href={telegram.url}
            data-analytics-action="telegram"
            onClick={(event) => { event.preventDefault(); requestContact("telegram"); }}
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
            className="se-1 hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 lg:flex"
          >
            <Send size={14} />
          </motion.a>}
          {vk && <motion.a
            href={vk.url}
            data-analytics-action="vk"
            onClick={(event) => { event.preventDefault(); requestContact("vk"); }}
            target="_blank"
            rel="noreferrer"
            aria-label="VK"
            className="se-1 type-micro hidden h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2 lg:flex"
          >
            VK
          </motion.a>}
          <motion.a
            href={`tel:${site.contacts.phoneValue}`}
            data-analytics-action="phone"
            onClick={(event) => { event.preventDefault(); requestContact("phone"); }}
            aria-label="Позвонить"
            className="se-1 flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2"
          >
            <Phone size={14} />
          </motion.a>
          <ContentAction action={{ mode: "booking", label: site.booking.buttonLabel }} variant="primary" size="sm" />
        </div>
      </div>
    </motion.header>
  );
}

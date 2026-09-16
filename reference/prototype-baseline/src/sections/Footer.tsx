import { MapPin, Phone, Mail, Clock3, CircleParking, TrainFront, Send, Video } from "lucide-react";
import { images } from "../data/images";
import { Reveal } from "../components/ui/Reveal";
import { Partners } from "./Partners";

const contactRows = [
  { icon: MapPin, label: "Адрес", value: "Новорижское шоссе, 3к1", href: "https://yandex.ru/maps/?text=Новорижское шоссе 3к1" },
  { icon: TrainFront, label: "Ближайшее метро", value: "Мякинино · 12 мин пешком" },
  { icon: CircleParking, label: "Парковка", value: "40 бесплатных мест у входа" },
  { icon: Clock3, label: "Режим работы", value: "Ежедневно 07:00–00:00" },
  { icon: Phone, label: "Телефон", value: "+7 999 000-00-00", href: "tel:+79990000000" },
  { icon: Mail, label: "Email", value: "hello@unlimriga.club", href: "mailto:hello@unlimriga.club" },
];

const navColumns = [
  ["Главная", "Корты", "Тренировки", "Цены"],
  ["Тренеры", "Турниры", "О клубе", "Контакты"],
];

const legalLinks = ["Политика конфиденциальности", "Публичная оферта", "Договор-оферта"];

export function Footer() {
  return (
    <footer id="footer" className="mesh-dark relative overflow-hidden pb-[calc(96px+env(safe-area-inset-bottom))] pt-20 text-white md:pb-16">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="se-3 h-[260px] w-full overflow-hidden bg-white/5">
                <iframe
                  title="Карта клуба Unlim Riga Padel"
                  src="https://yandex.ru/map-widget/v1/?ll=37.150000%2C55.800000&z=14&pt=37.150000,55.800000,pm2rdl"
                  className="h-full w-full grayscale"
                  loading="lazy"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {contactRows.map((row) => {
                  const Tag = row.href ? "a" : "div";
                  return (
                    <Tag
                      key={row.label}
                      href={row.href}
                      target={row.href?.startsWith("http") ? "_blank" : undefined}
                      rel={row.href?.startsWith("http") ? "noreferrer" : undefined}
                      className="se-2 flex items-start gap-3 bg-white/5 p-4 transition-colors hover:bg-white/10"
                    >
                      <row.icon size={16} className="mt-0.5 shrink-0 text-white/45" />
                      <span className="flex flex-col gap-0.5">
                        <span className="type-caption text-white/45">{row.label}</span>
                        <span className="type-ui font-medium text-white/85">{row.value}</span>
                      </span>
                    </Tag>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex flex-col gap-6">
              <div className="se-3 aspect-[16/10] w-full overflow-hidden">
                <img src={images.footerClub} alt="Клуб Unlim Riga Padel" className="h-full w-full object-cover" />
              </div>
              <p className="type-body-sm max-w-[520px] text-white/60">
                Unlim Riga Padel — клуб для тех, кто хочет играть на кортах уровня мировых турниров рядом с домом.
                Мы строили пространство вокруг трёх вещей: качества покрытия, работы тренеров и атмосферы, в которую
                хочется возвращаться. Здесь одинаково комфортно и новичку на первой тренировке, и резиденту клуба
                перед финалом лиги.
              </p>
              <div className="grid grid-cols-4 gap-3 border-t border-white/10 pt-6 text-center sm:text-left">
                {[
                  ["2023", "Год открытия"],
                  ["4", "Панорамных корта"],
                  ["9", "Тренеров в штате"],
                  ["2 100+", "Игроков в клубе"],
                ].map(([value, label]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="type-title-card font-semibold text-white">{value}</span>
                    <span className="type-micro leading-tight text-white/45">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="container-page mt-16">
        <Partners />
      </div>

      <div className="container-page mt-16 flex flex-col gap-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-3">
            <span className="type-editorial font-semibold text-white">UNLIM RIGA PADEL</span>
            <p className="type-caption max-w-[280px] leading-relaxed text-white/40">
              ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[Send, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Соцсеть клуба"
                  className="se-1 flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                >
                  <Icon size={15} />
                </a>
              ))}
              <a
                href="#"
                aria-label="VK"
                className="se-1 type-micro flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 font-semibold text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                VK
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="se-1 type-micro flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 font-semibold text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                IG
              </a>
            </div>
          </div>

          <div className="type-ui grid grid-cols-2 gap-x-10 gap-y-2 text-white/55 sm:flex sm:gap-16">
            {navColumns.map((col, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                {col.map((item) => (
                  <a key={item} href="#" className="transition-colors hover:text-white">
                    {item}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="type-caption flex flex-col gap-3 border-t border-white/10 pt-6 text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Unlim Riga Padel. Все права защищены.</span>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {legalLinks.map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-white/70">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

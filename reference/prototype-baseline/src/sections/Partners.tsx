import { partners } from "../data/content";
import { Marquee } from "../components/ui/Marquee";

export function Partners() {
  return (
    <div className="border-y border-white/10 py-8">
      <Marquee className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {partners.map((p) => (
          <span key={p} className="type-editorial shrink-0 font-semibold text-white/35">
            {p}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

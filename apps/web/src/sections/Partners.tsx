import React from "react";
import { useSite } from "../content/ContentContext";
import { Marquee } from "../components/ui/Marquee";

export function Partners() {
  const site = useSite();
  return (
    <div className="border-y border-white/10 py-8">
      <Marquee className="partners-marquee [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {site.partners.map((partner) => (
          <span key={partner.id} className="type-editorial shrink-0 font-semibold text-white/35">
            {partner.name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

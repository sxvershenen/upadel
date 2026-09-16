import { Activity, Layers3, Lightbulb, PanelTop, ShieldCheck } from "lucide-react";
import { cn } from "../../utils/cn";
import { GlassCard } from "../ui/Card";

const metrics = [
  { value: "11.5 м", label: "Высота потолка", icon: <PanelTop size={17} /> },
  { value: "+21°C", label: "Температура в зале", icon: <Lightbulb size={17} /> },
  { value: "350 Lux", label: "Flicker-free свет", icon: <Activity size={17} /> },
  { value: "2", label: "Панорамных корта", icon: <Layers3 size={17} /> },
];

function CourtIcon({ children }: { children: React.ReactNode }) {
  return <span className="se-2 flex h-10 w-10 items-center justify-center bg-white/10 text-white/75">{children}</span>;
}

export function CourtPanoramicCard() {
  return <GlassCard className="flex h-full flex-col justify-between gap-8 p-7 md:p-9"><div className="flex items-start justify-between gap-4"><CourtIcon><PanelTop size={18} /></CourtIcon><span className="type-eyebrow pt-2 text-white/45">Jubo Super Panoramic</span></div><div><h3 className="type-title-large max-w-[420px] text-white/90">Панорамное остекление</h3><p className="type-body-sm mt-3 max-w-[440px] text-white/55">12 мм закалённого стекла без массивных угловых рам и стоек — стабильная игра от стен на любой скорости мяча.</p></div></GlassCard>;
}

export function CourtMetricsCard() {
  return <GlassCard className="grid h-full grid-cols-2 p-2">{metrics.map((metric, index) => <div key={metric.label} className={cn("flex flex-col justify-center gap-1 p-6", index % 2 === 0 && "border-r border-white/10", index < 2 && "border-b border-white/10")}><span className="se-2 mb-3 flex h-8 w-8 items-center justify-center bg-white/10 text-white/70">{metric.icon}</span><span className="type-price font-semibold text-white/90">{metric.value}</span><span className="type-caption text-white/50">{metric.label}</span></div>)}</GlassCard>;
}

export function CourtDampingCard() {
  return <GlassCard className="flex h-full flex-col justify-between gap-8 p-7 md:p-9"><div className="flex items-start justify-between gap-4"><CourtIcon><Activity size={18} /></CourtIcon><span className="type-eyebrow pt-2 font-medium text-white/45">Демпферная система</span></div><div><h3 className="type-title-dense font-semibold text-white/90">Чистый отскок. Меньше вибраций</h3><p className="type-body-sm mt-3 text-white/55">Неопреновые демпферы между стеклом и металлом гасят удары конструкции — мяч ведёт себя предсказуемо.</p></div></GlassCard>;
}

export function CourtSurfaceCard() {
  return <GlassCard className="flex h-full flex-col justify-between gap-8 p-7 md:p-9"><div className="flex items-start justify-between gap-4"><CourtIcon><ShieldCheck size={18} /></CourtIcon><span className="type-eyebrow pt-2 font-medium text-white/45">Mondo XN</span></div><div><h3 className="type-title-dense font-semibold text-white/90">Официальное покрытие World Padel Tour</h3><p className="type-body-sm mt-3 text-white/55">Моноволоконное покрытие с оптимальным сцеплением — то же, что используется на турнирах тура.</p></div></GlassCard>;
}

export const courtCardComponents = [
  { id: "panoramic", Component: CourtPanoramicCard, columns: 7 },
  { id: "metrics", Component: CourtMetricsCard, columns: 5 },
  { id: "damping", Component: CourtDampingCard, columns: 6 },
  { id: "surface", Component: CourtSurfaceCard, columns: 6 },
] as const;

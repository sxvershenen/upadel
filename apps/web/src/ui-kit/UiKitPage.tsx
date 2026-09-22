import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, ChevronRight, Heart, Mail } from "lucide-react";
import { useContent } from "../content/ContentContext";
import {
  Accordion,
  ArticleCard,
  ArticleRow,
  ArrowAction,
  Badge,
  BenefitCard,
  BottomSheet,
  Button,
  ButtonLink,
  CardBody,
  CardTitle,
  CoachCard,
  CourtCard,
  Field,
  GalleryCard,
  IconButton,
  ImageCard,
  MembershipCard,
  MeshCard,
  OfferCard,
  RentalRateCard,
  ReviewCard,
  Select,
  SelectField,
  SurfaceCard,
  Tabs,
  TournamentCard,
  TrainingCard,
  Typography,
  designSystemCatalog,
  type TypeRole,
  type TypeTone,
} from "../design-system";

function KitSection({ id, eyebrow, title, note, children }: { id: string; eyebrow: string; title: string; note: string; children: ReactNode }) {
  return <section id={id} className="border-t border-ink/10 py-14 md:py-20">
    <div className="mb-8 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] md:items-end">
      <div><Typography role="eyebrow" className="font-semibold text-ink-soft">{eyebrow}</Typography><Typography as="h2" role="section" className="mt-2 font-semibold">{title}</Typography></div>
      <Typography role="body-small" className="text-ink-soft md:text-right">{note}</Typography>
    </div>
    {children}
  </section>;
}

function Demo({ title, children, dark = false }: { title: string; children: ReactNode; dark?: boolean }) {
  return <div className={dark ? "se-3 mesh-dark p-5 text-white md:p-7" : "se-3 bg-white p-5 md:p-7"}>
    <Typography role="caption" className={dark ? "mb-5 font-semibold uppercase text-white/55" : "mb-5 font-semibold uppercase text-ink-soft"}>{title}</Typography>
    {children}
  </div>;
}

function CssTokenValue({ name, label }: { name: string; label: string }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
  }, [name]);
  return <div className="se-1 bg-page px-3 py-2"><Typography role="caption" className="font-semibold">{label}</Typography><code className="type-micro text-ink-soft">{name} · {value || "…"}</code></div>;
}

function TypeSpec({ label, role, tone, context }: { label: string; role: TypeRole; tone?: TypeTone; context: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [spec, setSpec] = useState("…");
  useEffect(() => {
    const read = () => {
      const sample = ref.current?.querySelector<HTMLElement>("[data-type-spec]");
      if (!sample) return;
      const style = getComputedStyle(sample);
      setSpec(`${style.fontSize} / ${style.lineHeight} / ${style.fontWeight} / ${style.letterSpacing} / ${style.color}`);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const inverse = role === "hero" || role === "hero-lead" || tone?.startsWith("inverse");
  const toneLabel = tone ?? "role-default";
  return <div ref={ref} data-type-role-row data-role={role} data-tone={toneLabel} className={`grid gap-4 py-6 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-start ${inverse ? "se-2 mesh-dark px-4" : ""}`}><div className="min-w-0"><Typography role={role} tone={tone} className="break-words">{label}</Typography><code className={`type-micro mt-2 block ${inverse ? "text-white/50" : "text-ink-muted"}`}>role={role} · tone={toneLabel}</code><Typography role="caption" tone={inverse ? "inverse-muted" : "muted"} className="mt-2">{context}</Typography></div><div className="min-w-0"><Typography data-type-spec role={role} tone={tone} className="break-words">Падел объединяет людей<br className="hidden sm:block" /> и открывает новую игру</Typography><code className={`type-micro mt-2 block break-words ${inverse ? "text-white/50" : "text-ink-muted"}`}>{spec}</code></div></div>;
}

const colorTokens = [
  ["Page", "bg-page"], ["Ink", "bg-ink"], ["Ink soft", "bg-ink-soft"], ["Control", "bg-control"], ["Lime", "bg-lime"], ["Lime deep", "bg-lime-deep"], ["Lime soft", "bg-lime-soft"], ["Sky", "bg-sky"], ["Blue / focus", "bg-focus"], ["Violet", "bg-violet"], ["Sunset", "bg-sunset"], ["Sunset soft", "bg-sunset-soft"], ["Cyan", "bg-cyan"], ["Emerald", "bg-emerald"], ["Gold", "bg-gold"], ["Danger", "bg-danger"],
] as const;

const baseTypeSamples: { label: string; role: TypeRole; context: string }[] = [
  { label: "Micro", role: "micro", context: "Служебная подпись" },
  { label: "Caption / badge", role: "caption", context: "Метаданные светлой карточки" },
  { label: "Eyebrow", role: "eyebrow", context: "SectionHeader на светлом фоне" },
  { label: "UI", role: "ui", context: "Текст контролов" },
  { label: "Body small", role: "body-small", context: "Описание светлой карточки" },
  { label: "Body", role: "body", context: "Основной текст страницы" },
  { label: "Editorial", role: "editorial", context: "Вводный абзац" },
  { label: "Hero lead", role: "hero-lead", context: "Фактический default поверх hero" },
  { label: "Compact title", role: "title-compact", context: "Coach и article cards" },
  { label: "Dense title", role: "title-dense", context: "Плотный заголовок светлой поверхности" },
  { label: "Card title", role: "title-card", context: "Светлая production card" },
  { label: "Large title", role: "title-large", context: "Крупный заголовок светлой поверхности" },
  { label: "Price", role: "price", context: "Rent и coach cards" },
  { label: "Section", role: "section", context: "SectionHeader на светлом фоне" },
  { label: "Hero", role: "hero", context: "Фактический default поверх изображения" },
];

const productionTypeContexts: { label: string; role: TypeRole; tone: TypeTone; context: string }[] = [
  { label: "Eyebrow / glass", role: "eyebrow", tone: "inverse-subtle", context: "CourtCards metadata · white/45" },
  { label: "Dense title / glass", role: "title-dense", tone: "inverse-strong", context: "CourtCards title · white/90" },
  { label: "Price / dark", role: "price", tone: "inverse", context: "Tournament и photo cards · white" },
];

const overlayTones = ["overlay-lime", "overlay-blue", "overlay-cyan", "overlay-violet", "overlay-sunset", "overlay-emerald", "overlay-dark"] as const;

export function UiKitPage() {
  const { home, entities } = useContent();
  const [tab, setTab] = useState<"rent" | "training" | "membership">("rent");
  const [email, setEmail] = useState("hello@");
  const [selectValue, setSelectValue] = useState("newest");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notice, setNotice] = useState("Компоненты готовы к проверке мышью и клавиатурой");
  const emailError = email && !/^\S+@\S+\.\S+$/.test(email) ? "Введите полный адрес электронной почты" : undefined;

  return <div className="min-h-screen overflow-x-hidden bg-page text-ink">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-white backdrop-blur-xl">
      <div className="container-page flex min-h-[72px] items-center justify-between gap-4 py-3">
        <div><Typography role="micro" className="uppercase text-white/45">UNLIM RIGA PADEL</Typography><Typography as="h1" role="title-compact" tone="inverse" className="font-semibold">Production UI kit</Typography></div>
        <ButtonLink href="/" variant="glass" size="sm" icon={<ArrowLeft size={16} />} iconPosition="left" iconDivider={false}>На лендинг</ButtonLink>
      </div>
    </header>

    <main className="container-page">
      <div className="grid gap-8 py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:py-20">
        <div><Badge tone="lime">Public API · src/design-system</Badge><Typography as="h2" role="section" className="mt-5 max-w-[900px] font-semibold">Одна система для лендинга и следующих страниц</Typography><Typography role="editorial" className="mt-5 max-w-[760px] text-ink-soft">Каталог рендерит production-компоненты. Изменение компонента или токена сразу отражается здесь и в интерфейсе клуба.</Typography></div>
        <SurfaceCard interactive={false} className="p-5"><Typography role="caption" className="text-ink-soft">Статус демо</Typography><Typography role="body-small" aria-live="polite" className="mt-2 font-medium">{notice}</Typography></SurfaceCard>
      </div>

      <KitSection id="foundation" eyebrow="Foundation" title="Цвет, типографика, пространство" note="Выбирайте семантическую роль. Числовая шкала и responsive-переходы принадлежат CSS, а не разметке.">
        <div className="grid gap-4 xl:grid-cols-2">
          <Demo title="Semantic & artistic colors"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{colorTokens.map(([label, className]) => <div key={label}><div className={`se-2 h-20 ${className}`} /><Typography role="caption" className="mt-2 text-ink-soft">{label}</Typography></div>)}</div></Demo>
          <Demo title="Type roles · base defaults"><div className="divide-y divide-ink/10">{baseTypeSamples.map(({ label, role, context }) => <TypeSpec key={role} label={label} role={role} context={context} />)}</div></Demo>
          <Demo title="Production tone overrides"><div className="divide-y divide-ink/10">{productionTypeContexts.map(({ label, role, tone, context }) => <TypeSpec key={`${role}-${tone}`} label={label} role={role} tone={tone} context={context} />)}</div></Demo>
          <Demo title="Semantic text tones"><div className="grid gap-2">{designSystemCatalog.textTones.filter((tone) => !tone.startsWith("inverse")).map((tone) => <div key={tone} className="se-1 bg-page p-3"><Typography role="body-small" tone={tone}>tone={tone} · Семантический цвет текста</Typography></div>)}<div className="se-2 mesh-dark mt-2 grid gap-2 p-4">{designSystemCatalog.textTones.filter((tone) => tone.startsWith("inverse")).map((tone) => <Typography key={tone} role="body-small" tone={tone}>tone={tone} · Текст на тёмной поверхности</Typography>)}</div></div></Demo>
          <Demo title="Spacing, container & controls"><div className="space-y-5"><div className="flex items-end gap-3"><span className="se-1 h-2 w-8 bg-lime" /><span className="se-1 h-4 w-12 bg-lime" /><span className="se-1 h-8 w-16 bg-lime" /><span className="se-1 h-12 w-20 bg-lime" /></div><div className="grid gap-2 sm:grid-cols-2"><CssTokenValue name="--page-gutter" label="Page gutter" /><CssTokenValue name="--container-page" label="Container max" /><CssTokenValue name="--control-sm" label="Control sm" /><CssTokenValue name="--control-md" label="Control md" /><CssTokenValue name="--control-lg" label="Control lg" /></div><Typography role="body-small" className="text-ink-soft">Композиции используют кратную четырём шкалу Tailwind; отдельные размеры контролов и контейнера читаются из CSS tokens.</Typography></div></Demo>
          <Demo title="Radii & surfaces"><div className="grid grid-cols-3 gap-3"><div><div className="se-1 h-24 bg-control" /><CssTokenValue name="--se-1" label="Control" /></div><div><div className="se-2 h-24 bg-control" /><CssTokenValue name="--se-2" label="Action" /></div><div><div className="se-3 h-24 bg-white" /><CssTokenValue name="--se-3" label="Card" /></div></div></Demo>
        </div>
      </KitSection>

      <KitSection id="surfaces" eyebrow="Surfaces" title="Поверхности и художественные слои" note="Mesh и overlays — разрешённые выразительные исключения. Фирменный spring lift включён по умолчанию; interactive=false оставляет служебную поверхность неподвижной.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SurfaceCard className="min-h-[220px] p-6"><Badge tone="muted">White</Badge><CardTitle className="mt-12">Spring surface</CardTitle><CardBody className="mt-2">Интерактивная поверхность получает фирменный lift и pointer; доступное действие задаёт production recipe.</CardBody></SurfaceCard>
          <SurfaceCard className="min-h-[220px] p-6"><div className="flex items-start justify-between"><Badge tone="lime">CTA recipe</Badge><ArrowAction tone="light" cardHover className="bg-[#ededed]" /></div><CardTitle className="mt-12">Карточный affordance</CardTitle><ButtonLink href="#controls" size="sm" className="mt-4" icon={<ArrowRight size={16} />}>Перейти к controls</ButtonLink></SurfaceCard>
          <ImageCard src={home.offers[0]?.image?.url ?? ""} alt="Падел-турнир" overlay="overlay-blue" className="min-h-[280px]"><div className="flex h-full flex-col justify-between p-6"><div className="flex items-start justify-between"><Badge tone="outline-light">Glass outline-light</Badge><ArrowAction tone="glass" cardHover /></div><div><CardTitle className="text-white">Турнирная карточка</CardTitle><CardBody tone="inverse-muted" className="mt-2">Overscan удерживает изображение за границами карточки на всём parallax-ходе.</CardBody></div></div></ImageCard>
          {designSystemCatalog.meshTones.map((tone) => <MeshCard key={tone} tone={tone} className="min-h-[150px] p-5"><Typography role="caption" className="font-semibold uppercase text-current">{tone}</Typography><Typography role="title-compact" className="mt-10 font-semibold text-current">Mesh surface</Typography></MeshCard>)}
          <div className="se-3 glass-dark min-h-[150px] bg-[linear-gradient(135deg,#2563eb,#14141a)] p-5 text-white"><Typography role="caption" tone="inverse-muted">Glass / overlay</Typography><div className="se-2 glass mt-6 p-4"><Typography role="body-small" tone="inverse">Стекло живёт только поверх контрастного фона.</Typography></div></div>
          {overlayTones.map((overlay) => <div key={overlay} data-linear-overlay="true" className="se-3 relative isolate min-h-[150px] overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${home.offers[1]?.image?.url ?? ""})` }}><div data-image-overlay={overlay} className="pointer-events-none absolute inset-0" aria-hidden="true" /><div className="relative z-10 flex h-full min-h-[150px] items-end p-5 text-white"><Typography role="caption" tone="inverse" className="font-semibold uppercase">{overlay}</Typography></div></div>)}
        </div>
      </KitSection>

      <KitSection id="controls" eyebrow="Controls" title="Кнопки, ссылки и поля" note="Select использует тот же плавный dropdown-shell, что и меню; между пунктами только 2 px, а внутренние отступы компактные.">
        <div className="grid gap-4 xl:grid-cols-2">
          <Demo title="Variants"><div className="flex flex-wrap gap-3">{designSystemCatalog.buttonVariants.filter((v) => v !== "glass").map((variant) => <Button key={variant} variant={variant} onClick={() => setNotice(`Нажата кнопка ${variant}`)}>{variant}</Button>)}</div></Demo>
          <Demo title="Glass" dark><div className="flex flex-wrap gap-3"><Button variant="glass">Glass action</Button><ButtonLink href="#patterns" variant="glass" icon={<ChevronRight size={16} />}>Glass link</ButtonLink></div></Demo>
          <Demo title="Sizes & icon positions"><div className="flex flex-wrap items-center gap-3"><Button size="sm" icon={<CalendarCheck size={16} />} iconPosition="left">Small</Button><Button size="md" icon={<CalendarCheck size={16} />}>Medium</Button><Button size="lg" icon={<CalendarCheck size={18} />} iconDivider={false}>Large</Button></div></Demo>
          <Demo title="States"><div className="grid gap-3 sm:grid-cols-2"><Button disabled>Disabled</Button><Button loading>Отправляем</Button><Button fullWidth variant="dark" icon={<ArrowRight size={16} />}>Full width</Button><ButtonLink href="#foundation" fullWidth variant="neutral">ButtonLink</ButtonLink></div></Demo>
          <Demo title="Icon buttons"><div className="flex items-center gap-3"><IconButton size="sm" aria-label="Добавить в избранное"><Heart size={17} /></IconButton><IconButton aria-label="Отправить письмо" variant="dark"><Mail size={18} /></IconButton><IconButton aria-label="Недоступное действие" disabled><ChevronRight size={18} /></IconButton></div></Demo>
          <Demo title="Badge tones"><div className="flex flex-wrap gap-2">{designSystemCatalog.badgeTones.filter((tone) => tone !== "glass" && tone !== "outline-light").map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}</div><div className="se-2 mesh-dark mt-4 flex flex-wrap gap-2 p-4">{(["glass", "outline-light"] as const).map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}</div></Demo>
          <Demo title="Fields"><div className="grid gap-5"><Field label="Электронная почта" value={email} onChange={(event) => setEmail(event.target.value)} description="Пришлём подтверждение брони" error={emailError} placeholder="name@example.com" /><Field label="Номер карты" value="Недоступно" disabled /></div></Demo>
          <Demo title="Select / dropdown"><div className="grid gap-5 md:grid-cols-2"><Select aria-label="Сортировка" value={selectValue} onChange={setSelectValue} options={[{ value: "newest", label: "Сначала новые" }, { value: "popular", label: "Популярные" }, { value: "recommended", label: "Рекомендованные" }]} /><SelectField label="Формат тренировки" name="kit-format" value={selectValue} onChange={(event) => setSelectValue(event.target.value)} options={[{ value: "newest", label: "Индивидуальная" }, { value: "popular", label: "Групповая" }, { value: "recommended", label: "Детская" }]} /></div></Demo>
        </div>
      </KitSection>

      <KitSection id="navigation" eyebrow="Navigation" title="Tabs и accordion" note="Стрелки, Home и End меняют активную вкладку; accordion связывает trigger и region уникальными id.">
        <div className="grid gap-4 xl:grid-cols-2">
          <Demo title="Tabs"><Tabs aria-label="Тип тарифа" tabs={[{ id: "rent", label: "Аренда", panelId: "kit-tab-panel" }, { id: "training", label: "Тренировки", panelId: "kit-tab-panel" }, { id: "membership", label: "Абонементы", panelId: "kit-tab-panel" }]} value={tab} onChange={setTab} /><div id="kit-tab-panel" role="tabpanel" tabIndex={0} className="se-2 mt-5 bg-page p-5"><Typography role="body-small">Активный раздел: <strong>{tab}</strong></Typography></div></Demo>
          <Demo title="Accordion"><Accordion items={[{ q: "Нужно ли приносить ракетку?", a: "Нет, всё оборудование можно получить в клубе." }, { q: "Как отменить бронь?", a: "Условия отмены показаны перед подтверждением бронирования." }, { q: "Есть ли тренировки для новичков?", a: "Да, тренер подберёт безопасный стартовый формат." }]} /></Demo>
          <Demo title="Mobile bottom sheet"><Button className="md:hidden" onClick={() => setSheetOpen(true)}>Открыть mobile sheet</Button><Typography role="body-small" className="hidden text-ink-soft md:block">Компонент доступен на ширине меньше 768 px — проверьте Escape, циклический Tab и возврат фокуса.</Typography><BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Пример bottom sheet"><div className="grid gap-3"><Button fullWidth onClick={() => setSheetOpen(false)}>Основное действие</Button><Button fullWidth variant="neutral" onClick={() => setSheetOpen(false)}>Закрыть</Button></div></BottomSheet></Demo>
        </div>
      </KitSection>

      <KitSection id="patterns" eyebrow="Production cards" title="Точные карточки лендинга" note="Каждый пример ниже импортирован из того же production-компонента и использует те же реальные данные, что соответствующая секция.">
        <div className="grid gap-10">
          {entities.coaches[0] && <Demo title="Coach · opens accessible dialog"><div className="max-w-[420px]"><CoachCard coach={entities.coaches[0]} /></div></Demo>}
          {entities.articles[1] && entities.articleRows[1] && <Demo title="Articles · main, mobile/plain and row"><div className="grid gap-8 md:grid-cols-3"><ArticleCard post={entities.articles[0]} /><ArticleCard post={entities.articles[1]} mobilePlain /><div><ArticleRow post={entities.articleRows[0]} /><ArticleRow post={entities.articleRows[1]} /></div></div></Demo>}
          {entities.reviews[0] && <Demo title="Review"><div className="max-w-[540px]"><ReviewCard review={entities.reviews[0]} /></div></Demo>}
          {entities.tournaments[1] && entities.trainingPrograms[0] && <Demo title="Tournament & training"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><TournamentCard tournament={entities.tournaments[0]} /><TournamentCard tournament={entities.tournaments[1]} /><TrainingCard training={entities.trainingPrograms[0]} /></div></Demo>}
          <Demo title="Rent pricing · exact spacing"><div className="grid gap-4 lg:grid-cols-2">{entities.rentalRates.map((rate) => <RentalRateCard key={rate.id} rate={rate} />)}</div></Demo>
          <Demo title="Memberships"><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{entities.memberships.map((membership) => <MembershipCard key={membership.id} membership={membership} />)}</div></Demo>
          <Demo title="Offers"><div className="grid gap-4 md:grid-cols-2">{home.offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div></Demo>
          <Demo title="Benefits · full production set"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{home.benefits.cards.map((benefit) => <div key={benefit.id} data-benefit-recipe={benefit.variant} className={benefit.variant === "kids-wide" ? "min-h-[320px] xl:col-span-2" : "min-h-[320px]"}><BenefitCard benefit={benefit} /></div>)}</div></Demo>
          <Demo title="Gallery"><div data-gallery-recipe><GalleryCard src={entities.gallery[0]?.media.url ?? ""} /></div></Demo>
          <Demo title="Court glass · full production set" dark><div className="grid gap-4 md:grid-cols-2">{entities.courts.map((court) => <div key={court.id} data-court-recipe={court.cardVariant} className="min-h-[320px]"><CourtCard court={court} /></div>)}</div></Demo>
        </div>
      </KitSection>
    </main>

    <footer className="bg-ink py-8 text-white"><div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Typography role="body-small" className="text-white/55">UI kit использует тот же public API, что и лендинг.</Typography><ButtonLink href="/" variant="glass" size="sm" icon={<ArrowLeft size={16} />} iconPosition="left" iconDivider={false}>Вернуться</ButtonLink></div></footer>
  </div>;
}

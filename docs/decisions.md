# Product decisions

Do not implement an open area until its decision is accepted.

## D1 — Repository — accepted

Use one repository containing `apps/web` and `apps/cms`. They remain separate applications so the public site and admin can be built/deployed independently while sharing one project history.

Open later: hosting target and local versus S3-compatible media storage.

## D2 — Editing freedom — accepted

No free-form page builder. The CMS edits content, media, entities, visibility and homepage section order. Layout and animation code remains controlled. New landing pages are coded by an AI agent using the existing components, design system and UI kit, then receive typed CMS fields.

## D3 — Homepage composition — accepted

Editors may reorder and hide homepage sections. Header/footer stay outside that ordered section list.

## D4 — Preview — accepted

Provide live preview inside Payload, backed by a secure Astro draft-preview URL.

## D5 — Conversion goals — accepted

The primary goal is a confirmed booking when the booking provider can report it. Until then, report these separately:

- booking CTA click;
- phone click;
- successfully saved membership lead;
- successfully saved gift-certificate lead.

Never label a click as a confirmed booking or call.

## D6 — Booking integration — open

Provider is not selected; VivaCRM is currently most likely. “First provider” means the one concrete service connected for MVP. Build a provider-independent CTA/config adapter, but wait for real VivaCRM/Lunda/Padel app integration details before implementing the connection. Do not accept arbitrary CMS-injected HTML/JS.

## D7 — Analytics — accepted

Accepted: four base tabs, optional extra tab only for a clearly separate question, date trends, previous-period/year comparison, approximate unique-browser counts (~1% typical error), exact saved-lead counts, and arbitrary date ranges over 36 months of daily aggregates.

Keep the pseudonymous browser identifier for 13 months and its first recognised advertising source for at most 60 days. Russian privacy/legal behavior must be reviewed before launch; do not reuse the discarded Latvian assumption.

## D8 — MVP boundary

Recommendation for first release: all listed public routes, core CMS editing, media optimization, lead capture, SEO controls, booking adapter, article/entity management and a focused analytics overview. Defer visual page building, advanced attribution, media dependency graphs and automated booking-provider synchronization unless explicitly promoted into MVP.

## D9 — CMS organisation — accepted

Use one tabbed `Главная` editor with live preview. Reusable entities live in dedicated collections and are never duplicated into homepage fields.

- Coaches and tournaments: `Показывать на главной` plus display order.
- Articles: optional pinned home position `1–3`; unfilled positions use newest published articles.
- Article categories remain reusable records, but editors create or edit them inline from the article's `Категория` field; they are not a separate navigation destination.
- Homepage cards and catalog/detail pages read the same entity/media/SEO record.

## D10 — Homepage editor tabs — accepted

`Главная` uses these tabs: `Структура`, `Первый экран`, `Клуб`, `Услуги`, `Сообщество`, `SEO`. Catalog and thematic page globals additionally expose a `Шапка страницы` tab for hero media and grayscale. Reusable coaches, tournaments and articles remain collection-owned and are linked/resolved rather than copied.

Shared header, mobile navigation/menu, contacts and footer belong to `Настройки сайта`, because every public page consumes them. Desktop navigation items may contain typed submenu rows and both levels may reference optional SVG icons from the Media collection; public rendering uses safe image URLs rather than editor-provided inline markup.
CMS users and SEO redirects are also managed from dedicated tabs inside `Настройки сайта`; their standalone navigation entries stay hidden.

## D11 — Catalog and detail routes — accepted

- `/coaches`: filtered catalog, quick profile, then `/coaches/[slug]` detail.
- `/tournaments`: filtered catalog and `/tournaments/[slug]` detail rendered with a compact Swiss-style layout (non-fullscreen branded hero on image or mesh gradient with live status badge, 1.0–7.0 level visual gauge and single CTA button; 4-metric tournament passport dl without duplicate address/buttons; 3-tab competition module with participants grid, pair visualization, responsive standings without horizontal scroll, and prize distribution by places; 2-column lower section with left collapsible details for regulations, pre-court checklist, included perks, matchday timeline, and right FAQ accordion; and related tournaments). Tournament filtering uses player levels `1.0–7.0`; cards foreground the tournament format and keep the player level in metadata.
- Tournament editing uses tabs for core data, card presentation, participants, sortable manual standings, prizes/fees, FAQ, regulations/rules and SEO. A result row's array order is its place; points never reorder it. Format is one canonical select (plus a custom label only for `other`), and player level is a `from`/`to` range.
- `/blog`: catalog and `/blog/[slug]` article.
- Courts, prices, training and about remain single thematic pages; `/contacts` redirects to `/about`, while shared contact details stay in the footer and site settings.

Gallery management uses thumbnail cards, not a table. Media management shows live/draft usage locations; referenced files cannot be deleted until links are removed. Implementation-only seed markers are never editor-visible.

## D12 — Thematic page layouts — accepted

- `/prices`: clearly styled `Аренда / Тренировки / Абонементы` tabs; on mobile the transparent sticky wrapper uses the same top inset as the page's side gutter.
- `/training`: a compact CMS-managed methodology infographic leads into program cards and the coach carousel. Its knowledge base uses the accepted two-column pattern: first-visit checklist on the left and FAQ on the right. Section headings, CTA labels, checklist and FAQ are typed CMS fields; the old rich-text surrogate is retired from editing and projection.
- `/courts`: infographic court information; desktop masonry gallery with lightbox, mobile swipe sliders.
- /gift: conversion-focused Swiss-style SEO landing for padel gift certificates in Moscow. Built strictly with design system atoms (Typography, Badge, Button, ButtonLink, SurfaceCard, Accordion, Field, SelectField, CheckboxField, Reveal, MobileSwiperNav), non-breaking spaces on Russian prepositions, compact page-view hero without badges, CTAs or metrics chips, use-cases grid (court rent, PRO coaches, Varlion gear, 2x2 games), 2 presentation formats (physical luxury box on the left, digital PDF on the right with mobile Swiper and glass badge on image), combined 2-column desktop section (terms on the left, unwrapped Accordion FAQ on the right), conversion lead capture form without visible top labels (using in-field ghost text and labelVisibility="sr-only") for manager consultation and payment processing, and rich Schema.org JSON-LD (Product, FAQPage, BreadcrumbList, Organization).

## D14 — Commercial landing — accepted

`/padel-court-zakaz` is a code-defined SEO landing for JUBO court sales and turnkey installation in Russia (with 301 redirect from legacy `/padel-courts`). Its stable markup and animations are projected from the typed `padel-court-zakaz-page` Payload global: editors can manage copy, headings, poster/video and section media, repeatable cards, model data, CTA/form labels and SEO from the global exposed in Page Map; the admin editor keeps these sections in dedicated tabs rather than one long content form; no free-form page builder is introduced. The landing remains constructed strictly with design system atoms (`Typography`, `Badge`, `Button`, `ButtonLink`, `SurfaceCard`, `ImageCard`, `Tabs`, `Reveal`, `SplitTextReveal`), non-breaking spaces on prepositions (`typograph`), video hero with dark gradient, image-led turnkey services breakdown, price factors, monochrome JUBO engineering innovations section, interactive court model tabs with standardized 6-row spec comparison, and a left-aligned Swiss CTA conversion block with compact messenger buttons and an inline lead form submitting to the validated lead endpoint. Reusable cards and section reveals use the shared lazy GSAP reveal controller rather than section-only animation wiring.

## D13 — CMS palette — accepted

CMS uses Payload's existing `theme-success-*` scale as one shared blue accent system. Light theme uses a clear royal blue (`#2563eb`), dark theme uses the same hue family with a calmer blue (`#6fa7d7`), and all active, focus, hover, status and analytics states consume shared `admin-accent-*` aliases. Neutral surfaces remain theme-driven; no shadows or glow are added.

The reusable control sizes, field/button states and split-button rules are defined in `docs/cms-ui-system.md` and implemented through shared `admin-*` tokens in the Payload custom stylesheet.

## D15 — Desktop navigation interaction — accepted

On desktop, `Цены` is the only grouped top-level item; `Тренировки` and `Тренеры` remain its typed CMS-managed children. The black header compacts into an evenly spaced icon row while scrolling down (and expands on upward scroll): the pill keeps a fixed 60px vertical axis and stationary horizontal center; one progress value interpolates its width, padding, gaps and control widths in real layout, without independent FLIP transforms, and labels/icons swap through CSS fades with deterministic server-rendered visibility. Tooltips require current pointer hover or keyboard-visible focus, and scroll/page navigation clears stale intent. The grouped item keeps its dark gooey mega-menu. Desktop and mobile navigation chrome stays outside the Swup replacement surface; compact/menu state survives page replacement and respects reduced-motion preferences.

## D16 — Article editor — accepted

Keep Payload Lexical for article bodies. The article title is the only H1; body authors can use H2, H3 and H4, fixed formatting controls, lists/checklists, quotes, rules, links and Media uploads. Public article rendering uses escaped code-defined HTML and UI-kit typography (`type-title-large`, `type-title-card`, `type-title-compact`, `type-body`), never editor-provided raw HTML. Media selection inside a drawer inserts the selected record, while the standalone Media section retains edit navigation and batch tools.

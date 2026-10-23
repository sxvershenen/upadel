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

## D6 — Booking integration — accepted

VivaCRM booking and personal-account installation URLs are CMS-managed in Site Settings → «Бронирование и ЛК». Load scripts on demand through the shared provider adapter; accept only public VivaCRM installation scripts. Coach and training-program actions may override central booking with a validated iframe URL or VivaCRM script. Installation tags are reduced to URLs; arbitrary HTML/JS is never executed. Iframes open in the shared dialog with an external-link fallback. Homepage hero elements use three independently configured desktop slots and two mobile slots; each slot can show an action button or an info panel and choose its icon.

## D7 — Analytics — accepted

Accepted: four base tabs, optional extra tab only for a clearly separate question, date trends, previous-period/year comparison, approximate unique-browser counts (~1% typical error), exact saved-lead counts, and arbitrary date ranges over 36 months of daily aggregates.

Keep the pseudonymous browser identifier for 13 months and its first recognised advertising source for at most 60 days. Russian privacy/legal behavior must be reviewed before launch; do not reuse the discarded Latvian assumption.

Analytics does not load before a saved choice. The banner has one `ОК` action (all configured analytics on) and a settings icon for separate first-party, Metrika and configured GA4 choices. Visitors can reopen settings from the footer. Counter ID, Webvisor and Webmaster verification stay editable under `Настройки сайта → Интеграции`; replay masks all shared form inputs and textareas. This is an implementation default, not a legal conclusion.

## D8 — MVP boundary

Recommendation for first release: all listed public routes, core CMS editing, media optimization, lead capture, SEO controls, booking adapter, article/entity management and a focused analytics overview. Defer visual page building, advanced attribution, media dependency graphs and automated booking-provider synchronization unless explicitly promoted into MVP.

## D9 — CMS organisation — accepted

Use one tabbed `Главная` editor with live preview. Reusable entities live in dedicated collections and are never duplicated into homepage fields.

Use one level of native collapsible navigation groups, ordered as `Обращения`, `Страницы / разделы`, `Услуги и цены`, `Турниры`, `Публикации`, `Медиатека`, `Настройки`. `Главная` is the first page entry. Homepage-only court cards, reviews and FAQ are edited from its tabs through their existing collections; shared services and publication collections remain separate navigation entries. Partners belong to settings; tournament defaults belong with tournaments. Editor field accordions start collapsed on every editor opening, while manual expansion and validation remain available.

- Coaches and tournaments: `Показывать на главной` plus display order.
- Articles: optional pinned home position `1–3`; unfilled positions use newest published articles.
- Article categories remain reusable records, but editors create or edit them inline from the article's `Категория` field; they are not a separate navigation destination.
- Homepage cards and catalog/detail pages read the same entity/media/SEO record.

## D10 — Homepage editor tabs — accepted

`Главная` groups its section fields and homepage-only collections in tabs, including rental standards and the membership offer. Rental-rate records contain actual rental tariffs; standards and the membership offer are homepage-owned, and `/prices` consumes the same data and card components. On `/prices`, two rental rates and the membership offer share the first desktop row; standards start the second row at the left. The route keeps its own terms, FAQ and membership tab while reusing mobile card carousels. Catalog and thematic page editors additionally expose a `Шапка страницы` tab for hero media and grayscale. Reusable coaches, tournaments and articles remain collection-owned and are linked/resolved rather than copied.

Shared header, mobile navigation/menu, contacts and footer belong to `Настройки сайта`, because every public page consumes them. Desktop navigation items may contain typed submenu rows and both levels may reference optional SVG icons from the Media collection; public rendering uses safe image URLs rather than editor-provided inline markup.
CMS users and SEO redirects are also managed from dedicated tabs inside `Настройки сайта`; their standalone navigation entries stay hidden.
Policy and public-offer documents share `Настройки сайта → Юридические документы`, with separate editors, public URLs and publication state. The standalone JUBO editor remains in `Страницы / разделы` as `Дистрибьюция кортов`. Consolidation must preserve published content, pending drafts and media references rather than reseeding editor records.

## D11 — Catalog and detail routes — accepted

- `/coaches`: filtered catalog, quick profile, then `/coaches/[slug]` detail.
- `/tournaments`: filtered catalog and `/tournaments/[slug]` detail rendered with a compact Swiss-style layout (non-fullscreen branded hero on image or mesh gradient with live status badge, 1.0–7.0 level visual gauge and single CTA button; 4-metric tournament passport dl without duplicate address/buttons; 3-tab competition module with participants grid, pair visualization, responsive standings without horizontal scroll, and prize distribution by places; 2-column lower section with left collapsible details for regulations, pre-court checklist, included perks, matchday timeline, and right FAQ accordion; and related tournaments). Tournament filtering uses player levels `1.0–7.0`; cards foreground the tournament format and keep the player level in metadata.
- Tournament editing uses tabs for core data, card presentation, participants, sortable manual standings, prizes/fees, FAQ, regulations/rules and SEO. Empty drafts are allowed and receive a stable generated slug. The sidebar can disable card navigation or substitute an HTTPS URL; participation cost uses `entryFee`, while `prize` is exclusively the prize fund. A result row's array order is its place; points never reorder it. Format is one canonical select (plus a custom label only for `other`), and player level is a `from`/`to` range.
- `/blog`: catalog and `/blog/[slug]` article. Blog/coach/tournament catalogs use numbered pages of 12, with server filters preserved in URLs.
- Prices, training and about remain single thematic pages; `/contacts` permanently redirects (301) to `/about/`, while shared contact details stay in the footer and site settings. `/courts` is retired and returns 404; its standalone page editor is removed, while the court-card collection remains available inside `Главная`.

Gallery management uses thumbnail cards, not a table. Homepage club-life and `/about` galleries share the same animated lightbox with rounded media and previous/next controls. Media management shows live/draft usage locations; referenced files cannot be deleted until links are removed. Implementation-only seed markers are never editor-visible.

## D12 — Thematic page layouts — accepted

- `/prices`: morning rent is 3,500 ₽/hour at 07:00–09:00; prime time is 5,500 ₽/hour at 09:00–23:00. Memberships show a quote price and are individually enabled in CMS; if none are enabled, `/prices` omits its tabs and the homepage keeps only rent/training tabs. Cards open quick actions on mobile and booking/contact dialogs on desktop. Terms and FAQ share the gift-page layout and icon typography, with memberships first. Individual training starts at 9,000 ₽/hour and appears only in training formats. The white membership offer is a compact strip spanning two rental cards on the homepage, without an eyebrow; its copy and contact action are CMS-managed. It is the third rental card on `/prices`; standards remain on the homepage and in price conditions. Rental-card titles and times sit at the top; descriptions and the shared Price footer sit at the bottom. Equipment terms appear in standards rather than repeated rental/training-card descriptions; lounge copy specifies food and drinks. Shared typography prevents a final body-copy word from hanging alone and joins “Корзина мячей” with a nonbreaking space.
- Equipment rules are CMS-managed: court rental excludes balls and rackets; individual training includes balls only; kids groups include both. A ball basket costs 800 ₽/hour and a racket 500 ₽/hour. The homepage robot-machine banner costs 3,000 ₽/hour, uses a supplied photo with shared scroll parallax, and has no buttons. It uses the shared overlay-blue palette; its practice badge contains the icon. Its CMS description is one sentence about practicing at the player's own pace. Robot photo, eyebrow and icon remain CMS-managed. The mobile card follows the training-card layout: badge at top, title and description at bottom, then a separated price footer; desktop price stays to the right. Price uses the section type scale. The image crop centers the launcher and players at mobile and desktop widths. Parallax uses a 120% moving layer with ±6% travel.
- Homepage benefits use four desktop columns with automatic expansion of an incomplete row; the eight-card default is 4×2, including Telegram community before the ordinary-width kids card. Mobile retains its single-card swiper. Empty descriptions render no paragraph. Phone benefits share the mesh benefit recipe and use text/icon contrast derived from the CMS mesh tone. Online booking uses indigo with a transparent phone held in one right hand, whose thumb presses “В ИГРУ” on a minimal glass interface; community uses graphite with its enlarged chat phone tilted clockwise. Both illustrations scale with card height, retain a bottom-right crop and keep copy in a protected left column; the booking illustration is clipped to the right image zone. Colors and images remain CMS-managed.
- Homepage offers have independent CMS visibility switches and optional fields. Two active cards split above 1040px; one occupies the full width at a 4:1 desktop aspect ratio; zero removes the section. The single “Ваше мероприятие” card combines corporate tournaments and private events, using the full-bleed ImageCard recipe with its shared blue overlay, scroll parallax, image/card hover and decorative top-right arrow. Its supplied group photo is framed for the wide crop; single-card title and description use section/body type, while split cards retain card/body-small type. Actions render only with a configured mode and label; “Нет действия” never injects a fallback button. Public contract v21 excludes disabled offers and carries their approved mesh tone.
- `/training`: program cards and the coach carousel precede a compact CMS-managed methodology infographic; its methodology cards become unboxed icon rows with dividers on mobile. Its knowledge base uses the accepted two-column pattern: first-visit checklist on the left and FAQ on the right. Section headings, CTA labels, checklist and FAQ are typed CMS fields; the old rich-text surrogate is retired from editing and projection.
- /gift: conversion-focused Swiss-style SEO landing for padel gift certificates in Moscow. Built strictly with design system atoms (Typography, Badge, Button, ButtonLink, SurfaceCard, Accordion, Field, SelectField, CheckboxField, Reveal, MobileSwiperNav), non-breaking spaces on Russian prepositions, compact page-view hero without badges, CTAs or metrics chips, use-cases grid (unboxed icon rows with dividers on mobile; court rent, PRO coaches, sports shop gear, 2x2 games), 2 presentation formats (physical luxury box on the left, digital PDF on the right with mobile Swiper and glass badge on image), combined 2-column desktop section (terms on the left, unwrapped Accordion FAQ on the right), conversion lead capture form without visible top labels (using in-field ghost text and labelVisibility="sr-only") for manager consultation and payment processing, and rich Schema.org JSON-LD (Product, FAQPage, BreadcrumbList, Organization).

## D14 — Commercial landing — accepted

`/padel-court-zakaz` is a code-defined SEO landing for JUBO court sales and turnkey installation in Russia (with 301 redirect from legacy `/padel-courts`). Editors manage its copy, headings, poster/video and section media, repeatable cards, model data, CTA/form labels and SEO in `Страницы / разделы → Дистрибьюция кортов`, projected from the typed `padel-court-zakaz-page` global with independent publication state; no free-form page builder is introduced. Model images and the footer portrait are CMS media; technical comparison uses manufacturer-published values, with no numeric wind limit shown where JUBO publishes none. Standard Magnelis models share one C4/C5 wording; Xtrem's separate Qualisteelcoat system remains distinct. The landing remains constructed strictly with design system atoms (`Typography`, `Badge`, `Button`, `ButtonLink`, `SurfaceCard`, `ImageCard`, `Tabs`, `Reveal`, `SplitTextReveal`), non-breaking spaces on prepositions (`typograph`), video hero with dark gradient, image-led turnkey services breakdown, price factors, monochrome JUBO engineering innovations section, interactive court model tabs with standardized 6-row spec comparison, and a left-aligned Swiss CTA conversion block with compact messenger buttons and an inline lead form submitting to the validated lead endpoint. Reusable cards and section reveals use the shared lazy GSAP reveal controller rather than section-only animation wiring.

## D13 — CMS palette — accepted

CMS uses Payload's existing `theme-success-*` scale as one shared blue accent system. Light theme uses a clear royal blue (`#2563eb`), dark theme uses the same hue family with a calmer blue (`#6fa7d7`), and all active, focus, hover, status and analytics states consume shared `admin-accent-*` aliases. Neutral surfaces remain theme-driven; no shadows or glow are added.

The reusable control sizes, field/button states and split-button rules are defined in `docs/cms-ui-system.md` and implemented through shared `admin-*` tokens in the Payload custom stylesheet.

## D15 — Desktop navigation interaction — accepted

On desktop, `Цены` is the only grouped top-level item; `Тренировки` and `Тренеры` remain its typed CMS-managed children. The black header compacts into an evenly spaced icon row while scrolling down (and expands on upward scroll): the pill keeps a fixed 60px vertical axis and stationary horizontal center; one progress value interpolates its width, padding, gaps and control widths in real layout, without independent FLIP transforms. Labels/icons swap through CSS fades with deterministic server-rendered visibility, and the hidden label track collapses to zero in compact mode so it cannot displace the icon. Tooltips require current pointer hover or keyboard-visible focus, and scroll/page navigation clears stale intent. The grouped item keeps its dark gooey mega-menu. Desktop and mobile navigation chrome stays outside the Swup replacement surface; compact/menu state survives page replacement and respects reduced-motion preferences.

## D16 — Article editor — accepted

Keep Payload Lexical for article bodies. The article title is the only H1; body authors can use H2, H3 and H4, fixed formatting controls, lists/checklists, quotes, rules, links and Media uploads. Public article rendering uses escaped code-defined HTML and UI-kit typography (`type-title-large`, `type-title-card`, `type-title-compact`, `type-body`), never editor-provided raw HTML. Media selection inside a drawer inserts the selected record, while the standalone Media section retains edit navigation and batch tools.

## D17 — Public content delivery and SEO — accepted

Published edits appear on the next public request without rebuild, restart or a cache button. Draft edits remain in preview. The single-CMS-process projection cache invalidates automatically after content transactions; outage fallback is finite and never replaces an explicit not-found/unpublished response.

Homepage: preserve the large offer visually; render “Премиальный крытый падел-клуб” as the separate inline H1 beneath it, followed by editable descriptive text. The editor explains that the H1 is an SEO setting normally left unchanged. Owner-confirmed facts: 3 courts, 50 parking spaces, PRO TURF 240 and VK https://vk.ru/unlimpadel; unknown social profiles stay hidden. Coach fallback title: “Имя Фамилия - тренер по паделу | Москва, Новая Рига”. Gift certificates have no fixed price range in copy/schema.

The native WebGL2 ball scene loads only during stable idle after the first completed Swup navigation. The first transition uses the lightweight animation and never waits for the scene.

## D18 — Photo card overlays and mobile motion — accepted

Only the photo benefits (Varlion rackets, auto spa, food and drinks) and training program cards use the seven-color linear overlay palette on desktop and mobile. Each gradient has stops at 0/30/70/75/100%, with a saturated 75% tone and lighter 100% tone. Their mobile carousel images use scroll parallax with filter-free image loading. Supplied coach posters stay uncropped without parallax or badge overlays. Mobile photo benefits paint the responsive image and fixed-position gradient into the same parallax compositing layer; text and actions remain above it. Other mobile photo cards keep their existing transform compositing hints. Swipe hints finish their visual cycle even if a card is touched. Rental, membership, and other photo cards retain their existing surfaces.

## D19 — Club opening — accepted

Show the waitlist immediately on every full document entry, including after a prior submission. Keep grouped training programs in CMS but hide their public offers, filters and associated copy/reviews. Club rules use numbered disclosures and text links. Cancellation uses 12 hours; remove the same-day 3-hour exception from the published club rules and price summary. Preserve the supplied source documents. Waitlist success uses two sentences on separate lines and closes after 7 seconds. Mobile hero wordmark is at most 126px; social proof is compact only on mobile. Footer navigation is balanced across three columns; legal links stay in the bottom row. Gift consent starts unchecked and blocks submission until explicitly accepted.

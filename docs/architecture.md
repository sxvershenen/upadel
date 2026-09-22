# Architecture

Status: core split accepted; open product choices remain in `decisions.md`.

## Runtime boundaries

```text
Visitor -> server-rendered Astro page <- versioned Payload projection <- PostgreSQL
                  \-> media storage/CDN
                  \-> first-party event endpoint -> event store/aggregates

Owner -> Payload admin -> content, entities, leads, settings, analytics
      \-> protected Astro preview route -> draft Payload projection
Booking CTA -> centrally configured external provider adapter
```

Astro owns public routing, SEO HTML and interaction shells. Vite dependency caches are separated by development/production so `astro check` and builds cannot replace a running dev server’s React runtime. React islands own only stateful UI such as menus, filters, lightbox, forms, dialogs and booking widgets. Payload owns editorial workflows, validation, access control, preview and admin views. Business timezone is `Europe/Moscow`.

The isolated `/transitions/serve` and `/transitions/rally` playground routes are server-rendered Astro `noindex, follow` demos. A small React island adds the Swup + GSAP enhancement around the static page HTML and a persistent transparent viewport-sized native WebGL2 layer with a procedural 3D ball; the routes are intentionally excluded from the CMS SEO index and sitemap. The separate `/transitions/header` route is a noindex React playground for testing the Dynamic Island desktop navigation without mounting the production CMS-backed header. The code-defined `/padel-court-zakaz` landing (with 301 redirect from `/padel-courts`) uses the shared site shell and lead action layer, with the path included in the web sitemap.
The shared Astro layout adds intent-based prefetching for internal links and a DOM text typographer for non-breaking short Russian words, while preserving semantic HTML and explicit opt-out selectors for code-like content. Above-the-fold page and mobile-chrome entrances are emitted with SSR markup and CSS. A tiny persistent DOM controller applies the homepage hero parallax before React hydration, using the visible mobile asset with a desktop fallback. Its CMS-backed desktop header and mobile bottom navigation share one persistent React island outside the Swup replacement surface. Incoming page DTOs refresh their content without remounting chrome or resetting menu state. React alone owns desktop compact state; the first client render matches the expanded SSR header, then a layout effect applies the responsive icon mode before paint. Icon/label visibility and vertical geometry stay deterministic through hydration. Public content images carry aspect-compatible 640/card/hero srcset candidates and intrinsic dimensions through the shared DTO; mobile hero art direction uses one picture image. One reversible progressive-image atom handles loading: the image element remains black while decoding, then reveals smoothly within its own dimensions/radius; logos and transparent decorative assets opt out. Lazy images receive low fetch priority, and no React state update is performed on image completion. CMS rich-text images use the same data contract without another island. LAN development may project media/forms through the Astro same-origin proxy so phones need only the web port; production keeps the CMS origin directly. An inline lime route-progress indicator starts on navigation before hydration. The optional Swup/GSAP core initializes during idle time or immediately on internal-link intent, while the native WebGL2 scene module waits until the first successful navigation has finished and the destination is ready, then initializes during idle. New visits cancel pending idle work; resolved modules wait until navigation ends before mounting. Reveal preparation runs directly against SSR markup and marks visible elements before enabling CSS transitions, so hydration cannot hide them again. Swup waits for the next document before starting one synchronized ball/page timeline when the scene is ready, synchronizes route stylesheets and SEO head tags before content replacement, retains loaded styles, and lets Astro hydrate incoming islands.
Public lead forms use the shared `Field`, `TextareaField`, `SelectField` and `CheckboxField` atoms with accessible screen-reader labels. Mobile sheets and dialogs share coordinated backdrop/surface exit animations; modal-to-modal actions wait for the first surface to close. The lead form may use the full mobile viewport and hides its fallback scrollbar, while the compact coach dialog is sized to its content and never creates an inner scroller. Reusable surfaces and `Reveal` emit one reveal metadata contract, while `Typography`, `Badge`, `Button` and `ButtonLink` expose an explicit opt-in contract for atomic entrances. Cards remain reveal boundaries so their children never compete. The shared SSR-safe IntersectionObserver owns section entrances with CSS transitions; it prepares only offscreen targets, preserves visible SSR content and refreshes after Swup or DOM changes without importing GSAP into the initial page. Hero CTAs keep their CSS entrances. Homepage pricing tabs use one lightweight CSS entrance and an explicitly animated panel height; their cards do not register a second reveal owner. Automated mobile swipe hints play once per section and yield immediately to pointer interaction. Whole detail-page containers use opacity-only CSS entrances so native scroll restoration cannot accumulate a transform offset. GSAP is isolated to the optional page-transition timeline, whose waits preserve cleanup callbacks and settle on completion or interruption.
The transition demo uses the attached reference project's native WebGL2 scene: a client-only canvas renders its procedural shader ball, 3D bezier position, perspective depth, spin and particle trail over a fixed transition timeline. Mobile uses a portrait-rotated trajectory, reduced geometry detail and a capped pixel ratio to avoid frame stalls; Swup still replaces only the SSR content container. Rendering stops and clears the transparent canvas when no flight is active, and navigation remains functional when WebGL2 is unavailable.

Migration stage: the CMS-backed homepage server-renders all visible HTML in one React root. Hero and global actions hydrate immediately; lower homepage sections are streamed on the server but their client modules and hydration are deferred until approximately 900 px before the viewport. Lazy wrappers belong to each page root; outgoing observers disconnect on content replacement. Published CMS edits are read on the next request without rebuilding the public route, and reveal animations never hide visible SSR content. Swup/GSAP loads after critical interactivity; the dependency-free WebGL2 scene waits for idle after the first completed navigation, and its Web Audio whoosh stays in a separate small lazy chunk. Dedicated `/preview/*` routes use the Node adapter for secure live drafts.

## Content model

- Globals: site identity, navigation, contacts, footer, integrations, booking provider and homepage composition.
- Pages: code-defined page templates with parent/child relationships, CMS-managed content/SEO and per-page hero image/grayscale settings; `/gift` and `/padel-court-zakaz` are typed landings, not free-form page builders.
- `/gift` reads its hero, use cases, formats, terms, FAQ and form copy/media from the typed `gift-page` global; layout, responsive behavior and icon mapping remain code-defined. Certificate format has no implicit default and must be selected explicitly.
- `/training` reads methodology, program/team headings, CTA labels, first-visit checklist and FAQ from the typed `training-page` global. The retired rich-text surrogate columns remain untouched in the database for rollback but are no longer exposed or projected.
- Page hero rule: `eyebrow` is reserved for the homepage and the commercial `/padel-court-zakaz` hero; catalog, detail and thematic page heroes lead with `title` and `intro`. Use the eyebrow role for section or card context when that small label adds meaning. Shared desktop page heroes use `pt-24` and `pb-12`; `/padel-court-zakaz` keeps its own full-screen spacing.
- Collections: articles/categories, coaches, courts, training types, prices/memberships, tournaments/leagues, reviews, FAQ, partners and leads.
- Media: raster uploads are auto-oriented and normalized to WebP quality 80 before storage; SVG/GIF remain untranscoded. Desktop-navigation rows and their optional typed submenu children may reference SVG icons as Media relations rendered through safe image URLs. Alt/focal point/rights, schema-aware reverse usage links (including article bodies and retained versions) and referenced-file deletion safeguards remain in Payload.
- Shared SEO group: title, description, canonical, robots and social image. SSR emits code-defined entity/breadcrumb JSON-LD from published DTOs without invented authors, ratings or fixed gift/court prices. Social images never automatically become LCP preloads. The homepage offer is decorative; its separate SEO H1 and description continuation remain editable in the hero group.

Editing model: typed fields for core pages and repeatable entities. Homepage sections can be hidden or reordered, but their markup and animations remain code-defined. New landing layouts are implemented in code from the shared design system/UI kit, then exposed as typed CMS fields. `/padel-court-zakaz` uses the typed `padel-court-zakaz-page` global for copy, media, cards, CTA/form labels and SEO while preserving its stable code-defined route.
Article bodies use a collection-specific Payload Lexical editor with H2–H4, fixed formatting controls and Media uploads. The public projection converts supported nodes to escaped semantic HTML; Astro applies the shared UI-kit typography and serves protected per-article draft previews.

## Single source of truth

- Coaches, tournaments and articles are created once in their collections. Detail/catalog pages and homepage cards read the same record.
- Coaches and tournaments use homepage visibility/order fields; the homepage never stores copied card content.
- Tournament schedule labels are derived from required `startsAt`/`endsAt` values in Moscow time. Participants, manual result order, prizes, coordinator overrides, FAQ and regulations are collection-owned; reusable pre-court, included, matchday and FAQ content resolves from the published `tournament-defaults` global while inheritance is enabled.
- The blog homepage resolves three slots: explicitly pinned articles first, then newest published articles for empty slots. Preview images come from the article record.
- Unpublishing or deleting an entity removes it from every consumer; references must not leave copied stale content.

## Delivery rules

- Astro revalidates published content with CMS on every request. A bounded single-process CMS projection cache invalidates around content transaction commits/rollbacks; generations prevent old in-flight reads from refilling it. Preview bypasses caches. Public HTML and Swup never retain stale documents. A 5-second read deadline allows at most 2 minutes of last-good data only during network/502/503/504 outages; explicit 404/403 and invalid DTOs evict it. Direct SQL or separate-process changes become visible within the CMS cache TTL (60 seconds).
- `npm run seed:cms` idempotently seeds the prototype demo data/media, uses versioned local assets for Pexels sources, and rehydrates seed-owned media files missing from the local Payload media directory. Production web reads only the versioned `/api/public/homepage` projection.
- Convert uploaded raster images to WebP quality 80 before storage and generate responsive derivatives (including uncropped 640px); deployment backfills missing small derivatives without replacing originals/record IDs; inputs are capped at 25 MiB. MP4/WebM inputs are capped at 100 MiB and stored without transcoding until production storage is selected.
- Booking buttons call one adapter; provider configuration is global and validated before publish.
- The shared code route registry drives the authenticated page map and public SEO index. Redirects refresh on request without restart. Missing or unpublished routes return 404; operational CMS failures return controlled 503. Catalogs use bounded server pagination (12 records), URL filters and self-canonical numbered pages; filtered/sorted variants are noindex. Cards select only required fields; detail-only content stays on detail routes.
- Payload custom tools use the native admin shell and grouped navigation. The page map renders the code registry as a collapsed-by-default hierarchy and can create an immutable-path draft placeholder under an existing route; a page becomes public only after its code-defined template and typed projection are implemented.
- Track a versioned event contract. Store raw events for a bounded period and query mergeable daily aggregates for long historical ranges.
- Public endpoints enforce bounded byte/stream time limits and TTL rate buckets. The supplied single-proxy Nginx setup overwrites client-address headers and applies separate small lead/analytics body caps; CMS binds to loopback in production. In-process rate/cache state assumes one CMS process; multiple instances need coordinated invalidation and ingress limits.
- Analytics uses deduplicated raw events, 30-minute sessions and HLL p=14 daily sketches. Ingest batches up to 25 events with atomic parameterized PostgreSQL upserts; daily rebuilds page through raw rows under a per-day lock and repeatable-read snapshot. Retention deletes only verified snapshot rows. The browser serializes deliveries and acknowledges event IDs; document Web Vitals keep initial-document attribution and consult current consent/policy across Swup navigation.
- Payload runs scheduled publish/unpublish jobs every minute; no editor action beyond the existing schedule control is required. `PAYLOAD_DISABLE_JOBS=1` disables the runner in disposable tests/maintenance processes.
- External analytics is code-defined and consent-gated. Lead notification secrets are server-only; delivery failure never rolls back a saved lead.
- Before production launch, choose Russian hosting/data-processing vendors and review the privacy policy, form consents, analytics basis and operator obligations under applicable Russian law.
- Payload production schema changes run forward-only migrations from `apps/cms/src/migrations`; existing databases created by development schema push require an explicit baseline before the first production migration run. The admin route is configurable via `PAYLOAD_ADMIN_ROUTE`, with account lockout and proxy-backed login throttling required at the perimeter.

## Initial repository map

```text
apps/web/                 Astro public site
apps/cms/                 Payload config, admin, API and jobs
docs/                     Stable architecture and decisions
packages/content-contract/  Versioned public DTO and boundary validation
reference/prototype-baseline/  Immutable migration/recovery snapshot
```

## Reference prototype map

- `apps/web/src/App.tsx` — current one-page section order.
- `apps/web/src/sections/*` — visual section recipes, not CMS boundaries.
- `apps/cms/src/seed.ts` — idempotent imported demo data; PostgreSQL is the editable source of truth after seeding.
- `apps/web/src/design-system`, `components` and `styles` — UI contracts to preserve.
- `reference/prototype-baseline/docs/design-system.md` — existing component and accessibility rules.

The verified untouched copy is `reference/prototype-baseline`; production migration must not modify it.

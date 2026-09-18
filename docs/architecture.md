# Architecture

Status: core split accepted; open product choices remain in `decisions.md`.

## Runtime boundaries

```text
Visitor -> prerendered Astro page <- versioned Payload projection <- PostgreSQL
                  \-> media storage/CDN
                  \-> first-party event endpoint -> event store/aggregates

Owner -> Payload admin -> content, entities, leads, settings, analytics
      \-> protected Astro preview route -> draft Payload projection
Booking CTA -> centrally configured external provider adapter
```

Astro owns public routing, SEO HTML and interaction shells. React islands own only stateful UI such as menus, filters, lightbox, forms, dialogs and booking widgets. Payload owns editorial workflows, validation, access control, preview and admin views. Business timezone is `Europe/Moscow`.

The isolated `/transitions/serve` and `/transitions/rally` playground routes are server-rendered Astro `noindex, follow` demos. A small React island adds the Swup + GSAP enhancement around the static page HTML and a persistent transparent viewport-sized Three.js WebGL layer with a textured 3D ball; the routes are intentionally excluded from the CMS SEO index and sitemap. The separate `/transitions/header` route is a noindex React playground for testing the Dynamic Island desktop navigation without mounting the production CMS-backed header. The code-defined `/padel-court-zakaz` landing (with 301 redirect from `/padel-courts`) uses the shared site shell and lead action layer, with the path included in the web sitemap.
The shared Astro layout adds intent-based prefetching for internal links and a DOM text typographer for non-breaking short Russian words, while preserving semantic HTML and explicit opt-out selectors for code-like content. Above-the-fold page and mobile-chrome entrances, plus the homepage hero's initial parallax transform, are emitted with SSR markup and CSS so they start before React hydration; interactive scroll and layout motion remains island-owned. Its CMS-backed desktop header and mobile bottom navigation share one persistent React island outside the Swup replacement surface, so fixed chrome, menu state and one scroll listener survive page navigation. Reveal and transition runtimes start from document readiness and the live Swup surface, with the hydration marker used as telemetry rather than a hard animation gate.
Public lead forms use the shared `Field`, `TextareaField`, `SelectField` and `CheckboxField` atoms with accessible screen-reader labels; dialogs keep their header fixed while only the content viewport scrolls. Reusable surfaces and `Reveal` emit GSAP reveal metadata directly from the component layer, while `Typography`, `Badge`, `Button` and `ButtonLink` expose an explicit opt-in reveal contract for atomic staggered entrances. One lazy, SSR-safe DOM controller loads GSAP after hydration/idle and uses IntersectionObserver plus mutation refreshes to start only visible animations, without forcing each atom into a separate React island.
The transition demo uses the local reference project's raw Three.js scene: a client-only canvas renders the procedural textured/fuzzy ball, 3D bezier position, perspective depth, spin and particle trail over a fixed 1-second flight; Swup still replaces only the SSR content container.

Migration stage: the CMS-backed homepage prerenders visible HTML plus one `client:load` React island. Reveal animations never hide SSR content; the optional Swup/GSAP/Three transition runtime loads after document readiness and the browser is idle. A dedicated `/preview/homepage` route uses the interim Node adapter for secure live drafts; normal `/` remains static. Split the island later, guided by measured runtime cost and visual regression checks.

## Content model

- Globals: site identity, navigation, contacts, footer, integrations, booking provider and homepage composition.
- Pages: code-defined page templates with parent/child relationships, CMS-managed content/SEO and per-page hero image/grayscale settings; `/gift` and `/padel-court-zakaz` are typed landings, not free-form page builders.
- `/gift` reads its hero, use cases, formats, terms, FAQ and form copy/media from the typed `gift-page` global; layout, responsive behavior and icon mapping remain code-defined.
- Page hero rule: `eyebrow` is reserved for the homepage and the commercial `/padel-court-zakaz` hero; catalog, detail and thematic page heroes lead with `title` and `intro`. Use the eyebrow role for section or card context when that small label adds meaning. Shared desktop page heroes use `pt-24` and `pb-12`; `/padel-court-zakaz` keeps its own full-screen spacing.
- Collections: articles/categories, coaches, courts, training types, prices/memberships, tournaments/leagues, reviews, FAQ, partners and leads.
- Media: raster uploads are auto-oriented and normalized to WebP quality 80 before storage; SVG/GIF remain untranscoded. Desktop-navigation rows and their optional typed submenu children may reference SVG icons as Media relations rendered through safe image URLs. Alt/focal point/rights, schema-aware reverse usage links (including article bodies and retained versions) and referenced-file deletion safeguards remain in Payload.
- Shared SEO group: title, description, canonical, robots, social image and optional structured-data inputs.

Editing model: typed fields for core pages and repeatable entities. Homepage sections can be hidden or reordered, but their markup and animations remain code-defined. New landing layouts are implemented in code from the shared design system/UI kit, then exposed as typed CMS fields. `/padel-court-zakaz` uses the typed `padel-court-zakaz-page` global for copy, media, cards, CTA/form labels and SEO while preserving its stable code-defined route.
Article bodies use a collection-specific Payload Lexical editor with H2–H4, fixed formatting controls and Media uploads. The public projection converts supported nodes to escaped semantic HTML; Astro applies the shared UI-kit typography and serves protected per-article draft previews.

## Single source of truth

- Coaches, tournaments and articles are created once in their collections. Detail/catalog pages and homepage cards read the same record.
- Coaches and tournaments use homepage visibility/order fields; the homepage never stores copied card content.
- The blog homepage resolves three slots: explicitly pinned articles first, then newest published articles for empty slots. Preview images come from the article record.
- Unpublishing or deleting an entity removes it from every consumer; references must not leave copied stale content.

## Delivery rules

- Published content invalidates or rebuilds affected Astro pages; Payload contains a live preview of secure Astro draft URLs.
- `npm run seed:cms` idempotently seeds the prototype demo data/media and rehydrates seed-owned media files missing from the local Payload media directory. Production web reads only the versioned `/api/public/homepage` projection.
- Convert uploaded raster images to WebP quality 80 before storage and generate responsive derivatives; inputs are capped at 25 MiB. MP4/WebM inputs are capped at 100 MiB and stored without transcoding until production storage is selected.
- Booking buttons call one adapter; provider configuration is global and validated before publish.
- The shared code route registry drives the authenticated page map and public SEO index. Redirects are loaded once when Astro starts and require restart/deploy to change.
- Payload custom tools use the native admin shell and grouped navigation. The page map renders the code registry as a collapsed-by-default hierarchy and can create an immutable-path draft placeholder under an existing route; a page becomes public only after its code-defined template and typed projection are implemented.
- Track a versioned event contract. Store raw events for a bounded period and query mergeable daily aggregates for long historical ranges.
- Analytics uses deduplicated raw events, 30-minute sessions and HLL p=14 daily sketches; retention aggregates and verifies all expired days before deleting any raw day.
- External analytics is code-defined and consent-gated. Lead notification secrets are server-only; delivery failure never rolls back a saved lead.
- Before production launch, choose Russian hosting/data-processing vendors and review the privacy policy, form consents, analytics basis and operator obligations under applicable Russian law.

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

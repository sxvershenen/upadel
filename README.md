# UNLIM Riga Padel

SEO-first multipage website for a Russian padel brand in Moscow/Krasnogorsk, with an owner-friendly CMS and business analytics.

## Status

All fixed public routes are CMS-backed, including catalog/detail pages, mobile price tabs and responsive gallery/lightbox experiences. Astro server-renders published Payload content on request, protected routes power live preview, and Payload includes analytics, integrations, lead notifications, a hierarchical page/SEO map and visual media library.

## Target shape

- `apps/web` — Astro public site with React islands.
- `apps/cms` — Next.js + Payload CMS, API, admin UI and analytics.
- PostgreSQL — content, business entities, leads and analytics.
- Media storage — Payload-managed images/video; provider is not selected yet.

Create a shared package only when real cross-app code appears. Do not add abstractions in advance.

## Local run

```sh
npm install
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env
npm run seed:cms
ADMIN_USERNAME=admin ADMIN_EMAIL=admin@example.test ADMIN_PASSWORD='change-me' npm run admin:create
npm run analytics:demo # optional: fill local analytics with 30-day demo data
npm run dev:cms
npm run dev:web
```

Run the seed after PostgreSQL is available; it is idempotent and does not overwrite unrelated records. Public web builds require the CMS endpoint configured by `CMS_URL`. Build/typecheck commands are in the root `package.json`.

Run analytics aggregation every 15 minutes with `npm run analytics:maintain`; `npm run analytics:demo` is an idempotent local fixture for UI checks and must not be used as production traffic. Production must provide `ANALYTICS_JOB_SECRET` to the protected maintenance endpoint.

Production admin uses `PAYLOAD_ADMIN_ROUTE` and `ADMIN_USERNAME` from the server-only environment. Schema changes ship as Payload migrations; never run `migrate:fresh` or commit production secrets.

## Product surface

Public routes: `/`, `/blog`, `/prices`, `/training`, `/coaches`, `/courts`, `/tournaments`, `/about`, `/contacts`, `/policy`, `/oferta`, `/padel-court-zakaz` (with `/padel-courts` redirect), plus article and entity detail pages.

CMS areas: pages and navigation, home sections, business entities, blog, media, leads, SEO, integrations, booking and analytics.

## Project docs

- [`docs/architecture.md`](docs/architecture.md) — boundaries, data flow and content model.
- [`docs/analytics.md`](docs/analytics.md) — dashboard, event contract and retention rules.
- [`docs/decisions.md`](docs/decisions.md) — owner decisions required before implementation.
- [`docs/scope.md`](docs/scope.md) — concise MVP completion checklist.
- [`AGENTS.md`](AGENTS.md) — working rules for every model and subagent.
- [`reference/prototype-baseline`](reference/prototype-baseline) — untouched source snapshot of the supplied React/Vite prototype.

Keep these docs short. Update them only when architecture, scope, source-of-truth paths or an accepted decision changes.

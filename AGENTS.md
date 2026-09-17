# Project rules

## Before implementation

- Ask the owner about ambiguities that materially change UX, data model or scope.
- For visual/product choices, present 2–3 concrete options and a recommendation. Examples: dashboard layout, page-builder freedom, tabs/filters, graph choice and booking/contact flows.
- Use owner-facing examples and plain language; define necessary terms instead of asking with unexplained jargon.
- Do not start the affected implementation until the owner decides. Safe, reversible technical details may use an explicitly stated assumption.
- Separate MVP from later work; do not silently expand scope.

## Architecture

- Public site: Astro with React islands. Prefer static/server-rendered HTML; hydrate only interactive controls.
- CMS/API/admin: Next.js + Payload CMS backed by PostgreSQL.
- Payload is the source of truth for public content, business entities, SEO, integrations and media metadata. Do not reintroduce duplicated hardcoded production content.
- `packages/content-contract` is the public CMS-to-web boundary. Change its version and both consumers together; never expose hidden CMS fields or preview credentials.
- Preserve the prototype's exact layout, responsive behavior and animation contracts when migrating. Reuse its components without adding speculative abstraction.
- Homepage fields and section order are CMS-managed, but section markup stays code-defined. New landing pages are coded by an agent from the design system/UI kit; do not build a free-form runtime page builder.
- Treat external booking as a provider adapter configured centrally. Never allow arbitrary untrusted HTML/JS from ordinary CMS editor roles.
- Preserve `apps/cms/src/seed.ts` idempotency: seed-owned records may be skipped or versioned, never overwrite unrelated editor records or reset the database.
- Keep `apps/cms/src/lib/mediaUsage.ts` schema-aware when adding Media relationships. New direct Media fields must appear in usage reporting and deletion protection.

## Content and quality

- Every public entity needs draft/publish state, stable slug, SEO fields and preview support where useful.
- Keep Core Web Vitals, accessibility, responsive behavior and semantic HTML intact.
- Form fields: render without visible labels above them (use labelVisibility="sr-only"); convey field purpose via concise in-field ghost placeholder text (e.g. 'Telegram @username').
- Analytics must not block navigation or rendering. Define event names and required properties centrally; avoid collecting personal data without a stated purpose and retention rule.
- Tests should cover changed behavior and failure paths. Do not weaken assertions to make checks pass.

## Documentation duty

After a material change, update only the affected lines in `README.md`, `docs/architecture.md` or `docs/decisions.md`. Record accepted decisions and remove resolved questions. Do not duplicate implementation details or maintain diary-style logs.

Update `docs/scope.md` only when an item actually changes status; never mark partially implemented work complete.

## Git workflow

- After each completed update, create a focused commit with a clear message.
- After the relevant checks pass, push the commit to the current branch's configured remote.
- Before committing, inspect the diff and keep secrets, local configuration and generated artifacts out of commits.
- If no remote is configured or push fails, report the exact blocker and do not treat the push as completed.

## Reference

Immutable local snapshot: `reference/prototype-baseline`. Never edit it. Compare migrated visuals/behavior against it and change only production code. The source was copied without `node_modules` and reproducible `dist` output.

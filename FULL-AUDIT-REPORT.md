# UNLIM: SEO, analytics и security audit

Дата: 2026-09-20

## Ограничения проверки

Проверен исходный код, локальная CMS на `127.0.0.1:3000`, локальная PostgreSQL, Payload routes, SEO projection, analytics contract и production build. Production-домен, reverse proxy, DNS, TLS, CDN/WAF, Google Search Console, GA4 и Яндекс.Вебмастер не переданы, поэтому их состояние не подтверждено.

## Итог

| Область | Оценка | Статус |
|---|---:|---|
| Technical SEO | 82/100 | Основы SSR, robots и sitemap есть; нужны production-проверки и расширение schema |
| Content / E-E-A-T | 67/100 | Контентная модель хорошая, но авторство и доказательные сигналы не систематизированы |
| Analytics readiness | 78/100 | First-party contract, consent, deduplication, retention и Web Vitals готовы; внешние vendors требуют запуска и юридической проверки |
| Application security | 76/100 | После исправлений admin auth, lockout, IP throttle, CSRF и headers закрыты на уровне приложения; production perimeter не проверен |

## Что уже исправлено

- Admin route перенесён с `/admin` на `/urp-panel` с env-переопределением `PAYLOAD_ADMIN_ROUTE`.
- Payload login переведён на username, включены 5 попыток и lock на 15 минут.
- Добавлен IP-level лимит: 30 запросов login в минуту на IP в процессе CMS.
- Custom admin API теперь требуют `permissions.canAccessAdmin`, а не только наличие JWT.
- GraphQL route и Playground удалены из Next app routes.
- Добавлены `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS в production.
- Sitemap больше не фиксируется на момент build и обновляется по CMS projection с коротким cache.
- Canonical URL нормализует trailing slash; добавлены OG/Twitter metadata и Organization/SportsActivityLocation JSON-LD.
- Удалён hardcoded домен из JSON-LD landing page; URL строятся от текущего public origin.
- Redirect map больше не выключает весь сайт при временной недоступности CMS.
- Карточки «Площадка для турниров» и «Ваше мероприятие» ведут в lead form с отдельным `sourceEntity`; это значение попадает в аналитику и текст уведомления.
- Gift landing теперь отправляет тот же нормализованный lead payload, что и остальные формы; Padel landing использует допустимые event/object types и не создаёт дублирующий success event.

## Authentication, brute force и IDOR

Payload account lock теперь явный: 5 неверных попыток по аккаунту → 15 минут блокировки. Дополнительно login route ограничен 30 запросами в минуту на IP; это защита в памяти одного процесса, поэтому reverse proxy должен перезаписывать `X-Real-IP`/`X-Forwarded-For`, а при нескольких инстансах нужен общий rate-limit store.

Локальная проверка дала: 30 неуспешных login-запросов → `401`, 31-й → `429`; `/admin/login` → `404`; `/urp-panel/login` → `200`; custom admin API без сессии → `401`.

Прямой unauthenticated IDOR в проверенных custom routes не обнаружен. Риск был в том, что custom admin endpoints проверяли только `user`; теперь они проверяют admin permission. Все редакторы сейчас фактически имеют одинаковую admin-модель. При добавлении ролей нужно убрать широкие `overrideAccess: true` из пользовательских действий и ввести role-based access.

## Analytics

Готовы: versioned event contract, строгая санитизация, отсутствие query в path, consent gate, first-party queue, deduplication по event ID, sessions, HLL uniques, 90-day raw retention, 36-month daily aggregates, lead attribution и Web Vitals.

Осталось до production:

- настроить реальные IDs GA4/Метрики и проверить события в live окружении;
- проверить законность consent/retention/localisation для РФ;
- настроить внешний rate limit для public analytics/leads: текущий in-memory лимит сбрасывается при рестарте и может обходиться spoofed IP header без правильного proxy;
- подключить реальный booking provider adapter или оставить booking disabled до его реализации;
- отдельно проверить отзыв согласия: текущая реализация перезагружает страницу и очищает собственное хранилище, но не гарантирует удаление cookies третьих vendors.

## SEO

Проверено/исправлено: SSR critical HTML, title/description, robots directives, canonical, live sitemap, preview `noindex`, redirect registry, media alt/размеры, OG/Twitter basics и local business entity JSON-LD.

Следующие SEO-задачи: добавить Article/BlogPosting и BreadcrumbList для detail routes, Event schema для турниров, Service/Offer только для подтверждённых цен, авторов и даты обновления статей, затем проверить все публичные URLs через production crawl и Google/Yandex tools.

## Dependencies

`npm audit --omit=dev` на текущем lockfile обнаружил 7 advisories: 6 moderate и 1 low, high/critical нет. Цепочки затрагивают `esbuild`, `drizzle-kit`/Payload и `dompurify`/admin dependencies. Перед production нужно обновить lockfile в отдельном PR и прогнать полный build/test; blind `npm audit fix` не применять.

# Action plan: production readiness

## P0 — до production

1. На VPS задать новые случайные `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `ANALYTICS_JOB_SECRET` и production admin password. Локальный пароль из задачи не использовать в production.
2. Настроить reverse proxy: TLS, HSTS, overwrite `X-Real-IP`, limit login/public forms, PostgreSQL только на localhost/private network.
3. Сделать backup PostgreSQL и media. Не запускать `migrate:fresh`, `seed` и не удалять volume.
4. Для существующей БД, созданной через dev schema push, сначала определить baseline migration. Не запускать весь migration history вслепую: локальный `migrate:status` показал, что history table не отражает текущую уже существующую схему.
5. Проверить production login на `/urp-panel/login`, `401/403/429`, cookie `HttpOnly; Secure; SameSite=Lax` и недоступность `/admin`.
6. После подключения уведомлений отправить тестовые заявки из `/`, `/gift`, `/padel-court-zakaz`, `/training`, `/coaches/*`, `/tournaments/*` и проверить `sourcePage`, `sourceEntity`, аналитику и Telegram/VK.

## P1 — первая неделя

1. Обновить vulnerable dependency chains отдельным изменением lockfile.
2. Подключить GA4/Метрику и проверить canonical/page_view/lead/booking/web_vital в live окружении.
3. Добавить Article/BlogPosting, BreadcrumbList и Event schema там, где данные подтверждены CMS.
4. Подключить PageSpeed/CrUX, GSC и Яндекс.Вебмастер после появления production-домена.
5. Добавить общий rate-limit store или WAF rule, если появится второй CMS instance.

## P2 — позже

1. Role-based access для редакторов и отдельная роль администратора.
2. CAPTCHA/Turnstile для публичной lead form при появлении спама.
3. Consent-management с явным удалением/отзывом cookies внешних analytics vendors.
4. Storage/CDN для media и отдельная политика retention для lead PII.

# Analytics

Designed by the requested Astra subagent and implemented end to end. Dashboard, aggregation and 36-month history are accepted.

## Dashboard

Use one Payload custom view with shared period controls (`7/30/90/custom`) and comparison to the preceding equal period or year. Default: last 30 complete days in `Europe/Moscow`.

1. Overview — visitors, sessions, sessions with target action, confirmed leads; one comparison chart, compact funnel and top converting pages.
2. Audience — new/returning, visit frequency, active time and device. Geography stays secondary.
3. Interactions — `Forms / Coaches / Tournaments / Articles / Contacts`; one funnel and object-level result table.
4. Sources — channel, referrer domain and UTM campaign with visitors, target sessions, leads and conversion.

MVP uses fixed reports, role-protected API access, 15-minute aggregates and a visible last-updated/data-health state. Add a fifth tab only when it answers a separate business question; do not split tabs merely to fit more charts. Cohorts, paths, CRM revenue, ad spend/ROAS, custom segments and detailed CWV are later work.

For local UI acceptance, `npm run analytics:demo` fills an idempotent 30-day fixture through the same ingestion and aggregation path; demo leads are marked with the `analytics-demo-v1` idempotency prefix.

## Metric meaning

The main result is `booking_confirmed` only when a provider sends server confirmation. Before that, show booking clicks, phone clicks and successful membership/gift leads separately.

For every action show total events and, where useful, unique sessions and unique browsers. Example: one recognised browser clicking phone 100 times is 100 clicks but one unique converter. Without login, analytics recognises a browser, not a person; another device or cleared storage looks new.

## Event contract

Common envelope: `event_id`, schema version, occurred/received time, `session_id`, pseudonymous `anonymous_id`, optional verified `user_id`, `page_view_id`, page/language, object type/id and consent state.

Canonical events: `page_view`, `active_time`, `cta_click`, `contact_click`, `form_start`, `form_step`, `form_submit_attempt`, `form_submit_success`, `form_error`, `web_vital`. Coach, tournament and article events use object type/id instead of separate event families.

- Emit `form_submit_success` only after the server persists a lead.
- Deduplicate deliveries; close sessions after 30 minutes of inactivity.
- Count funnel steps once per session and object, in order.
- A phone/message/booking click is an intent signal, not a confirmed outcome.
- Monthly uniques cannot be summed from daily uniques.
- Distinguish empty data from failed collection.

Store raw events -> derived sessions -> daily aggregates:

- detailed events: proposed 90 days;
- minimal browser record: 13 months; clear the first advertising source after 60 days;
- daily aggregates: 36 months;
- operational lead/booking records: separate business retention.

Daily aggregates retain allowed dimensions such as date, action/object, first source, current source, UTM campaign, device and language. Mergeable approximate unique counters allow arbitrary date ranges without counting the same recognised browser once per day. Exact server-saved lead counts remain exact. After raw deletion, a new historical filter cannot be invented unless its dimension was aggregated.

Run aggregation automatically, then delete an old day only after verification. Also provide an admin action named “Оптимизировать старые данные”: preview affected dates/volume, run the same safe job immediately and report the result. The button is not a replacement for the scheduled retention job. Run it every 15 minutes with `npm run analytics:maintain`, or call the protected endpoint with `ANALYTICS_JOB_SECRET`.

Do not store form values, full referrer query strings or raw IP. Geo may be derived at ingestion.

## Privacy boundary

The audience and brand are Russian; Latvian/EU assumptions do not apply by default. Treat browser identifiers, event history and submitted lead data as potentially regulated data. Keep purpose, legal basis, Russian data localisation, notices/consents, access and deletion configurable and review them before launch. Form consent and analytics behavior are separate concerns.

## Accepted retention

Keep the pseudonymous browser identifier for 13 months. Its first advertising source expires after 60 days; historical campaign aggregates remain for the accepted 36-month reporting window.

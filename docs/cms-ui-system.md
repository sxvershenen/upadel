# CMS UI system

Scope: Payload admin and the custom CMS views under `apps/cms/src/components/admin`.

## Control contract

- Regular fields and buttons: `--admin-control-height` (`40px`), `--admin-control-radius`, `--admin-control-padding-x` (`12px`), and `--admin-control-gap` (`8px`).
- Visible tab tracks use the regular `--admin-control-height` (`40px`); tab items use `--admin-tab-item-height` (`32px`) with a `4px` inset. Secondary header actions align to the regular `40px` control.
- Page titles use `--admin-page-title-size` (`32px`) and section titles use `--admin-section-title-size` (`20px`). Page-level horizontal spacing comes from Payload `Gutter`; custom pages do not add another inline padding.
- Page titles use the compact native-list baseline. Custom pages apply `--admin-page-title-offset` through `AdminPageFrame` and use `admin-page-title-band`; native document and list title/action rows align from the top so actions and status badges can grow downward without moving the title.
- Standalone icon buttons: `--admin-control-height-icon` (`40px`) with an `18px` icon.
- Field surface: `--admin-field-background`; hover surface: `--admin-field-hover-background`; disabled surface/text: `--admin-field-disabled-background` and `--admin-field-disabled-foreground`.
- Primary actions use `--admin-accent`, `--admin-accent-hover`, and `--admin-accent-contrast`. Selected states use the same `--admin-accent-soft` surface and `--admin-accent-text` foreground everywhere.
- Tabs and segmented filters use a neutral `--admin-button-background` track with a `--theme-bg` active item; the track does not add extra vertical padding. Blue is reserved for primary actions, focus and data visualization.

Native inputs, selects, Payload React Select controls, custom filter controls, and regular buttons must use this contract. Native textareas use the same surface, radius and typography with a `96px` minimum height and vertical resize; rich-text editors keep their own contract. Payload split buttons must keep a `40px` wrapper and equal-height main and popup segments. Disabled primary actions use the neutral disabled surface, not a translucent accent.

Custom screens use `AdminPageFrame` for page geometry and `AdminSegmentedControl` for repeated tab/filter groups; do not recreate these structures with route-specific button markup.

Payload `btn--style-none` and `.card__click` are transparent structural click targets, not visible controls; they must never receive button surfaces or control heights.

Filter/tool rows stay on the page canvas unless they form a deliberate segmented control; the fields and buttons provide their own surfaces. Larger content groups such as reports, tables and dashboards may use a single `theme-elevation-50` surface.

Custom views must not add horizontal page padding on top of Payload `Gutter`. Search bars with desktop action controls use one `40px` grid row; action padding belongs inside the controls, not around the row. Tabs keep the same horizontal gutter as their content.

The only intentional size exception is a `32px` icon utility placed over media or inside a dense tree/table action row. CMS surfaces do not add shadows or glow; use elevation backgrounds and dividers when separation is needed.

When adding a CMS control, consume these tokens instead of introducing a local pixel value or a new color. If a new variant is genuinely needed, add it here and to `custom.scss` before using it in a component.

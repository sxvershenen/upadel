import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const oldNotice = 'Продолжая использовать наш сайт, вы даёте *согласие на использование собираемых данных (cookie)*. Если вы не хотите, чтобы ваши данные обрабатывались, измените настройки браузера.'
const newNotice = 'Собираем статистику посещений, чтобы улучшать сайт. Нажмите ОК, чтобы включить аналитику, или откройте настройки и выберите, какие инструменты разрешить. Подробнее — *политика конфиденциальности*.'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "show_partners" boolean NOT NULL DEFAULT false`)
  await db.execute(sql`ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_show_partners" boolean NOT NULL DEFAULT false`)

  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    await db.execute(sql.raw(`UPDATE "${table}" SET "${prefix}cookie_notice_text" = '${newNotice}' WHERE "${prefix}cookie_notice_text" = '${oldNotice}'`))
    await db.execute(sql.raw(`UPDATE "${table}" SET "${prefix}cookie_notice_accept_label" = 'ОК' WHERE "${prefix}cookie_notice_accept_label" = 'Принять'`))
    await db.execute(sql.raw(`UPDATE "${table}" SET "${prefix}cookie_notice_manage_label" = 'Настройки cookies' WHERE "${prefix}cookie_notice_manage_label" = 'Настроить cookies'`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_show_partners"`)
  await db.execute(sql`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "show_partners"`)
}

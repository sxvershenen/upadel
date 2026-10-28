import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'
const fields = {
  analytics_notice: 'Используем cookie и Яндекс Метрику',
  analytics_policy_prefix: 'Продолжая, вы соглашаетесь с',
  analytics_continue_label: 'Продолжить',
  analytics_decline_label: 'Я передумал',
}
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    for (const [name, value] of Object.entries(fields)) await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN "${prefix}waitlist_${name}" varchar DEFAULT '${value}'`))
  }
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    for (const name of Object.keys(fields)) await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN "${prefix}waitlist_${name}"`))
  }
}

import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, prefix, condition] of [['homepage', '', ''], ['_homepage_v', 'version_', ' WHERE "latest" = true']] as const) {
    await db.execute(sql.raw(`UPDATE "${table}" SET
      "${prefix}hero_buttons_and_elements_desktop_slot3_title" = 'Планируемая дата',
      "${prefix}hero_buttons_and_elements_desktop_slot3_caption" = 'открытия 8.11',
      "${prefix}hero_buttons_and_elements_mobile_slot2_title" = 'Планируемая дата',
      "${prefix}hero_buttons_and_elements_mobile_slot2_caption" = 'открытия 8.11',
      "${prefix}hero_opening_notice_title" = 'Планируемая дата',
      "${prefix}hero_opening_notice_caption" = 'открытия 8.11'${condition}`))
  }
}
export async function down(_: MigrateDownArgs): Promise<void> {
  // Editorial owner decision stays in place on code rollback.
}

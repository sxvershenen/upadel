import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const bookingURL = 'https://supadb.vivacrm.ru/storage/v1/object/public/widgets/3ffc4681-890e-4d27-9676-1a5a7c246b17.js'
const accountURL = 'https://supadb.vivacrm.ru/storage/v1/object/public/widgets/8e5e55da-bb08-4d93-9572-047f3d99b3b8.js'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Activate the owner-provided widget; retain existing URL/adapter fields for later CMS mode changes.
  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    await db.execute(sql.raw(`UPDATE "${table}" SET "${prefix}booking_mode" = 'vivacrm-widget', "${prefix}booking_widget_u_r_l" = '${bookingURL}'
      WHERE "${prefix}booking_widget_u_r_l" IS NULL;
      UPDATE "${table}" SET "${prefix}account_mode" = 'vivacrm-widget', "${prefix}account_widget_u_r_l" = '${accountURL}'
      WHERE "${prefix}account_mode" = 'disabled' AND "${prefix}account_widget_u_r_l" IS NULL AND "${prefix}account_external_u_r_l" IS NULL;`))
  }
  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    await db.execute(sql.raw(`UPDATE "${table}" SET "${prefix}hero_secondary_action_mode" = 'account', "${prefix}hero_secondary_action_label" = 'Личный кабинет'
      WHERE "${prefix}hero_secondary_action_mode" = 'trial-booking' AND "${prefix}hero_secondary_action_label" IN ('Пробное занятие', 'Попробовать');`))
  }
  for (const table of ['site_settings_mobile_navigation', '_site_settings_v_version_mobile_navigation']) {
    // Change only the previous standard three-item navigation; preserve custom rows.
    await db.execute(sql.raw(`DELETE FROM "${table}" WHERE "href" = '/training' AND "_parent_id" IN
      (SELECT "_parent_id" FROM "${table}" GROUP BY "_parent_id" HAVING count(*) = 3 AND count(*) FILTER (WHERE "href" IN ('/', '/training', '/prices')) = 3);
      UPDATE "${table}" SET "_order" = 2 WHERE "href" = '/prices' AND "_order" = 3 AND NOT EXISTS
      (SELECT 1 FROM "${table}" AS training WHERE training."_parent_id" = "${table}"."_parent_id" AND training."href" = '/training');`))
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  throw new Error('Booking content migration is forward-only; restore a backup to roll back.')
}

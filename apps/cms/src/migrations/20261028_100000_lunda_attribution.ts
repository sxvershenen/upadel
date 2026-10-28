import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "leads" ADD COLUMN "yandex_client_i_d" varchar;
    CREATE INDEX "leads_yandex_client_i_d_idx" ON "leads" ("yandex_client_i_d");
    ALTER TABLE "site_settings" ADD COLUMN "booking_lunda_club_i_d" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_booking_lunda_club_i_d" varchar;`)
  // Owner-requested one-time content change. Historical versions remain untouched.
  for (const [table, prefix, condition] of [['site_settings', '', ''], ['_site_settings_v', 'version_', ' WHERE "latest" = true']] as const) {
    await db.execute(sql.raw(`UPDATE "${table}" SET
      "${prefix}header_subtitle" = 'Новорижское шоссе 32км 3с2',
      "${prefix}address" = 'Новорижское шоссе 32км 3с2',
      "${prefix}booking_mode" = 'provider-adapter',
      "${prefix}booking_provider_adapter" = 'lunda',
      "${prefix}booking_lunda_club_i_d" = '25591c97-c7c7-48ef-9244-20d82dcca967',
      "${prefix}account_mode" = 'disabled'${condition}`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Keep the owner's address/account choice; restore the previous configured booking script.
  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    await db.execute(sql.raw(`UPDATE "${table}" SET "${prefix}booking_mode" = 'vivacrm-widget'
      WHERE "${prefix}booking_provider_adapter" = 'lunda' AND "${prefix}booking_widget_u_r_l" IS NOT NULL`))
  }
  await db.execute(sql`DROP INDEX "leads_yandex_client_i_d_idx";
    ALTER TABLE "leads" DROP COLUMN "yandex_client_i_d";
    ALTER TABLE "site_settings" DROP COLUMN "booking_lunda_club_i_d";
    ALTER TABLE "_site_settings_v" DROP COLUMN "version_booking_lunda_club_i_d";`)
}

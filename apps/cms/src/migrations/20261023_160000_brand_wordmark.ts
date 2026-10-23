import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN "brand_wordmark_id" integer REFERENCES "media"("id") ON DELETE SET NULL;
    ALTER TABLE "site_settings" ADD COLUMN "club_update_version" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_brand_wordmark_id" integer REFERENCES "media"("id") ON DELETE SET NULL;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_club_update_version" varchar;
    CREATE INDEX "site_settings_brand_wordmark_idx" ON "site_settings" ("brand_wordmark_id");
    CREATE INDEX "_site_settings_v_version_brand_wordmark_idx" ON "_site_settings_v" ("version_brand_wordmark_id");
  `)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN "brand_wordmark_id", DROP COLUMN "club_update_version";
    ALTER TABLE "_site_settings_v" DROP COLUMN "version_brand_wordmark_id", DROP COLUMN "version_club_update_version";
  `)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings_desktop_navigation" ADD COLUMN "icon_id" integer;
  ALTER TABLE "_site_settings_v_version_desktop_navigation" ADD COLUMN "icon_id" integer;
  ALTER TABLE "site_settings_desktop_navigation" ADD CONSTRAINT "site_settings_desktop_navigation_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_desktop_navigation" ADD CONSTRAINT "_site_settings_v_version_desktop_navigation_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_desktop_navigation_icon_idx" ON "site_settings_desktop_navigation" USING btree ("icon_id");
  CREATE INDEX "_site_settings_v_version_desktop_navigation_icon_idx" ON "_site_settings_v_version_desktop_navigation" USING btree ("icon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_desktop_navigation" DROP CONSTRAINT "site_settings_desktop_navigation_icon_id_media_id_fk";

  ALTER TABLE "_site_settings_v_version_desktop_navigation" DROP CONSTRAINT "_site_settings_v_version_desktop_navigation_icon_id_media_id_fk";

  DROP INDEX "site_settings_desktop_navigation_icon_idx";
  DROP INDEX "_site_settings_v_version_desktop_navigation_icon_idx";
  ALTER TABLE "site_settings_desktop_navigation" DROP COLUMN "icon_id";
  ALTER TABLE "_site_settings_v_version_desktop_navigation" DROP COLUMN "icon_id";`)
}

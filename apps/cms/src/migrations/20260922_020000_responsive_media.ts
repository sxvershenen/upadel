import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_small_url" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_small_width" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_small_height" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_small_mime_type" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_small_filesize" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_small_filename" varchar;
    CREATE INDEX IF NOT EXISTS "media_sizes_small_sizes_small_filename_idx" ON "media" ("sizes_small_filename");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_sizes_small_sizes_small_filename_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_small_url", DROP COLUMN IF EXISTS "sizes_small_width", DROP COLUMN IF EXISTS "sizes_small_height", DROP COLUMN IF EXISTS "sizes_small_mime_type", DROP COLUMN IF EXISTS "sizes_small_filesize", DROP COLUMN IF EXISTS "sizes_small_filename";
  `)
}

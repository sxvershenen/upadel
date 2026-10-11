import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_dense_url" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_dense_width" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_dense_height" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_dense_mime_type" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_dense_filesize" numeric;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_dense_filename" varchar;
    CREATE INDEX IF NOT EXISTS "media_sizes_dense_sizes_dense_filename_idx" ON "media" ("sizes_dense_filename");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_sizes_dense_sizes_dense_filename_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_dense_url", DROP COLUMN IF EXISTS "sizes_dense_width", DROP COLUMN IF EXISTS "sizes_dense_height", DROP COLUMN IF EXISTS "sizes_dense_mime_type", DROP COLUMN IF EXISTS "sizes_dense_filesize", DROP COLUMN IF EXISTS "sizes_dense_filename";
  `)
}

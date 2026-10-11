import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const sizes = ['compact', 'mobile', 'medium'] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const size of sizes) {
    await db.execute(sql.raw(`
      ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_${size}_url" varchar;
      ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_${size}_width" numeric;
      ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_${size}_height" numeric;
      ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_${size}_mime_type" varchar;
      ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_${size}_filesize" numeric;
      ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_${size}_filename" varchar;
      CREATE INDEX IF NOT EXISTS "media_sizes_${size}_sizes_${size}_filename_idx" ON "media" ("sizes_${size}_filename");
    `))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const size of sizes) {
    await db.execute(sql.raw(`
      DROP INDEX IF EXISTS "media_sizes_${size}_sizes_${size}_filename_idx";
      ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_${size}_url", DROP COLUMN IF EXISTS "sizes_${size}_width", DROP COLUMN IF EXISTS "sizes_${size}_height", DROP COLUMN IF EXISTS "sizes_${size}_mime_type", DROP COLUMN IF EXISTS "sizes_${size}_filesize", DROP COLUMN IF EXISTS "sizes_${size}_filename";
    `))
  }
}

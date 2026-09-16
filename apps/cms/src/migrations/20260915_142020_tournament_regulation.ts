import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tournaments" ADD COLUMN "regulation" jsonb;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_regulation" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tournaments" DROP COLUMN "regulation";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_regulation";`)
}

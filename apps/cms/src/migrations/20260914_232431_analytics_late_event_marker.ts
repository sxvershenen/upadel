import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "analytics_events" ADD COLUMN "aggregated_at" timestamp(3) with time zone;
  CREATE INDEX "analytics_events_aggregated_at_idx" ON "analytics_events" USING btree ("aggregated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "analytics_events_aggregated_at_idx";
  ALTER TABLE "analytics_events" DROP COLUMN "aggregated_at";`)
}

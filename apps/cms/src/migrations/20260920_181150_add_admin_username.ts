import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "username" varchar;
    UPDATE "users" SET "username" = 'user-' || "id"::text WHERE "username" IS NULL;
    ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
    CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "users_username_idx";
    ALTER TABLE "users" DROP COLUMN "username";
  `)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "training_page" ADD COLUMN "infographic_eyebrow" varchar;
  ALTER TABLE "training_page" ADD COLUMN "programs_title" varchar;
  ALTER TABLE "_training_page_v" ADD COLUMN "version_infographic_eyebrow" varchar;
  ALTER TABLE "_training_page_v" ADD COLUMN "version_programs_title" varchar;
  ALTER TABLE "gift_page" ADD COLUMN "offer_eyebrow" varchar;
  ALTER TABLE "gift_page" ADD COLUMN "offer_title" varchar;
  ALTER TABLE "gift_page" ADD COLUMN "offer_copy" varchar;
  ALTER TABLE "gift_page" ADD COLUMN "steps_eyebrow" varchar;
  ALTER TABLE "gift_page" ADD COLUMN "steps_title" varchar;
  ALTER TABLE "gift_page" ADD COLUMN "faq_title" varchar;
  ALTER TABLE "_gift_page_v" ADD COLUMN "version_offer_eyebrow" varchar;
  ALTER TABLE "_gift_page_v" ADD COLUMN "version_offer_title" varchar;
  ALTER TABLE "_gift_page_v" ADD COLUMN "version_offer_copy" varchar;
  ALTER TABLE "_gift_page_v" ADD COLUMN "version_steps_eyebrow" varchar;
  ALTER TABLE "_gift_page_v" ADD COLUMN "version_steps_title" varchar;
  ALTER TABLE "_gift_page_v" ADD COLUMN "version_faq_title" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "training_page" DROP COLUMN "infographic_eyebrow";
  ALTER TABLE "training_page" DROP COLUMN "programs_title";
  ALTER TABLE "_training_page_v" DROP COLUMN "version_infographic_eyebrow";
  ALTER TABLE "_training_page_v" DROP COLUMN "version_programs_title";
  ALTER TABLE "gift_page" DROP COLUMN "offer_eyebrow";
  ALTER TABLE "gift_page" DROP COLUMN "offer_title";
  ALTER TABLE "gift_page" DROP COLUMN "offer_copy";
  ALTER TABLE "gift_page" DROP COLUMN "steps_eyebrow";
  ALTER TABLE "gift_page" DROP COLUMN "steps_title";
  ALTER TABLE "gift_page" DROP COLUMN "faq_title";
  ALTER TABLE "_gift_page_v" DROP COLUMN "version_offer_eyebrow";
  ALTER TABLE "_gift_page_v" DROP COLUMN "version_offer_title";
  ALTER TABLE "_gift_page_v" DROP COLUMN "version_offer_copy";
  ALTER TABLE "_gift_page_v" DROP COLUMN "version_steps_eyebrow";
  ALTER TABLE "_gift_page_v" DROP COLUMN "version_steps_title";
  ALTER TABLE "_gift_page_v" DROP COLUMN "version_faq_title";`)
}

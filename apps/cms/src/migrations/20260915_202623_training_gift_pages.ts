import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_gift_page_benefits_icon" AS ENUM('Gift', 'BadgeCheck', 'CalendarCheck', 'Sparkles');
  CREATE TYPE "public"."enum_gift_page_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_gift_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_gift_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__gift_page_v_version_benefits_icon" AS ENUM('Gift', 'BadgeCheck', 'CalendarCheck', 'Sparkles');
  CREATE TYPE "public"."enum__gift_page_v_version_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__gift_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__gift_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "gift_page_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_gift_page_benefits_icon"
  );
  
  CREATE TABLE "gift_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "gift_page_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "gift_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"article" jsonb,
  	"action_label" varchar,
  	"action_mode" "enum_gift_page_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"hero_image_id" integer,
  	"hero_grayscale" boolean DEFAULT true,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_gift_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_gift_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_gift_page_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__gift_page_v_version_benefits_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gift_page_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gift_page_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gift_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_article" jsonb,
  	"version_action_label" varchar,
  	"version_action_mode" "enum__gift_page_v_version_action_mode" DEFAULT 'none',
  	"version_action_href" varchar,
  	"version_action_lead_type" "lead_type",
  	"version_hero_image_id" integer,
  	"version_hero_grayscale" boolean DEFAULT true,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__gift_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__gift_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "training_page" ADD COLUMN "infographic_title" varchar;
  ALTER TABLE "training_page" ADD COLUMN "infographic_copy" varchar;
  ALTER TABLE "training_page" ADD COLUMN "article" jsonb;
  ALTER TABLE "_training_page_v" ADD COLUMN "version_infographic_title" varchar;
  ALTER TABLE "_training_page_v" ADD COLUMN "version_infographic_copy" varchar;
  ALTER TABLE "_training_page_v" ADD COLUMN "version_article" jsonb;
  ALTER TABLE "gift_page_benefits" ADD CONSTRAINT "gift_page_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gift_page_steps" ADD CONSTRAINT "gift_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gift_page_faq" ADD CONSTRAINT "gift_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gift_page" ADD CONSTRAINT "gift_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gift_page" ADD CONSTRAINT "gift_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gift_page_v_version_benefits" ADD CONSTRAINT "_gift_page_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gift_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gift_page_v_version_steps" ADD CONSTRAINT "_gift_page_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gift_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gift_page_v_version_faq" ADD CONSTRAINT "_gift_page_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gift_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gift_page_v" ADD CONSTRAINT "_gift_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gift_page_v" ADD CONSTRAINT "_gift_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "gift_page_benefits_order_idx" ON "gift_page_benefits" USING btree ("_order");
  CREATE INDEX "gift_page_benefits_parent_id_idx" ON "gift_page_benefits" USING btree ("_parent_id");
  CREATE INDEX "gift_page_steps_order_idx" ON "gift_page_steps" USING btree ("_order");
  CREATE INDEX "gift_page_steps_parent_id_idx" ON "gift_page_steps" USING btree ("_parent_id");
  CREATE INDEX "gift_page_faq_order_idx" ON "gift_page_faq" USING btree ("_order");
  CREATE INDEX "gift_page_faq_parent_id_idx" ON "gift_page_faq" USING btree ("_parent_id");
  CREATE INDEX "gift_page_hero_image_idx" ON "gift_page" USING btree ("hero_image_id");
  CREATE INDEX "gift_page_seo_seo_social_image_idx" ON "gift_page" USING btree ("seo_social_image_id");
  CREATE INDEX "gift_page__status_idx" ON "gift_page" USING btree ("_status");
  CREATE INDEX "_gift_page_v_version_benefits_order_idx" ON "_gift_page_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_gift_page_v_version_benefits_parent_id_idx" ON "_gift_page_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_gift_page_v_version_steps_order_idx" ON "_gift_page_v_version_steps" USING btree ("_order");
  CREATE INDEX "_gift_page_v_version_steps_parent_id_idx" ON "_gift_page_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_gift_page_v_version_faq_order_idx" ON "_gift_page_v_version_faq" USING btree ("_order");
  CREATE INDEX "_gift_page_v_version_faq_parent_id_idx" ON "_gift_page_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_gift_page_v_version_version_hero_image_idx" ON "_gift_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_gift_page_v_version_seo_version_seo_social_image_idx" ON "_gift_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_gift_page_v_version_version__status_idx" ON "_gift_page_v" USING btree ("version__status");
  CREATE INDEX "_gift_page_v_created_at_idx" ON "_gift_page_v" USING btree ("created_at");
  CREATE INDEX "_gift_page_v_updated_at_idx" ON "_gift_page_v" USING btree ("updated_at");
  CREATE INDEX "_gift_page_v_latest_idx" ON "_gift_page_v" USING btree ("latest");
  CREATE INDEX "_gift_page_v_autosave_idx" ON "_gift_page_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "gift_page_benefits" CASCADE;
  DROP TABLE "gift_page_steps" CASCADE;
  DROP TABLE "gift_page_faq" CASCADE;
  DROP TABLE "gift_page" CASCADE;
  DROP TABLE "_gift_page_v_version_benefits" CASCADE;
  DROP TABLE "_gift_page_v_version_steps" CASCADE;
  DROP TABLE "_gift_page_v_version_faq" CASCADE;
  DROP TABLE "_gift_page_v" CASCADE;
  ALTER TABLE "training_page" DROP COLUMN "infographic_title";
  ALTER TABLE "training_page" DROP COLUMN "infographic_copy";
  ALTER TABLE "training_page" DROP COLUMN "article";
  ALTER TABLE "_training_page_v" DROP COLUMN "version_infographic_title";
  ALTER TABLE "_training_page_v" DROP COLUMN "version_infographic_copy";
  ALTER TABLE "_training_page_v" DROP COLUMN "version_article";
  DROP TYPE "public"."enum_gift_page_benefits_icon";
  DROP TYPE "public"."enum_gift_page_action_mode";
  DROP TYPE "public"."enum_gift_page_seo_robots";
  DROP TYPE "public"."enum_gift_page_status";
  DROP TYPE "public"."enum__gift_page_v_version_benefits_icon";
  DROP TYPE "public"."enum__gift_page_v_version_action_mode";
  DROP TYPE "public"."enum__gift_page_v_version_seo_robots";
  DROP TYPE "public"."enum__gift_page_v_version_status";`)
}

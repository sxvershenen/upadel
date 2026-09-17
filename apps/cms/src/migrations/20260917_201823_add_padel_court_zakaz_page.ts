import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."padel_turnkey_icon" AS ENUM('Ruler', 'Settings2', 'Truck', 'Wrench', 'ClipboardCheck', 'Layers3', 'ShieldCheck', 'Factory', 'Sparkles', 'Wind', 'CheckCircle2');
  CREATE TYPE "public"."padel_turnkey_overlay" AS ENUM('overlay-blue', 'overlay-violet', 'overlay-emerald', 'overlay-lime', 'overlay-dark');
  CREATE TYPE "public"."padel_technology_icon" AS ENUM('Ruler', 'Settings2', 'Truck', 'Wrench', 'ClipboardCheck', 'Layers3', 'ShieldCheck', 'Factory', 'Sparkles', 'Wind', 'CheckCircle2');
  CREATE TYPE "public"."enum_padel_court_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_padel_court_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__padel_court_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__padel_court_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pcz_hero_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "pcz_advantages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"index" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pcz_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"icon" "padel_turnkey_icon",
  	"overlay" "padel_turnkey_overlay"
  );
  
  CREATE TABLE "pcz_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "pcz_technology_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"tag" varchar,
  	"text" varchar,
  	"icon" "padel_technology_icon"
  );
  
  CREATE TABLE "pcz_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pcz_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "pcz_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pcz_model_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pcz_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "padel_court_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"hero_video_id" integer,
  	"hero_primary_label" varchar,
  	"hero_secondary_label" varchar,
  	"distributor_title" varchar,
  	"distributor_text" varchar,
  	"turnkey_title" varchar,
  	"turnkey_intro" varchar,
  	"price_title" varchar,
  	"price_text" varchar,
  	"price_action_label" varchar,
  	"technology_title" varchar,
  	"technology_text" varchar,
  	"technology_background_id" integer,
  	"gallery_title" varchar,
  	"gallery_text" varchar,
  	"gallery_credit_label" varchar,
  	"models_title" varchar,
  	"models_text" varchar,
  	"models_badge" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_contacts_telegram_label" varchar,
  	"cta_contacts_telegram_u_r_l" varchar,
  	"cta_contacts_vk_label" varchar,
  	"cta_contacts_vk_u_r_l" varchar,
  	"cta_contacts_phone_label" varchar,
  	"cta_form_title" varchar,
  	"cta_form_channel_label" varchar,
  	"cta_form_name_label" varchar,
  	"cta_form_name_placeholder" varchar,
  	"cta_form_phone_label" varchar,
  	"cta_form_phone_placeholder" varchar,
  	"cta_form_telegram_label" varchar,
  	"cta_form_telegram_placeholder" varchar,
  	"cta_form_vk_label" varchar,
  	"cta_form_vk_placeholder" varchar,
  	"cta_form_model_label" varchar,
  	"cta_form_model_option_prefix" varchar,
  	"cta_form_consultation_option_label" varchar,
  	"cta_form_court_count_label" varchar,
  	"cta_form_court_count_one_label" varchar,
  	"cta_form_court_count_two_three_label" varchar,
  	"cta_form_court_count_four_six_label" varchar,
  	"cta_form_court_count_seven_plus_label" varchar,
  	"cta_form_city_label" varchar,
  	"cta_form_city_placeholder" varchar,
  	"cta_form_comment_label" varchar,
  	"cta_form_comment_placeholder" varchar,
  	"cta_form_consent_label" varchar,
  	"cta_form_policy_label" varchar,
  	"cta_form_submit_label" varchar,
  	"cta_form_success_title" varchar,
  	"cta_form_success_text" varchar,
  	"cta_form_resubmit_label" varchar,
  	"cta_form_name_error" varchar,
  	"cta_form_contact_error" varchar,
  	"cta_form_consent_error" varchar,
  	"cta_form_submit_error" varchar,
  	"cta_form_connection_error" varchar,
  	"hero_image_id" integer,
  	"hero_grayscale" boolean DEFAULT true,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_padel_court_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_padel_court_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_pcz_hero_metrics_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_advantages_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"index" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_steps_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"icon" "padel_turnkey_icon",
  	"overlay" "padel_turnkey_overlay",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_factors_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_technology_items_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"tag" varchar,
  	"text" varchar,
  	"icon" "padel_technology_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_gallery_items_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_highlights_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pcz_model_items_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "_pcz_guarantees_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_padel_court_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_hero_video_id" integer,
  	"version_hero_primary_label" varchar,
  	"version_hero_secondary_label" varchar,
  	"version_distributor_title" varchar,
  	"version_distributor_text" varchar,
  	"version_turnkey_title" varchar,
  	"version_turnkey_intro" varchar,
  	"version_price_title" varchar,
  	"version_price_text" varchar,
  	"version_price_action_label" varchar,
  	"version_technology_title" varchar,
  	"version_technology_text" varchar,
  	"version_technology_background_id" integer,
  	"version_gallery_title" varchar,
  	"version_gallery_text" varchar,
  	"version_gallery_credit_label" varchar,
  	"version_models_title" varchar,
  	"version_models_text" varchar,
  	"version_models_badge" varchar,
  	"version_cta_title" varchar,
  	"version_cta_text" varchar,
  	"version_cta_contacts_telegram_label" varchar,
  	"version_cta_contacts_telegram_u_r_l" varchar,
  	"version_cta_contacts_vk_label" varchar,
  	"version_cta_contacts_vk_u_r_l" varchar,
  	"version_cta_contacts_phone_label" varchar,
  	"version_cta_form_title" varchar,
  	"version_cta_form_channel_label" varchar,
  	"version_cta_form_name_label" varchar,
  	"version_cta_form_name_placeholder" varchar,
  	"version_cta_form_phone_label" varchar,
  	"version_cta_form_phone_placeholder" varchar,
  	"version_cta_form_telegram_label" varchar,
  	"version_cta_form_telegram_placeholder" varchar,
  	"version_cta_form_vk_label" varchar,
  	"version_cta_form_vk_placeholder" varchar,
  	"version_cta_form_model_label" varchar,
  	"version_cta_form_model_option_prefix" varchar,
  	"version_cta_form_consultation_option_label" varchar,
  	"version_cta_form_court_count_label" varchar,
  	"version_cta_form_court_count_one_label" varchar,
  	"version_cta_form_court_count_two_three_label" varchar,
  	"version_cta_form_court_count_four_six_label" varchar,
  	"version_cta_form_court_count_seven_plus_label" varchar,
  	"version_cta_form_city_label" varchar,
  	"version_cta_form_city_placeholder" varchar,
  	"version_cta_form_comment_label" varchar,
  	"version_cta_form_comment_placeholder" varchar,
  	"version_cta_form_consent_label" varchar,
  	"version_cta_form_policy_label" varchar,
  	"version_cta_form_submit_label" varchar,
  	"version_cta_form_success_title" varchar,
  	"version_cta_form_success_text" varchar,
  	"version_cta_form_resubmit_label" varchar,
  	"version_cta_form_name_error" varchar,
  	"version_cta_form_contact_error" varchar,
  	"version_cta_form_consent_error" varchar,
  	"version_cta_form_submit_error" varchar,
  	"version_cta_form_connection_error" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_grayscale" boolean DEFAULT true,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__padel_court_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__padel_court_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "pcz_hero_metrics" ADD CONSTRAINT "pcz_hero_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_advantages" ADD CONSTRAINT "pcz_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_steps" ADD CONSTRAINT "pcz_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pcz_steps" ADD CONSTRAINT "pcz_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_factors" ADD CONSTRAINT "pcz_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_technology_items" ADD CONSTRAINT "pcz_technology_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_gallery_items" ADD CONSTRAINT "pcz_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pcz_gallery_items" ADD CONSTRAINT "pcz_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_specs" ADD CONSTRAINT "pcz_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pcz_model_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_highlights" ADD CONSTRAINT "pcz_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pcz_model_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_model_items" ADD CONSTRAINT "pcz_model_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pcz_model_items" ADD CONSTRAINT "pcz_model_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pcz_guarantees" ADD CONSTRAINT "pcz_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."padel_court_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "padel_court_page" ADD CONSTRAINT "padel_court_page_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "padel_court_page" ADD CONSTRAINT "padel_court_page_technology_background_id_media_id_fk" FOREIGN KEY ("technology_background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "padel_court_page" ADD CONSTRAINT "padel_court_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "padel_court_page" ADD CONSTRAINT "padel_court_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pcz_hero_metrics_v" ADD CONSTRAINT "_pcz_hero_metrics_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_advantages_v" ADD CONSTRAINT "_pcz_advantages_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_steps_v" ADD CONSTRAINT "_pcz_steps_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pcz_steps_v" ADD CONSTRAINT "_pcz_steps_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_factors_v" ADD CONSTRAINT "_pcz_factors_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_technology_items_v" ADD CONSTRAINT "_pcz_technology_items_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_gallery_items_v" ADD CONSTRAINT "_pcz_gallery_items_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pcz_gallery_items_v" ADD CONSTRAINT "_pcz_gallery_items_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_specs_v" ADD CONSTRAINT "_pcz_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pcz_model_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_highlights_v" ADD CONSTRAINT "_pcz_highlights_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pcz_model_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_model_items_v" ADD CONSTRAINT "_pcz_model_items_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pcz_model_items_v" ADD CONSTRAINT "_pcz_model_items_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pcz_guarantees_v" ADD CONSTRAINT "_pcz_guarantees_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_padel_court_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_padel_court_page_v" ADD CONSTRAINT "_padel_court_page_v_version_hero_video_id_media_id_fk" FOREIGN KEY ("version_hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_padel_court_page_v" ADD CONSTRAINT "_padel_court_page_v_version_technology_background_id_media_id_fk" FOREIGN KEY ("version_technology_background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_padel_court_page_v" ADD CONSTRAINT "_padel_court_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_padel_court_page_v" ADD CONSTRAINT "_padel_court_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pcz_hero_metrics_order_idx" ON "pcz_hero_metrics" USING btree ("_order");
  CREATE INDEX "pcz_hero_metrics_parent_id_idx" ON "pcz_hero_metrics" USING btree ("_parent_id");
  CREATE INDEX "pcz_advantages_order_idx" ON "pcz_advantages" USING btree ("_order");
  CREATE INDEX "pcz_advantages_parent_id_idx" ON "pcz_advantages" USING btree ("_parent_id");
  CREATE INDEX "pcz_steps_order_idx" ON "pcz_steps" USING btree ("_order");
  CREATE INDEX "pcz_steps_parent_id_idx" ON "pcz_steps" USING btree ("_parent_id");
  CREATE INDEX "pcz_steps_image_idx" ON "pcz_steps" USING btree ("image_id");
  CREATE INDEX "pcz_factors_order_idx" ON "pcz_factors" USING btree ("_order");
  CREATE INDEX "pcz_factors_parent_id_idx" ON "pcz_factors" USING btree ("_parent_id");
  CREATE INDEX "pcz_technology_items_order_idx" ON "pcz_technology_items" USING btree ("_order");
  CREATE INDEX "pcz_technology_items_parent_id_idx" ON "pcz_technology_items" USING btree ("_parent_id");
  CREATE INDEX "pcz_gallery_items_order_idx" ON "pcz_gallery_items" USING btree ("_order");
  CREATE INDEX "pcz_gallery_items_parent_id_idx" ON "pcz_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pcz_gallery_items_media_idx" ON "pcz_gallery_items" USING btree ("media_id");
  CREATE INDEX "pcz_specs_order_idx" ON "pcz_specs" USING btree ("_order");
  CREATE INDEX "pcz_specs_parent_id_idx" ON "pcz_specs" USING btree ("_parent_id");
  CREATE INDEX "pcz_highlights_order_idx" ON "pcz_highlights" USING btree ("_order");
  CREATE INDEX "pcz_highlights_parent_id_idx" ON "pcz_highlights" USING btree ("_parent_id");
  CREATE INDEX "pcz_model_items_order_idx" ON "pcz_model_items" USING btree ("_order");
  CREATE INDEX "pcz_model_items_parent_id_idx" ON "pcz_model_items" USING btree ("_parent_id");
  CREATE INDEX "pcz_model_items_image_idx" ON "pcz_model_items" USING btree ("image_id");
  CREATE INDEX "pcz_guarantees_order_idx" ON "pcz_guarantees" USING btree ("_order");
  CREATE INDEX "pcz_guarantees_parent_id_idx" ON "pcz_guarantees" USING btree ("_parent_id");
  CREATE INDEX "padel_court_page_hero_video_idx" ON "padel_court_page" USING btree ("hero_video_id");
  CREATE INDEX "padel_court_page_technology_technology_background_idx" ON "padel_court_page" USING btree ("technology_background_id");
  CREATE INDEX "padel_court_page_hero_image_idx" ON "padel_court_page" USING btree ("hero_image_id");
  CREATE INDEX "padel_court_page_seo_seo_social_image_idx" ON "padel_court_page" USING btree ("seo_social_image_id");
  CREATE INDEX "padel_court_page__status_idx" ON "padel_court_page" USING btree ("_status");
  CREATE INDEX "_pcz_hero_metrics_v_order_idx" ON "_pcz_hero_metrics_v" USING btree ("_order");
  CREATE INDEX "_pcz_hero_metrics_v_parent_id_idx" ON "_pcz_hero_metrics_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_advantages_v_order_idx" ON "_pcz_advantages_v" USING btree ("_order");
  CREATE INDEX "_pcz_advantages_v_parent_id_idx" ON "_pcz_advantages_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_steps_v_order_idx" ON "_pcz_steps_v" USING btree ("_order");
  CREATE INDEX "_pcz_steps_v_parent_id_idx" ON "_pcz_steps_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_steps_v_image_idx" ON "_pcz_steps_v" USING btree ("image_id");
  CREATE INDEX "_pcz_factors_v_order_idx" ON "_pcz_factors_v" USING btree ("_order");
  CREATE INDEX "_pcz_factors_v_parent_id_idx" ON "_pcz_factors_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_technology_items_v_order_idx" ON "_pcz_technology_items_v" USING btree ("_order");
  CREATE INDEX "_pcz_technology_items_v_parent_id_idx" ON "_pcz_technology_items_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_gallery_items_v_order_idx" ON "_pcz_gallery_items_v" USING btree ("_order");
  CREATE INDEX "_pcz_gallery_items_v_parent_id_idx" ON "_pcz_gallery_items_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_gallery_items_v_media_idx" ON "_pcz_gallery_items_v" USING btree ("media_id");
  CREATE INDEX "_pcz_specs_v_order_idx" ON "_pcz_specs_v" USING btree ("_order");
  CREATE INDEX "_pcz_specs_v_parent_id_idx" ON "_pcz_specs_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_highlights_v_order_idx" ON "_pcz_highlights_v" USING btree ("_order");
  CREATE INDEX "_pcz_highlights_v_parent_id_idx" ON "_pcz_highlights_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_model_items_v_order_idx" ON "_pcz_model_items_v" USING btree ("_order");
  CREATE INDEX "_pcz_model_items_v_parent_id_idx" ON "_pcz_model_items_v" USING btree ("_parent_id");
  CREATE INDEX "_pcz_model_items_v_image_idx" ON "_pcz_model_items_v" USING btree ("image_id");
  CREATE INDEX "_pcz_guarantees_v_order_idx" ON "_pcz_guarantees_v" USING btree ("_order");
  CREATE INDEX "_pcz_guarantees_v_parent_id_idx" ON "_pcz_guarantees_v" USING btree ("_parent_id");
  CREATE INDEX "_padel_court_page_v_version_version_hero_video_idx" ON "_padel_court_page_v" USING btree ("version_hero_video_id");
  CREATE INDEX "_padel_court_page_v_version_technology_version_technolog_idx" ON "_padel_court_page_v" USING btree ("version_technology_background_id");
  CREATE INDEX "_padel_court_page_v_version_version_hero_image_idx" ON "_padel_court_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_padel_court_page_v_version_seo_version_seo_social_image_idx" ON "_padel_court_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_padel_court_page_v_version_version__status_idx" ON "_padel_court_page_v" USING btree ("version__status");
  CREATE INDEX "_padel_court_page_v_created_at_idx" ON "_padel_court_page_v" USING btree ("created_at");
  CREATE INDEX "_padel_court_page_v_updated_at_idx" ON "_padel_court_page_v" USING btree ("updated_at");
  CREATE INDEX "_padel_court_page_v_latest_idx" ON "_padel_court_page_v" USING btree ("latest");
  CREATE INDEX "_padel_court_page_v_autosave_idx" ON "_padel_court_page_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pcz_hero_metrics" CASCADE;
  DROP TABLE "pcz_advantages" CASCADE;
  DROP TABLE "pcz_steps" CASCADE;
  DROP TABLE "pcz_factors" CASCADE;
  DROP TABLE "pcz_technology_items" CASCADE;
  DROP TABLE "pcz_gallery_items" CASCADE;
  DROP TABLE "pcz_specs" CASCADE;
  DROP TABLE "pcz_highlights" CASCADE;
  DROP TABLE "pcz_model_items" CASCADE;
  DROP TABLE "pcz_guarantees" CASCADE;
  DROP TABLE "padel_court_page" CASCADE;
  DROP TABLE "_pcz_hero_metrics_v" CASCADE;
  DROP TABLE "_pcz_advantages_v" CASCADE;
  DROP TABLE "_pcz_steps_v" CASCADE;
  DROP TABLE "_pcz_factors_v" CASCADE;
  DROP TABLE "_pcz_technology_items_v" CASCADE;
  DROP TABLE "_pcz_gallery_items_v" CASCADE;
  DROP TABLE "_pcz_specs_v" CASCADE;
  DROP TABLE "_pcz_highlights_v" CASCADE;
  DROP TABLE "_pcz_model_items_v" CASCADE;
  DROP TABLE "_pcz_guarantees_v" CASCADE;
  DROP TABLE "_padel_court_page_v" CASCADE;
  DROP TYPE "public"."padel_turnkey_icon";
  DROP TYPE "public"."padel_turnkey_overlay";
  DROP TYPE "public"."padel_technology_icon";
  DROP TYPE "public"."enum_padel_court_page_seo_robots";
  DROP TYPE "public"."enum_padel_court_page_status";
  DROP TYPE "public"."enum__padel_court_page_v_version_seo_robots";
  DROP TYPE "public"."enum__padel_court_page_v_version_status";`)
}

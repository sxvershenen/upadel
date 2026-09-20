import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_gift_page_formats_format_id" AS ENUM('box', 'digital');
    CREATE TYPE "public"."enum_gift_page_terms_icon" AS ENUM('CalendarCheck', 'ShieldCheck', 'Layers', 'PackageCheck', 'Users', 'ClipboardCheck');
    CREATE TYPE "public"."enum__gift_page_v_version_formats_format_id" AS ENUM('box', 'digital');
    CREATE TYPE "public"."enum__gift_page_v_version_terms_icon" AS ENUM('CalendarCheck', 'ShieldCheck', 'Layers', 'PackageCheck', 'Users', 'ClipboardCheck');

    ALTER TABLE "gift_page_benefits" ADD COLUMN "badge" varchar;
    ALTER TABLE "_gift_page_v_version_benefits" ADD COLUMN "badge" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_section_title" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_section_copy" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_channel_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_telegram_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_phone_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_vk_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_format_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_purpose_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_name_placeholder" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_contact_phone_placeholder" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_contact_telegram_placeholder" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_contact_v_k_placeholder" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_recipient_placeholder" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_comment_placeholder" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_consent_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_policy_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_submit_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_success_title" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_success_text" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "form_resubmit_label" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "formats_title" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "formats_copy" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "terms_title" varchar;
    ALTER TABLE "gift_page" ADD COLUMN "terms_copy" varchar;

    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_section_title" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_section_copy" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_channel_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_telegram_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_phone_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_vk_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_format_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_purpose_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_name_placeholder" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_contact_phone_placeholder" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_contact_telegram_placeholder" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_contact_v_k_placeholder" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_recipient_placeholder" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_comment_placeholder" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_consent_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_policy_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_submit_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_success_title" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_success_text" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_form_resubmit_label" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_formats_title" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_formats_copy" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_terms_title" varchar;
    ALTER TABLE "_gift_page_v" ADD COLUMN "version_terms_copy" varchar;

    CREATE TABLE "gift_page_formats" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "format_id" "enum_gift_page_formats_format_id",
      "badge" varchar,
      "title" varchar,
      "image_id" integer,
      "button_text" varchar,
      "button_selected_text" varchar
    );
    CREATE TABLE "gift_page_formats_features" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );
    CREATE TABLE "gift_page_terms" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "text" varchar,
      "icon" "enum_gift_page_terms_icon"
    );

    CREATE SEQUENCE "_gift_page_v_version_formats_id_seq";
    CREATE SEQUENCE "_gift_page_v_version_formats_features_id_seq";
    CREATE SEQUENCE "_gift_page_v_version_terms_id_seq";
    CREATE TABLE "_gift_page_v_version_formats" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" integer PRIMARY KEY NOT NULL DEFAULT nextval('"_gift_page_v_version_formats_id_seq"'::regclass),
      "_uuid" varchar,
      "badge" varchar,
      "title" varchar,
      "image_id" integer,
      "button_text" varchar,
      "button_selected_text" varchar,
      "format_id" "enum__gift_page_v_version_formats_format_id"
    );
    CREATE TABLE "_gift_page_v_version_formats_features" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" integer PRIMARY KEY NOT NULL DEFAULT nextval('"_gift_page_v_version_formats_features_id_seq"'::regclass),
      "text" varchar,
      "_uuid" varchar
    );
    CREATE TABLE "_gift_page_v_version_terms" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" integer PRIMARY KEY NOT NULL DEFAULT nextval('"_gift_page_v_version_terms_id_seq"'::regclass),
      "title" varchar,
      "text" varchar,
      "icon" "enum__gift_page_v_version_terms_icon",
      "_uuid" varchar
    );
    ALTER SEQUENCE "_gift_page_v_version_formats_id_seq" OWNED BY "_gift_page_v_version_formats"."id";
    ALTER SEQUENCE "_gift_page_v_version_formats_features_id_seq" OWNED BY "_gift_page_v_version_formats_features"."id";
    ALTER SEQUENCE "_gift_page_v_version_terms_id_seq" OWNED BY "_gift_page_v_version_terms"."id";

    ALTER TABLE "gift_page_formats" ADD CONSTRAINT "gift_page_formats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_page"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "gift_page_formats" ADD CONSTRAINT "gift_page_formats_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "gift_page_formats_features" ADD CONSTRAINT "gift_page_formats_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_page_formats"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "gift_page_terms" ADD CONSTRAINT "gift_page_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_page"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_gift_page_v_version_formats" ADD CONSTRAINT "_gift_page_v_version_formats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gift_page_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_gift_page_v_version_formats" ADD CONSTRAINT "_gift_page_v_version_formats_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_gift_page_v_version_formats_features" ADD CONSTRAINT "_gift_page_v_version_formats_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gift_page_v_version_formats"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_gift_page_v_version_terms" ADD CONSTRAINT "_gift_page_v_version_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gift_page_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "gift_page_formats_order_idx" ON "gift_page_formats" USING btree ("_order");
    CREATE INDEX "gift_page_formats_parent_id_idx" ON "gift_page_formats" USING btree ("_parent_id");
    CREATE INDEX "gift_page_formats_image_idx" ON "gift_page_formats" USING btree ("image_id");
    CREATE INDEX "gift_page_formats_features_order_idx" ON "gift_page_formats_features" USING btree ("_order");
    CREATE INDEX "gift_page_formats_features_parent_id_idx" ON "gift_page_formats_features" USING btree ("_parent_id");
    CREATE INDEX "gift_page_terms_order_idx" ON "gift_page_terms" USING btree ("_order");
    CREATE INDEX "gift_page_terms_parent_id_idx" ON "gift_page_terms" USING btree ("_parent_id");
    CREATE INDEX "_gift_page_v_version_formats_order_idx" ON "_gift_page_v_version_formats" USING btree ("_order");
    CREATE INDEX "_gift_page_v_version_formats_parent_id_idx" ON "_gift_page_v_version_formats" USING btree ("_parent_id");
    CREATE INDEX "_gift_page_v_version_formats_image_idx" ON "_gift_page_v_version_formats" USING btree ("image_id");
    CREATE INDEX "_gift_page_v_version_formats_features_order_idx" ON "_gift_page_v_version_formats_features" USING btree ("_order");
    CREATE INDEX "_gift_page_v_version_formats_features_parent_id_idx" ON "_gift_page_v_version_formats_features" USING btree ("_parent_id");
    CREATE INDEX "_gift_page_v_version_terms_order_idx" ON "_gift_page_v_version_terms" USING btree ("_order");
    CREATE INDEX "_gift_page_v_version_terms_parent_id_idx" ON "_gift_page_v_version_terms" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "_gift_page_v_version_formats_features" CASCADE;
    DROP TABLE "_gift_page_v_version_formats" CASCADE;
    DROP TABLE "_gift_page_v_version_terms" CASCADE;
    DROP TABLE "gift_page_formats_features" CASCADE;
    DROP TABLE "gift_page_formats" CASCADE;
    DROP TABLE "gift_page_terms" CASCADE;
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_section_title";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_section_copy";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_channel_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_telegram_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_phone_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_vk_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_format_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_purpose_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_name_placeholder";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_contact_phone_placeholder";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_contact_telegram_placeholder";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_contact_v_k_placeholder";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_recipient_placeholder";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_comment_placeholder";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_consent_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_policy_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_submit_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_success_title";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_success_text";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_form_resubmit_label";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_formats_title";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_formats_copy";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_terms_title";
    ALTER TABLE "_gift_page_v" DROP COLUMN "version_terms_copy";
    ALTER TABLE "gift_page" DROP COLUMN "form_section_title";
    ALTER TABLE "gift_page" DROP COLUMN "form_section_copy";
    ALTER TABLE "gift_page" DROP COLUMN "form_channel_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_telegram_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_phone_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_vk_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_format_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_purpose_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_name_placeholder";
    ALTER TABLE "gift_page" DROP COLUMN "form_contact_phone_placeholder";
    ALTER TABLE "gift_page" DROP COLUMN "form_contact_telegram_placeholder";
    ALTER TABLE "gift_page" DROP COLUMN "form_contact_v_k_placeholder";
    ALTER TABLE "gift_page" DROP COLUMN "form_recipient_placeholder";
    ALTER TABLE "gift_page" DROP COLUMN "form_comment_placeholder";
    ALTER TABLE "gift_page" DROP COLUMN "form_consent_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_policy_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_submit_label";
    ALTER TABLE "gift_page" DROP COLUMN "form_success_title";
    ALTER TABLE "gift_page" DROP COLUMN "form_success_text";
    ALTER TABLE "gift_page" DROP COLUMN "form_resubmit_label";
    ALTER TABLE "gift_page" DROP COLUMN "formats_title";
    ALTER TABLE "gift_page" DROP COLUMN "formats_copy";
    ALTER TABLE "gift_page" DROP COLUMN "terms_title";
    ALTER TABLE "gift_page" DROP COLUMN "terms_copy";
    ALTER TABLE "_gift_page_v_version_benefits" DROP COLUMN "badge";
    ALTER TABLE "gift_page_benefits" DROP COLUMN "badge";
    DROP TYPE "public"."enum__gift_page_v_version_formats_format_id";
    DROP TYPE "public"."enum__gift_page_v_version_terms_icon";
    DROP TYPE "public"."enum_gift_page_formats_format_id";
    DROP TYPE "public"."enum_gift_page_terms_icon";
  `)
}

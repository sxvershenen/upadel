import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_brand_logo_mode" AS ENUM('text', 'prefix', 'replace');
  CREATE TYPE "public"."enum__site_settings_v_version_brand_logo_mode" AS ENUM('text', 'prefix', 'replace');
  ALTER TABLE "blog_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "blog_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_blog_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_blog_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "coaches_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "coaches_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_coaches_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_coaches_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "tournaments_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "tournaments_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_tournaments_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_tournaments_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "prices_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "prices_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_prices_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_prices_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "training_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "training_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_training_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_training_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "courts_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "courts_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_courts_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_courts_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "gallery_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "gallery_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_gallery_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_gallery_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "about_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "about_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_about_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_about_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "contacts_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "contacts_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_contacts_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_contacts_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "policy_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "policy_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_policy_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_policy_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "oferta_page" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "oferta_page" ADD COLUMN "hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "_oferta_page_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_oferta_page_v" ADD COLUMN "version_hero_grayscale" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "brand_logo_mode" "enum_site_settings_brand_logo_mode" DEFAULT 'prefix';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_brand_logo_mode" "enum__site_settings_v_version_brand_logo_mode" DEFAULT 'prefix';
  ALTER TABLE "blog_page" ADD CONSTRAINT "blog_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_page_v" ADD CONSTRAINT "_blog_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaches_page" ADD CONSTRAINT "coaches_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_coaches_page_v" ADD CONSTRAINT "_coaches_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tournaments_page" ADD CONSTRAINT "tournaments_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tournaments_page_v" ADD CONSTRAINT "_tournaments_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prices_page" ADD CONSTRAINT "prices_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prices_page_v" ADD CONSTRAINT "_prices_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_page" ADD CONSTRAINT "training_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_training_page_v" ADD CONSTRAINT "_training_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courts_page" ADD CONSTRAINT "courts_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courts_page_v" ADD CONSTRAINT "_courts_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_page" ADD CONSTRAINT "gallery_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gallery_page_v" ADD CONSTRAINT "_gallery_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_page_v" ADD CONSTRAINT "_about_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts_page" ADD CONSTRAINT "contacts_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contacts_page_v" ADD CONSTRAINT "_contacts_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "policy_page" ADD CONSTRAINT "policy_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_policy_page_v" ADD CONSTRAINT "_policy_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "oferta_page" ADD CONSTRAINT "oferta_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_oferta_page_v" ADD CONSTRAINT "_oferta_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "blog_page_hero_image_idx" ON "blog_page" USING btree ("hero_image_id");
  CREATE INDEX "_blog_page_v_version_version_hero_image_idx" ON "_blog_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "coaches_page_hero_image_idx" ON "coaches_page" USING btree ("hero_image_id");
  CREATE INDEX "_coaches_page_v_version_version_hero_image_idx" ON "_coaches_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "tournaments_page_hero_image_idx" ON "tournaments_page" USING btree ("hero_image_id");
  CREATE INDEX "_tournaments_page_v_version_version_hero_image_idx" ON "_tournaments_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "prices_page_hero_image_idx" ON "prices_page" USING btree ("hero_image_id");
  CREATE INDEX "_prices_page_v_version_version_hero_image_idx" ON "_prices_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "training_page_hero_image_idx" ON "training_page" USING btree ("hero_image_id");
  CREATE INDEX "_training_page_v_version_version_hero_image_idx" ON "_training_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "courts_page_hero_image_idx" ON "courts_page" USING btree ("hero_image_id");
  CREATE INDEX "_courts_page_v_version_version_hero_image_idx" ON "_courts_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "gallery_page_hero_image_idx" ON "gallery_page" USING btree ("hero_image_id");
  CREATE INDEX "_gallery_page_v_version_version_hero_image_idx" ON "_gallery_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "about_page_hero_image_idx" ON "about_page" USING btree ("hero_image_id");
  CREATE INDEX "_about_page_v_version_version_hero_image_idx" ON "_about_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "contacts_page_hero_image_idx" ON "contacts_page" USING btree ("hero_image_id");
  CREATE INDEX "_contacts_page_v_version_version_hero_image_idx" ON "_contacts_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "policy_page_hero_image_idx" ON "policy_page" USING btree ("hero_image_id");
  CREATE INDEX "_policy_page_v_version_version_hero_image_idx" ON "_policy_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "oferta_page_hero_image_idx" ON "oferta_page" USING btree ("hero_image_id");
  CREATE INDEX "_oferta_page_v_version_version_hero_image_idx" ON "_oferta_page_v" USING btree ("version_hero_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_page" DROP CONSTRAINT "blog_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_blog_page_v" DROP CONSTRAINT "_blog_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "coaches_page" DROP CONSTRAINT "coaches_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_coaches_page_v" DROP CONSTRAINT "_coaches_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "tournaments_page" DROP CONSTRAINT "tournaments_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_tournaments_page_v" DROP CONSTRAINT "_tournaments_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "prices_page" DROP CONSTRAINT "prices_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_prices_page_v" DROP CONSTRAINT "_prices_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "training_page" DROP CONSTRAINT "training_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_training_page_v" DROP CONSTRAINT "_training_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "courts_page" DROP CONSTRAINT "courts_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_courts_page_v" DROP CONSTRAINT "_courts_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "gallery_page" DROP CONSTRAINT "gallery_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_gallery_page_v" DROP CONSTRAINT "_gallery_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "about_page" DROP CONSTRAINT "about_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_about_page_v" DROP CONSTRAINT "_about_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "contacts_page" DROP CONSTRAINT "contacts_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_contacts_page_v" DROP CONSTRAINT "_contacts_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "policy_page" DROP CONSTRAINT "policy_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_policy_page_v" DROP CONSTRAINT "_policy_page_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "oferta_page" DROP CONSTRAINT "oferta_page_hero_image_id_media_id_fk";
  
  ALTER TABLE "_oferta_page_v" DROP CONSTRAINT "_oferta_page_v_version_hero_image_id_media_id_fk";
  
  DROP INDEX "blog_page_hero_image_idx";
  DROP INDEX "_blog_page_v_version_version_hero_image_idx";
  DROP INDEX "coaches_page_hero_image_idx";
  DROP INDEX "_coaches_page_v_version_version_hero_image_idx";
  DROP INDEX "tournaments_page_hero_image_idx";
  DROP INDEX "_tournaments_page_v_version_version_hero_image_idx";
  DROP INDEX "prices_page_hero_image_idx";
  DROP INDEX "_prices_page_v_version_version_hero_image_idx";
  DROP INDEX "training_page_hero_image_idx";
  DROP INDEX "_training_page_v_version_version_hero_image_idx";
  DROP INDEX "courts_page_hero_image_idx";
  DROP INDEX "_courts_page_v_version_version_hero_image_idx";
  DROP INDEX "gallery_page_hero_image_idx";
  DROP INDEX "_gallery_page_v_version_version_hero_image_idx";
  DROP INDEX "about_page_hero_image_idx";
  DROP INDEX "_about_page_v_version_version_hero_image_idx";
  DROP INDEX "contacts_page_hero_image_idx";
  DROP INDEX "_contacts_page_v_version_version_hero_image_idx";
  DROP INDEX "policy_page_hero_image_idx";
  DROP INDEX "_policy_page_v_version_version_hero_image_idx";
  DROP INDEX "oferta_page_hero_image_idx";
  DROP INDEX "_oferta_page_v_version_version_hero_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "brand_logo_mode";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_brand_logo_mode";
  ALTER TABLE "blog_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "blog_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_blog_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_blog_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "coaches_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "coaches_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_coaches_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_coaches_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "tournaments_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "tournaments_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_tournaments_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_tournaments_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "prices_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "prices_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_prices_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_prices_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "training_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "training_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_training_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_training_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "courts_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "courts_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_courts_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_courts_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "gallery_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "gallery_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_gallery_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_gallery_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "about_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "about_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_about_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_about_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "contacts_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "contacts_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_contacts_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_contacts_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "policy_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "policy_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_policy_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_policy_page_v" DROP COLUMN "version_hero_grayscale";
  ALTER TABLE "oferta_page" DROP COLUMN "hero_image_id";
  ALTER TABLE "oferta_page" DROP COLUMN "hero_grayscale";
  ALTER TABLE "_oferta_page_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_oferta_page_v" DROP COLUMN "version_hero_grayscale";
  DROP TYPE "public"."enum_site_settings_brand_logo_mode";
  DROP TYPE "public"."enum__site_settings_v_version_brand_logo_mode";`)
}

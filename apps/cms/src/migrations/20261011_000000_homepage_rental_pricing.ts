import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(`
    CREATE TYPE "hm_mem_mesh_tone" AS ENUM ('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
    CREATE TYPE "hm_std_mesh_tone" AS ENUM ('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
    CREATE TYPE "hm_mem_act_mode" AS ENUM ('account', 'embed-widget', 'none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
    CREATE TYPE "hm_mem_lead_type" AS ENUM ('membership', 'gift', 'trial', 'consultation', 'other');
  `))

  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    await db.execute(sql.raw(`ALTER TABLE "${table}"
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_show_on_homepage" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_title" varchar DEFAULT 'Абонементы',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_eyebrow" varchar DEFAULT 'Для постоянных игроков',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_description" varchar DEFAULT 'Скидки для постоянных игроков.',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_price_label" varchar DEFAULT 'Условия уточняйте у администратора',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_mesh_tone" "hm_mem_mesh_tone" DEFAULT 'dark',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_action_label" varchar,
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_action_mode" "hm_mem_act_mode" DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_action_href" varchar,
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_membership_offer_action_lead_type" "hm_mem_lead_type",
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_rental_standards_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_rental_standards_show_on_homepage" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_rental_standards_title" varchar DEFAULT 'Стандарты Unlim Riga',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_rental_standards_eyebrow" varchar DEFAULT 'Премиальный сервис',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_rental_standards_time_label" varchar DEFAULT 'Включено в стоимость аренды',
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_rental_standards_description" varchar,
      ADD COLUMN IF NOT EXISTS "${prefix}pricing_section_rental_standards_mesh_tone" "hm_std_mesh_tone" DEFAULT 'dark';`))
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "hp_rental_standards_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "homepage"("id") ON DELETE cascade,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "hp_rental_standards_items_order_idx" ON "hp_rental_standards_items" ("_order");
    CREATE INDEX IF NOT EXISTS "hp_rental_standards_items_parent_idx" ON "hp_rental_standards_items" ("_parent_id");
    CREATE TABLE IF NOT EXISTS "_hp_rental_standards_items_v" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "_homepage_v"("id") ON DELETE cascade,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_hp_rental_standards_items_v_order_idx" ON "_hp_rental_standards_items_v" ("_order");
    CREATE INDEX IF NOT EXISTS "_hp_rental_standards_items_v_parent_idx" ON "_hp_rental_standards_items_v" ("_parent_id");
  `)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  throw new Error('Homepage pricing migration is forward-only to preserve editor versions.')
}

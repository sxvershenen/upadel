import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'
const textFields = ['title', 'description', 'submit_label', 'success_title', 'success_text', 'telegram_title', 'telegram_copy', 'telegram_u_r_l']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN "${prefix}waitlist_enabled" boolean DEFAULT false`))
    for (const field of textFields) await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN "${prefix}waitlist_${field}" varchar`))
  }
  for (const [table, prefix] of [['rules_page', ''], ['_rules_page_v', 'version_']] as const) {
    const statusType = prefix ? 'enum__rules_page_v_version_status' : 'enum_rules_page_status'
    const seoType = prefix ? 'enum__rules_page_v_version_seo_robots' : 'enum_rules_page_seo_robots'
    await db.execute(sql.raw(`CREATE TYPE "${statusType}" AS ENUM ('draft', 'published')`))
    await db.execute(sql.raw(`CREATE TYPE "${seoType}" AS ENUM ('index-follow', 'noindex-follow', 'noindex-nofollow')`))
    await db.execute(sql.raw(`CREATE TABLE "${table}" (
      "id" serial PRIMARY KEY,
      "${prefix}seed_version" varchar,
      "${prefix}eyebrow" varchar, "${prefix}title" varchar, "${prefix}intro" varchar,
      "${prefix}closing_text" varchar,
      "${prefix}hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "${prefix}hero_grayscale" boolean DEFAULT true,
      "${prefix}seo_title" varchar, "${prefix}seo_description" varchar, "${prefix}seo_canonical" varchar,
      "${prefix}seo_robots" "${seoType}" DEFAULT 'index-follow',
      "${prefix}seo_social_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "${prefix}_status" "${statusType}" DEFAULT 'draft',
      "${prefix}updated_at" timestamp(3) with time zone, "${prefix}created_at" timestamp(3) with time zone
      ${prefix ? ', "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "latest" boolean, "autosave" boolean' : ''}
    )`))
    for (const field of ['hero_image_id', 'seo_social_image_id']) await db.execute(sql.raw(`CREATE INDEX "${table}_${prefix}${field}_idx" ON "${table}" ("${prefix}${field}")`))
    const sections = prefix ? '_rules_page_v_version_sections' : 'rules_page_sections'
    await db.execute(sql.raw(`CREATE TABLE "${sections}" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL REFERENCES "${table}"("id") ON DELETE CASCADE,
      "id" ${prefix ? 'serial' : 'varchar'} PRIMARY KEY,
      "title" varchar, "content" jsonb ${prefix ? ', "_uuid" varchar' : ''}
    )`))
    for (const field of ['_order', '_parent_id']) await db.execute(sql.raw(`CREATE INDEX "${sections}${field}_idx" ON "${sections}" ("${field}")`))
  }
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "_rules_page_v_version_sections", "rules_page_sections", "_rules_page_v", "rules_page"`)
  await db.execute(sql`DROP TYPE "enum__rules_page_v_version_status", "enum_rules_page_status", "enum__rules_page_v_version_seo_robots", "enum_rules_page_seo_robots"`)
  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    for (const field of ['enabled', ...textFields]) await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN "${prefix}waitlist_${field}"`))
  }
}

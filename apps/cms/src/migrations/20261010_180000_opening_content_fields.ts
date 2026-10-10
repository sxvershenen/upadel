import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    await db.execute(sql.raw(`ALTER TABLE "${table}"
      ADD COLUMN IF NOT EXISTS "${prefix}opening_content_version" varchar,
      ADD COLUMN IF NOT EXISTS "${prefix}hero_opening_notice_title" varchar DEFAULT 'Открытие в ноябре',
      ADD COLUMN IF NOT EXISTS "${prefix}hero_opening_notice_caption" varchar DEFAULT 'Спец. оффер с 01.11 до 15.11',
      ADD COLUMN IF NOT EXISTS "${prefix}methodist_banner_price" numeric DEFAULT 3000;`))
  }
  for (const [table, prefix] of [['tournaments', ''], ['_tournaments_v', 'version_']] as const) {
    await db.execute(sql.raw(`ALTER TABLE "${table}"
      ADD COLUMN IF NOT EXISTS "${prefix}card_link_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "${prefix}card_u_r_l" varchar;`))
    for (const column of ['title', 'description', 'lifecycle', 'starts_at', 'ends_at', 'level_from', 'level_to', 'format', 'participant_mode', 'total_slots', 'visual_style', 'icon', 'entry_fee', 'prize_label', 'prize', 'slug']) {
      await db.execute(sql.raw(`ALTER TABLE "${table}" ALTER COLUMN "${prefix}${column}" DROP NOT NULL;`))
    }
  }
  for (const [table, prefix] of [['prices_page', ''], ['_prices_page_v', 'version_']] as const) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${prefix}terms_title" varchar DEFAULT 'Условия и правила', ADD COLUMN IF NOT EXISTS "${prefix}faq_title" varchar DEFAULT 'Частые вопросы';`))
  }
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "prices_page_faq" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "prices_page"("id") ON DELETE cascade,
      "id" varchar PRIMARY KEY NOT NULL,
      "question" varchar,
      "answer" varchar
    );
    CREATE INDEX IF NOT EXISTS "prices_page_faq_order_idx" ON "prices_page_faq" ("_order");
    CREATE INDEX IF NOT EXISTS "prices_page_faq_parent_id_idx" ON "prices_page_faq" ("_parent_id");
    CREATE TABLE IF NOT EXISTS "_prices_page_v_version_faq" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "_prices_page_v"("id") ON DELETE cascade,
      "id" serial PRIMARY KEY NOT NULL,
      "question" varchar,
      "answer" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_prices_page_v_version_faq_order_idx" ON "_prices_page_v_version_faq" ("_order");
    CREATE INDEX IF NOT EXISTS "_prices_page_v_version_faq_parent_id_idx" ON "_prices_page_v_version_faq" ("_parent_id");
  `)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  throw new Error('Opening content migration is forward-only; restore a backup to roll back.')
}

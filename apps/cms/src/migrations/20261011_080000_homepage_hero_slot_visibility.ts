import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const slotNames = [
  'hero_buttons_and_elements_desktop_slot1_enabled',
  'hero_buttons_and_elements_desktop_slot2_enabled',
  'hero_buttons_and_elements_desktop_slot3_enabled',
  'hero_buttons_and_elements_mobile_slot1_enabled',
  'hero_buttons_and_elements_mobile_slot2_enabled',
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    const columns = slotNames.map((name) => `ADD COLUMN IF NOT EXISTS "${prefix}${name}" boolean NOT NULL DEFAULT true`).join(', ')
    await db.execute(sql.raw(`ALTER TABLE "${table}" ${columns};`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [table, prefix] of [['_homepage_v', 'version_'], ['homepage', '']] as const) {
    const columns = slotNames.map((name) => `DROP COLUMN IF EXISTS "${prefix}${name}"`).join(', ')
    await db.execute(sql.raw(`ALTER TABLE "${table}" ${columns};`))
  }
}

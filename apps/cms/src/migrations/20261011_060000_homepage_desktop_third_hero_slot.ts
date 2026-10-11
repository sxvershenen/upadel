import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const fields = [
  ['type', `"hero_slot_element" NOT NULL DEFAULT 'info'`],
  ['icon', `"hero_slot_icon" NOT NULL DEFAULT 'CalendarDays'`],
  ['action_label', 'varchar'],
  ['action_mode', '"hero_slot_action_mode"'],
  ['action_href', 'varchar'],
  ['action_lead', '"hero_slot_lead_type"'],
  ['title', `varchar NOT NULL DEFAULT 'Открытие в ноябре'`],
  ['caption', `varchar NOT NULL DEFAULT 'Спец. оффер с 01.11 до 15.11'`],
] as const

function slot3Columns(prefix: string) {
  return fields.map(([field, type]) => `ADD COLUMN IF NOT EXISTS "${prefix}hero_buttons_and_elements_desktop_slot3_${field}" ${type}`).join(',\n')
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" ${slot3Columns(prefix)};`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [table, prefix] of [['_homepage_v', 'version_'], ['homepage', '']] as const) {
    const columns = fields.map(([field]) => `DROP COLUMN IF EXISTS "${prefix}hero_buttons_and_elements_desktop_slot3_${field}"`).join(', ')
    await db.execute(sql.raw(`ALTER TABLE "${table}" ${columns};`))
  }
}

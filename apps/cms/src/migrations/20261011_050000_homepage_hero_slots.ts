import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const slots = [
  { id: 'd1', type: 'button', icon: 'CalendarCheck', label: 'Забронировать', mode: 'booking' },
  { id: 'd2', type: 'button', icon: 'UserRound', label: 'Личный кабинет', mode: 'account' },
  { id: 'm1', type: 'button', icon: 'CalendarCheck', label: 'Забронировать', mode: 'booking' },
  { id: 'm2', type: 'info', icon: 'CalendarDays', title: 'Открытие в ноябре', caption: 'Спец. оффер с 01.11 до 15.11' },
] as const

const columns = slots.flatMap((slot) => [
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_type`, type: 'hero_slot_element', value: slot.type },
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_icon`, type: 'hero_slot_icon', value: slot.icon },
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_action_label`, type: 'varchar', value: 'label' in slot ? slot.label : null },
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_action_mode`, type: 'hero_slot_action_mode', value: 'mode' in slot ? slot.mode : null },
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_action_href`, type: 'varchar', value: null },
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_action_lead`, type: 'hero_slot_lead_type', value: null },
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_title`, type: 'varchar', value: 'title' in slot ? slot.title : null },
  { name: `hero_buttons_and_elements_${slot.id[0] === 'd' ? 'desktop' : 'mobile'}_slot${slot.id[1]}_caption`, type: 'varchar', value: 'caption' in slot ? slot.caption : null },
])

function sqlValue(value: string | null): string {
  return value === null ? 'NULL' : `'${value.replaceAll("'", "''")}'`
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(`
    DO $$ BEGIN CREATE TYPE "hero_slot_element" AS ENUM ('button', 'info'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "hero_slot_icon" AS ENUM ('CalendarCheck', 'CalendarDays', 'UserRound', 'ArrowUpRight', 'Info', 'Sparkles'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "hero_slot_action_mode" AS ENUM ('none', 'booking', 'account', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "hero_slot_lead_type" AS ENUM ('membership', 'gift', 'trial', 'consultation', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `))

  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    const additions = columns.map(({ name, type, value }) => `ADD COLUMN IF NOT EXISTS "${prefix}${name}" ${type === 'varchar' ? 'varchar' : `"${type}"`}${value !== null ? ` DEFAULT ${sqlValue(value)}` : ''}`).join(',\n')
    await db.execute(sql.raw(`ALTER TABLE "${table}" ${additions};`))
  }

  await db.execute(sql`
    UPDATE "homepage"
    SET "hero_social_proof_caption" = 'Рейтинг на Яндекс'
    WHERE replace("hero_social_proof_caption", chr(160), ' ') = 'Рейтинг клуба на Новой Риге';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [table, prefix] of [['_homepage_v', 'version_'], ['homepage', '']] as const) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" ${columns.map(({ name }) => `DROP COLUMN IF EXISTS "${prefix}${name}"`).join(', ')};`))
  }
  await db.execute(sql.raw('DROP TYPE IF EXISTS "hero_slot_lead_type"; DROP TYPE IF EXISTS "hero_slot_action_mode"; DROP TYPE IF EXISTS "hero_slot_icon"; DROP TYPE IF EXISTS "hero_slot_element";'))
}

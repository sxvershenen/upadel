import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const captionFields = [
  'hero_buttons_and_elements_desktop_slot3_caption',
  'hero_buttons_and_elements_mobile_slot2_caption',
  'hero_opening_notice_caption',
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    const assignments = captionFields.map((field) => {
      const column = `"${prefix}${field}"`
      return `${column} = replace(replace(${column}, 'Спец. оффер', 'Акция'), 'Спец. оффер', 'Акция')`
    }).join(',\n')
    const predicates = captionFields.map((field) => {
      const column = `"${prefix}${field}"`
      return `${column} LIKE 'Спец.%оффер%'`
    }).join(' OR ')
    await db.execute(sql.raw(`UPDATE "${table}" SET ${assignments} WHERE ${predicates};`))
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The copy change is editorial and intentionally stays in place on rollback.
}

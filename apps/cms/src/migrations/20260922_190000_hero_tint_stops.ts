import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const tintColumns = [
  ['hero_tint_desktop_center_x', 80], ['hero_tint_desktop_center_y', 30],
  ['hero_tint_desktop_stop1_opacity', 0], ['hero_tint_desktop_stop1_position', 30],
  ['hero_tint_desktop_stop2_opacity', 64], ['hero_tint_desktop_stop2_position', 70],
  ['hero_tint_desktop_stop3_opacity', 79], ['hero_tint_desktop_stop3_position', 154],
  ['hero_tint_mobile_center_x', 50], ['hero_tint_mobile_center_y', 35],
  ['hero_tint_mobile_stop1_opacity', 0], ['hero_tint_mobile_stop1_position', 30],
  ['hero_tint_mobile_stop2_opacity', 64], ['hero_tint_mobile_stop2_position', 70],
  ['hero_tint_mobile_stop3_opacity', 79], ['hero_tint_mobile_stop3_position', 154],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ${sql.raw(tintColumns.map(([name, value]) => `ALTER TABLE "homepage" ADD COLUMN "${name}" numeric DEFAULT ${value};`).join('\n'))}
    ${sql.raw(tintColumns.map(([name, value]) => `ALTER TABLE "_homepage_v" ADD COLUMN "version_${name}" numeric DEFAULT ${value};`).join('\n'))}
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ${sql.raw(tintColumns.map(([name]) => `ALTER TABLE "_homepage_v" DROP COLUMN "version_${name}";`).join('\n'))}
    ${sql.raw(tintColumns.map(([name]) => `ALTER TABLE "homepage" DROP COLUMN "${name}";`).join('\n'))}
  `)
}

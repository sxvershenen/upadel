import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const tintColumns = [
  ['hero_tint_desktop_point1_opacity', 98], ['hero_tint_desktop_point1_x', 0], ['hero_tint_desktop_point1_y', 100],
  ['hero_tint_desktop_point2_opacity', 72], ['hero_tint_desktop_point2_x', 100], ['hero_tint_desktop_point2_y', 100],
  ['hero_tint_desktop_point3_opacity', 34], ['hero_tint_desktop_point3_x', 50], ['hero_tint_desktop_point3_y', 0],
  ['hero_tint_mobile_point1_opacity', 98], ['hero_tint_mobile_point1_x', 50], ['hero_tint_mobile_point1_y', 100],
  ['hero_tint_mobile_point2_opacity', 56], ['hero_tint_mobile_point2_x', 0], ['hero_tint_mobile_point2_y', 0],
  ['hero_tint_mobile_point3_opacity', 56], ['hero_tint_mobile_point3_x', 100], ['hero_tint_mobile_point3_y', 0],
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

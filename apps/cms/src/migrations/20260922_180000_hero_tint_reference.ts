import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const legacyDesktop = `
  "hero_tint_desktop_point1_opacity" = 98
  AND "hero_tint_desktop_point1_x" = 0
  AND "hero_tint_desktop_point1_y" = 100
  AND "hero_tint_desktop_point2_opacity" = 72
  AND "hero_tint_desktop_point2_x" = 100
  AND "hero_tint_desktop_point2_y" = 100
  AND "hero_tint_desktop_point3_opacity" = 34
  AND "hero_tint_desktop_point3_x" = 50
  AND "hero_tint_desktop_point3_y" = 0
`

const updatedDesktop = `
  "hero_tint_desktop_point1_opacity" = 98
  AND "hero_tint_desktop_point1_x" = 0
  AND "hero_tint_desktop_point1_y" = 100
  AND "hero_tint_desktop_point2_opacity" = 72
  AND "hero_tint_desktop_point2_x" = 100
  AND "hero_tint_desktop_point2_y" = 100
  AND "hero_tint_desktop_point3_opacity" = 34
  AND "hero_tint_desktop_point3_x" = 0
  AND "hero_tint_desktop_point3_y" = 0
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "homepage"
    SET "hero_tint_desktop_point3_x" = 0
    WHERE ${sql.raw(legacyDesktop)};

    UPDATE "_homepage_v"
    SET "version_hero_tint_desktop_point3_x" = 0
    WHERE "latest" = true AND ${sql.raw(legacyDesktop.replaceAll('"hero_tint_', '"version_hero_tint_'))};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "homepage"
    SET "hero_tint_desktop_point3_x" = 50
    WHERE ${sql.raw(updatedDesktop)};

    UPDATE "_homepage_v"
    SET "version_hero_tint_desktop_point3_x" = 50
    WHERE "latest" = true AND ${sql.raw(updatedDesktop.replaceAll('"hero_tint_', '"version_hero_tint_'))};
  `)
}

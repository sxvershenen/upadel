import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const previousMobileDefaults = {
  centerY: 35,
  stop2Opacity: 64,
  stop2Position: 70,
  stop3Opacity: 79,
  stop3Position: 154,
} as const

const mobileDefaults = {
  centerY: 30,
  stop2Opacity: 39,
  stop2Position: 50,
  stop3Opacity: 84,
  stop3Position: 90,
} as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "homepage"
    SET
      "hero_tint_mobile_center_y" = ${mobileDefaults.centerY},
      "hero_tint_mobile_stop2_opacity" = ${mobileDefaults.stop2Opacity},
      "hero_tint_mobile_stop2_position" = ${mobileDefaults.stop2Position},
      "hero_tint_mobile_stop3_opacity" = ${mobileDefaults.stop3Opacity},
      "hero_tint_mobile_stop3_position" = ${mobileDefaults.stop3Position}
    WHERE
      "hero_tint_mobile_center_y" = ${previousMobileDefaults.centerY}
      AND "hero_tint_mobile_stop2_opacity" = ${previousMobileDefaults.stop2Opacity}
      AND "hero_tint_mobile_stop2_position" = ${previousMobileDefaults.stop2Position}
      AND "hero_tint_mobile_stop3_opacity" = ${previousMobileDefaults.stop3Opacity}
      AND "hero_tint_mobile_stop3_position" = ${previousMobileDefaults.stop3Position};
  `)
  await db.execute(sql`
    UPDATE "_homepage_v"
    SET
      "version_hero_tint_mobile_center_y" = ${mobileDefaults.centerY},
      "version_hero_tint_mobile_stop2_opacity" = ${mobileDefaults.stop2Opacity},
      "version_hero_tint_mobile_stop2_position" = ${mobileDefaults.stop2Position},
      "version_hero_tint_mobile_stop3_opacity" = ${mobileDefaults.stop3Opacity},
      "version_hero_tint_mobile_stop3_position" = ${mobileDefaults.stop3Position}
    WHERE
      "version_hero_tint_mobile_center_y" = ${previousMobileDefaults.centerY}
      AND "version_hero_tint_mobile_stop2_opacity" = ${previousMobileDefaults.stop2Opacity}
      AND "version_hero_tint_mobile_stop2_position" = ${previousMobileDefaults.stop2Position}
      AND "version_hero_tint_mobile_stop3_opacity" = ${previousMobileDefaults.stop3Opacity}
      AND "version_hero_tint_mobile_stop3_position" = ${previousMobileDefaults.stop3Position};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "homepage"
    SET
      "hero_tint_mobile_center_y" = ${previousMobileDefaults.centerY},
      "hero_tint_mobile_stop2_opacity" = ${previousMobileDefaults.stop2Opacity},
      "hero_tint_mobile_stop2_position" = ${previousMobileDefaults.stop2Position},
      "hero_tint_mobile_stop3_opacity" = ${previousMobileDefaults.stop3Opacity},
      "hero_tint_mobile_stop3_position" = ${previousMobileDefaults.stop3Position}
    WHERE
      "hero_tint_mobile_center_y" = ${mobileDefaults.centerY}
      AND "hero_tint_mobile_stop2_opacity" = ${mobileDefaults.stop2Opacity}
      AND "hero_tint_mobile_stop2_position" = ${mobileDefaults.stop2Position}
      AND "hero_tint_mobile_stop3_opacity" = ${mobileDefaults.stop3Opacity}
      AND "hero_tint_mobile_stop3_position" = ${mobileDefaults.stop3Position};
  `)
  await db.execute(sql`
    UPDATE "_homepage_v"
    SET
      "version_hero_tint_mobile_center_y" = ${previousMobileDefaults.centerY},
      "version_hero_tint_mobile_stop2_opacity" = ${previousMobileDefaults.stop2Opacity},
      "version_hero_tint_mobile_stop2_position" = ${previousMobileDefaults.stop2Position},
      "version_hero_tint_mobile_stop3_opacity" = ${previousMobileDefaults.stop3Opacity},
      "version_hero_tint_mobile_stop3_position" = ${previousMobileDefaults.stop3Position}
    WHERE
      "version_hero_tint_mobile_center_y" = ${mobileDefaults.centerY}
      AND "version_hero_tint_mobile_stop2_opacity" = ${mobileDefaults.stop2Opacity}
      AND "version_hero_tint_mobile_stop2_position" = ${mobileDefaults.stop2Position}
      AND "version_hero_tint_mobile_stop3_opacity" = ${mobileDefaults.stop3Opacity}
      AND "version_hero_tint_mobile_stop3_position" = ${mobileDefaults.stop3Position};
  `)
}

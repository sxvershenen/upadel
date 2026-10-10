import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of ['homepage_offers_section_cards', '_homepage_v_version_offers_section_cards']) {
    const meshType = `enum_${table}_mesh_tone`
    await db.execute(sql.raw(`CREATE TYPE "${meshType}" AS ENUM ('indigo', 'deep-blue');
      ALTER TABLE "${table}" ADD COLUMN "enabled" boolean DEFAULT true,
      ADD COLUMN "mesh_tone" "${meshType}" DEFAULT 'deep-blue';`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of ['homepage_offers_section_cards', '_homepage_v_version_offers_section_cards']) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN "enabled", DROP COLUMN "mesh_tone";
      DROP TYPE "enum_${table}_mesh_tone";`))
  }
}

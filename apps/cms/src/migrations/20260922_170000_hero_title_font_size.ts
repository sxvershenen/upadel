import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const fontSizeColumns = [
  ['hero_title_font_size_mobile', 48],
  ['hero_title_font_size_desktop', 102],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ${sql.raw(fontSizeColumns.map(([name, value]) => `ALTER TABLE "homepage" ADD COLUMN "${name}" numeric DEFAULT ${value};`).join('\n'))}
    ${sql.raw(fontSizeColumns.map(([name, value]) => `ALTER TABLE "_homepage_v" ADD COLUMN "version_${name}" numeric DEFAULT ${value};`).join('\n'))}
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ${sql.raw(fontSizeColumns.map(([name]) => `ALTER TABLE "_homepage_v" DROP COLUMN "version_${name}";`).join('\n'))}
    ${sql.raw(fontSizeColumns.map(([name]) => `ALTER TABLE "homepage" DROP COLUMN "${name}";`).join('\n'))}
  `)
}

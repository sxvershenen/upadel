import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const type of ['enum_rental_rates_card_variant', 'enum__rental_rates_v_version_card_variant']) {
    await db.execute(sql.raw(`ALTER TYPE "${type}" ADD VALUE IF NOT EXISTS 'membership-offer';`))
  }
  for (const type of ['enum_homepage_benefits_section_cards_variant', 'enum__homepage_v_version_benefits_section_cards_variant']) {
    await db.execute(sql.raw(`ALTER TYPE "${type}" ADD VALUE IF NOT EXISTS 'community';`))
  }
  for (const [table, prefix] of [['homepage', ''], ['_homepage_v', 'version_']] as const) {
    const iconType = `enum_${table}_${prefix}methodist_banner_icon`
    await db.execute(sql.raw(`CREATE TYPE "${iconType}" AS ENUM ('Target', 'Bot', 'Zap');
      ALTER TABLE "${table}" ADD COLUMN "${prefix}methodist_banner_eyebrow" varchar DEFAULT 'Самостоятельная практика',
      ADD COLUMN "${prefix}methodist_banner_icon" "${iconType}" DEFAULT 'Target';`))
  }
  for (const table of ['prices_page_rules', '_prices_page_v_version_rules']) {
    const iconType = `enum_${table}_icon`
    await db.execute(sql.raw(`CREATE TYPE "${iconType}" AS ENUM ('CreditCard', 'CalendarCheck', 'RefreshCw', 'PackageCheck', 'ShowerHead', 'ClipboardCheck');
      ALTER TABLE "${table}" ADD COLUMN "icon" "${iconType}" DEFAULT 'ClipboardCheck';`))
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  throw new Error('Opening refinements migration is forward-only; restore a backup to roll back.')
}

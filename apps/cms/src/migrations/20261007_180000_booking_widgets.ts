import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Enum additions must commit before their values are used by the data migration.
  await db.execute(sql`DO $$ DECLARE item record; BEGIN
    FOR item IN SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace AND typname LIKE 'enum%action_mode' LOOP
      EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', item.typname, 'account');
    END LOOP;
  END $$;`)
  for (const [table, prefix] of [['coaches', ''], ['_coaches_v', 'version_'], ['training_programs', ''], ['_training_programs_v', 'version_']] as const) {
    const enumName = `enum_${table}_${prefix}action_widget_kind`
    await db.execute(sql.raw(`ALTER TYPE "enum_${table}_${prefix}action_mode" ADD VALUE IF NOT EXISTS 'embed-widget';
      CREATE TYPE "${enumName}" AS ENUM ('iframe', 'vivacrm-script');
      ALTER TABLE "${table}" ADD COLUMN "${prefix}action_widget_kind" "${enumName}" DEFAULT 'iframe', ADD COLUMN "${prefix}action_widget_u_r_l" varchar;`))
  }
  for (const [table, prefix] of [['site_settings', ''], ['_site_settings_v', 'version_']] as const) {
    await db.execute(sql.raw(`ALTER TYPE "enum_${table}_${prefix}booking_mode" ADD VALUE IF NOT EXISTS 'vivacrm-widget';
      CREATE TYPE "enum_${table}_${prefix}account_mode" AS ENUM ('disabled', 'vivacrm-widget', 'external-link');
      ALTER TABLE "${table}" ADD COLUMN "${prefix}booking_widget_u_r_l" varchar,
        ADD COLUMN "${prefix}account_mode" "enum_${table}_${prefix}account_mode" DEFAULT 'disabled',
        ADD COLUMN "${prefix}account_widget_u_r_l" varchar,
        ADD COLUMN "${prefix}account_external_u_r_l" varchar,
        ADD COLUMN "${prefix}account_button_label" varchar DEFAULT 'Личный кабинет',
        ADD COLUMN "${prefix}account_mobile_label" varchar DEFAULT 'Кабинет';`))
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  throw new Error('Booking widget migrations are forward-only; restore a backup to roll back.')
}

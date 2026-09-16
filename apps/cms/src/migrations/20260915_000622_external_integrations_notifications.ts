import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_notification_status" AS ENUM('not-configured', 'sent', 'partial', 'failed');
  ALTER TABLE "leads" ADD COLUMN "notification_status" "enum_leads_notification_status" DEFAULT 'not-configured';
  ALTER TABLE "leads" ADD COLUMN "notified_at" timestamp(3) with time zone;
  ALTER TABLE "leads" ADD COLUMN "notification_result" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "analytics_yandex_metrica_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "analytics_yandex_metrica_counter_i_d" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "analytics_yandex_metrica_webvisor" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "analytics_yandex_webmaster_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "analytics_ga4_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "analytics_ga4_measurement_i_d" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "lead_notifications_telegram_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "lead_notifications_telegram_bot_token" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "lead_notifications_telegram_chat_i_d" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "lead_notifications_vk_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "lead_notifications_vk_access_token" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "lead_notifications_vk_peer_i_d" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "lead_notifications_vk_a_p_i_version" varchar DEFAULT '5.199';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_analytics_yandex_metrica_enabled" boolean DEFAULT false;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_analytics_yandex_metrica_counter_i_d" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_analytics_yandex_metrica_webvisor" boolean DEFAULT false;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_analytics_yandex_webmaster_verification" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_analytics_ga4_enabled" boolean DEFAULT false;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_analytics_ga4_measurement_i_d" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_lead_notifications_telegram_enabled" boolean DEFAULT false;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_lead_notifications_telegram_bot_token" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_lead_notifications_telegram_chat_i_d" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_lead_notifications_vk_enabled" boolean DEFAULT false;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_lead_notifications_vk_access_token" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_lead_notifications_vk_peer_i_d" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_lead_notifications_vk_a_p_i_version" varchar DEFAULT '5.199';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" DROP COLUMN "notification_status";
  ALTER TABLE "leads" DROP COLUMN "notified_at";
  ALTER TABLE "leads" DROP COLUMN "notification_result";
  ALTER TABLE "site_settings" DROP COLUMN "analytics_yandex_metrica_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "analytics_yandex_metrica_counter_i_d";
  ALTER TABLE "site_settings" DROP COLUMN "analytics_yandex_metrica_webvisor";
  ALTER TABLE "site_settings" DROP COLUMN "analytics_yandex_webmaster_verification";
  ALTER TABLE "site_settings" DROP COLUMN "analytics_ga4_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "analytics_ga4_measurement_i_d";
  ALTER TABLE "site_settings" DROP COLUMN "lead_notifications_telegram_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "lead_notifications_telegram_bot_token";
  ALTER TABLE "site_settings" DROP COLUMN "lead_notifications_telegram_chat_i_d";
  ALTER TABLE "site_settings" DROP COLUMN "lead_notifications_vk_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "lead_notifications_vk_access_token";
  ALTER TABLE "site_settings" DROP COLUMN "lead_notifications_vk_peer_i_d";
  ALTER TABLE "site_settings" DROP COLUMN "lead_notifications_vk_a_p_i_version";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_analytics_yandex_metrica_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_analytics_yandex_metrica_counter_i_d";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_analytics_yandex_metrica_webvisor";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_analytics_yandex_webmaster_verification";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_analytics_ga4_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_analytics_ga4_measurement_i_d";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_lead_notifications_telegram_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_lead_notifications_telegram_bot_token";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_lead_notifications_telegram_chat_i_d";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_lead_notifications_vk_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_lead_notifications_vk_access_token";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_lead_notifications_vk_peer_i_d";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_lead_notifications_vk_a_p_i_version";
  DROP TYPE "public"."enum_leads_notification_status";`)
}

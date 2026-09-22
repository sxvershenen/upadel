import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage" ADD COLUMN "hero_seo_heading" varchar DEFAULT 'Премиальный крытый падел-клуб';
    ALTER TABLE "_homepage_v" ADD COLUMN "version_hero_seo_heading" varchar DEFAULT 'Премиальный крытый падел-клуб';

    UPDATE "homepage"
    SET
      "hero_seo_heading" = COALESCE("hero_seo_heading", 'Премиальный крытый падел-клуб'),
      "hero_description" = 'с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием PRO TURF 240 и клубным лаунжем.'
    WHERE "hero_description" IN (
      'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.',
      'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.'
    );

    UPDATE "homepage_hero_stats"
    SET "value" = '3 корта'
    WHERE "label" = 'Jubo Super Panoramic' AND "value" IN ('2 корта', '4 корта');

    UPDATE "_homepage_v"
    SET
      "version_hero_seo_heading" = COALESCE("version_hero_seo_heading", 'Премиальный крытый падел-клуб'),
      "version_hero_description" = 'с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием PRO TURF 240 и клубным лаунжем.'
    WHERE "latest" = true AND "version_hero_description" IN (
      'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.',
      'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.'
    );

    UPDATE "_homepage_v_version_hero_stats"
    SET "value" = '3 корта'
    WHERE "_parent_id" IN (SELECT "id" FROM "_homepage_v" WHERE "latest" = true)
      AND "label" = 'Jubo Super Panoramic' AND "value" IN ('2 корта', '4 корта');

    UPDATE "gift_page_benefits"
    SET "body" = '3 панорамных корта Jubo Super Panoramic с профессиональным покрытием PRO TURF 240 и климат-контролем.'
    WHERE "body" = '4 панорамных корта Jubo Super Panoramic с профессиональным покрытием Mondo и климат-контролем.';

    UPDATE "gift_page"
    SET
      "seo_title" = COALESCE("seo_title", 'Подарочный сертификат на падел в Москве — тренировки и аренда корта | UNLIM'),
      "seo_description" = CASE
        WHEN "seo_description" IS NULL OR "seo_description" = 'Подарочный сертификат на падел в Москве: электронный PDF за 2 минуты или премиальный бокс, аренда панорамного корта Jubo и тренировка с тренером.'
          THEN 'Подарочный сертификат на падел в Москве: аренда панорамного корта, тренировка с тренером, электронный PDF или подарочный бокс.'
        ELSE "seo_description"
      END,
      "seo_social_image_id" = COALESCE("seo_social_image_id", "hero_image_id");

    UPDATE "_gift_page_v_version_benefits"
    SET "body" = '3 панорамных корта Jubo Super Panoramic с профессиональным покрытием PRO TURF 240 и климат-контролем.'
    WHERE "_parent_id" IN (SELECT "id" FROM "_gift_page_v" WHERE "latest" = true)
      AND "body" = '4 панорамных корта Jubo Super Panoramic с профессиональным покрытием Mondo и климат-контролем.';

    UPDATE "_gift_page_v"
    SET
      "version_seo_title" = COALESCE("version_seo_title", 'Подарочный сертификат на падел в Москве — тренировки и аренда корта | UNLIM'),
      "version_seo_description" = CASE
        WHEN "version_seo_description" IS NULL OR "version_seo_description" = 'Подарочный сертификат на падел в Москве: электронный PDF за 2 минуты или премиальный бокс, аренда панорамного корта Jubo и тренировка с тренером.'
          THEN 'Подарочный сертификат на падел в Москве: аренда панорамного корта, тренировка с тренером, электронный PDF или подарочный бокс.'
        ELSE "version_seo_description"
      END,
      "version_seo_social_image_id" = COALESCE("version_seo_social_image_id", "version_hero_image_id")
    WHERE "latest" = true;

    UPDATE "courts"
    SET
      "title" = CASE WHEN "title" = 'Официальное покрытие World Padel Tour' THEN 'Профессиональное покрытие PRO TURF 240' ELSE "title" END,
      "eyebrow" = CASE WHEN "eyebrow" = 'Mondo XN' THEN 'PRO TURF 240' ELSE "eyebrow" END,
      "description" = CASE WHEN "description" = 'Моноволоконное покрытие с оптимальным сцеплением — то же, что используется на турнирах тура.' THEN 'Профессиональное покрытие PRO TURF 240 с оптимальным сцеплением и предсказуемым отскоком мяча.' ELSE "description" END
    WHERE "seed_key" = 'prototype:court:surface';

    UPDATE "_courts_v" versions
    SET
      "version_title" = CASE WHEN versions."version_title" = 'Официальное покрытие World Padel Tour' THEN 'Профессиональное покрытие PRO TURF 240' ELSE versions."version_title" END,
      "version_eyebrow" = CASE WHEN versions."version_eyebrow" = 'Mondo XN' THEN 'PRO TURF 240' ELSE versions."version_eyebrow" END,
      "version_description" = CASE WHEN versions."version_description" = 'Моноволоконное покрытие с оптимальным сцеплением — то же, что используется на турнирах тура.' THEN 'Профессиональное покрытие PRO TURF 240 с оптимальным сцеплением и предсказуемым отскоком мяча.' ELSE versions."version_description" END
    FROM "courts" current
    WHERE versions."latest" = true AND versions."parent_id" = current."id" AND current."seed_key" = 'prototype:court:surface';

    UPDATE "courts_metrics"
    SET "value" = '3'
    WHERE "label" = 'Панорамных корта' AND "value" IN ('2', '4');

    UPDATE "_courts_v_version_metrics"
    SET "value" = '3'
    WHERE "_parent_id" IN (SELECT "id" FROM "_courts_v" WHERE "latest" = true)
      AND "label" = 'Панорамных корта' AND "value" IN ('2', '4');

    UPDATE "courts_page_metrics"
    SET "value" = '3'
    WHERE "label" = 'панорамных корта' AND "value" = '4';

    UPDATE "_courts_page_v_version_metrics"
    SET "value" = '3'
    WHERE "_parent_id" IN (SELECT "id" FROM "_courts_page_v" WHERE "latest" = true)
      AND "label" = 'панорамных корта' AND "value" = '4';

    UPDATE "courts_page"
    SET "seo_description" = 'Три панорамных корта Jubo и профессиональное покрытие PRO TURF 240.'
    WHERE "seo_description" = 'Панорамные корты Jubo и профессиональное покрытие Mondo.';

    UPDATE "_courts_page_v"
    SET "version_seo_description" = 'Три панорамных корта Jubo и профессиональное покрытие PRO TURF 240.'
    WHERE "latest" = true AND "version_seo_description" = 'Панорамные корты Jubo и профессиональное покрытие Mondo.';

    UPDATE "about_page_stats"
    SET "value" = '3'
    WHERE "label" = 'панорамных корта' AND "value" = '4';

    UPDATE "_about_page_v_version_stats"
    SET "value" = '3'
    WHERE "_parent_id" IN (SELECT "id" FROM "_about_page_v" WHERE "latest" = true)
      AND "label" = 'панорамных корта' AND "value" = '4';

    UPDATE "site_settings"
    SET "parking" = '50 бесплатных мест у входа'
    WHERE "parking" IN ('40 бесплатных мест у входа', '40 бесплатных мест у входа');

    UPDATE "_site_settings_v"
    SET "version_parking" = '50 бесплатных мест у входа'
    WHERE "latest" = true AND "version_parking" IN ('40 бесплатных мест у входа', '40 бесплатных мест у входа');

    UPDATE "site_settings_footer_stats"
    SET "value" = '3'
    WHERE "label" = 'Панорамных корта' AND "value" = '4';

    UPDATE "_site_settings_v_version_footer_stats"
    SET "value" = '3'
    WHERE "_parent_id" IN (SELECT "id" FROM "_site_settings_v" WHERE "latest" = true)
      AND "label" = 'Панорамных корта' AND "value" = '4';

    DELETE FROM "site_settings_social_links"
    WHERE "url" IN ('https://t.me', '#');

    DELETE FROM "_site_settings_v_version_social_links"
    WHERE "_parent_id" IN (SELECT "id" FROM "_site_settings_v" WHERE "latest" = true)
      AND "url" IN ('https://t.me', '#');

    UPDATE "site_settings_social_links"
    SET "url" = 'https://vk.ru/unlimpadel'
    WHERE "provider" = 'vk' AND "url" = 'https://vk.com';

    UPDATE "_site_settings_v_version_social_links"
    SET "url" = 'https://vk.ru/unlimpadel'
    WHERE "_parent_id" IN (SELECT "id" FROM "_site_settings_v" WHERE "latest" = true)
      AND "provider" = 'vk' AND "url" = 'https://vk.com';

    INSERT INTO "site_settings_social_links" ("_order", "_parent_id", "id", "provider", "label", "url")
    SELECT
      COALESCE((SELECT MAX(link."_order") + 1 FROM "site_settings_social_links" link WHERE link."_parent_id" = settings."id"), 0),
      settings."id",
      'owner-approved-vk-' || settings."id",
      'vk',
      'VK',
      'https://vk.ru/unlimpadel'
    FROM "site_settings" settings
    WHERE NOT EXISTS (
      SELECT 1 FROM "site_settings_social_links" link
      WHERE link."_parent_id" = settings."id" AND link."provider" = 'vk'
    )
    ON CONFLICT ("id") DO NOTHING;

    INSERT INTO "_site_settings_v_version_social_links" ("_order", "_parent_id", "provider", "label", "url", "_uuid")
    SELECT
      COALESCE((SELECT MAX(link."_order") + 1 FROM "_site_settings_v_version_social_links" link WHERE link."_parent_id" = versions."id"), 0),
      versions."id",
      'vk',
      'VK',
      'https://vk.ru/unlimpadel',
      'owner-approved-vk-' || versions."id"
    FROM "_site_settings_v" versions
    WHERE versions."latest" = true AND NOT EXISTS (
      SELECT 1 FROM "_site_settings_v_version_social_links" link
      WHERE link."_parent_id" = versions."id" AND link."provider" = 'vk'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_homepage_v" DROP COLUMN "version_hero_seo_heading";
    ALTER TABLE "homepage" DROP COLUMN "hero_seo_heading";
  `)
}

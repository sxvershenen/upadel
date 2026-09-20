import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tournaments_participants_level" AS ENUM('1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0');
  CREATE TYPE "public"."enum_tournaments_participants_status" AS ENUM('confirmed', 'waitlist');
  CREATE TYPE "public"."enum_tournaments_perks_icon" AS ENUM('Sparkles', 'Droplets', 'ShowerHead', 'Camera');
  CREATE TYPE "public"."enum_tournaments_level_from" AS ENUM('1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0');
  CREATE TYPE "public"."enum_tournaments_level_to" AS ENUM('1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0');
  CREATE TYPE "public"."enum_tournaments_format" AS ENUM('americano', 'groups-knockout', 'round-robin-playoff', 'other');
  CREATE TYPE "public"."enum_tournaments_participant_mode" AS ENUM('players', 'pairs');
  CREATE TYPE "public"."enum__tournaments_v_version_participants_level" AS ENUM('1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0');
  CREATE TYPE "public"."enum__tournaments_v_version_participants_status" AS ENUM('confirmed', 'waitlist');
  CREATE TYPE "public"."enum__tournaments_v_version_perks_icon" AS ENUM('Sparkles', 'Droplets', 'ShowerHead', 'Camera');
  CREATE TYPE "public"."enum__tournaments_v_version_level_from" AS ENUM('1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0');
  CREATE TYPE "public"."enum__tournaments_v_version_level_to" AS ENUM('1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0');
  CREATE TYPE "public"."enum__tournaments_v_version_format" AS ENUM('americano', 'groups-knockout', 'round-robin-playoff', 'other');
  CREATE TYPE "public"."enum__tournaments_v_version_participant_mode" AS ENUM('players', 'pairs');
  CREATE TYPE "public"."enum_tournament_defaults_perks_icon" AS ENUM('Sparkles', 'Droplets', 'ShowerHead', 'Camera');
  CREATE TYPE "public"."enum_tournament_defaults_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tournament_defaults_v_version_perks_icon" AS ENUM('Sparkles', 'Droplets', 'ShowerHead', 'Camera');
  CREATE TYPE "public"."enum__tournament_defaults_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "tournaments_participants" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "partner_name" varchar,
    "level" "enum_tournaments_participants_level",
    "status" "enum_tournaments_participants_status" DEFAULT 'confirmed'
  );

  CREATE TABLE "tournaments_standings" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "partner_name" varchar,
    "matches" numeric DEFAULT 0,
    "points" numeric DEFAULT 0,
    "difference" varchar DEFAULT '0',
    "award" varchar
  );

  CREATE TABLE "tournaments_prizes" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "reward" varchar,
    "description" varchar
  );

  CREATE TABLE "tournaments_faqs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar
  );

  CREATE TABLE "tournaments_checklist" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "tournaments_perks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon" "enum_tournaments_perks_icon",
    "title" varchar,
    "description" varchar
  );

  CREATE TABLE "tournaments_matchday" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "timing" varchar,
    "title" varchar,
    "description" varchar
  );

  CREATE TABLE "_tournaments_v_version_participants" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "partner_name" varchar,
    "level" "enum__tournaments_v_version_participants_level",
    "status" "enum__tournaments_v_version_participants_status" DEFAULT 'confirmed',
    "_uuid" varchar
  );

  CREATE TABLE "_tournaments_v_version_standings" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "partner_name" varchar,
    "matches" numeric DEFAULT 0,
    "points" numeric DEFAULT 0,
    "difference" varchar DEFAULT '0',
    "award" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournaments_v_version_prizes" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "reward" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournaments_v_version_faqs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournaments_v_version_checklist" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournaments_v_version_perks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon" "enum__tournaments_v_version_perks_icon",
    "title" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournaments_v_version_matchday" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "timing" varchar,
    "title" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "tournament_defaults_checklist" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "tournament_defaults_perks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon" "enum_tournament_defaults_perks_icon",
    "title" varchar,
    "description" varchar
  );

  CREATE TABLE "tournament_defaults_matchday" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "timing" varchar,
    "title" varchar,
    "description" varchar
  );

  CREATE TABLE "tournament_defaults_faqs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar
  );

  CREATE TABLE "tournament_defaults" (
    "id" serial PRIMARY KEY NOT NULL,
    "seed_version" varchar,
    "_status" "enum_tournament_defaults_status" DEFAULT 'draft',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "_tournament_defaults_v_version_checklist" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournament_defaults_v_version_perks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon" "enum__tournament_defaults_v_version_perks_icon",
    "title" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournament_defaults_v_version_matchday" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "timing" varchar,
    "title" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournament_defaults_v_version_faqs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tournament_defaults_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_seed_version" varchar,
    "version__status" "enum__tournament_defaults_v_version_status" DEFAULT 'draft',
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );


  ALTER TABLE "tournaments" ALTER COLUMN "prize_label" SET DEFAULT 'Призовой фонд';
  ALTER TABLE "_tournaments_v" ALTER COLUMN "version_prize_label" SET DEFAULT 'Призовой фонд';
  ALTER TABLE "tournaments" ADD COLUMN "level_from" "enum_tournaments_level_from";
  ALTER TABLE "tournaments" ADD COLUMN "level_to" "enum_tournaments_level_to";
  ALTER TABLE "tournaments" ADD COLUMN "custom_format" varchar;
  ALTER TABLE "tournaments" ADD COLUMN "participant_mode" "enum_tournaments_participant_mode" DEFAULT 'players';
  ALTER TABLE "tournaments" ADD COLUMN "total_slots" numeric DEFAULT 16;
  ALTER TABLE "tournaments" ADD COLUMN "use_club_coordinator_contacts" boolean DEFAULT true;
  ALTER TABLE "tournaments" ADD COLUMN "coordinator_telegram_label" varchar DEFAULT 'Telegram';
  ALTER TABLE "tournaments" ADD COLUMN "coordinator_telegram_u_r_l" varchar;
  ALTER TABLE "tournaments" ADD COLUMN "coordinator_phone_display" varchar;
  ALTER TABLE "tournaments" ADD COLUMN "coordinator_phone_value" varchar;
  ALTER TABLE "tournaments" ADD COLUMN "use_default_faq" boolean DEFAULT true;
  ALTER TABLE "tournaments" ADD COLUMN "use_default_checklist" boolean DEFAULT true;
  ALTER TABLE "tournaments" ADD COLUMN "use_default_perks" boolean DEFAULT true;
  ALTER TABLE "tournaments" ADD COLUMN "use_default_matchday" boolean DEFAULT true;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_level_from" "enum__tournaments_v_version_level_from";
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_level_to" "enum__tournaments_v_version_level_to";
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_custom_format" varchar;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_participant_mode" "enum__tournaments_v_version_participant_mode" DEFAULT 'players';
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_total_slots" numeric DEFAULT 16;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_use_club_coordinator_contacts" boolean DEFAULT true;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_coordinator_telegram_label" varchar DEFAULT 'Telegram';
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_coordinator_telegram_u_r_l" varchar;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_coordinator_phone_display" varchar;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_coordinator_phone_value" varchar;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_use_default_faq" boolean DEFAULT true;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_use_default_checklist" boolean DEFAULT true;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_use_default_perks" boolean DEFAULT true;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_use_default_matchday" boolean DEFAULT true;
  UPDATE "tournaments" SET
    "starts_at" = COALESCE("starts_at", CASE WHEN "slug" = 'open-league' THEN '2026-03-14T08:00:00.000Z'::timestamptz ELSE '2026-09-20T16:30:00.000Z'::timestamptz END),
    "ends_at" = COALESCE("ends_at", CASE WHEN "slug" = 'open-league' THEN '2026-03-14T14:00:00.000Z'::timestamptz ELSE '2026-09-20T19:30:00.000Z'::timestamptz END),
    "level_from" = CASE WHEN "format_key" = 'groups-knockout' THEN '4.0'::"enum_tournaments_level_from" ELSE '2.0'::"enum_tournaments_level_from" END,
    "level_to" = CASE WHEN "format_key" = 'groups-knockout' THEN '4.0'::"enum_tournaments_level_to" ELSE '2.0'::"enum_tournaments_level_to" END,
    "participant_mode" = CASE WHEN "format_key" = 'americano' THEN 'players'::"enum_tournaments_participant_mode" ELSE 'pairs'::"enum_tournaments_participant_mode" END,
    "total_slots" = CASE WHEN "format_key" = 'americano' THEN 16 ELSE 8 END;
  UPDATE "_tournaments_v" SET
    "version_level_from" = CASE WHEN "version_format_key" = 'groups-knockout' THEN '4.0'::"enum__tournaments_v_version_level_from" ELSE '2.0'::"enum__tournaments_v_version_level_from" END,
    "version_level_to" = CASE WHEN "version_format_key" = 'groups-knockout' THEN '4.0'::"enum__tournaments_v_version_level_to" ELSE '2.0'::"enum__tournaments_v_version_level_to" END,
    "version_participant_mode" = CASE WHEN "version_format_key" = 'americano' THEN 'players'::"enum__tournaments_v_version_participant_mode" ELSE 'pairs'::"enum__tournaments_v_version_participant_mode" END,
    "version_total_slots" = CASE WHEN "version_format_key" = 'americano' THEN 16 ELSE 8 END;
  ALTER TABLE "tournaments" ALTER COLUMN "format" SET DATA TYPE "public"."enum_tournaments_format" USING "format_key"::text::"public"."enum_tournaments_format";
  ALTER TABLE "_tournaments_v" ALTER COLUMN "version_format" SET DATA TYPE "public"."enum__tournaments_v_version_format" USING "version_format_key"::text::"public"."enum__tournaments_v_version_format";
  ALTER TABLE "tournaments" ALTER COLUMN "starts_at" SET NOT NULL;
  ALTER TABLE "tournaments" ALTER COLUMN "ends_at" SET NOT NULL;
  ALTER TABLE "tournaments" ALTER COLUMN "level_from" SET NOT NULL;
  ALTER TABLE "tournaments" ALTER COLUMN "level_to" SET NOT NULL;
  ALTER TABLE "tournaments" ALTER COLUMN "participant_mode" SET NOT NULL;
  ALTER TABLE "tournaments" ALTER COLUMN "total_slots" SET NOT NULL;

  INSERT INTO "tournament_defaults" ("id", "seed_version", "_status", "updated_at", "created_at") VALUES (1, 'prototype-v2', 'published', now(), now());
  SELECT setval(pg_get_serial_sequence('tournament_defaults', 'id'), 1, true);
  INSERT INTO "tournament_defaults_checklist" ("_order", "_parent_id", "id", "text") VALUES
    (0, 1, 'default-check-1', 'Приезжайте за 15–30 минут до начала для спокойной разминки и жеребьёвки.'),
    (1, 1, 'default-check-2', 'Возьмите спортивную обувь с немаркой подошвой (non-marking).'),
    (2, 1, 'default-check-3', 'Ракетку можно принести свою или взять на тест-драйв в про-шопе.');
  INSERT INTO "tournament_defaults_perks" ("_order", "_parent_id", "id", "icon", "title", "description") VALUES
    (0, 1, 'default-perk-1', 'Sparkles', 'Турнирные мячи', 'Профессиональные мячи Bullpadel на каждый сет.'),
    (1, 1, 'default-perk-2', 'Droplets', 'Питьевая вода', 'Бутилированная и фильтрованная вода для участников.'),
    (2, 1, 'default-perk-3', 'ShowerHead', 'Раздевалки и сауна', 'Просторные душевые, свежие полотенца и финская сауна.'),
    (3, 1, 'default-perk-4', 'Camera', 'Судейство и фотоотчёт', 'Координатор сеток, хронометраж и памятные фотографии.');
  INSERT INTO "tournament_defaults_matchday" ("_order", "_parent_id", "id", "timing", "title", "description") VALUES
    (0, 1, 'default-day-1', 'За 30 минут', 'Сбор и разминка', 'Регистрация участников на ресепшн, переодевание и разминка на кортах.'),
    (1, 1, 'default-day-2', 'За 10 минут', 'Брифинг и жеребьёвка', 'Судья озвучивает регламент, распределяет корты и даёт старт первому туру.'),
    (2, 1, 'default-day-3', 'Основное время', 'Турнирные матчи', 'Серия динамичных встреч с ротацией и оперативным ведением счёта на табло.'),
    (3, 1, 'default-day-4', 'Финал турнира', 'Награждение и лаунж', 'Финальные розыгрыши, вручение призов и неформальное общение.');
  INSERT INTO "tournament_defaults_faqs" ("_order", "_parent_id", "id", "question", "answer") VALUES
    (0, 1, 'default-faq-1', 'Нужен ли постоянный напарник для участия?', 'Формат участия указан в описании турнира. Если у вас пока нет партнёра, оставьте заявку — администратор подскажет доступные варианты.'),
    (1, 1, 'default-faq-2', 'Какой уровень подготовки требуется?', 'Ориентируйтесь на диапазон уровня на странице турнира. Если сомневаетесь, свяжитесь с клубом для быстрой оценки.'),
    (2, 1, 'default-faq-3', 'Какая экипировка нужна для турнира?', 'Обязательна спортивная обувь для падела или тенниса с немаркой подошвой. Ракетку можно принести свою или взять в клубе.'),
    (3, 1, 'default-faq-4', 'Что делать, если планы изменились после регистрации?', 'Пожалуйста, предупредите координатора не позднее чем за 24 часа до старта турнира.');

  INSERT INTO "tournaments_participants" ("_order", "_parent_id", "id", "name", "level", "status")
    SELECT p.ord - 1, t.id, 'americano-player-' || p.ord, p.name, '2.0', 'confirmed'
    FROM "tournaments" t CROSS JOIN LATERAL unnest(ARRAY['Максим Воронов','Анна Кузнецова','Денис Соколов','Екатерина Морозова','Артём Лебедев','Полина Новикова','Михаил Белов','София Павлова','Роман Орлов','Дарья Смирнова','Кирилл Фёдоров','Елена Попова']) WITH ORDINALITY p(name, ord)
    WHERE t.slug = 'americano';
  INSERT INTO "tournaments_participants" ("_order", "_parent_id", "id", "name", "partner_name", "level", "status")
    SELECT p.ord - 1, t.id, 'open-pair-' || p.ord, p.name, p.partner, '4.0', 'confirmed'
    FROM "tournaments" t CROSS JOIN LATERAL unnest(ARRAY['М. Воронов','Д. Соколов','А. Лебедев','Р. Орлов','М. Белов','Е. Морозов'], ARRAY['А. Кузнецов','И. Васильев','К. Фёдоров','С. Медведев','П. Новиков','О. Ильин']) WITH ORDINALITY p(name, partner, ord)
    WHERE t.slug = 'open-league';
  INSERT INTO "tournaments_standings" ("_order", "_parent_id", "id", "name", "matches", "points", "difference", "award")
    SELECT s.ord - 1, t.id, 'americano-standing-' || s.ord, s.name, 7, s.points, s.difference, s.award
    FROM "tournaments" t CROSS JOIN LATERAL unnest(ARRAY['Максим Воронов','Екатерина Морозова','Артём Лебедев','Анна Кузнецова','Михаил Белов'], ARRAY[142,136,131,125,119], ARRAY['+38','+26','+18','+12','+4'], ARRAY['Золотой кубок','Серебряный призёр','Бронзовый призёр',NULL,NULL]::varchar[]) WITH ORDINALITY s(name, points, difference, award, ord)
    WHERE t.slug = 'americano';
  INSERT INTO "tournaments_prizes" ("_order", "_parent_id", "id", "title", "reward", "description")
    SELECT p.ord - 1, t.id, t.slug || '-prize-' || p.ord, p.title, p.reward, p.description
    FROM "tournaments" t CROSS JOIN LATERAL unnest(ARRAY['Победитель турнира','Серебряный призёр','Бронзовый призёр'], ARRAY['Главный приз','Второй приз','Третий приз'], ARRAY['Кубок клуба и призы партнёров.','Медаль и призы партнёров.','Медаль и памятный подарок.']) WITH ORDINALITY p(title, reward, description, ord)
    WHERE t.slug IN ('americano', 'open-league');
  ALTER TABLE "tournaments_participants" ADD CONSTRAINT "tournaments_participants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournaments_standings" ADD CONSTRAINT "tournaments_standings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournaments_prizes" ADD CONSTRAINT "tournaments_prizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournaments_faqs" ADD CONSTRAINT "tournaments_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournaments_checklist" ADD CONSTRAINT "tournaments_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournaments_perks" ADD CONSTRAINT "tournaments_perks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournaments_matchday" ADD CONSTRAINT "tournaments_matchday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournaments_v_version_participants" ADD CONSTRAINT "_tournaments_v_version_participants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournaments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournaments_v_version_standings" ADD CONSTRAINT "_tournaments_v_version_standings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournaments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournaments_v_version_prizes" ADD CONSTRAINT "_tournaments_v_version_prizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournaments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournaments_v_version_faqs" ADD CONSTRAINT "_tournaments_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournaments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournaments_v_version_checklist" ADD CONSTRAINT "_tournaments_v_version_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournaments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournaments_v_version_perks" ADD CONSTRAINT "_tournaments_v_version_perks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournaments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournaments_v_version_matchday" ADD CONSTRAINT "_tournaments_v_version_matchday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournaments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournament_defaults_checklist" ADD CONSTRAINT "tournament_defaults_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournament_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournament_defaults_perks" ADD CONSTRAINT "tournament_defaults_perks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournament_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournament_defaults_matchday" ADD CONSTRAINT "tournament_defaults_matchday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournament_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tournament_defaults_faqs" ADD CONSTRAINT "tournament_defaults_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tournament_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournament_defaults_v_version_checklist" ADD CONSTRAINT "_tournament_defaults_v_version_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournament_defaults_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournament_defaults_v_version_perks" ADD CONSTRAINT "_tournament_defaults_v_version_perks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournament_defaults_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournament_defaults_v_version_matchday" ADD CONSTRAINT "_tournament_defaults_v_version_matchday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournament_defaults_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tournament_defaults_v_version_faqs" ADD CONSTRAINT "_tournament_defaults_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tournament_defaults_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tournaments_participants_order_idx" ON "tournaments_participants" USING btree ("_order");
  CREATE INDEX "tournaments_participants_parent_id_idx" ON "tournaments_participants" USING btree ("_parent_id");
  CREATE INDEX "tournaments_standings_order_idx" ON "tournaments_standings" USING btree ("_order");
  CREATE INDEX "tournaments_standings_parent_id_idx" ON "tournaments_standings" USING btree ("_parent_id");
  CREATE INDEX "tournaments_prizes_order_idx" ON "tournaments_prizes" USING btree ("_order");
  CREATE INDEX "tournaments_prizes_parent_id_idx" ON "tournaments_prizes" USING btree ("_parent_id");
  CREATE INDEX "tournaments_faqs_order_idx" ON "tournaments_faqs" USING btree ("_order");
  CREATE INDEX "tournaments_faqs_parent_id_idx" ON "tournaments_faqs" USING btree ("_parent_id");
  CREATE INDEX "tournaments_checklist_order_idx" ON "tournaments_checklist" USING btree ("_order");
  CREATE INDEX "tournaments_checklist_parent_id_idx" ON "tournaments_checklist" USING btree ("_parent_id");
  CREATE INDEX "tournaments_perks_order_idx" ON "tournaments_perks" USING btree ("_order");
  CREATE INDEX "tournaments_perks_parent_id_idx" ON "tournaments_perks" USING btree ("_parent_id");
  CREATE INDEX "tournaments_matchday_order_idx" ON "tournaments_matchday" USING btree ("_order");
  CREATE INDEX "tournaments_matchday_parent_id_idx" ON "tournaments_matchday" USING btree ("_parent_id");
  CREATE INDEX "_tournaments_v_version_participants_order_idx" ON "_tournaments_v_version_participants" USING btree ("_order");
  CREATE INDEX "_tournaments_v_version_participants_parent_id_idx" ON "_tournaments_v_version_participants" USING btree ("_parent_id");
  CREATE INDEX "_tournaments_v_version_standings_order_idx" ON "_tournaments_v_version_standings" USING btree ("_order");
  CREATE INDEX "_tournaments_v_version_standings_parent_id_idx" ON "_tournaments_v_version_standings" USING btree ("_parent_id");
  CREATE INDEX "_tournaments_v_version_prizes_order_idx" ON "_tournaments_v_version_prizes" USING btree ("_order");
  CREATE INDEX "_tournaments_v_version_prizes_parent_id_idx" ON "_tournaments_v_version_prizes" USING btree ("_parent_id");
  CREATE INDEX "_tournaments_v_version_faqs_order_idx" ON "_tournaments_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_tournaments_v_version_faqs_parent_id_idx" ON "_tournaments_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_tournaments_v_version_checklist_order_idx" ON "_tournaments_v_version_checklist" USING btree ("_order");
  CREATE INDEX "_tournaments_v_version_checklist_parent_id_idx" ON "_tournaments_v_version_checklist" USING btree ("_parent_id");
  CREATE INDEX "_tournaments_v_version_perks_order_idx" ON "_tournaments_v_version_perks" USING btree ("_order");
  CREATE INDEX "_tournaments_v_version_perks_parent_id_idx" ON "_tournaments_v_version_perks" USING btree ("_parent_id");
  CREATE INDEX "_tournaments_v_version_matchday_order_idx" ON "_tournaments_v_version_matchday" USING btree ("_order");
  CREATE INDEX "_tournaments_v_version_matchday_parent_id_idx" ON "_tournaments_v_version_matchday" USING btree ("_parent_id");
  CREATE INDEX "tournament_defaults_checklist_order_idx" ON "tournament_defaults_checklist" USING btree ("_order");
  CREATE INDEX "tournament_defaults_checklist_parent_id_idx" ON "tournament_defaults_checklist" USING btree ("_parent_id");
  CREATE INDEX "tournament_defaults_perks_order_idx" ON "tournament_defaults_perks" USING btree ("_order");
  CREATE INDEX "tournament_defaults_perks_parent_id_idx" ON "tournament_defaults_perks" USING btree ("_parent_id");
  CREATE INDEX "tournament_defaults_matchday_order_idx" ON "tournament_defaults_matchday" USING btree ("_order");
  CREATE INDEX "tournament_defaults_matchday_parent_id_idx" ON "tournament_defaults_matchday" USING btree ("_parent_id");
  CREATE INDEX "tournament_defaults_faqs_order_idx" ON "tournament_defaults_faqs" USING btree ("_order");
  CREATE INDEX "tournament_defaults_faqs_parent_id_idx" ON "tournament_defaults_faqs" USING btree ("_parent_id");
  CREATE INDEX "tournament_defaults__status_idx" ON "tournament_defaults" USING btree ("_status");
  CREATE INDEX "_tournament_defaults_v_version_checklist_order_idx" ON "_tournament_defaults_v_version_checklist" USING btree ("_order");
  CREATE INDEX "_tournament_defaults_v_version_checklist_parent_id_idx" ON "_tournament_defaults_v_version_checklist" USING btree ("_parent_id");
  CREATE INDEX "_tournament_defaults_v_version_perks_order_idx" ON "_tournament_defaults_v_version_perks" USING btree ("_order");
  CREATE INDEX "_tournament_defaults_v_version_perks_parent_id_idx" ON "_tournament_defaults_v_version_perks" USING btree ("_parent_id");
  CREATE INDEX "_tournament_defaults_v_version_matchday_order_idx" ON "_tournament_defaults_v_version_matchday" USING btree ("_order");
  CREATE INDEX "_tournament_defaults_v_version_matchday_parent_id_idx" ON "_tournament_defaults_v_version_matchday" USING btree ("_parent_id");
  CREATE INDEX "_tournament_defaults_v_version_faqs_order_idx" ON "_tournament_defaults_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_tournament_defaults_v_version_faqs_parent_id_idx" ON "_tournament_defaults_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_tournament_defaults_v_version_version__status_idx" ON "_tournament_defaults_v" USING btree ("version__status");
  CREATE INDEX "_tournament_defaults_v_created_at_idx" ON "_tournament_defaults_v" USING btree ("created_at");
  CREATE INDEX "_tournament_defaults_v_updated_at_idx" ON "_tournament_defaults_v" USING btree ("updated_at");
  CREATE INDEX "_tournament_defaults_v_latest_idx" ON "_tournament_defaults_v" USING btree ("latest");
  CREATE INDEX "_tournament_defaults_v_autosave_idx" ON "_tournament_defaults_v" USING btree ("autosave");
  ALTER TABLE "tournaments" DROP COLUMN "category";
  ALTER TABLE "tournaments" DROP COLUMN "category_key";
  ALTER TABLE "tournaments" DROP COLUMN IF EXISTS "level";
  ALTER TABLE "tournaments" DROP COLUMN IF EXISTS "level_key";
  ALTER TABLE "tournaments" DROP COLUMN "schedule_label";
  ALTER TABLE "tournaments" DROP COLUMN "format_key";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_category";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_category_key";
  ALTER TABLE "_tournaments_v" DROP COLUMN IF EXISTS "version_level";
  ALTER TABLE "_tournaments_v" DROP COLUMN IF EXISTS "version_level_key";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_schedule_label";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_format_key";
  DROP TYPE "public"."enum_tournaments_category_key";
  DROP TYPE "public"."enum_tournaments_format_key";
  DROP TYPE "public"."enum__tournaments_v_version_category_key";
  DROP TYPE "public"."enum__tournaments_v_version_format_key";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tournaments_category_key" AS ENUM('club-game', 'mens-league', 'womens-open', 'junior', 'open');
  CREATE TYPE "public"."enum_tournaments_format_key" AS ENUM('americano', 'groups-knockout', 'round-robin-playoff', 'other');
  CREATE TYPE "public"."enum__tournaments_v_version_category_key" AS ENUM('club-game', 'mens-league', 'womens-open', 'junior', 'open');
  CREATE TYPE "public"."enum__tournaments_v_version_format_key" AS ENUM('americano', 'groups-knockout', 'round-robin-playoff', 'other');
  ALTER TABLE "tournaments_participants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournaments_standings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournaments_prizes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournaments_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournaments_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournaments_perks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournaments_matchday" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournaments_v_version_participants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournaments_v_version_standings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournaments_v_version_prizes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournaments_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournaments_v_version_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournaments_v_version_perks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournaments_v_version_matchday" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournament_defaults_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournament_defaults_perks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournament_defaults_matchday" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournament_defaults_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tournament_defaults" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournament_defaults_v_version_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournament_defaults_v_version_perks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournament_defaults_v_version_matchday" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournament_defaults_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tournament_defaults_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tournaments_participants" CASCADE;
  DROP TABLE "tournaments_standings" CASCADE;
  DROP TABLE "tournaments_prizes" CASCADE;
  DROP TABLE "tournaments_faqs" CASCADE;
  DROP TABLE "tournaments_checklist" CASCADE;
  DROP TABLE "tournaments_perks" CASCADE;
  DROP TABLE "tournaments_matchday" CASCADE;
  DROP TABLE "_tournaments_v_version_participants" CASCADE;
  DROP TABLE "_tournaments_v_version_standings" CASCADE;
  DROP TABLE "_tournaments_v_version_prizes" CASCADE;
  DROP TABLE "_tournaments_v_version_faqs" CASCADE;
  DROP TABLE "_tournaments_v_version_checklist" CASCADE;
  DROP TABLE "_tournaments_v_version_perks" CASCADE;
  DROP TABLE "_tournaments_v_version_matchday" CASCADE;
  DROP TABLE "tournament_defaults_checklist" CASCADE;
  DROP TABLE "tournament_defaults_perks" CASCADE;
  DROP TABLE "tournament_defaults_matchday" CASCADE;
  DROP TABLE "tournament_defaults_faqs" CASCADE;
  DROP TABLE "tournament_defaults" CASCADE;
  DROP TABLE "_tournament_defaults_v_version_checklist" CASCADE;
  DROP TABLE "_tournament_defaults_v_version_perks" CASCADE;
  DROP TABLE "_tournament_defaults_v_version_matchday" CASCADE;
  DROP TABLE "_tournament_defaults_v_version_faqs" CASCADE;
  DROP TABLE "_tournament_defaults_v" CASCADE;
  ALTER TABLE "tournaments" ALTER COLUMN "format" SET DATA TYPE varchar;
  ALTER TABLE "tournaments" ALTER COLUMN "prize_label" DROP DEFAULT;
  ALTER TABLE "_tournaments_v" ALTER COLUMN "version_format" SET DATA TYPE varchar;
  ALTER TABLE "_tournaments_v" ALTER COLUMN "version_prize_label" DROP DEFAULT;
  ALTER TABLE "tournaments" ADD COLUMN "category" varchar;
  ALTER TABLE "tournaments" ADD COLUMN "category_key" "enum_tournaments_category_key";
  ALTER TABLE "tournaments" ADD COLUMN "schedule_label" varchar;
  ALTER TABLE "tournaments" ADD COLUMN "format_key" "enum_tournaments_format_key";
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_category" varchar;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_category_key" "enum__tournaments_v_version_category_key";
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_schedule_label" varchar;
  ALTER TABLE "_tournaments_v" ADD COLUMN "version_format_key" "enum__tournaments_v_version_format_key";
  ALTER TABLE "tournaments" DROP COLUMN "level_from";
  ALTER TABLE "tournaments" DROP COLUMN "level_to";
  ALTER TABLE "tournaments" DROP COLUMN "custom_format";
  ALTER TABLE "tournaments" DROP COLUMN "participant_mode";
  ALTER TABLE "tournaments" DROP COLUMN "total_slots";
  ALTER TABLE "tournaments" DROP COLUMN "use_club_coordinator_contacts";
  ALTER TABLE "tournaments" DROP COLUMN "coordinator_telegram_label";
  ALTER TABLE "tournaments" DROP COLUMN "coordinator_telegram_u_r_l";
  ALTER TABLE "tournaments" DROP COLUMN "coordinator_phone_display";
  ALTER TABLE "tournaments" DROP COLUMN "coordinator_phone_value";
  ALTER TABLE "tournaments" DROP COLUMN "use_default_faq";
  ALTER TABLE "tournaments" DROP COLUMN "use_default_checklist";
  ALTER TABLE "tournaments" DROP COLUMN "use_default_perks";
  ALTER TABLE "tournaments" DROP COLUMN "use_default_matchday";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_level_from";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_level_to";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_custom_format";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_participant_mode";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_total_slots";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_use_club_coordinator_contacts";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_coordinator_telegram_label";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_coordinator_telegram_u_r_l";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_coordinator_phone_display";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_coordinator_phone_value";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_use_default_faq";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_use_default_checklist";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_use_default_perks";
  ALTER TABLE "_tournaments_v" DROP COLUMN "version_use_default_matchday";
  DROP TYPE "public"."enum_tournaments_participants_level";
  DROP TYPE "public"."enum_tournaments_participants_status";
  DROP TYPE "public"."enum_tournaments_perks_icon";
  DROP TYPE "public"."enum_tournaments_level_from";
  DROP TYPE "public"."enum_tournaments_level_to";
  DROP TYPE "public"."enum_tournaments_format";
  DROP TYPE "public"."enum_tournaments_participant_mode";
  DROP TYPE "public"."enum__tournaments_v_version_participants_level";
  DROP TYPE "public"."enum__tournaments_v_version_participants_status";
  DROP TYPE "public"."enum__tournaments_v_version_perks_icon";
  DROP TYPE "public"."enum__tournaments_v_version_level_from";
  DROP TYPE "public"."enum__tournaments_v_version_level_to";
  DROP TYPE "public"."enum__tournaments_v_version_format";
  DROP TYPE "public"."enum__tournaments_v_version_participant_mode";
  DROP TYPE "public"."enum_tournament_defaults_perks_icon";
  DROP TYPE "public"."enum_tournament_defaults_status";
  DROP TYPE "public"."enum__tournament_defaults_v_version_perks_icon";
  DROP TYPE "public"."enum__tournament_defaults_v_version_status";
  `)
}

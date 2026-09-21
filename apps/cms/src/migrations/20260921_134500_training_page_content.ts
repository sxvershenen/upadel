import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_training_page_first_visit_items_icon" AS ENUM('Dumbbell', 'Footprints', 'ShowerHead', 'Timer');
    CREATE TYPE "public"."enum__training_page_v_version_first_visit_items_icon" AS ENUM('Dumbbell', 'Footprints', 'ShowerHead', 'Timer');

    ALTER TABLE "training_page" ADD COLUMN "programs_eyebrow" varchar;
    ALTER TABLE "training_page" ADD COLUMN "coaches_eyebrow" varchar;
    ALTER TABLE "training_page" ADD COLUMN "coaches_title" varchar;
    ALTER TABLE "training_page" ADD COLUMN "coaches_desktop_action_label" varchar;
    ALTER TABLE "training_page" ADD COLUMN "coaches_mobile_action_label" varchar;
    ALTER TABLE "training_page" ADD COLUMN "knowledge_eyebrow" varchar;
    ALTER TABLE "training_page" ADD COLUMN "knowledge_title" varchar;
    ALTER TABLE "training_page" ADD COLUMN "first_visit_title" varchar;
    ALTER TABLE "training_page" ADD COLUMN "first_visit_copy" varchar;
    ALTER TABLE "training_page" ADD COLUMN "faq_title" varchar;
    ALTER TABLE "training_page" ADD COLUMN "faq_copy" varchar;

    ALTER TABLE "_training_page_v" ADD COLUMN "version_programs_eyebrow" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_coaches_eyebrow" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_coaches_title" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_coaches_desktop_action_label" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_coaches_mobile_action_label" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_knowledge_eyebrow" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_knowledge_title" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_first_visit_title" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_first_visit_copy" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_faq_title" varchar;
    ALTER TABLE "_training_page_v" ADD COLUMN "version_faq_copy" varchar;

    CREATE TABLE "training_page_first_visit_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "body" varchar,
      "icon" "enum_training_page_first_visit_items_icon"
    );
    CREATE TABLE "training_page_faq" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "question" varchar,
      "answer" varchar
    );

    CREATE SEQUENCE "_training_page_v_version_first_visit_items_id_seq";
    CREATE SEQUENCE "_training_page_v_version_faq_id_seq";
    CREATE TABLE "_training_page_v_version_first_visit_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" integer PRIMARY KEY NOT NULL DEFAULT nextval('"_training_page_v_version_first_visit_items_id_seq"'::regclass),
      "title" varchar,
      "body" varchar,
      "icon" "enum__training_page_v_version_first_visit_items_icon",
      "_uuid" varchar
    );
    CREATE TABLE "_training_page_v_version_faq" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" integer PRIMARY KEY NOT NULL DEFAULT nextval('"_training_page_v_version_faq_id_seq"'::regclass),
      "question" varchar,
      "answer" varchar,
      "_uuid" varchar
    );
    ALTER SEQUENCE "_training_page_v_version_first_visit_items_id_seq" OWNED BY "_training_page_v_version_first_visit_items"."id";
    ALTER SEQUENCE "_training_page_v_version_faq_id_seq" OWNED BY "_training_page_v_version_faq"."id";

    ALTER TABLE "training_page_first_visit_items" ADD CONSTRAINT "training_page_first_visit_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training_page"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "training_page_faq" ADD CONSTRAINT "training_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training_page"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_training_page_v_version_first_visit_items" ADD CONSTRAINT "_training_page_v_version_first_visit_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_training_page_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_training_page_v_version_faq" ADD CONSTRAINT "_training_page_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_training_page_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "training_page_first_visit_items_order_idx" ON "training_page_first_visit_items" USING btree ("_order");
    CREATE INDEX "training_page_first_visit_items_parent_id_idx" ON "training_page_first_visit_items" USING btree ("_parent_id");
    CREATE INDEX "training_page_faq_order_idx" ON "training_page_faq" USING btree ("_order");
    CREATE INDEX "training_page_faq_parent_id_idx" ON "training_page_faq" USING btree ("_parent_id");
    CREATE INDEX "_training_page_v_version_first_visit_items_order_idx" ON "_training_page_v_version_first_visit_items" USING btree ("_order");
    CREATE INDEX "_training_page_v_version_first_visit_items_parent_id_idx" ON "_training_page_v_version_first_visit_items" USING btree ("_parent_id");
    CREATE INDEX "_training_page_v_version_faq_order_idx" ON "_training_page_v_version_faq" USING btree ("_order");
    CREATE INDEX "_training_page_v_version_faq_parent_id_idx" ON "_training_page_v_version_faq" USING btree ("_parent_id");

    UPDATE "training_page" SET
      "programs_eyebrow" = COALESCE("programs_eyebrow", 'Программы'),
      "coaches_eyebrow" = COALESCE("coaches_eyebrow", 'Команда наставников'),
      "coaches_title" = COALESCE("coaches_title", 'Тренеры клуба'),
      "coaches_desktop_action_label" = COALESCE("coaches_desktop_action_label", 'Все'),
      "coaches_mobile_action_label" = COALESCE("coaches_mobile_action_label", 'Все тренеры'),
      "knowledge_eyebrow" = COALESCE("knowledge_eyebrow", 'База знаний'),
      "knowledge_title" = COALESCE("knowledge_title", 'Перед первой тренировкой'),
      "first_visit_title" = COALESCE("first_visit_title", 'Что нужно для первого визита'),
      "first_visit_copy" = COALESCE("first_visit_copy", 'Подготовьтесь без лишних покупок — основное уже есть в клубе.'),
      "faq_title" = COALESCE("faq_title", 'Частые вопросы'),
      "faq_copy" = COALESCE("faq_copy", 'Коротко о формате занятий, прогрессе и первом визите.');

    INSERT INTO "training_page_first_visit_items" ("_order", "_parent_id", "id", "title", "body", "icon")
    SELECT item.ord, page.id, 'training-first-' || page.id || '-' || item.ord, item.title, item.body, item.icon::"enum_training_page_first_visit_items_icon"
    FROM "training_page" page CROSS JOIN (VALUES
      (1, 'Ракетка и мячи', 'Премиальные ракетки Varlion и мячи включены в каждый визит.', 'Dumbbell'),
      (2, 'Обувь для корта', 'Возьмите сменные чистые кроссовки с нескользящей подошвой.', 'Footprints'),
      (3, 'Раздевалки и душ', 'Шкафчики, полотенца, душевые и фены доступны без доплат.', 'ShowerHead'),
      (4, 'Время прибытия', 'Приезжайте за 10–15 минут до начала занятия.', 'Timer')
    ) AS item(ord, title, body, icon)
    WHERE NOT EXISTS (SELECT 1 FROM "training_page_first_visit_items" existing WHERE existing."_parent_id" = page.id);

    INSERT INTO "training_page_faq" ("_order", "_parent_id", "id", "question", "answer")
    SELECT item.ord, page.id, 'training-faq-' || page.id || '-' || item.ord, item.question, item.answer
    FROM "training_page" page CROSS JOIN (VALUES
      (1, 'Как проходят тренировки по паделу?', 'Занятие строится вокруг практики: разминки, базовых ударов, игровых ситуаций и короткого разбора.'),
      (2, 'Как выбрать формат занятий?', 'Если формат пока не очевиден, начните с пробного занятия и обсудите план с тренером.'),
      (3, 'Когда будет заметен прогресс?', 'Темп зависит от исходного уровня и регулярности занятий.'),
      (4, 'Нужна ли своя экипировка?', 'Нет. Ракетки и мячи предоставит клуб.')
    ) AS item(ord, question, answer)
    WHERE NOT EXISTS (SELECT 1 FROM "training_page_faq" existing WHERE existing."_parent_id" = page.id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "_training_page_v_version_first_visit_items" CASCADE;
    DROP TABLE "_training_page_v_version_faq" CASCADE;
    DROP TABLE "training_page_first_visit_items" CASCADE;
    DROP TABLE "training_page_faq" CASCADE;
    ALTER TABLE "_training_page_v" DROP COLUMN "version_programs_eyebrow";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_coaches_eyebrow";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_coaches_title";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_coaches_desktop_action_label";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_coaches_mobile_action_label";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_knowledge_eyebrow";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_knowledge_title";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_first_visit_title";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_first_visit_copy";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_faq_title";
    ALTER TABLE "_training_page_v" DROP COLUMN "version_faq_copy";
    ALTER TABLE "training_page" DROP COLUMN "programs_eyebrow";
    ALTER TABLE "training_page" DROP COLUMN "coaches_eyebrow";
    ALTER TABLE "training_page" DROP COLUMN "coaches_title";
    ALTER TABLE "training_page" DROP COLUMN "coaches_desktop_action_label";
    ALTER TABLE "training_page" DROP COLUMN "coaches_mobile_action_label";
    ALTER TABLE "training_page" DROP COLUMN "knowledge_eyebrow";
    ALTER TABLE "training_page" DROP COLUMN "knowledge_title";
    ALTER TABLE "training_page" DROP COLUMN "first_visit_title";
    ALTER TABLE "training_page" DROP COLUMN "first_visit_copy";
    ALTER TABLE "training_page" DROP COLUMN "faq_title";
    ALTER TABLE "training_page" DROP COLUMN "faq_copy";
    DROP TYPE "public"."enum__training_page_v_version_first_visit_items_icon";
    DROP TYPE "public"."enum_training_page_first_visit_items_icon";
  `)
}

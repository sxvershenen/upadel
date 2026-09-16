import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "desktop_nav_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"icon_id" integer
  );
  
  CREATE TABLE "_desktop_nav_children_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"icon_id" integer,
  	"_uuid" varchar
  );
  
  ALTER TABLE "desktop_nav_children" ADD CONSTRAINT "desktop_nav_children_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "desktop_nav_children" ADD CONSTRAINT "desktop_nav_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_desktop_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_desktop_nav_children_v" ADD CONSTRAINT "_desktop_nav_children_v_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_desktop_nav_children_v" ADD CONSTRAINT "_desktop_nav_children_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_desktop_navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "desktop_nav_children_order_idx" ON "desktop_nav_children" USING btree ("_order");
  CREATE INDEX "desktop_nav_children_parent_id_idx" ON "desktop_nav_children" USING btree ("_parent_id");
  CREATE INDEX "desktop_nav_children_icon_idx" ON "desktop_nav_children" USING btree ("icon_id");
  CREATE INDEX "_desktop_nav_children_v_order_idx" ON "_desktop_nav_children_v" USING btree ("_order");
  CREATE INDEX "_desktop_nav_children_v_parent_id_idx" ON "_desktop_nav_children_v" USING btree ("_parent_id");
  CREATE INDEX "_desktop_nav_children_v_icon_idx" ON "_desktop_nav_children_v" USING btree ("icon_id");

  INSERT INTO "desktop_nav_children" ("_order", "_parent_id", "id", "label", "href")
  SELECT defaults.item_order, navigation.id, md5(navigation.id || ':' || defaults.href), defaults.label, defaults.href
  FROM "site_settings_desktop_navigation" navigation
  CROSS JOIN (VALUES (0, 'Аренда', '/prices'), (1, 'Тренировки', '/training'), (2, 'Тренеры', '/coaches')) AS defaults(item_order, label, href)
  WHERE navigation.href = '/prices'
    AND NOT EXISTS (SELECT 1 FROM "desktop_nav_children" child WHERE child."_parent_id" = navigation.id);

  INSERT INTO "_desktop_nav_children_v" ("_order", "_parent_id", "label", "href", "_uuid")
  SELECT defaults.item_order, navigation.id, defaults.label, defaults.href, md5(navigation.id::text || ':' || defaults.href)
  FROM "_site_settings_v_version_desktop_navigation" navigation
  CROSS JOIN (VALUES (0, 'Аренда', '/prices'), (1, 'Тренировки', '/training'), (2, 'Тренеры', '/coaches')) AS defaults(item_order, label, href)
  WHERE navigation.href = '/prices'
    AND NOT EXISTS (SELECT 1 FROM "_desktop_nav_children_v" child WHERE child."_parent_id" = navigation.id);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "desktop_nav_children" CASCADE;
  DROP TABLE "_desktop_nav_children_v" CASCADE;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_article_categories_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_article_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__article_categories_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__article_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_articles_home_position" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__articles_v_version_home_position" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_coaches_levels" AS ENUM('beginner', 'intermediate', 'medium', 'tournament', 'kids', 'all');
  CREATE TYPE "public"."enum_coaches_focus_areas" AS ENUM('technique', 'pair-tactics', 'tournament-prep', 'kids', 'fitness', 'beginner-start', 'groups', 'women');
  CREATE TYPE "public"."enum_coaches_language_codes" AS ENUM('RU', 'EN', 'LV', 'DE');
  CREATE TYPE "public"."enum_coaches_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."lead_type" AS ENUM('membership', 'gift', 'trial', 'consultation', 'other');
  CREATE TYPE "public"."enum_coaches_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_coaches_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__coaches_v_version_levels" AS ENUM('beginner', 'intermediate', 'medium', 'tournament', 'kids', 'all');
  CREATE TYPE "public"."enum__coaches_v_version_focus_areas" AS ENUM('technique', 'pair-tactics', 'tournament-prep', 'kids', 'fitness', 'beginner-start', 'groups', 'women');
  CREATE TYPE "public"."enum__coaches_v_version_language_codes" AS ENUM('RU', 'EN', 'LV', 'DE');
  CREATE TYPE "public"."enum__coaches_v_version_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__coaches_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__coaches_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_courts_metrics_icon" AS ENUM('PanelTop', 'Lightbulb', 'Activity', 'Layers3');
  CREATE TYPE "public"."enum_courts_card_variant" AS ENUM('panoramic', 'metrics', 'damping', 'surface');
  CREATE TYPE "public"."enum_courts_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_courts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courts_v_version_metrics_icon" AS ENUM('PanelTop', 'Lightbulb', 'Activity', 'Layers3');
  CREATE TYPE "public"."enum__courts_v_version_card_variant" AS ENUM('panoramic', 'metrics', 'damping', 'surface');
  CREATE TYPE "public"."enum__courts_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__courts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_rental_rates_badge_tone" AS ENUM('lime', 'lime-soft', 'sunset', 'gold', 'muted', 'glass', 'outline-light');
  CREATE TYPE "public"."enum_rental_rates_card_variant" AS ENUM('rate', 'trial', 'standards');
  CREATE TYPE "public"."enum_rental_rates_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum_rental_rates_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_rental_rates_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__rental_rates_v_version_badge_tone" AS ENUM('lime', 'lime-soft', 'sunset', 'gold', 'muted', 'glass', 'outline-light');
  CREATE TYPE "public"."enum__rental_rates_v_version_card_variant" AS ENUM('rate', 'trial', 'standards');
  CREATE TYPE "public"."enum__rental_rates_v_version_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum__rental_rates_v_version_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__rental_rates_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_training_programs_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum_training_programs_icon" AS ENUM('User', 'Users', 'Baby');
  CREATE TYPE "public"."enum_training_programs_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_training_programs_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_training_programs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__training_programs_v_version_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum__training_programs_v_version_icon" AS ENUM('User', 'Users', 'Baby');
  CREATE TYPE "public"."enum__training_programs_v_version_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__training_programs_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__training_programs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_memberships_badge_tone" AS ENUM('lime', 'lime-soft', 'sunset', 'gold', 'muted', 'glass', 'outline-light');
  CREATE TYPE "public"."enum_memberships_card_variant" AS ENUM('gift', 'package', 'featured-package', 'resident');
  CREATE TYPE "public"."enum_memberships_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum_memberships_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_memberships_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__memberships_v_version_badge_tone" AS ENUM('lime', 'lime-soft', 'sunset', 'gold', 'muted', 'glass', 'outline-light');
  CREATE TYPE "public"."enum__memberships_v_version_card_variant" AS ENUM('gift', 'package', 'featured-package', 'resident');
  CREATE TYPE "public"."enum__memberships_v_version_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum__memberships_v_version_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__memberships_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tournaments_category_key" AS ENUM('club-game', 'mens-league', 'womens-open', 'junior', 'open');
  CREATE TYPE "public"."enum_tournaments_lifecycle" AS ENUM('upcoming', 'active', 'finished', 'cancelled');
  CREATE TYPE "public"."enum_tournaments_format_key" AS ENUM('americano', 'groups-knockout', 'round-robin-playoff', 'other');
  CREATE TYPE "public"."enum_tournaments_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_tournaments_visual_style" AS ENUM('image', 'mesh');
  CREATE TYPE "public"."enum_tournaments_image_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum_tournaments_mesh_style" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum_tournaments_icon" AS ENUM('PartyPopper', 'Trophy', 'Medal');
  CREATE TYPE "public"."enum_tournaments_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_tournaments_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tournaments_v_version_category_key" AS ENUM('club-game', 'mens-league', 'womens-open', 'junior', 'open');
  CREATE TYPE "public"."enum__tournaments_v_version_lifecycle" AS ENUM('upcoming', 'active', 'finished', 'cancelled');
  CREATE TYPE "public"."enum__tournaments_v_version_format_key" AS ENUM('americano', 'groups-knockout', 'round-robin-playoff', 'other');
  CREATE TYPE "public"."enum__tournaments_v_version_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__tournaments_v_version_visual_style" AS ENUM('image', 'mesh');
  CREATE TYPE "public"."enum__tournaments_v_version_image_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum__tournaments_v_version_mesh_style" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum__tournaments_v_version_icon" AS ENUM('PartyPopper', 'Trophy', 'Medal');
  CREATE TYPE "public"."enum__tournaments_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__tournaments_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_gallery_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__gallery_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reviews_source" AS ENUM('club', 'yandex', 'other');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__reviews_v_version_source" AS ENUM('club', 'yandex', 'other');
  CREATE TYPE "public"."enum__reviews_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_faqs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faqs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_partners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_leads_type" AS ENUM('membership', 'gift', 'trial', 'consultation', 'other');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'converted', 'rejected');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_homepage_sections_section" AS ENUM('hero', 'benefits', 'offers', 'courts', 'pricing', 'coaches', 'methodist-banner', 'tournaments', 'gallery', 'blog', 'reviews-faq');
  CREATE TYPE "public"."enum_homepage_benefits_section_cards_variant" AS ENUM('parking', 'lockers', 'shower', 'chill', 'online-booking', 'coaches-metric', 'kids-wide');
  CREATE TYPE "public"."enum_homepage_benefits_section_cards_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum_homepage_benefits_section_cards_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum_homepage_benefits_section_cards_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_homepage_offers_section_cards_variant" AS ENUM('tournament-venue', 'event');
  CREATE TYPE "public"."enum_homepage_offers_section_cards_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum_homepage_offers_section_cards_icon" AS ENUM('Trophy', 'PartyPopper');
  CREATE TYPE "public"."enum_homepage_offers_section_cards_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_homepage_hero_primary_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_homepage_hero_secondary_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_homepage_pricing_section_default_tab" AS ENUM('rent', 'training', 'memberships');
  CREATE TYPE "public"."enum_homepage_methodist_banner_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum_homepage_methodist_banner_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_homepage_gallery_section_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_homepage_blog_section_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_homepage_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_sections_section" AS ENUM('hero', 'benefits', 'offers', 'courts', 'pricing', 'coaches', 'methodist-banner', 'tournaments', 'gallery', 'blog', 'reviews-faq');
  CREATE TYPE "public"."enum__homepage_v_version_benefits_section_cards_variant" AS ENUM('parking', 'lockers', 'shower', 'chill', 'online-booking', 'coaches-metric', 'kids-wide');
  CREATE TYPE "public"."enum__homepage_v_version_benefits_section_cards_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum__homepage_v_version_benefits_section_cards_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum__homepage_v_version_benefits_section_cards_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__homepage_v_version_offers_section_cards_variant" AS ENUM('tournament-venue', 'event');
  CREATE TYPE "public"."enum__homepage_v_version_offers_section_cards_overlay" AS ENUM('overlay-lime', 'overlay-blue', 'overlay-cyan', 'overlay-violet', 'overlay-sunset', 'overlay-emerald', 'overlay-dark');
  CREATE TYPE "public"."enum__homepage_v_version_offers_section_cards_icon" AS ENUM('Trophy', 'PartyPopper');
  CREATE TYPE "public"."enum__homepage_v_version_offers_section_cards_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__homepage_v_version_hero_primary_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__homepage_v_version_hero_secondary_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__homepage_v_version_pricing_section_default_tab" AS ENUM('rent', 'training', 'memberships');
  CREATE TYPE "public"."enum__homepage_v_version_methodist_banner_mesh_tone" AS ENUM('indigo', 'deep-blue', 'dark', 'lime', 'lime-soft', 'sky', 'lavender', 'sunset', 'navy-gold');
  CREATE TYPE "public"."enum__homepage_v_version_methodist_banner_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__homepage_v_version_gallery_section_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__homepage_v_version_blog_section_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__homepage_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_blog_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_blog_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__blog_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_coaches_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_coaches_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__coaches_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__coaches_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tournaments_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_tournaments_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tournaments_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__tournaments_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_prices_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_prices_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__prices_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__prices_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_training_page_blocks_icon" AS ENUM('Target', 'Calendar', 'TrendingUp', 'Users');
  CREATE TYPE "public"."enum_training_page_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum_training_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_training_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__training_page_v_version_blocks_icon" AS ENUM('Target', 'Calendar', 'TrendingUp', 'Users');
  CREATE TYPE "public"."enum__training_page_v_version_action_mode" AS ENUM('none', 'booking', 'trial-booking', 'internal-link', 'external-link', 'phone', 'email', 'lead-form');
  CREATE TYPE "public"."enum__training_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__training_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_courts_page_metrics_icon" AS ENUM('Layers3', 'PanelTop', 'Lightbulb', 'Thermometer');
  CREATE TYPE "public"."enum_courts_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_courts_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courts_page_v_version_metrics_icon" AS ENUM('Layers3', 'PanelTop', 'Lightbulb', 'Thermometer');
  CREATE TYPE "public"."enum__courts_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__courts_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_gallery_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_gallery_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__gallery_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__gallery_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_about_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_about_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__about_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_contacts_page_arrival_notes_icon" AS ENUM('Car', 'Train', 'Clock', 'MapPin');
  CREATE TYPE "public"."enum_contacts_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_contacts_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contacts_page_v_version_arrival_notes_icon" AS ENUM('Car', 'Train', 'Clock', 'MapPin');
  CREATE TYPE "public"."enum__contacts_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__contacts_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_policy_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_policy_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__policy_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__policy_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_oferta_page_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum_oferta_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__oferta_page_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow', 'noindex-nofollow');
  CREATE TYPE "public"."enum__oferta_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_mobile_navigation_icon" AS ENUM('Home', 'Dumbbell', 'Tag');
  CREATE TYPE "public"."enum_site_settings_footer_navigation_column" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_site_settings_social_links_provider" AS ENUM('telegram', 'vk', 'instagram', 'video');
  CREATE TYPE "public"."enum_site_settings_analytics_mode" AS ENUM('disabled', 'consent-required', 'first-party');
  CREATE TYPE "public"."enum_site_settings_booking_mode" AS ENUM('disabled', 'external-link', 'provider-adapter');
  CREATE TYPE "public"."enum_site_settings_booking_provider_adapter" AS ENUM('vivacrm', 'lunda', 'padel-app');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_mobile_navigation_icon" AS ENUM('Home', 'Dumbbell', 'Tag');
  CREATE TYPE "public"."enum__site_settings_v_version_footer_navigation_column" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__site_settings_v_version_social_links_provider" AS ENUM('telegram', 'vk', 'instagram', 'video');
  CREATE TYPE "public"."enum__site_settings_v_version_analytics_mode" AS ENUM('disabled', 'consent-required', 'first-party');
  CREATE TYPE "public"."enum__site_settings_v_version_booking_mode" AS ENUM('disabled', 'external-link', 'provider-adapter');
  CREATE TYPE "public"."enum__site_settings_v_version_booking_provider_adapter" AS ENUM('vivacrm', 'lunda', 'padel-app');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_key" varchar,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"usage_rights" varchar,
  	"source_u_r_l" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "article_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_article_categories_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"slug" varchar,
  	"seed_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_article_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_article_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__article_categories_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version_slug" varchar,
  	"version_seed_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__article_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category_id" integer,
  	"excerpt" varchar,
  	"content" jsonb,
  	"preview_image_id" integer,
  	"reading_time_minutes" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_articles_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"slug" varchar,
  	"seed_key" varchar,
  	"home_position" "enum_articles_home_position",
  	"published_at" timestamp(3) with time zone,
  	"popularity_score" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_category_id" integer,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_preview_image_id" integer,
  	"version_reading_time_minutes" numeric,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__articles_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version_slug" varchar,
  	"version_seed_key" varchar,
  	"version_home_position" "enum__articles_v_version_home_position",
  	"version_published_at" timestamp(3) with time zone,
  	"version_popularity_score" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "coaches_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_coaches_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "coaches_focus_areas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_coaches_focus_areas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "coaches_language_codes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_coaches_language_codes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "coaches_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "coaches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"photo_id" integer,
  	"specialization" varchar,
  	"bio" varchar,
  	"level" varchar,
  	"experience" varchar,
  	"languages" varchar,
  	"rating" numeric,
  	"reviews_count" numeric,
  	"price_from" numeric,
  	"action_label" varchar,
  	"action_mode" "enum_coaches_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_coaches_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"slug" varchar,
  	"seed_key" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_coaches_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_coaches_v_version_levels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__coaches_v_version_levels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_coaches_v_version_focus_areas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__coaches_v_version_focus_areas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_coaches_v_version_language_codes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__coaches_v_version_language_codes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_coaches_v_version_certificates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_coaches_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_photo_id" integer,
  	"version_specialization" varchar,
  	"version_bio" varchar,
  	"version_level" varchar,
  	"version_experience" varchar,
  	"version_languages" varchar,
  	"version_rating" numeric,
  	"version_reviews_count" numeric,
  	"version_price_from" numeric,
  	"version_action_label" varchar,
  	"version_action_mode" "enum__coaches_v_version_action_mode" DEFAULT 'none',
  	"version_action_href" varchar,
  	"version_action_lead_type" "lead_type",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__coaches_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version_slug" varchar,
  	"version_seed_key" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__coaches_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "courts_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"icon" "enum_courts_metrics_icon"
  );
  
  CREATE TABLE "courts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"eyebrow" varchar,
  	"description" varchar,
  	"card_variant" "enum_courts_card_variant",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_courts_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"slug" varchar,
  	"seed_key" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_courts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_courts_v_version_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"icon" "enum__courts_v_version_metrics_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_eyebrow" varchar,
  	"version_description" varchar,
  	"version_card_variant" "enum__courts_v_version_card_variant",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__courts_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version_slug" varchar,
  	"version_seed_key" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__courts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "rental_rates_included_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "rental_rates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_key" varchar,
  	"title" varchar,
  	"eyebrow" varchar,
  	"time_label" varchar,
  	"description" varchar,
  	"price" numeric,
  	"price_label" varchar,
  	"price_suffix" varchar DEFAULT '/ час',
  	"badge" varchar,
  	"badge_tone" "enum_rental_rates_badge_tone",
  	"card_variant" "enum_rental_rates_card_variant",
  	"mesh_tone" "enum_rental_rates_mesh_tone",
  	"action_label" varchar,
  	"action_mode" "enum_rental_rates_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_rental_rates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_rental_rates_v_version_included_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_rental_rates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seed_key" varchar,
  	"version_title" varchar,
  	"version_eyebrow" varchar,
  	"version_time_label" varchar,
  	"version_description" varchar,
  	"version_price" numeric,
  	"version_price_label" varchar,
  	"version_price_suffix" varchar DEFAULT '/ час',
  	"version_badge" varchar,
  	"version_badge_tone" "enum__rental_rates_v_version_badge_tone",
  	"version_card_variant" "enum__rental_rates_v_version_card_variant",
  	"version_mesh_tone" "enum__rental_rates_v_version_mesh_tone",
  	"version_action_label" varchar,
  	"version_action_mode" "enum__rental_rates_v_version_action_mode" DEFAULT 'none',
  	"version_action_href" varchar,
  	"version_action_lead_type" "lead_type",
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__rental_rates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "training_programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"badge" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"overlay" "enum_training_programs_overlay",
  	"icon" "enum_training_programs_icon",
  	"price_from" numeric,
  	"action_label" varchar,
  	"action_mode" "enum_training_programs_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_training_programs_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"slug" varchar,
  	"seed_key" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_training_programs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_training_programs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_badge" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_overlay" "enum__training_programs_v_version_overlay",
  	"version_icon" "enum__training_programs_v_version_icon",
  	"version_price_from" numeric,
  	"version_action_label" varchar,
  	"version_action_mode" "enum__training_programs_v_version_action_mode" DEFAULT 'none',
  	"version_action_href" varchar,
  	"version_action_lead_type" "lead_type",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__training_programs_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version_slug" varchar,
  	"version_seed_key" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__training_programs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "memberships_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_key" varchar,
  	"title" varchar,
  	"badge" varchar,
  	"badge_tone" "enum_memberships_badge_tone",
  	"description" varchar,
  	"card_variant" "enum_memberships_card_variant",
  	"mesh_tone" "enum_memberships_mesh_tone",
  	"price" numeric,
  	"old_price" numeric,
  	"price_label" varchar,
  	"gift_amount_limits_minimum" numeric DEFAULT 1000,
  	"gift_amount_limits_maximum" numeric DEFAULT 100000,
  	"action_label" varchar,
  	"action_mode" "enum_memberships_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_memberships_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_memberships_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_memberships_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seed_key" varchar,
  	"version_title" varchar,
  	"version_badge" varchar,
  	"version_badge_tone" "enum__memberships_v_version_badge_tone",
  	"version_description" varchar,
  	"version_card_variant" "enum__memberships_v_version_card_variant",
  	"version_mesh_tone" "enum__memberships_v_version_mesh_tone",
  	"version_price" numeric,
  	"version_old_price" numeric,
  	"version_price_label" varchar,
  	"version_gift_amount_limits_minimum" numeric DEFAULT 1000,
  	"version_gift_amount_limits_maximum" numeric DEFAULT 100000,
  	"version_action_label" varchar,
  	"version_action_mode" "enum__memberships_v_version_action_mode" DEFAULT 'none',
  	"version_action_href" varchar,
  	"version_action_lead_type" "lead_type",
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__memberships_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "tournaments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category" varchar,
  	"category_key" "enum_tournaments_category_key",
  	"lifecycle" "enum_tournaments_lifecycle" DEFAULT 'upcoming',
  	"schedule_label" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"format" varchar,
  	"format_key" "enum_tournaments_format_key",
  	"entry_fee" varchar,
  	"description" varchar,
  	"prize_label" varchar,
  	"prize" varchar,
  	"action_label" varchar,
  	"action_mode" "enum_tournaments_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"visual_style" "enum_tournaments_visual_style" DEFAULT 'mesh',
  	"image_id" integer,
  	"image_overlay" "enum_tournaments_image_overlay" DEFAULT 'overlay-dark',
  	"mesh_style" "enum_tournaments_mesh_style" DEFAULT 'deep-blue',
  	"icon" "enum_tournaments_icon" DEFAULT 'Trophy',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_tournaments_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"slug" varchar,
  	"seed_key" varchar,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tournaments_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_tournaments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_category" varchar,
  	"version_category_key" "enum__tournaments_v_version_category_key",
  	"version_lifecycle" "enum__tournaments_v_version_lifecycle" DEFAULT 'upcoming',
  	"version_schedule_label" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_format" varchar,
  	"version_format_key" "enum__tournaments_v_version_format_key",
  	"version_entry_fee" varchar,
  	"version_description" varchar,
  	"version_prize_label" varchar,
  	"version_prize" varchar,
  	"version_action_label" varchar,
  	"version_action_mode" "enum__tournaments_v_version_action_mode" DEFAULT 'none',
  	"version_action_href" varchar,
  	"version_action_lead_type" "lead_type",
  	"version_visual_style" "enum__tournaments_v_version_visual_style" DEFAULT 'mesh',
  	"version_image_id" integer,
  	"version_image_overlay" "enum__tournaments_v_version_image_overlay" DEFAULT 'overlay-dark',
  	"version_mesh_style" "enum__tournaments_v_version_mesh_style" DEFAULT 'deep-blue',
  	"version_icon" "enum__tournaments_v_version_icon" DEFAULT 'Trophy',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__tournaments_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version_slug" varchar,
  	"version_seed_key" varchar,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tournaments_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "gallery_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_key" varchar,
  	"title" varchar,
  	"media_id" integer,
  	"caption" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"gallery_page_order" numeric,
  	"show_on_courts_page" boolean DEFAULT false,
  	"courts_page_order" numeric,
  	"show_on_about_page" boolean DEFAULT false,
  	"about_page_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_gallery_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_gallery_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seed_key" varchar,
  	"version_title" varchar,
  	"version_media_id" integer,
  	"version_caption" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_gallery_page_order" numeric,
  	"version_show_on_courts_page" boolean DEFAULT false,
  	"version_courts_page_order" numeric,
  	"version_show_on_about_page" boolean DEFAULT false,
  	"version_about_page_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__gallery_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_key" varchar,
  	"author_name" varchar,
  	"author_meta" varchar,
  	"avatar_id" integer,
  	"rating" numeric,
  	"text" varchar,
  	"source" "enum_reviews_source" DEFAULT 'club',
  	"source_u_r_l" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_reviews_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_reviews_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seed_key" varchar,
  	"version_author_name" varchar,
  	"version_author_meta" varchar,
  	"version_avatar_id" integer,
  	"version_rating" numeric,
  	"version_text" varchar,
  	"version_source" "enum__reviews_v_version_source" DEFAULT 'club',
  	"version_source_u_r_l" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__reviews_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_key" varchar,
  	"question" varchar,
  	"answer" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_faqs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_faqs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seed_key" varchar,
  	"version_question" varchar,
  	"version_answer" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__faqs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_key" varchar,
  	"name" varchar,
  	"logo_id" integer,
  	"website_u_r_l" varchar,
  	"is_active" boolean DEFAULT true,
  	"show_on_homepage" boolean DEFAULT false,
  	"homepage_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_partners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_partners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seed_key" varchar,
  	"version_name" varchar,
  	"version_logo_id" integer,
  	"version_website_u_r_l" varchar,
  	"version_is_active" boolean DEFAULT true,
  	"version_show_on_homepage" boolean DEFAULT false,
  	"version_homepage_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__partners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_leads_type" NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"telegram" varchar,
  	"comment" varchar,
  	"source_page" varchar NOT NULL,
  	"source_entity" varchar,
  	"idempotency_key" varchar NOT NULL,
  	"analytics_anonymous_id" varchar,
  	"analytics_session_id" varchar,
  	"analytics_channel" varchar,
  	"analytics_device" varchar,
  	"analytics_language" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "analytics_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" varchar NOT NULL,
  	"schema_version" numeric NOT NULL,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"received_at" timestamp(3) with time zone NOT NULL,
  	"anonymous_id" varchar NOT NULL,
  	"session_id" varchar NOT NULL,
  	"page_view_id" varchar,
  	"name" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"title" varchar,
  	"language" varchar,
  	"object_type" varchar,
  	"object_id" varchar,
  	"action_kind" varchar,
  	"form_type" varchar,
  	"step" numeric,
  	"value" numeric,
  	"metric_name" varchar,
  	"consent_state" varchar NOT NULL,
  	"channel" varchar,
  	"source" varchar,
  	"medium" varchar,
  	"campaign" varchar,
  	"content" varchar,
  	"term" varchar,
  	"referrer_domain" varchar,
  	"click_id_type" varchar,
  	"click_id" varchar,
  	"first_channel" varchar,
  	"first_source" varchar,
  	"first_medium" varchar,
  	"first_campaign" varchar,
  	"device" varchar,
  	"browser" varchar,
  	"os" varchar,
  	"os_version" varchar,
  	"is_bot" boolean DEFAULT false,
  	"lead_id" integer
  );
  
  CREATE TABLE "analytics_browsers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"anonymous_id" varchar NOT NULL,
  	"first_seen_at" timestamp(3) with time zone NOT NULL,
  	"last_seen_at" timestamp(3) with time zone NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"first_source_captured_at" timestamp(3) with time zone,
  	"first_channel" varchar,
  	"first_source" varchar,
  	"first_medium" varchar,
  	"first_campaign" varchar
  );
  
  CREATE TABLE "analytics_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" varchar NOT NULL,
  	"anonymous_id" varchar NOT NULL,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"last_activity_at" timestamp(3) with time zone NOT NULL,
  	"ended_at" timestamp(3) with time zone NOT NULL,
  	"channel" varchar,
  	"source" varchar,
  	"medium" varchar,
  	"campaign" varchar,
  	"device" varchar,
  	"language" varchar,
  	"os" varchar,
  	"os_version" varchar,
  	"has_target_action" boolean DEFAULT false
  );
  
  CREATE TABLE "analytics_daily" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"aggregate_key" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"event_name" varchar NOT NULL,
  	"path" varchar,
  	"object_type" varchar,
  	"object_id" varchar,
  	"action_kind" varchar,
  	"form_type" varchar,
  	"channel" varchar,
  	"source" varchar,
  	"medium" varchar,
  	"campaign" varchar,
  	"referrer_domain" varchar,
  	"first_channel" varchar,
  	"first_source" varchar,
  	"first_medium" varchar,
  	"first_campaign" varchar,
  	"device" varchar,
  	"language" varchar,
  	"visitor_type" varchar,
  	"os" varchar,
  	"os_version" varchar,
  	"event_count" numeric NOT NULL,
  	"active_ms" numeric NOT NULL,
  	"exact_lead_count" numeric NOT NULL,
  	"browser_hll" varchar NOT NULL,
  	"session_hll" varchar NOT NULL,
  	"raw_event_count" numeric NOT NULL,
  	"verified_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"article_categories_id" integer,
  	"articles_id" integer,
  	"coaches_id" integer,
  	"courts_id" integer,
  	"rental_rates_id" integer,
  	"training_programs_id" integer,
  	"memberships_id" integer,
  	"tournaments_id" integer,
  	"gallery_items_id" integer,
  	"reviews_id" integer,
  	"faqs_id" integer,
  	"partners_id" integer,
  	"leads_id" integer,
  	"analytics_events_id" integer,
  	"analytics_browsers_id" integer,
  	"analytics_sessions_id" integer,
  	"analytics_daily_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_homepage_sections_section",
  	"visible" boolean DEFAULT true
  );
  
  CREATE TABLE "homepage_hero_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "homepage_benefits_section_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_homepage_benefits_section_cards_variant",
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"supporting_text" varchar,
  	"media_id" integer,
  	"overlay" "enum_homepage_benefits_section_cards_overlay",
  	"mesh_tone" "enum_homepage_benefits_section_cards_mesh_tone",
  	"action_label" varchar,
  	"action_mode" "enum_homepage_benefits_section_cards_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type"
  );
  
  CREATE TABLE "homepage_offers_section_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_homepage_offers_section_cards_variant",
  	"badge" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"overlay" "enum_homepage_offers_section_cards_overlay",
  	"icon" "enum_homepage_offers_section_cards_icon",
  	"action_label" varchar,
  	"action_mode" "enum_homepage_offers_section_cards_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type"
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"hero_title_line" varchar DEFAULT 'Первая тренировка',
  	"hero_title_connector" varchar DEFAULT 'за',
  	"hero_title_accent" varchar DEFAULT '1 990 ₽',
  	"hero_description" varchar DEFAULT 'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.',
  	"hero_desktop_media_id" integer,
  	"hero_desktop_video_poster_id" integer,
  	"hero_mobile_media_id" integer,
  	"hero_mobile_video_poster_id" integer,
  	"hero_primary_action_label" varchar,
  	"hero_primary_action_mode" "enum_homepage_hero_primary_action_mode" DEFAULT 'none',
  	"hero_primary_action_href" varchar,
  	"hero_primary_action_lead_type" "lead_type",
  	"hero_secondary_action_label" varchar,
  	"hero_secondary_action_mode" "enum_homepage_hero_secondary_action_mode" DEFAULT 'none',
  	"hero_secondary_action_href" varchar,
  	"hero_secondary_action_lead_type" "lead_type",
  	"hero_social_proof_rating_label" varchar DEFAULT '4.9 · 500+ игроков',
  	"hero_social_proof_caption" varchar DEFAULT 'Рейтинг клуба на Новой Риге',
  	"benefits_section_eyebrow" varchar DEFAULT 'Преимущества клуба',
  	"benefits_section_title" varchar DEFAULT 'Всё для игры и отдыха',
  	"courts_section_title_line_one" varchar DEFAULT 'Инженерный подход',
  	"courts_section_title_line_two" varchar DEFAULT 'к каждой детали корта',
  	"courts_section_background_media_id" integer,
  	"courts_section_background_alt" varchar DEFAULT 'Панорамные корты Unlim Riga Padel',
  	"pricing_section_eyebrow" varchar DEFAULT 'Тарифы',
  	"pricing_section_title" varchar DEFAULT 'Цены и абонементы',
  	"pricing_section_default_tab" "enum_homepage_pricing_section_default_tab" DEFAULT 'rent',
  	"pricing_section_rent_tab_label" varchar DEFAULT 'Аренда',
  	"pricing_section_training_tab_label" varchar DEFAULT 'Тренировки',
  	"pricing_section_memberships_tab_label" varchar DEFAULT 'Абонементы',
  	"methodist_banner_title" varchar DEFAULT 'Не знаете, с чего начать или какого тренера выбрать?',
  	"methodist_banner_description" varchar DEFAULT 'Наш старший методист подберёт программу и напарников по вашему спортивному бэкграунду — бесплатная консультация занимает 10 минут.',
  	"methodist_banner_decorative_media_id" integer,
  	"methodist_banner_mesh_tone" "enum_homepage_methodist_banner_mesh_tone" DEFAULT 'lavender',
  	"methodist_banner_action_label" varchar,
  	"methodist_banner_action_mode" "enum_homepage_methodist_banner_action_mode" DEFAULT 'none',
  	"methodist_banner_action_href" varchar,
  	"methodist_banner_action_lead_type" "lead_type",
  	"coaches_section_eyebrow" varchar DEFAULT 'Команда',
  	"coaches_section_title" varchar DEFAULT 'Тренеры',
  	"tournaments_section_eyebrow" varchar DEFAULT 'Соревнования',
  	"tournaments_section_title" varchar DEFAULT 'Турниры и лиги',
  	"gallery_section_eyebrow" varchar DEFAULT 'Сообщество',
  	"gallery_section_title" varchar DEFAULT 'Жизнь клуба',
  	"gallery_section_action_label" varchar,
  	"gallery_section_action_mode" "enum_homepage_gallery_section_action_mode" DEFAULT 'none',
  	"gallery_section_action_href" varchar,
  	"gallery_section_action_lead_type" "lead_type",
  	"blog_section_eyebrow" varchar DEFAULT 'Медиа',
  	"blog_section_title" varchar DEFAULT 'Блог и статьи',
  	"blog_section_action_label" varchar,
  	"blog_section_action_mode" "enum_homepage_blog_section_action_mode" DEFAULT 'none',
  	"blog_section_action_href" varchar,
  	"blog_section_action_lead_type" "lead_type",
  	"reviews_section_reviews_eyebrow" varchar DEFAULT 'Отзывы',
  	"reviews_section_reviews_title" varchar DEFAULT 'Что говорят игроки',
  	"reviews_section_faq_eyebrow" varchar DEFAULT 'Вопросы',
  	"reviews_section_faq_title" varchar DEFAULT 'Частые вопросы',
  	"reviews_section_external_rating_label" varchar DEFAULT '4.8 на Яндекс Картах',
  	"reviews_section_external_reviews_label" varchar DEFAULT '312 отзывов о клубе',
  	"reviews_section_external_reviews_u_r_l" varchar DEFAULT 'https://yandex.ru/maps',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_homepage_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"coaches_id" integer
  );
  
  CREATE TABLE "_homepage_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"section" "enum__homepage_v_version_sections_section",
  	"visible" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_hero_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_benefits_section_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__homepage_v_version_benefits_section_cards_variant",
  	"eyebrow" varchar,
  	"title" varchar,
  	"description" varchar,
  	"supporting_text" varchar,
  	"media_id" integer,
  	"overlay" "enum__homepage_v_version_benefits_section_cards_overlay",
  	"mesh_tone" "enum__homepage_v_version_benefits_section_cards_mesh_tone",
  	"action_label" varchar,
  	"action_mode" "enum__homepage_v_version_benefits_section_cards_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_offers_section_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__homepage_v_version_offers_section_cards_variant",
  	"badge" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"overlay" "enum__homepage_v_version_offers_section_cards_overlay",
  	"icon" "enum__homepage_v_version_offers_section_cards_icon",
  	"action_label" varchar,
  	"action_mode" "enum__homepage_v_version_offers_section_cards_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_hero_title_line" varchar DEFAULT 'Первая тренировка',
  	"version_hero_title_connector" varchar DEFAULT 'за',
  	"version_hero_title_accent" varchar DEFAULT '1 990 ₽',
  	"version_hero_description" varchar DEFAULT 'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.',
  	"version_hero_desktop_media_id" integer,
  	"version_hero_desktop_video_poster_id" integer,
  	"version_hero_mobile_media_id" integer,
  	"version_hero_mobile_video_poster_id" integer,
  	"version_hero_primary_action_label" varchar,
  	"version_hero_primary_action_mode" "enum__homepage_v_version_hero_primary_action_mode" DEFAULT 'none',
  	"version_hero_primary_action_href" varchar,
  	"version_hero_primary_action_lead_type" "lead_type",
  	"version_hero_secondary_action_label" varchar,
  	"version_hero_secondary_action_mode" "enum__homepage_v_version_hero_secondary_action_mode" DEFAULT 'none',
  	"version_hero_secondary_action_href" varchar,
  	"version_hero_secondary_action_lead_type" "lead_type",
  	"version_hero_social_proof_rating_label" varchar DEFAULT '4.9 · 500+ игроков',
  	"version_hero_social_proof_caption" varchar DEFAULT 'Рейтинг клуба на Новой Риге',
  	"version_benefits_section_eyebrow" varchar DEFAULT 'Преимущества клуба',
  	"version_benefits_section_title" varchar DEFAULT 'Всё для игры и отдыха',
  	"version_courts_section_title_line_one" varchar DEFAULT 'Инженерный подход',
  	"version_courts_section_title_line_two" varchar DEFAULT 'к каждой детали корта',
  	"version_courts_section_background_media_id" integer,
  	"version_courts_section_background_alt" varchar DEFAULT 'Панорамные корты Unlim Riga Padel',
  	"version_pricing_section_eyebrow" varchar DEFAULT 'Тарифы',
  	"version_pricing_section_title" varchar DEFAULT 'Цены и абонементы',
  	"version_pricing_section_default_tab" "enum__homepage_v_version_pricing_section_default_tab" DEFAULT 'rent',
  	"version_pricing_section_rent_tab_label" varchar DEFAULT 'Аренда',
  	"version_pricing_section_training_tab_label" varchar DEFAULT 'Тренировки',
  	"version_pricing_section_memberships_tab_label" varchar DEFAULT 'Абонементы',
  	"version_methodist_banner_title" varchar DEFAULT 'Не знаете, с чего начать или какого тренера выбрать?',
  	"version_methodist_banner_description" varchar DEFAULT 'Наш старший методист подберёт программу и напарников по вашему спортивному бэкграунду — бесплатная консультация занимает 10 минут.',
  	"version_methodist_banner_decorative_media_id" integer,
  	"version_methodist_banner_mesh_tone" "enum__homepage_v_version_methodist_banner_mesh_tone" DEFAULT 'lavender',
  	"version_methodist_banner_action_label" varchar,
  	"version_methodist_banner_action_mode" "enum__homepage_v_version_methodist_banner_action_mode" DEFAULT 'none',
  	"version_methodist_banner_action_href" varchar,
  	"version_methodist_banner_action_lead_type" "lead_type",
  	"version_coaches_section_eyebrow" varchar DEFAULT 'Команда',
  	"version_coaches_section_title" varchar DEFAULT 'Тренеры',
  	"version_tournaments_section_eyebrow" varchar DEFAULT 'Соревнования',
  	"version_tournaments_section_title" varchar DEFAULT 'Турниры и лиги',
  	"version_gallery_section_eyebrow" varchar DEFAULT 'Сообщество',
  	"version_gallery_section_title" varchar DEFAULT 'Жизнь клуба',
  	"version_gallery_section_action_label" varchar,
  	"version_gallery_section_action_mode" "enum__homepage_v_version_gallery_section_action_mode" DEFAULT 'none',
  	"version_gallery_section_action_href" varchar,
  	"version_gallery_section_action_lead_type" "lead_type",
  	"version_blog_section_eyebrow" varchar DEFAULT 'Медиа',
  	"version_blog_section_title" varchar DEFAULT 'Блог и статьи',
  	"version_blog_section_action_label" varchar,
  	"version_blog_section_action_mode" "enum__homepage_v_version_blog_section_action_mode" DEFAULT 'none',
  	"version_blog_section_action_href" varchar,
  	"version_blog_section_action_lead_type" "lead_type",
  	"version_reviews_section_reviews_eyebrow" varchar DEFAULT 'Отзывы',
  	"version_reviews_section_reviews_title" varchar DEFAULT 'Что говорят игроки',
  	"version_reviews_section_faq_eyebrow" varchar DEFAULT 'Вопросы',
  	"version_reviews_section_faq_title" varchar DEFAULT 'Частые вопросы',
  	"version_reviews_section_external_rating_label" varchar DEFAULT '4.8 на Яндекс Картах',
  	"version_reviews_section_external_reviews_label" varchar DEFAULT '312 отзывов о клубе',
  	"version_reviews_section_external_reviews_u_r_l" varchar DEFAULT 'https://yandex.ru/maps',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__homepage_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"coaches_id" integer
  );
  
  CREATE TABLE "blog_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_blog_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_blog_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_blog_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__blog_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__blog_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "coaches_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_coaches_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_coaches_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_coaches_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__coaches_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__coaches_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "tournaments_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_tournaments_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_tournaments_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_tournaments_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__tournaments_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__tournaments_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "prices_page_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb
  );
  
  CREATE TABLE "prices_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"rent_tab_label" varchar,
  	"training_tab_label" varchar,
  	"memberships_tab_label" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_prices_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_prices_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_prices_page_v_version_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_prices_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_rent_tab_label" varchar,
  	"version_training_tab_label" varchar,
  	"version_memberships_tab_label" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__prices_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__prices_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "training_page_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_training_page_blocks_icon"
  );
  
  CREATE TABLE "training_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"action_label" varchar,
  	"action_mode" "enum_training_page_action_mode" DEFAULT 'none',
  	"action_href" varchar,
  	"action_lead_type" "lead_type",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_training_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_training_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_training_page_v_version_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__training_page_v_version_blocks_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_training_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_action_label" varchar,
  	"version_action_mode" "enum__training_page_v_version_action_mode" DEFAULT 'none',
  	"version_action_href" varchar,
  	"version_action_lead_type" "lead_type",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__training_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__training_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "courts_page_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"icon" "enum_courts_page_metrics_icon"
  );
  
  CREATE TABLE "courts_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"infographic_title" varchar,
  	"infographic_copy" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_courts_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_courts_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_courts_page_v_version_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"icon" "enum__courts_page_v_version_metrics_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courts_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_infographic_title" varchar,
  	"version_infographic_copy" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__courts_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__courts_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "gallery_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_gallery_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_gallery_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_gallery_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__gallery_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__gallery_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "about_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"story" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_about_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_about_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_about_page_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_story" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__about_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__about_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "contacts_page_arrival_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum_contacts_page_arrival_notes_icon"
  );
  
  CREATE TABLE "contacts_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"directions_title" varchar,
  	"directions_text" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_contacts_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_contacts_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_contacts_page_v_version_arrival_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum__contacts_page_v_version_arrival_notes_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contacts_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_directions_title" varchar,
  	"version_directions_text" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__contacts_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__contacts_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "policy_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"notice" varchar,
  	"content" jsonb,
  	"approved" boolean DEFAULT false,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_policy_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_policy_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_policy_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_notice" varchar,
  	"version_content" jsonb,
  	"version_approved" boolean DEFAULT false,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__policy_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__policy_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "oferta_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"notice" varchar,
  	"content" jsonb,
  	"approved" boolean DEFAULT false,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_robots" "enum_oferta_page_seo_robots" DEFAULT 'index-follow',
  	"seo_social_image_id" integer,
  	"_status" "enum_oferta_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_oferta_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_notice" varchar,
  	"version_content" jsonb,
  	"version_approved" boolean DEFAULT false,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_robots" "enum__oferta_page_v_version_seo_robots" DEFAULT 'index-follow',
  	"version_seo_social_image_id" integer,
  	"version__status" "enum__oferta_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "site_settings_desktop_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings_mobile_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"icon" "enum_site_settings_mobile_navigation_icon"
  );
  
  CREATE TABLE "site_settings_mobile_menu_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings_footer_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings_footer_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"column" "enum_site_settings_footer_navigation_column" DEFAULT '1'
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" "enum_site_settings_social_links_provider",
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seed_version" varchar,
  	"brand_name" varchar DEFAULT 'UNLIM RIGA PADEL',
  	"brand_logo_id" integer,
  	"header_subtitle" varchar DEFAULT 'Новорижское шоссе 3к1',
  	"mobile_actions_play_label" varchar DEFAULT 'Играть',
  	"mobile_actions_menu_label" varchar DEFAULT 'Меню',
  	"mobile_actions_menu_title" varchar DEFAULT 'Меню',
  	"mobile_actions_quick_actions_title" varchar DEFAULT 'Быстрые действия',
  	"mobile_actions_book_court_label" varchar DEFAULT 'Забронировать корт',
  	"mobile_actions_call_label" varchar DEFAULT 'Позвонить в клуб',
  	"mobile_actions_directions_label" varchar DEFAULT 'Проложить маршрут',
  	"address" varchar DEFAULT 'Новорижское шоссе, 3к1',
  	"directions_u_r_l" varchar,
  	"address_label" varchar DEFAULT 'Адрес',
  	"transit_label" varchar DEFAULT 'Ближайшее метро',
  	"parking_label" varchar DEFAULT 'Парковка',
  	"opening_hours_label" varchar DEFAULT 'Режим работы',
  	"phone_field_label" varchar DEFAULT 'Телефон',
  	"email_field_label" varchar DEFAULT 'Email',
  	"phone_display" varchar DEFAULT '+7 999 000-00-00',
  	"phone_value" varchar DEFAULT '+79990000000',
  	"email" varchar DEFAULT 'hello@unlimriga.club',
  	"transit" varchar DEFAULT 'Мякинино · 12 мин пешком',
  	"parking" varchar DEFAULT '40 бесплатных мест у входа',
  	"opening_hours" varchar DEFAULT 'Ежедневно 07:00–00:00',
  	"map_latitude" numeric DEFAULT 55.8,
  	"map_longitude" numeric DEFAULT 37.15,
  	"map_zoom" numeric DEFAULT 14,
  	"footer_image_id" integer,
  	"footer_about" varchar DEFAULT 'Unlim Riga Padel — клуб для тех, кто хочет играть на кортах уровня мировых турниров рядом с домом. Мы строили пространство вокруг качества покрытия, работы тренеров и атмосферы, в которую хочется возвращаться.',
  	"legal_entity" varchar DEFAULT 'ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451',
  	"copyright" varchar DEFAULT '© 2026 Unlim Riga Padel. Все права защищены.',
  	"cookie_notice_text" varchar DEFAULT 'Используем cookies, чтобы бронирование и подбор тренировок работали быстрее.',
  	"cookie_notice_accept_label" varchar DEFAULT 'Принять',
  	"cookie_notice_reject_label" varchar DEFAULT 'Отклонить',
  	"cookie_notice_manage_label" varchar DEFAULT 'Настроить cookies',
  	"analytics_mode" "enum_site_settings_analytics_mode" DEFAULT 'consent-required',
  	"contact_confirmation_avatar_id" integer,
  	"contact_confirmation_dialog_title" varchar DEFAULT 'Связаться с клубом',
  	"contact_confirmation_cancel_label" varchar DEFAULT 'Отмена',
  	"contact_confirmation_continue_label" varchar DEFAULT 'Продолжить',
  	"contact_confirmation_form_title" varchar DEFAULT 'Оставить заявку',
  	"contact_confirmation_submit_label" varchar DEFAULT 'Отправить',
  	"contact_confirmation_success_title" varchar DEFAULT 'Заявка отправлена',
  	"contact_confirmation_success_text" varchar DEFAULT 'Администратор клуба свяжется с вами.',
  	"contact_confirmation_consent_label" varchar DEFAULT 'Согласие на обработку персональных данных (текст требует юридического согласования)',
  	"contact_confirmation_policy_href" varchar DEFAULT '/policy',
  	"contact_confirmation_phone_enabled" boolean DEFAULT true,
  	"contact_confirmation_email_enabled" boolean DEFAULT true,
  	"contact_confirmation_telegram_enabled" boolean DEFAULT true,
  	"contact_confirmation_vk_enabled" boolean DEFAULT true,
  	"booking_mode" "enum_site_settings_booking_mode" DEFAULT 'disabled',
  	"booking_external_u_r_l" varchar,
  	"booking_provider_adapter" "enum_site_settings_booking_provider_adapter",
  	"booking_provider_account_i_d" varchar,
  	"booking_credential_environment_variable" varchar,
  	"booking_button_label" varchar DEFAULT 'Забронировать',
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_desktop_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_mobile_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"icon" "enum__site_settings_v_version_mobile_navigation_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_mobile_menu_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_footer_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_footer_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"column" "enum__site_settings_v_version_footer_navigation_column" DEFAULT '1',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"provider" "enum__site_settings_v_version_social_links_provider",
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seed_version" varchar,
  	"version_brand_name" varchar DEFAULT 'UNLIM RIGA PADEL',
  	"version_brand_logo_id" integer,
  	"version_header_subtitle" varchar DEFAULT 'Новорижское шоссе 3к1',
  	"version_mobile_actions_play_label" varchar DEFAULT 'Играть',
  	"version_mobile_actions_menu_label" varchar DEFAULT 'Меню',
  	"version_mobile_actions_menu_title" varchar DEFAULT 'Меню',
  	"version_mobile_actions_quick_actions_title" varchar DEFAULT 'Быстрые действия',
  	"version_mobile_actions_book_court_label" varchar DEFAULT 'Забронировать корт',
  	"version_mobile_actions_call_label" varchar DEFAULT 'Позвонить в клуб',
  	"version_mobile_actions_directions_label" varchar DEFAULT 'Проложить маршрут',
  	"version_address" varchar DEFAULT 'Новорижское шоссе, 3к1',
  	"version_directions_u_r_l" varchar,
  	"version_address_label" varchar DEFAULT 'Адрес',
  	"version_transit_label" varchar DEFAULT 'Ближайшее метро',
  	"version_parking_label" varchar DEFAULT 'Парковка',
  	"version_opening_hours_label" varchar DEFAULT 'Режим работы',
  	"version_phone_field_label" varchar DEFAULT 'Телефон',
  	"version_email_field_label" varchar DEFAULT 'Email',
  	"version_phone_display" varchar DEFAULT '+7 999 000-00-00',
  	"version_phone_value" varchar DEFAULT '+79990000000',
  	"version_email" varchar DEFAULT 'hello@unlimriga.club',
  	"version_transit" varchar DEFAULT 'Мякинино · 12 мин пешком',
  	"version_parking" varchar DEFAULT '40 бесплатных мест у входа',
  	"version_opening_hours" varchar DEFAULT 'Ежедневно 07:00–00:00',
  	"version_map_latitude" numeric DEFAULT 55.8,
  	"version_map_longitude" numeric DEFAULT 37.15,
  	"version_map_zoom" numeric DEFAULT 14,
  	"version_footer_image_id" integer,
  	"version_footer_about" varchar DEFAULT 'Unlim Riga Padel — клуб для тех, кто хочет играть на кортах уровня мировых турниров рядом с домом. Мы строили пространство вокруг качества покрытия, работы тренеров и атмосферы, в которую хочется возвращаться.',
  	"version_legal_entity" varchar DEFAULT 'ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451',
  	"version_copyright" varchar DEFAULT '© 2026 Unlim Riga Padel. Все права защищены.',
  	"version_cookie_notice_text" varchar DEFAULT 'Используем cookies, чтобы бронирование и подбор тренировок работали быстрее.',
  	"version_cookie_notice_accept_label" varchar DEFAULT 'Принять',
  	"version_cookie_notice_reject_label" varchar DEFAULT 'Отклонить',
  	"version_cookie_notice_manage_label" varchar DEFAULT 'Настроить cookies',
  	"version_analytics_mode" "enum__site_settings_v_version_analytics_mode" DEFAULT 'consent-required',
  	"version_contact_confirmation_avatar_id" integer,
  	"version_contact_confirmation_dialog_title" varchar DEFAULT 'Связаться с клубом',
  	"version_contact_confirmation_cancel_label" varchar DEFAULT 'Отмена',
  	"version_contact_confirmation_continue_label" varchar DEFAULT 'Продолжить',
  	"version_contact_confirmation_form_title" varchar DEFAULT 'Оставить заявку',
  	"version_contact_confirmation_submit_label" varchar DEFAULT 'Отправить',
  	"version_contact_confirmation_success_title" varchar DEFAULT 'Заявка отправлена',
  	"version_contact_confirmation_success_text" varchar DEFAULT 'Администратор клуба свяжется с вами.',
  	"version_contact_confirmation_consent_label" varchar DEFAULT 'Согласие на обработку персональных данных (текст требует юридического согласования)',
  	"version_contact_confirmation_policy_href" varchar DEFAULT '/policy',
  	"version_contact_confirmation_phone_enabled" boolean DEFAULT true,
  	"version_contact_confirmation_email_enabled" boolean DEFAULT true,
  	"version_contact_confirmation_telegram_enabled" boolean DEFAULT true,
  	"version_contact_confirmation_vk_enabled" boolean DEFAULT true,
  	"version_booking_mode" "enum__site_settings_v_version_booking_mode" DEFAULT 'disabled',
  	"version_booking_external_u_r_l" varchar,
  	"version_booking_provider_adapter" "enum__site_settings_v_version_booking_provider_adapter",
  	"version_booking_provider_account_i_d" varchar,
  	"version_booking_credential_environment_variable" varchar,
  	"version_booking_button_label" varchar DEFAULT 'Забронировать',
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_parent_id_article_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_article_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_preview_image_id_media_id_fk" FOREIGN KEY ("version_preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaches_levels" ADD CONSTRAINT "coaches_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coaches_focus_areas" ADD CONSTRAINT "coaches_focus_areas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coaches_language_codes" ADD CONSTRAINT "coaches_language_codes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coaches_certificates" ADD CONSTRAINT "coaches_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coaches" ADD CONSTRAINT "coaches_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaches" ADD CONSTRAINT "coaches_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_coaches_v_version_levels" ADD CONSTRAINT "_coaches_v_version_levels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_coaches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_coaches_v_version_focus_areas" ADD CONSTRAINT "_coaches_v_version_focus_areas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_coaches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_coaches_v_version_language_codes" ADD CONSTRAINT "_coaches_v_version_language_codes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_coaches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_coaches_v_version_certificates" ADD CONSTRAINT "_coaches_v_version_certificates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_coaches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_coaches_v" ADD CONSTRAINT "_coaches_v_parent_id_coaches_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_coaches_v" ADD CONSTRAINT "_coaches_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_coaches_v" ADD CONSTRAINT "_coaches_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courts_metrics" ADD CONSTRAINT "courts_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courts" ADD CONSTRAINT "courts_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courts_v_version_metrics" ADD CONSTRAINT "_courts_v_version_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courts_v" ADD CONSTRAINT "_courts_v_parent_id_courts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courts_v" ADD CONSTRAINT "_courts_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rental_rates_included_items" ADD CONSTRAINT "rental_rates_included_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rental_rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rental_rates_v_version_included_items" ADD CONSTRAINT "_rental_rates_v_version_included_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rental_rates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rental_rates_v" ADD CONSTRAINT "_rental_rates_v_parent_id_rental_rates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rental_rates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_training_programs_v" ADD CONSTRAINT "_training_programs_v_parent_id_training_programs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."training_programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_training_programs_v" ADD CONSTRAINT "_training_programs_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_training_programs_v" ADD CONSTRAINT "_training_programs_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships_benefits" ADD CONSTRAINT "memberships_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_memberships_v_version_benefits" ADD CONSTRAINT "_memberships_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_memberships_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_memberships_v" ADD CONSTRAINT "_memberships_v_parent_id_memberships_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."memberships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tournaments_v" ADD CONSTRAINT "_tournaments_v_parent_id_tournaments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tournaments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tournaments_v" ADD CONSTRAINT "_tournaments_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tournaments_v" ADD CONSTRAINT "_tournaments_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gallery_items_v" ADD CONSTRAINT "_gallery_items_v_parent_id_gallery_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gallery_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gallery_items_v" ADD CONSTRAINT "_gallery_items_v_version_media_id_media_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_parent_id_reviews_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_parent_id_faqs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_parent_id_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coaches_fk" FOREIGN KEY ("coaches_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courts_fk" FOREIGN KEY ("courts_id") REFERENCES "public"."courts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rental_rates_fk" FOREIGN KEY ("rental_rates_id") REFERENCES "public"."rental_rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_training_programs_fk" FOREIGN KEY ("training_programs_id") REFERENCES "public"."training_programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_memberships_fk" FOREIGN KEY ("memberships_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tournaments_fk" FOREIGN KEY ("tournaments_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_items_fk" FOREIGN KEY ("gallery_items_id") REFERENCES "public"."gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_events_fk" FOREIGN KEY ("analytics_events_id") REFERENCES "public"."analytics_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_browsers_fk" FOREIGN KEY ("analytics_browsers_id") REFERENCES "public"."analytics_browsers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_sessions_fk" FOREIGN KEY ("analytics_sessions_id") REFERENCES "public"."analytics_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_daily_fk" FOREIGN KEY ("analytics_daily_id") REFERENCES "public"."analytics_daily"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections" ADD CONSTRAINT "homepage_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_stats" ADD CONSTRAINT "homepage_hero_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_benefits_section_cards" ADD CONSTRAINT "homepage_benefits_section_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_benefits_section_cards" ADD CONSTRAINT "homepage_benefits_section_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_offers_section_cards" ADD CONSTRAINT "homepage_offers_section_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_offers_section_cards" ADD CONSTRAINT "homepage_offers_section_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_desktop_media_id_media_id_fk" FOREIGN KEY ("hero_desktop_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_desktop_video_poster_id_media_id_fk" FOREIGN KEY ("hero_desktop_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_mobile_media_id_media_id_fk" FOREIGN KEY ("hero_mobile_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_mobile_video_poster_id_media_id_fk" FOREIGN KEY ("hero_mobile_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_courts_section_background_media_id_media_id_fk" FOREIGN KEY ("courts_section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_methodist_banner_decorative_media_id_media_id_fk" FOREIGN KEY ("methodist_banner_decorative_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_coaches_fk" FOREIGN KEY ("coaches_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections" ADD CONSTRAINT "_homepage_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_hero_stats" ADD CONSTRAINT "_homepage_v_version_hero_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_benefits_section_cards" ADD CONSTRAINT "_homepage_v_version_benefits_section_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_benefits_section_cards" ADD CONSTRAINT "_homepage_v_version_benefits_section_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_offers_section_cards" ADD CONSTRAINT "_homepage_v_version_offers_section_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_offers_section_cards" ADD CONSTRAINT "_homepage_v_version_offers_section_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_desktop_media_id_media_id_fk" FOREIGN KEY ("version_hero_desktop_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_desktop_video_poster_id_media_id_fk" FOREIGN KEY ("version_hero_desktop_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_mobile_media_id_media_id_fk" FOREIGN KEY ("version_hero_mobile_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_mobile_video_poster_id_media_id_fk" FOREIGN KEY ("version_hero_mobile_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_courts_section_background_media_id_media_id_fk" FOREIGN KEY ("version_courts_section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_methodist_banner_decorative_media_id_media_id_fk" FOREIGN KEY ("version_methodist_banner_decorative_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_coaches_fk" FOREIGN KEY ("coaches_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_page" ADD CONSTRAINT "blog_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_page_v" ADD CONSTRAINT "_blog_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaches_page" ADD CONSTRAINT "coaches_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_coaches_page_v" ADD CONSTRAINT "_coaches_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tournaments_page" ADD CONSTRAINT "tournaments_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tournaments_page_v" ADD CONSTRAINT "_tournaments_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prices_page_rules" ADD CONSTRAINT "prices_page_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prices_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prices_page" ADD CONSTRAINT "prices_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prices_page_v_version_rules" ADD CONSTRAINT "_prices_page_v_version_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_prices_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prices_page_v" ADD CONSTRAINT "_prices_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "training_page_blocks" ADD CONSTRAINT "training_page_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."training_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "training_page" ADD CONSTRAINT "training_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_training_page_v_version_blocks" ADD CONSTRAINT "_training_page_v_version_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_training_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_training_page_v" ADD CONSTRAINT "_training_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courts_page_metrics" ADD CONSTRAINT "courts_page_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courts_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courts_page" ADD CONSTRAINT "courts_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courts_page_v_version_metrics" ADD CONSTRAINT "_courts_page_v_version_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courts_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courts_page_v" ADD CONSTRAINT "_courts_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_page" ADD CONSTRAINT "gallery_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gallery_page_v" ADD CONSTRAINT "_gallery_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_stats" ADD CONSTRAINT "about_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_stats" ADD CONSTRAINT "_about_page_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v" ADD CONSTRAINT "_about_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts_page_arrival_notes" ADD CONSTRAINT "contacts_page_arrival_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacts_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts_page" ADD CONSTRAINT "contacts_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contacts_page_v_version_arrival_notes" ADD CONSTRAINT "_contacts_page_v_version_arrival_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contacts_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contacts_page_v" ADD CONSTRAINT "_contacts_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "policy_page" ADD CONSTRAINT "policy_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_policy_page_v" ADD CONSTRAINT "_policy_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "oferta_page" ADD CONSTRAINT "oferta_page_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_oferta_page_v" ADD CONSTRAINT "_oferta_page_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_desktop_navigation" ADD CONSTRAINT "site_settings_desktop_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_mobile_navigation" ADD CONSTRAINT "site_settings_mobile_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_mobile_menu_navigation" ADD CONSTRAINT "site_settings_mobile_menu_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_stats" ADD CONSTRAINT "site_settings_footer_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_navigation" ADD CONSTRAINT "site_settings_footer_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_legal_links" ADD CONSTRAINT "site_settings_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_logo_id_media_id_fk" FOREIGN KEY ("brand_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_footer_image_id_media_id_fk" FOREIGN KEY ("footer_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_contact_confirmation_avatar_id_media_id_fk" FOREIGN KEY ("contact_confirmation_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_desktop_navigation" ADD CONSTRAINT "_site_settings_v_version_desktop_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_mobile_navigation" ADD CONSTRAINT "_site_settings_v_version_mobile_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_mobile_menu_navigation" ADD CONSTRAINT "_site_settings_v_version_mobile_menu_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_footer_stats" ADD CONSTRAINT "_site_settings_v_version_footer_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_footer_navigation" ADD CONSTRAINT "_site_settings_v_version_footer_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_social_links" ADD CONSTRAINT "_site_settings_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_legal_links" ADD CONSTRAINT "_site_settings_v_version_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_brand_logo_id_media_id_fk" FOREIGN KEY ("version_brand_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_footer_image_id_media_id_fk" FOREIGN KEY ("version_footer_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_contact_confirmation_avatar_id_media_id_fk" FOREIGN KEY ("version_contact_confirmation_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "media_seed_key_idx" ON "media" USING btree ("seed_key");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "article_categories_title_idx" ON "article_categories" USING btree ("title");
  CREATE INDEX "article_categories_seo_seo_social_image_idx" ON "article_categories" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "article_categories_slug_idx" ON "article_categories" USING btree ("slug");
  CREATE UNIQUE INDEX "article_categories_seed_key_idx" ON "article_categories" USING btree ("seed_key");
  CREATE INDEX "article_categories_updated_at_idx" ON "article_categories" USING btree ("updated_at");
  CREATE INDEX "article_categories_created_at_idx" ON "article_categories" USING btree ("created_at");
  CREATE INDEX "article_categories__status_idx" ON "article_categories" USING btree ("_status");
  CREATE INDEX "_article_categories_v_parent_idx" ON "_article_categories_v" USING btree ("parent_id");
  CREATE INDEX "_article_categories_v_version_version_title_idx" ON "_article_categories_v" USING btree ("version_title");
  CREATE INDEX "_article_categories_v_version_seo_version_seo_social_ima_idx" ON "_article_categories_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_article_categories_v_version_version_slug_idx" ON "_article_categories_v" USING btree ("version_slug");
  CREATE INDEX "_article_categories_v_version_version_seed_key_idx" ON "_article_categories_v" USING btree ("version_seed_key");
  CREATE INDEX "_article_categories_v_version_version_updated_at_idx" ON "_article_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_article_categories_v_version_version_created_at_idx" ON "_article_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_article_categories_v_version_version__status_idx" ON "_article_categories_v" USING btree ("version__status");
  CREATE INDEX "_article_categories_v_created_at_idx" ON "_article_categories_v" USING btree ("created_at");
  CREATE INDEX "_article_categories_v_updated_at_idx" ON "_article_categories_v" USING btree ("updated_at");
  CREATE INDEX "_article_categories_v_latest_idx" ON "_article_categories_v" USING btree ("latest");
  CREATE INDEX "_article_categories_v_autosave_idx" ON "_article_categories_v" USING btree ("autosave");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_preview_image_idx" ON "articles" USING btree ("preview_image_id");
  CREATE INDEX "articles_seo_seo_social_image_idx" ON "articles" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE UNIQUE INDEX "articles_seed_key_idx" ON "articles" USING btree ("seed_key");
  CREATE UNIQUE INDEX "articles_home_position_idx" ON "articles" USING btree ("home_position");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_articles_v_version_version_preview_image_idx" ON "_articles_v" USING btree ("version_preview_image_id");
  CREATE INDEX "_articles_v_version_seo_version_seo_social_image_idx" ON "_articles_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_seed_key_idx" ON "_articles_v" USING btree ("version_seed_key");
  CREATE INDEX "_articles_v_version_version_home_position_idx" ON "_articles_v" USING btree ("version_home_position");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "coaches_levels_order_idx" ON "coaches_levels" USING btree ("order");
  CREATE INDEX "coaches_levels_parent_idx" ON "coaches_levels" USING btree ("parent_id");
  CREATE INDEX "coaches_focus_areas_order_idx" ON "coaches_focus_areas" USING btree ("order");
  CREATE INDEX "coaches_focus_areas_parent_idx" ON "coaches_focus_areas" USING btree ("parent_id");
  CREATE INDEX "coaches_language_codes_order_idx" ON "coaches_language_codes" USING btree ("order");
  CREATE INDEX "coaches_language_codes_parent_idx" ON "coaches_language_codes" USING btree ("parent_id");
  CREATE INDEX "coaches_certificates_order_idx" ON "coaches_certificates" USING btree ("_order");
  CREATE INDEX "coaches_certificates_parent_id_idx" ON "coaches_certificates" USING btree ("_parent_id");
  CREATE INDEX "coaches_photo_idx" ON "coaches" USING btree ("photo_id");
  CREATE INDEX "coaches_seo_seo_social_image_idx" ON "coaches" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "coaches_slug_idx" ON "coaches" USING btree ("slug");
  CREATE UNIQUE INDEX "coaches_seed_key_idx" ON "coaches" USING btree ("seed_key");
  CREATE UNIQUE INDEX "coaches_homepage_order_idx" ON "coaches" USING btree ("homepage_order");
  CREATE INDEX "coaches_updated_at_idx" ON "coaches" USING btree ("updated_at");
  CREATE INDEX "coaches_created_at_idx" ON "coaches" USING btree ("created_at");
  CREATE INDEX "coaches__status_idx" ON "coaches" USING btree ("_status");
  CREATE INDEX "_coaches_v_version_levels_order_idx" ON "_coaches_v_version_levels" USING btree ("order");
  CREATE INDEX "_coaches_v_version_levels_parent_idx" ON "_coaches_v_version_levels" USING btree ("parent_id");
  CREATE INDEX "_coaches_v_version_focus_areas_order_idx" ON "_coaches_v_version_focus_areas" USING btree ("order");
  CREATE INDEX "_coaches_v_version_focus_areas_parent_idx" ON "_coaches_v_version_focus_areas" USING btree ("parent_id");
  CREATE INDEX "_coaches_v_version_language_codes_order_idx" ON "_coaches_v_version_language_codes" USING btree ("order");
  CREATE INDEX "_coaches_v_version_language_codes_parent_idx" ON "_coaches_v_version_language_codes" USING btree ("parent_id");
  CREATE INDEX "_coaches_v_version_certificates_order_idx" ON "_coaches_v_version_certificates" USING btree ("_order");
  CREATE INDEX "_coaches_v_version_certificates_parent_id_idx" ON "_coaches_v_version_certificates" USING btree ("_parent_id");
  CREATE INDEX "_coaches_v_parent_idx" ON "_coaches_v" USING btree ("parent_id");
  CREATE INDEX "_coaches_v_version_version_photo_idx" ON "_coaches_v" USING btree ("version_photo_id");
  CREATE INDEX "_coaches_v_version_seo_version_seo_social_image_idx" ON "_coaches_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_coaches_v_version_version_slug_idx" ON "_coaches_v" USING btree ("version_slug");
  CREATE INDEX "_coaches_v_version_version_seed_key_idx" ON "_coaches_v" USING btree ("version_seed_key");
  CREATE INDEX "_coaches_v_version_version_homepage_order_idx" ON "_coaches_v" USING btree ("version_homepage_order");
  CREATE INDEX "_coaches_v_version_version_updated_at_idx" ON "_coaches_v" USING btree ("version_updated_at");
  CREATE INDEX "_coaches_v_version_version_created_at_idx" ON "_coaches_v" USING btree ("version_created_at");
  CREATE INDEX "_coaches_v_version_version__status_idx" ON "_coaches_v" USING btree ("version__status");
  CREATE INDEX "_coaches_v_created_at_idx" ON "_coaches_v" USING btree ("created_at");
  CREATE INDEX "_coaches_v_updated_at_idx" ON "_coaches_v" USING btree ("updated_at");
  CREATE INDEX "_coaches_v_latest_idx" ON "_coaches_v" USING btree ("latest");
  CREATE INDEX "_coaches_v_autosave_idx" ON "_coaches_v" USING btree ("autosave");
  CREATE INDEX "courts_metrics_order_idx" ON "courts_metrics" USING btree ("_order");
  CREATE INDEX "courts_metrics_parent_id_idx" ON "courts_metrics" USING btree ("_parent_id");
  CREATE INDEX "courts_seo_seo_social_image_idx" ON "courts" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "courts_slug_idx" ON "courts" USING btree ("slug");
  CREATE UNIQUE INDEX "courts_seed_key_idx" ON "courts" USING btree ("seed_key");
  CREATE UNIQUE INDEX "courts_homepage_order_idx" ON "courts" USING btree ("homepage_order");
  CREATE INDEX "courts_updated_at_idx" ON "courts" USING btree ("updated_at");
  CREATE INDEX "courts_created_at_idx" ON "courts" USING btree ("created_at");
  CREATE INDEX "courts__status_idx" ON "courts" USING btree ("_status");
  CREATE INDEX "_courts_v_version_metrics_order_idx" ON "_courts_v_version_metrics" USING btree ("_order");
  CREATE INDEX "_courts_v_version_metrics_parent_id_idx" ON "_courts_v_version_metrics" USING btree ("_parent_id");
  CREATE INDEX "_courts_v_parent_idx" ON "_courts_v" USING btree ("parent_id");
  CREATE INDEX "_courts_v_version_seo_version_seo_social_image_idx" ON "_courts_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_courts_v_version_version_slug_idx" ON "_courts_v" USING btree ("version_slug");
  CREATE INDEX "_courts_v_version_version_seed_key_idx" ON "_courts_v" USING btree ("version_seed_key");
  CREATE INDEX "_courts_v_version_version_homepage_order_idx" ON "_courts_v" USING btree ("version_homepage_order");
  CREATE INDEX "_courts_v_version_version_updated_at_idx" ON "_courts_v" USING btree ("version_updated_at");
  CREATE INDEX "_courts_v_version_version_created_at_idx" ON "_courts_v" USING btree ("version_created_at");
  CREATE INDEX "_courts_v_version_version__status_idx" ON "_courts_v" USING btree ("version__status");
  CREATE INDEX "_courts_v_created_at_idx" ON "_courts_v" USING btree ("created_at");
  CREATE INDEX "_courts_v_updated_at_idx" ON "_courts_v" USING btree ("updated_at");
  CREATE INDEX "_courts_v_latest_idx" ON "_courts_v" USING btree ("latest");
  CREATE INDEX "_courts_v_autosave_idx" ON "_courts_v" USING btree ("autosave");
  CREATE INDEX "rental_rates_included_items_order_idx" ON "rental_rates_included_items" USING btree ("_order");
  CREATE INDEX "rental_rates_included_items_parent_id_idx" ON "rental_rates_included_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rental_rates_seed_key_idx" ON "rental_rates" USING btree ("seed_key");
  CREATE UNIQUE INDEX "rental_rates_homepage_order_idx" ON "rental_rates" USING btree ("homepage_order");
  CREATE INDEX "rental_rates_updated_at_idx" ON "rental_rates" USING btree ("updated_at");
  CREATE INDEX "rental_rates_created_at_idx" ON "rental_rates" USING btree ("created_at");
  CREATE INDEX "rental_rates__status_idx" ON "rental_rates" USING btree ("_status");
  CREATE INDEX "_rental_rates_v_version_included_items_order_idx" ON "_rental_rates_v_version_included_items" USING btree ("_order");
  CREATE INDEX "_rental_rates_v_version_included_items_parent_id_idx" ON "_rental_rates_v_version_included_items" USING btree ("_parent_id");
  CREATE INDEX "_rental_rates_v_parent_idx" ON "_rental_rates_v" USING btree ("parent_id");
  CREATE INDEX "_rental_rates_v_version_version_seed_key_idx" ON "_rental_rates_v" USING btree ("version_seed_key");
  CREATE INDEX "_rental_rates_v_version_version_homepage_order_idx" ON "_rental_rates_v" USING btree ("version_homepage_order");
  CREATE INDEX "_rental_rates_v_version_version_updated_at_idx" ON "_rental_rates_v" USING btree ("version_updated_at");
  CREATE INDEX "_rental_rates_v_version_version_created_at_idx" ON "_rental_rates_v" USING btree ("version_created_at");
  CREATE INDEX "_rental_rates_v_version_version__status_idx" ON "_rental_rates_v" USING btree ("version__status");
  CREATE INDEX "_rental_rates_v_created_at_idx" ON "_rental_rates_v" USING btree ("created_at");
  CREATE INDEX "_rental_rates_v_updated_at_idx" ON "_rental_rates_v" USING btree ("updated_at");
  CREATE INDEX "_rental_rates_v_latest_idx" ON "_rental_rates_v" USING btree ("latest");
  CREATE INDEX "_rental_rates_v_autosave_idx" ON "_rental_rates_v" USING btree ("autosave");
  CREATE INDEX "training_programs_image_idx" ON "training_programs" USING btree ("image_id");
  CREATE INDEX "training_programs_seo_seo_social_image_idx" ON "training_programs" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "training_programs_slug_idx" ON "training_programs" USING btree ("slug");
  CREATE UNIQUE INDEX "training_programs_seed_key_idx" ON "training_programs" USING btree ("seed_key");
  CREATE UNIQUE INDEX "training_programs_homepage_order_idx" ON "training_programs" USING btree ("homepage_order");
  CREATE INDEX "training_programs_updated_at_idx" ON "training_programs" USING btree ("updated_at");
  CREATE INDEX "training_programs_created_at_idx" ON "training_programs" USING btree ("created_at");
  CREATE INDEX "training_programs__status_idx" ON "training_programs" USING btree ("_status");
  CREATE INDEX "_training_programs_v_parent_idx" ON "_training_programs_v" USING btree ("parent_id");
  CREATE INDEX "_training_programs_v_version_version_image_idx" ON "_training_programs_v" USING btree ("version_image_id");
  CREATE INDEX "_training_programs_v_version_seo_version_seo_social_imag_idx" ON "_training_programs_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_training_programs_v_version_version_slug_idx" ON "_training_programs_v" USING btree ("version_slug");
  CREATE INDEX "_training_programs_v_version_version_seed_key_idx" ON "_training_programs_v" USING btree ("version_seed_key");
  CREATE INDEX "_training_programs_v_version_version_homepage_order_idx" ON "_training_programs_v" USING btree ("version_homepage_order");
  CREATE INDEX "_training_programs_v_version_version_updated_at_idx" ON "_training_programs_v" USING btree ("version_updated_at");
  CREATE INDEX "_training_programs_v_version_version_created_at_idx" ON "_training_programs_v" USING btree ("version_created_at");
  CREATE INDEX "_training_programs_v_version_version__status_idx" ON "_training_programs_v" USING btree ("version__status");
  CREATE INDEX "_training_programs_v_created_at_idx" ON "_training_programs_v" USING btree ("created_at");
  CREATE INDEX "_training_programs_v_updated_at_idx" ON "_training_programs_v" USING btree ("updated_at");
  CREATE INDEX "_training_programs_v_latest_idx" ON "_training_programs_v" USING btree ("latest");
  CREATE INDEX "_training_programs_v_autosave_idx" ON "_training_programs_v" USING btree ("autosave");
  CREATE INDEX "memberships_benefits_order_idx" ON "memberships_benefits" USING btree ("_order");
  CREATE INDEX "memberships_benefits_parent_id_idx" ON "memberships_benefits" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "memberships_seed_key_idx" ON "memberships" USING btree ("seed_key");
  CREATE UNIQUE INDEX "memberships_homepage_order_idx" ON "memberships" USING btree ("homepage_order");
  CREATE INDEX "memberships_updated_at_idx" ON "memberships" USING btree ("updated_at");
  CREATE INDEX "memberships_created_at_idx" ON "memberships" USING btree ("created_at");
  CREATE INDEX "memberships__status_idx" ON "memberships" USING btree ("_status");
  CREATE INDEX "_memberships_v_version_benefits_order_idx" ON "_memberships_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_memberships_v_version_benefits_parent_id_idx" ON "_memberships_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_memberships_v_parent_idx" ON "_memberships_v" USING btree ("parent_id");
  CREATE INDEX "_memberships_v_version_version_seed_key_idx" ON "_memberships_v" USING btree ("version_seed_key");
  CREATE INDEX "_memberships_v_version_version_homepage_order_idx" ON "_memberships_v" USING btree ("version_homepage_order");
  CREATE INDEX "_memberships_v_version_version_updated_at_idx" ON "_memberships_v" USING btree ("version_updated_at");
  CREATE INDEX "_memberships_v_version_version_created_at_idx" ON "_memberships_v" USING btree ("version_created_at");
  CREATE INDEX "_memberships_v_version_version__status_idx" ON "_memberships_v" USING btree ("version__status");
  CREATE INDEX "_memberships_v_created_at_idx" ON "_memberships_v" USING btree ("created_at");
  CREATE INDEX "_memberships_v_updated_at_idx" ON "_memberships_v" USING btree ("updated_at");
  CREATE INDEX "_memberships_v_latest_idx" ON "_memberships_v" USING btree ("latest");
  CREATE INDEX "_memberships_v_autosave_idx" ON "_memberships_v" USING btree ("autosave");
  CREATE INDEX "tournaments_image_idx" ON "tournaments" USING btree ("image_id");
  CREATE INDEX "tournaments_seo_seo_social_image_idx" ON "tournaments" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "tournaments_slug_idx" ON "tournaments" USING btree ("slug");
  CREATE UNIQUE INDEX "tournaments_seed_key_idx" ON "tournaments" USING btree ("seed_key");
  CREATE UNIQUE INDEX "tournaments_homepage_order_idx" ON "tournaments" USING btree ("homepage_order");
  CREATE INDEX "tournaments_updated_at_idx" ON "tournaments" USING btree ("updated_at");
  CREATE INDEX "tournaments_created_at_idx" ON "tournaments" USING btree ("created_at");
  CREATE INDEX "tournaments__status_idx" ON "tournaments" USING btree ("_status");
  CREATE INDEX "_tournaments_v_parent_idx" ON "_tournaments_v" USING btree ("parent_id");
  CREATE INDEX "_tournaments_v_version_version_image_idx" ON "_tournaments_v" USING btree ("version_image_id");
  CREATE INDEX "_tournaments_v_version_seo_version_seo_social_image_idx" ON "_tournaments_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_tournaments_v_version_version_slug_idx" ON "_tournaments_v" USING btree ("version_slug");
  CREATE INDEX "_tournaments_v_version_version_seed_key_idx" ON "_tournaments_v" USING btree ("version_seed_key");
  CREATE INDEX "_tournaments_v_version_version_homepage_order_idx" ON "_tournaments_v" USING btree ("version_homepage_order");
  CREATE INDEX "_tournaments_v_version_version_updated_at_idx" ON "_tournaments_v" USING btree ("version_updated_at");
  CREATE INDEX "_tournaments_v_version_version_created_at_idx" ON "_tournaments_v" USING btree ("version_created_at");
  CREATE INDEX "_tournaments_v_version_version__status_idx" ON "_tournaments_v" USING btree ("version__status");
  CREATE INDEX "_tournaments_v_created_at_idx" ON "_tournaments_v" USING btree ("created_at");
  CREATE INDEX "_tournaments_v_updated_at_idx" ON "_tournaments_v" USING btree ("updated_at");
  CREATE INDEX "_tournaments_v_latest_idx" ON "_tournaments_v" USING btree ("latest");
  CREATE INDEX "_tournaments_v_autosave_idx" ON "_tournaments_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "gallery_items_seed_key_idx" ON "gallery_items" USING btree ("seed_key");
  CREATE INDEX "gallery_items_media_idx" ON "gallery_items" USING btree ("media_id");
  CREATE UNIQUE INDEX "gallery_items_homepage_order_idx" ON "gallery_items" USING btree ("homepage_order");
  CREATE UNIQUE INDEX "gallery_items_gallery_page_order_idx" ON "gallery_items" USING btree ("gallery_page_order");
  CREATE UNIQUE INDEX "gallery_items_courts_page_order_idx" ON "gallery_items" USING btree ("courts_page_order");
  CREATE UNIQUE INDEX "gallery_items_about_page_order_idx" ON "gallery_items" USING btree ("about_page_order");
  CREATE INDEX "gallery_items_updated_at_idx" ON "gallery_items" USING btree ("updated_at");
  CREATE INDEX "gallery_items_created_at_idx" ON "gallery_items" USING btree ("created_at");
  CREATE INDEX "gallery_items__status_idx" ON "gallery_items" USING btree ("_status");
  CREATE INDEX "_gallery_items_v_parent_idx" ON "_gallery_items_v" USING btree ("parent_id");
  CREATE INDEX "_gallery_items_v_version_version_seed_key_idx" ON "_gallery_items_v" USING btree ("version_seed_key");
  CREATE INDEX "_gallery_items_v_version_version_media_idx" ON "_gallery_items_v" USING btree ("version_media_id");
  CREATE INDEX "_gallery_items_v_version_version_homepage_order_idx" ON "_gallery_items_v" USING btree ("version_homepage_order");
  CREATE INDEX "_gallery_items_v_version_version_gallery_page_order_idx" ON "_gallery_items_v" USING btree ("version_gallery_page_order");
  CREATE INDEX "_gallery_items_v_version_version_courts_page_order_idx" ON "_gallery_items_v" USING btree ("version_courts_page_order");
  CREATE INDEX "_gallery_items_v_version_version_about_page_order_idx" ON "_gallery_items_v" USING btree ("version_about_page_order");
  CREATE INDEX "_gallery_items_v_version_version_updated_at_idx" ON "_gallery_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_gallery_items_v_version_version_created_at_idx" ON "_gallery_items_v" USING btree ("version_created_at");
  CREATE INDEX "_gallery_items_v_version_version__status_idx" ON "_gallery_items_v" USING btree ("version__status");
  CREATE INDEX "_gallery_items_v_created_at_idx" ON "_gallery_items_v" USING btree ("created_at");
  CREATE INDEX "_gallery_items_v_updated_at_idx" ON "_gallery_items_v" USING btree ("updated_at");
  CREATE INDEX "_gallery_items_v_latest_idx" ON "_gallery_items_v" USING btree ("latest");
  CREATE INDEX "_gallery_items_v_autosave_idx" ON "_gallery_items_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "reviews_seed_key_idx" ON "reviews" USING btree ("seed_key");
  CREATE INDEX "reviews_avatar_idx" ON "reviews" USING btree ("avatar_id");
  CREATE UNIQUE INDEX "reviews_homepage_order_idx" ON "reviews" USING btree ("homepage_order");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews__status_idx" ON "reviews" USING btree ("_status");
  CREATE INDEX "_reviews_v_parent_idx" ON "_reviews_v" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_version_version_seed_key_idx" ON "_reviews_v" USING btree ("version_seed_key");
  CREATE INDEX "_reviews_v_version_version_avatar_idx" ON "_reviews_v" USING btree ("version_avatar_id");
  CREATE INDEX "_reviews_v_version_version_homepage_order_idx" ON "_reviews_v" USING btree ("version_homepage_order");
  CREATE INDEX "_reviews_v_version_version_updated_at_idx" ON "_reviews_v" USING btree ("version_updated_at");
  CREATE INDEX "_reviews_v_version_version_created_at_idx" ON "_reviews_v" USING btree ("version_created_at");
  CREATE INDEX "_reviews_v_version_version__status_idx" ON "_reviews_v" USING btree ("version__status");
  CREATE INDEX "_reviews_v_created_at_idx" ON "_reviews_v" USING btree ("created_at");
  CREATE INDEX "_reviews_v_updated_at_idx" ON "_reviews_v" USING btree ("updated_at");
  CREATE INDEX "_reviews_v_latest_idx" ON "_reviews_v" USING btree ("latest");
  CREATE INDEX "_reviews_v_autosave_idx" ON "_reviews_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "faqs_seed_key_idx" ON "faqs" USING btree ("seed_key");
  CREATE UNIQUE INDEX "faqs_homepage_order_idx" ON "faqs" USING btree ("homepage_order");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "faqs__status_idx" ON "faqs" USING btree ("_status");
  CREATE INDEX "_faqs_v_parent_idx" ON "_faqs_v" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_version_version_seed_key_idx" ON "_faqs_v" USING btree ("version_seed_key");
  CREATE INDEX "_faqs_v_version_version_homepage_order_idx" ON "_faqs_v" USING btree ("version_homepage_order");
  CREATE INDEX "_faqs_v_version_version_updated_at_idx" ON "_faqs_v" USING btree ("version_updated_at");
  CREATE INDEX "_faqs_v_version_version_created_at_idx" ON "_faqs_v" USING btree ("version_created_at");
  CREATE INDEX "_faqs_v_version_version__status_idx" ON "_faqs_v" USING btree ("version__status");
  CREATE INDEX "_faqs_v_created_at_idx" ON "_faqs_v" USING btree ("created_at");
  CREATE INDEX "_faqs_v_updated_at_idx" ON "_faqs_v" USING btree ("updated_at");
  CREATE INDEX "_faqs_v_latest_idx" ON "_faqs_v" USING btree ("latest");
  CREATE INDEX "_faqs_v_autosave_idx" ON "_faqs_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "partners_seed_key_idx" ON "partners" USING btree ("seed_key");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE UNIQUE INDEX "partners_homepage_order_idx" ON "partners" USING btree ("homepage_order");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "partners__status_idx" ON "partners" USING btree ("_status");
  CREATE INDEX "_partners_v_parent_idx" ON "_partners_v" USING btree ("parent_id");
  CREATE INDEX "_partners_v_version_version_seed_key_idx" ON "_partners_v" USING btree ("version_seed_key");
  CREATE INDEX "_partners_v_version_version_logo_idx" ON "_partners_v" USING btree ("version_logo_id");
  CREATE INDEX "_partners_v_version_version_homepage_order_idx" ON "_partners_v" USING btree ("version_homepage_order");
  CREATE INDEX "_partners_v_version_version_updated_at_idx" ON "_partners_v" USING btree ("version_updated_at");
  CREATE INDEX "_partners_v_version_version_created_at_idx" ON "_partners_v" USING btree ("version_created_at");
  CREATE INDEX "_partners_v_version_version__status_idx" ON "_partners_v" USING btree ("version__status");
  CREATE INDEX "_partners_v_created_at_idx" ON "_partners_v" USING btree ("created_at");
  CREATE INDEX "_partners_v_updated_at_idx" ON "_partners_v" USING btree ("updated_at");
  CREATE INDEX "_partners_v_latest_idx" ON "_partners_v" USING btree ("latest");
  CREATE INDEX "_partners_v_autosave_idx" ON "_partners_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "leads_idempotency_key_idx" ON "leads" USING btree ("idempotency_key");
  CREATE INDEX "leads_analytics_anonymous_id_idx" ON "leads" USING btree ("analytics_anonymous_id");
  CREATE INDEX "leads_analytics_session_id_idx" ON "leads" USING btree ("analytics_session_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE UNIQUE INDEX "analytics_events_event_id_idx" ON "analytics_events" USING btree ("event_id");
  CREATE INDEX "analytics_events_occurred_at_idx" ON "analytics_events" USING btree ("occurred_at");
  CREATE INDEX "analytics_events_received_at_idx" ON "analytics_events" USING btree ("received_at");
  CREATE INDEX "analytics_events_anonymous_id_idx" ON "analytics_events" USING btree ("anonymous_id");
  CREATE INDEX "analytics_events_session_id_idx" ON "analytics_events" USING btree ("session_id");
  CREATE INDEX "analytics_events_name_idx" ON "analytics_events" USING btree ("name");
  CREATE INDEX "analytics_events_path_idx" ON "analytics_events" USING btree ("path");
  CREATE INDEX "analytics_events_object_type_idx" ON "analytics_events" USING btree ("object_type");
  CREATE INDEX "analytics_events_object_id_idx" ON "analytics_events" USING btree ("object_id");
  CREATE INDEX "analytics_events_action_kind_idx" ON "analytics_events" USING btree ("action_kind");
  CREATE INDEX "analytics_events_form_type_idx" ON "analytics_events" USING btree ("form_type");
  CREATE INDEX "analytics_events_channel_idx" ON "analytics_events" USING btree ("channel");
  CREATE INDEX "analytics_events_campaign_idx" ON "analytics_events" USING btree ("campaign");
  CREATE INDEX "analytics_events_referrer_domain_idx" ON "analytics_events" USING btree ("referrer_domain");
  CREATE INDEX "analytics_events_device_idx" ON "analytics_events" USING btree ("device");
  CREATE INDEX "analytics_events_lead_idx" ON "analytics_events" USING btree ("lead_id");
  CREATE UNIQUE INDEX "analytics_browsers_anonymous_id_idx" ON "analytics_browsers" USING btree ("anonymous_id");
  CREATE INDEX "analytics_browsers_first_seen_at_idx" ON "analytics_browsers" USING btree ("first_seen_at");
  CREATE INDEX "analytics_browsers_last_seen_at_idx" ON "analytics_browsers" USING btree ("last_seen_at");
  CREATE INDEX "analytics_browsers_expires_at_idx" ON "analytics_browsers" USING btree ("expires_at");
  CREATE UNIQUE INDEX "analytics_sessions_session_id_idx" ON "analytics_sessions" USING btree ("session_id");
  CREATE INDEX "analytics_sessions_anonymous_id_idx" ON "analytics_sessions" USING btree ("anonymous_id");
  CREATE INDEX "analytics_sessions_started_at_idx" ON "analytics_sessions" USING btree ("started_at");
  CREATE INDEX "analytics_sessions_last_activity_at_idx" ON "analytics_sessions" USING btree ("last_activity_at");
  CREATE INDEX "analytics_sessions_ended_at_idx" ON "analytics_sessions" USING btree ("ended_at");
  CREATE INDEX "analytics_sessions_has_target_action_idx" ON "analytics_sessions" USING btree ("has_target_action");
  CREATE UNIQUE INDEX "analytics_daily_aggregate_key_idx" ON "analytics_daily" USING btree ("aggregate_key");
  CREATE INDEX "analytics_daily_date_idx" ON "analytics_daily" USING btree ("date");
  CREATE INDEX "analytics_daily_event_name_idx" ON "analytics_daily" USING btree ("event_name");
  CREATE INDEX "analytics_daily_path_idx" ON "analytics_daily" USING btree ("path");
  CREATE INDEX "analytics_daily_object_type_idx" ON "analytics_daily" USING btree ("object_type");
  CREATE INDEX "analytics_daily_object_id_idx" ON "analytics_daily" USING btree ("object_id");
  CREATE INDEX "analytics_daily_channel_idx" ON "analytics_daily" USING btree ("channel");
  CREATE INDEX "analytics_daily_campaign_idx" ON "analytics_daily" USING btree ("campaign");
  CREATE INDEX "analytics_daily_referrer_domain_idx" ON "analytics_daily" USING btree ("referrer_domain");
  CREATE INDEX "analytics_daily_first_channel_idx" ON "analytics_daily" USING btree ("first_channel");
  CREATE INDEX "analytics_daily_first_campaign_idx" ON "analytics_daily" USING btree ("first_campaign");
  CREATE INDEX "analytics_daily_device_idx" ON "analytics_daily" USING btree ("device");
  CREATE INDEX "analytics_daily_language_idx" ON "analytics_daily" USING btree ("language");
  CREATE INDEX "analytics_daily_os_idx" ON "analytics_daily" USING btree ("os");
  CREATE INDEX "analytics_daily_verified_at_idx" ON "analytics_daily" USING btree ("verified_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_article_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("article_categories_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_coaches_id_idx" ON "payload_locked_documents_rels" USING btree ("coaches_id");
  CREATE INDEX "payload_locked_documents_rels_courts_id_idx" ON "payload_locked_documents_rels" USING btree ("courts_id");
  CREATE INDEX "payload_locked_documents_rels_rental_rates_id_idx" ON "payload_locked_documents_rels" USING btree ("rental_rates_id");
  CREATE INDEX "payload_locked_documents_rels_training_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("training_programs_id");
  CREATE INDEX "payload_locked_documents_rels_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("memberships_id");
  CREATE INDEX "payload_locked_documents_rels_tournaments_id_idx" ON "payload_locked_documents_rels" USING btree ("tournaments_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_items_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_items_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_events_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_events_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_browsers_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_browsers_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_daily_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_daily_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_sections_order_idx" ON "homepage_sections" USING btree ("_order");
  CREATE INDEX "homepage_sections_parent_id_idx" ON "homepage_sections" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_stats_order_idx" ON "homepage_hero_stats" USING btree ("_order");
  CREATE INDEX "homepage_hero_stats_parent_id_idx" ON "homepage_hero_stats" USING btree ("_parent_id");
  CREATE INDEX "homepage_benefits_section_cards_order_idx" ON "homepage_benefits_section_cards" USING btree ("_order");
  CREATE INDEX "homepage_benefits_section_cards_parent_id_idx" ON "homepage_benefits_section_cards" USING btree ("_parent_id");
  CREATE INDEX "homepage_benefits_section_cards_media_idx" ON "homepage_benefits_section_cards" USING btree ("media_id");
  CREATE INDEX "homepage_offers_section_cards_order_idx" ON "homepage_offers_section_cards" USING btree ("_order");
  CREATE INDEX "homepage_offers_section_cards_parent_id_idx" ON "homepage_offers_section_cards" USING btree ("_parent_id");
  CREATE INDEX "homepage_offers_section_cards_image_idx" ON "homepage_offers_section_cards" USING btree ("image_id");
  CREATE INDEX "homepage_hero_hero_desktop_media_idx" ON "homepage" USING btree ("hero_desktop_media_id");
  CREATE INDEX "homepage_hero_hero_desktop_video_poster_idx" ON "homepage" USING btree ("hero_desktop_video_poster_id");
  CREATE INDEX "homepage_hero_hero_mobile_media_idx" ON "homepage" USING btree ("hero_mobile_media_id");
  CREATE INDEX "homepage_hero_hero_mobile_video_poster_idx" ON "homepage" USING btree ("hero_mobile_video_poster_id");
  CREATE INDEX "homepage_courts_section_courts_section_background_media_idx" ON "homepage" USING btree ("courts_section_background_media_id");
  CREATE INDEX "homepage_methodist_banner_methodist_banner_decorative_me_idx" ON "homepage" USING btree ("methodist_banner_decorative_media_id");
  CREATE INDEX "homepage_seo_seo_social_image_idx" ON "homepage" USING btree ("seo_social_image_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_coaches_id_idx" ON "homepage_rels" USING btree ("coaches_id");
  CREATE INDEX "_homepage_v_version_sections_order_idx" ON "_homepage_v_version_sections" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_parent_id_idx" ON "_homepage_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_hero_stats_order_idx" ON "_homepage_v_version_hero_stats" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_hero_stats_parent_id_idx" ON "_homepage_v_version_hero_stats" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_benefits_section_cards_order_idx" ON "_homepage_v_version_benefits_section_cards" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_benefits_section_cards_parent_id_idx" ON "_homepage_v_version_benefits_section_cards" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_benefits_section_cards_media_idx" ON "_homepage_v_version_benefits_section_cards" USING btree ("media_id");
  CREATE INDEX "_homepage_v_version_offers_section_cards_order_idx" ON "_homepage_v_version_offers_section_cards" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_offers_section_cards_parent_id_idx" ON "_homepage_v_version_offers_section_cards" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_offers_section_cards_image_idx" ON "_homepage_v_version_offers_section_cards" USING btree ("image_id");
  CREATE INDEX "_homepage_v_version_hero_version_hero_desktop_media_idx" ON "_homepage_v" USING btree ("version_hero_desktop_media_id");
  CREATE INDEX "_homepage_v_version_hero_version_hero_desktop_video_post_idx" ON "_homepage_v" USING btree ("version_hero_desktop_video_poster_id");
  CREATE INDEX "_homepage_v_version_hero_version_hero_mobile_media_idx" ON "_homepage_v" USING btree ("version_hero_mobile_media_id");
  CREATE INDEX "_homepage_v_version_hero_version_hero_mobile_video_poste_idx" ON "_homepage_v" USING btree ("version_hero_mobile_video_poster_id");
  CREATE INDEX "_homepage_v_version_courts_section_version_courts_sectio_idx" ON "_homepage_v" USING btree ("version_courts_section_background_media_id");
  CREATE INDEX "_homepage_v_version_methodist_banner_version_methodist_b_idx" ON "_homepage_v" USING btree ("version_methodist_banner_decorative_media_id");
  CREATE INDEX "_homepage_v_version_seo_version_seo_social_image_idx" ON "_homepage_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE INDEX "_homepage_v_autosave_idx" ON "_homepage_v" USING btree ("autosave");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_coaches_id_idx" ON "_homepage_v_rels" USING btree ("coaches_id");
  CREATE INDEX "blog_page_seo_seo_social_image_idx" ON "blog_page" USING btree ("seo_social_image_id");
  CREATE INDEX "blog_page__status_idx" ON "blog_page" USING btree ("_status");
  CREATE INDEX "_blog_page_v_version_seo_version_seo_social_image_idx" ON "_blog_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_blog_page_v_version_version__status_idx" ON "_blog_page_v" USING btree ("version__status");
  CREATE INDEX "_blog_page_v_created_at_idx" ON "_blog_page_v" USING btree ("created_at");
  CREATE INDEX "_blog_page_v_updated_at_idx" ON "_blog_page_v" USING btree ("updated_at");
  CREATE INDEX "_blog_page_v_latest_idx" ON "_blog_page_v" USING btree ("latest");
  CREATE INDEX "_blog_page_v_autosave_idx" ON "_blog_page_v" USING btree ("autosave");
  CREATE INDEX "coaches_page_seo_seo_social_image_idx" ON "coaches_page" USING btree ("seo_social_image_id");
  CREATE INDEX "coaches_page__status_idx" ON "coaches_page" USING btree ("_status");
  CREATE INDEX "_coaches_page_v_version_seo_version_seo_social_image_idx" ON "_coaches_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_coaches_page_v_version_version__status_idx" ON "_coaches_page_v" USING btree ("version__status");
  CREATE INDEX "_coaches_page_v_created_at_idx" ON "_coaches_page_v" USING btree ("created_at");
  CREATE INDEX "_coaches_page_v_updated_at_idx" ON "_coaches_page_v" USING btree ("updated_at");
  CREATE INDEX "_coaches_page_v_latest_idx" ON "_coaches_page_v" USING btree ("latest");
  CREATE INDEX "_coaches_page_v_autosave_idx" ON "_coaches_page_v" USING btree ("autosave");
  CREATE INDEX "tournaments_page_seo_seo_social_image_idx" ON "tournaments_page" USING btree ("seo_social_image_id");
  CREATE INDEX "tournaments_page__status_idx" ON "tournaments_page" USING btree ("_status");
  CREATE INDEX "_tournaments_page_v_version_seo_version_seo_social_image_idx" ON "_tournaments_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_tournaments_page_v_version_version__status_idx" ON "_tournaments_page_v" USING btree ("version__status");
  CREATE INDEX "_tournaments_page_v_created_at_idx" ON "_tournaments_page_v" USING btree ("created_at");
  CREATE INDEX "_tournaments_page_v_updated_at_idx" ON "_tournaments_page_v" USING btree ("updated_at");
  CREATE INDEX "_tournaments_page_v_latest_idx" ON "_tournaments_page_v" USING btree ("latest");
  CREATE INDEX "_tournaments_page_v_autosave_idx" ON "_tournaments_page_v" USING btree ("autosave");
  CREATE INDEX "prices_page_rules_order_idx" ON "prices_page_rules" USING btree ("_order");
  CREATE INDEX "prices_page_rules_parent_id_idx" ON "prices_page_rules" USING btree ("_parent_id");
  CREATE INDEX "prices_page_seo_seo_social_image_idx" ON "prices_page" USING btree ("seo_social_image_id");
  CREATE INDEX "prices_page__status_idx" ON "prices_page" USING btree ("_status");
  CREATE INDEX "_prices_page_v_version_rules_order_idx" ON "_prices_page_v_version_rules" USING btree ("_order");
  CREATE INDEX "_prices_page_v_version_rules_parent_id_idx" ON "_prices_page_v_version_rules" USING btree ("_parent_id");
  CREATE INDEX "_prices_page_v_version_seo_version_seo_social_image_idx" ON "_prices_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_prices_page_v_version_version__status_idx" ON "_prices_page_v" USING btree ("version__status");
  CREATE INDEX "_prices_page_v_created_at_idx" ON "_prices_page_v" USING btree ("created_at");
  CREATE INDEX "_prices_page_v_updated_at_idx" ON "_prices_page_v" USING btree ("updated_at");
  CREATE INDEX "_prices_page_v_latest_idx" ON "_prices_page_v" USING btree ("latest");
  CREATE INDEX "_prices_page_v_autosave_idx" ON "_prices_page_v" USING btree ("autosave");
  CREATE INDEX "training_page_blocks_order_idx" ON "training_page_blocks" USING btree ("_order");
  CREATE INDEX "training_page_blocks_parent_id_idx" ON "training_page_blocks" USING btree ("_parent_id");
  CREATE INDEX "training_page_seo_seo_social_image_idx" ON "training_page" USING btree ("seo_social_image_id");
  CREATE INDEX "training_page__status_idx" ON "training_page" USING btree ("_status");
  CREATE INDEX "_training_page_v_version_blocks_order_idx" ON "_training_page_v_version_blocks" USING btree ("_order");
  CREATE INDEX "_training_page_v_version_blocks_parent_id_idx" ON "_training_page_v_version_blocks" USING btree ("_parent_id");
  CREATE INDEX "_training_page_v_version_seo_version_seo_social_image_idx" ON "_training_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_training_page_v_version_version__status_idx" ON "_training_page_v" USING btree ("version__status");
  CREATE INDEX "_training_page_v_created_at_idx" ON "_training_page_v" USING btree ("created_at");
  CREATE INDEX "_training_page_v_updated_at_idx" ON "_training_page_v" USING btree ("updated_at");
  CREATE INDEX "_training_page_v_latest_idx" ON "_training_page_v" USING btree ("latest");
  CREATE INDEX "_training_page_v_autosave_idx" ON "_training_page_v" USING btree ("autosave");
  CREATE INDEX "courts_page_metrics_order_idx" ON "courts_page_metrics" USING btree ("_order");
  CREATE INDEX "courts_page_metrics_parent_id_idx" ON "courts_page_metrics" USING btree ("_parent_id");
  CREATE INDEX "courts_page_seo_seo_social_image_idx" ON "courts_page" USING btree ("seo_social_image_id");
  CREATE INDEX "courts_page__status_idx" ON "courts_page" USING btree ("_status");
  CREATE INDEX "_courts_page_v_version_metrics_order_idx" ON "_courts_page_v_version_metrics" USING btree ("_order");
  CREATE INDEX "_courts_page_v_version_metrics_parent_id_idx" ON "_courts_page_v_version_metrics" USING btree ("_parent_id");
  CREATE INDEX "_courts_page_v_version_seo_version_seo_social_image_idx" ON "_courts_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_courts_page_v_version_version__status_idx" ON "_courts_page_v" USING btree ("version__status");
  CREATE INDEX "_courts_page_v_created_at_idx" ON "_courts_page_v" USING btree ("created_at");
  CREATE INDEX "_courts_page_v_updated_at_idx" ON "_courts_page_v" USING btree ("updated_at");
  CREATE INDEX "_courts_page_v_latest_idx" ON "_courts_page_v" USING btree ("latest");
  CREATE INDEX "_courts_page_v_autosave_idx" ON "_courts_page_v" USING btree ("autosave");
  CREATE INDEX "gallery_page_seo_seo_social_image_idx" ON "gallery_page" USING btree ("seo_social_image_id");
  CREATE INDEX "gallery_page__status_idx" ON "gallery_page" USING btree ("_status");
  CREATE INDEX "_gallery_page_v_version_seo_version_seo_social_image_idx" ON "_gallery_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_gallery_page_v_version_version__status_idx" ON "_gallery_page_v" USING btree ("version__status");
  CREATE INDEX "_gallery_page_v_created_at_idx" ON "_gallery_page_v" USING btree ("created_at");
  CREATE INDEX "_gallery_page_v_updated_at_idx" ON "_gallery_page_v" USING btree ("updated_at");
  CREATE INDEX "_gallery_page_v_latest_idx" ON "_gallery_page_v" USING btree ("latest");
  CREATE INDEX "_gallery_page_v_autosave_idx" ON "_gallery_page_v" USING btree ("autosave");
  CREATE INDEX "about_page_stats_order_idx" ON "about_page_stats" USING btree ("_order");
  CREATE INDEX "about_page_stats_parent_id_idx" ON "about_page_stats" USING btree ("_parent_id");
  CREATE INDEX "about_page_seo_seo_social_image_idx" ON "about_page" USING btree ("seo_social_image_id");
  CREATE INDEX "about_page__status_idx" ON "about_page" USING btree ("_status");
  CREATE INDEX "_about_page_v_version_stats_order_idx" ON "_about_page_v_version_stats" USING btree ("_order");
  CREATE INDEX "_about_page_v_version_stats_parent_id_idx" ON "_about_page_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_about_page_v_version_seo_version_seo_social_image_idx" ON "_about_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_about_page_v_version_version__status_idx" ON "_about_page_v" USING btree ("version__status");
  CREATE INDEX "_about_page_v_created_at_idx" ON "_about_page_v" USING btree ("created_at");
  CREATE INDEX "_about_page_v_updated_at_idx" ON "_about_page_v" USING btree ("updated_at");
  CREATE INDEX "_about_page_v_latest_idx" ON "_about_page_v" USING btree ("latest");
  CREATE INDEX "_about_page_v_autosave_idx" ON "_about_page_v" USING btree ("autosave");
  CREATE INDEX "contacts_page_arrival_notes_order_idx" ON "contacts_page_arrival_notes" USING btree ("_order");
  CREATE INDEX "contacts_page_arrival_notes_parent_id_idx" ON "contacts_page_arrival_notes" USING btree ("_parent_id");
  CREATE INDEX "contacts_page_seo_seo_social_image_idx" ON "contacts_page" USING btree ("seo_social_image_id");
  CREATE INDEX "contacts_page__status_idx" ON "contacts_page" USING btree ("_status");
  CREATE INDEX "_contacts_page_v_version_arrival_notes_order_idx" ON "_contacts_page_v_version_arrival_notes" USING btree ("_order");
  CREATE INDEX "_contacts_page_v_version_arrival_notes_parent_id_idx" ON "_contacts_page_v_version_arrival_notes" USING btree ("_parent_id");
  CREATE INDEX "_contacts_page_v_version_seo_version_seo_social_image_idx" ON "_contacts_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_contacts_page_v_version_version__status_idx" ON "_contacts_page_v" USING btree ("version__status");
  CREATE INDEX "_contacts_page_v_created_at_idx" ON "_contacts_page_v" USING btree ("created_at");
  CREATE INDEX "_contacts_page_v_updated_at_idx" ON "_contacts_page_v" USING btree ("updated_at");
  CREATE INDEX "_contacts_page_v_latest_idx" ON "_contacts_page_v" USING btree ("latest");
  CREATE INDEX "_contacts_page_v_autosave_idx" ON "_contacts_page_v" USING btree ("autosave");
  CREATE INDEX "policy_page_seo_seo_social_image_idx" ON "policy_page" USING btree ("seo_social_image_id");
  CREATE INDEX "policy_page__status_idx" ON "policy_page" USING btree ("_status");
  CREATE INDEX "_policy_page_v_version_seo_version_seo_social_image_idx" ON "_policy_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_policy_page_v_version_version__status_idx" ON "_policy_page_v" USING btree ("version__status");
  CREATE INDEX "_policy_page_v_created_at_idx" ON "_policy_page_v" USING btree ("created_at");
  CREATE INDEX "_policy_page_v_updated_at_idx" ON "_policy_page_v" USING btree ("updated_at");
  CREATE INDEX "_policy_page_v_latest_idx" ON "_policy_page_v" USING btree ("latest");
  CREATE INDEX "_policy_page_v_autosave_idx" ON "_policy_page_v" USING btree ("autosave");
  CREATE INDEX "oferta_page_seo_seo_social_image_idx" ON "oferta_page" USING btree ("seo_social_image_id");
  CREATE INDEX "oferta_page__status_idx" ON "oferta_page" USING btree ("_status");
  CREATE INDEX "_oferta_page_v_version_seo_version_seo_social_image_idx" ON "_oferta_page_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_oferta_page_v_version_version__status_idx" ON "_oferta_page_v" USING btree ("version__status");
  CREATE INDEX "_oferta_page_v_created_at_idx" ON "_oferta_page_v" USING btree ("created_at");
  CREATE INDEX "_oferta_page_v_updated_at_idx" ON "_oferta_page_v" USING btree ("updated_at");
  CREATE INDEX "_oferta_page_v_latest_idx" ON "_oferta_page_v" USING btree ("latest");
  CREATE INDEX "_oferta_page_v_autosave_idx" ON "_oferta_page_v" USING btree ("autosave");
  CREATE INDEX "site_settings_desktop_navigation_order_idx" ON "site_settings_desktop_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_desktop_navigation_parent_id_idx" ON "site_settings_desktop_navigation" USING btree ("_parent_id");
  CREATE INDEX "site_settings_mobile_navigation_order_idx" ON "site_settings_mobile_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_mobile_navigation_parent_id_idx" ON "site_settings_mobile_navigation" USING btree ("_parent_id");
  CREATE INDEX "site_settings_mobile_menu_navigation_order_idx" ON "site_settings_mobile_menu_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_mobile_menu_navigation_parent_id_idx" ON "site_settings_mobile_menu_navigation" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_stats_order_idx" ON "site_settings_footer_stats" USING btree ("_order");
  CREATE INDEX "site_settings_footer_stats_parent_id_idx" ON "site_settings_footer_stats" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_navigation_order_idx" ON "site_settings_footer_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_footer_navigation_parent_id_idx" ON "site_settings_footer_navigation" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_legal_links_order_idx" ON "site_settings_legal_links" USING btree ("_order");
  CREATE INDEX "site_settings_legal_links_parent_id_idx" ON "site_settings_legal_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_brand_logo_idx" ON "site_settings" USING btree ("brand_logo_id");
  CREATE INDEX "site_settings_footer_image_idx" ON "site_settings" USING btree ("footer_image_id");
  CREATE INDEX "site_settings_contact_confirmation_contact_confirmation__idx" ON "site_settings" USING btree ("contact_confirmation_avatar_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_desktop_navigation_order_idx" ON "_site_settings_v_version_desktop_navigation" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_desktop_navigation_parent_id_idx" ON "_site_settings_v_version_desktop_navigation" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_mobile_navigation_order_idx" ON "_site_settings_v_version_mobile_navigation" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_mobile_navigation_parent_id_idx" ON "_site_settings_v_version_mobile_navigation" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_mobile_menu_navigation_order_idx" ON "_site_settings_v_version_mobile_menu_navigation" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_mobile_menu_navigation_parent_id_idx" ON "_site_settings_v_version_mobile_menu_navigation" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_footer_stats_order_idx" ON "_site_settings_v_version_footer_stats" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_footer_stats_parent_id_idx" ON "_site_settings_v_version_footer_stats" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_footer_navigation_order_idx" ON "_site_settings_v_version_footer_navigation" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_footer_navigation_parent_id_idx" ON "_site_settings_v_version_footer_navigation" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_social_links_order_idx" ON "_site_settings_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_social_links_parent_id_idx" ON "_site_settings_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_legal_links_order_idx" ON "_site_settings_v_version_legal_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_legal_links_parent_id_idx" ON "_site_settings_v_version_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version_brand_logo_idx" ON "_site_settings_v" USING btree ("version_brand_logo_id");
  CREATE INDEX "_site_settings_v_version_version_footer_image_idx" ON "_site_settings_v" USING btree ("version_footer_image_id");
  CREATE INDEX "_site_settings_v_version_contact_confirmation_version_co_idx" ON "_site_settings_v" USING btree ("version_contact_confirmation_avatar_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "_site_settings_v_autosave_idx" ON "_site_settings_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "article_categories" CASCADE;
  DROP TABLE "_article_categories_v" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "coaches_levels" CASCADE;
  DROP TABLE "coaches_focus_areas" CASCADE;
  DROP TABLE "coaches_language_codes" CASCADE;
  DROP TABLE "coaches_certificates" CASCADE;
  DROP TABLE "coaches" CASCADE;
  DROP TABLE "_coaches_v_version_levels" CASCADE;
  DROP TABLE "_coaches_v_version_focus_areas" CASCADE;
  DROP TABLE "_coaches_v_version_language_codes" CASCADE;
  DROP TABLE "_coaches_v_version_certificates" CASCADE;
  DROP TABLE "_coaches_v" CASCADE;
  DROP TABLE "courts_metrics" CASCADE;
  DROP TABLE "courts" CASCADE;
  DROP TABLE "_courts_v_version_metrics" CASCADE;
  DROP TABLE "_courts_v" CASCADE;
  DROP TABLE "rental_rates_included_items" CASCADE;
  DROP TABLE "rental_rates" CASCADE;
  DROP TABLE "_rental_rates_v_version_included_items" CASCADE;
  DROP TABLE "_rental_rates_v" CASCADE;
  DROP TABLE "training_programs" CASCADE;
  DROP TABLE "_training_programs_v" CASCADE;
  DROP TABLE "memberships_benefits" CASCADE;
  DROP TABLE "memberships" CASCADE;
  DROP TABLE "_memberships_v_version_benefits" CASCADE;
  DROP TABLE "_memberships_v" CASCADE;
  DROP TABLE "tournaments" CASCADE;
  DROP TABLE "_tournaments_v" CASCADE;
  DROP TABLE "gallery_items" CASCADE;
  DROP TABLE "_gallery_items_v" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "_reviews_v" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "_faqs_v" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "_partners_v" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "analytics_events" CASCADE;
  DROP TABLE "analytics_browsers" CASCADE;
  DROP TABLE "analytics_sessions" CASCADE;
  DROP TABLE "analytics_daily" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_sections" CASCADE;
  DROP TABLE "homepage_hero_stats" CASCADE;
  DROP TABLE "homepage_benefits_section_cards" CASCADE;
  DROP TABLE "homepage_offers_section_cards" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_version_sections" CASCADE;
  DROP TABLE "_homepage_v_version_hero_stats" CASCADE;
  DROP TABLE "_homepage_v_version_benefits_section_cards" CASCADE;
  DROP TABLE "_homepage_v_version_offers_section_cards" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TABLE "blog_page" CASCADE;
  DROP TABLE "_blog_page_v" CASCADE;
  DROP TABLE "coaches_page" CASCADE;
  DROP TABLE "_coaches_page_v" CASCADE;
  DROP TABLE "tournaments_page" CASCADE;
  DROP TABLE "_tournaments_page_v" CASCADE;
  DROP TABLE "prices_page_rules" CASCADE;
  DROP TABLE "prices_page" CASCADE;
  DROP TABLE "_prices_page_v_version_rules" CASCADE;
  DROP TABLE "_prices_page_v" CASCADE;
  DROP TABLE "training_page_blocks" CASCADE;
  DROP TABLE "training_page" CASCADE;
  DROP TABLE "_training_page_v_version_blocks" CASCADE;
  DROP TABLE "_training_page_v" CASCADE;
  DROP TABLE "courts_page_metrics" CASCADE;
  DROP TABLE "courts_page" CASCADE;
  DROP TABLE "_courts_page_v_version_metrics" CASCADE;
  DROP TABLE "_courts_page_v" CASCADE;
  DROP TABLE "gallery_page" CASCADE;
  DROP TABLE "_gallery_page_v" CASCADE;
  DROP TABLE "about_page_stats" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "_about_page_v_version_stats" CASCADE;
  DROP TABLE "_about_page_v" CASCADE;
  DROP TABLE "contacts_page_arrival_notes" CASCADE;
  DROP TABLE "contacts_page" CASCADE;
  DROP TABLE "_contacts_page_v_version_arrival_notes" CASCADE;
  DROP TABLE "_contacts_page_v" CASCADE;
  DROP TABLE "policy_page" CASCADE;
  DROP TABLE "_policy_page_v" CASCADE;
  DROP TABLE "oferta_page" CASCADE;
  DROP TABLE "_oferta_page_v" CASCADE;
  DROP TABLE "site_settings_desktop_navigation" CASCADE;
  DROP TABLE "site_settings_mobile_navigation" CASCADE;
  DROP TABLE "site_settings_mobile_menu_navigation" CASCADE;
  DROP TABLE "site_settings_footer_stats" CASCADE;
  DROP TABLE "site_settings_footer_navigation" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_legal_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_desktop_navigation" CASCADE;
  DROP TABLE "_site_settings_v_version_mobile_navigation" CASCADE;
  DROP TABLE "_site_settings_v_version_mobile_menu_navigation" CASCADE;
  DROP TABLE "_site_settings_v_version_footer_stats" CASCADE;
  DROP TABLE "_site_settings_v_version_footer_navigation" CASCADE;
  DROP TABLE "_site_settings_v_version_social_links" CASCADE;
  DROP TABLE "_site_settings_v_version_legal_links" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TYPE "public"."enum_article_categories_seo_robots";
  DROP TYPE "public"."enum_article_categories_status";
  DROP TYPE "public"."enum__article_categories_v_version_seo_robots";
  DROP TYPE "public"."enum__article_categories_v_version_status";
  DROP TYPE "public"."enum_articles_seo_robots";
  DROP TYPE "public"."enum_articles_home_position";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_seo_robots";
  DROP TYPE "public"."enum__articles_v_version_home_position";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_coaches_levels";
  DROP TYPE "public"."enum_coaches_focus_areas";
  DROP TYPE "public"."enum_coaches_language_codes";
  DROP TYPE "public"."enum_coaches_action_mode";
  DROP TYPE "public"."lead_type";
  DROP TYPE "public"."enum_coaches_seo_robots";
  DROP TYPE "public"."enum_coaches_status";
  DROP TYPE "public"."enum__coaches_v_version_levels";
  DROP TYPE "public"."enum__coaches_v_version_focus_areas";
  DROP TYPE "public"."enum__coaches_v_version_language_codes";
  DROP TYPE "public"."enum__coaches_v_version_action_mode";
  DROP TYPE "public"."enum__coaches_v_version_seo_robots";
  DROP TYPE "public"."enum__coaches_v_version_status";
  DROP TYPE "public"."enum_courts_metrics_icon";
  DROP TYPE "public"."enum_courts_card_variant";
  DROP TYPE "public"."enum_courts_seo_robots";
  DROP TYPE "public"."enum_courts_status";
  DROP TYPE "public"."enum__courts_v_version_metrics_icon";
  DROP TYPE "public"."enum__courts_v_version_card_variant";
  DROP TYPE "public"."enum__courts_v_version_seo_robots";
  DROP TYPE "public"."enum__courts_v_version_status";
  DROP TYPE "public"."enum_rental_rates_badge_tone";
  DROP TYPE "public"."enum_rental_rates_card_variant";
  DROP TYPE "public"."enum_rental_rates_mesh_tone";
  DROP TYPE "public"."enum_rental_rates_action_mode";
  DROP TYPE "public"."enum_rental_rates_status";
  DROP TYPE "public"."enum__rental_rates_v_version_badge_tone";
  DROP TYPE "public"."enum__rental_rates_v_version_card_variant";
  DROP TYPE "public"."enum__rental_rates_v_version_mesh_tone";
  DROP TYPE "public"."enum__rental_rates_v_version_action_mode";
  DROP TYPE "public"."enum__rental_rates_v_version_status";
  DROP TYPE "public"."enum_training_programs_overlay";
  DROP TYPE "public"."enum_training_programs_icon";
  DROP TYPE "public"."enum_training_programs_action_mode";
  DROP TYPE "public"."enum_training_programs_seo_robots";
  DROP TYPE "public"."enum_training_programs_status";
  DROP TYPE "public"."enum__training_programs_v_version_overlay";
  DROP TYPE "public"."enum__training_programs_v_version_icon";
  DROP TYPE "public"."enum__training_programs_v_version_action_mode";
  DROP TYPE "public"."enum__training_programs_v_version_seo_robots";
  DROP TYPE "public"."enum__training_programs_v_version_status";
  DROP TYPE "public"."enum_memberships_badge_tone";
  DROP TYPE "public"."enum_memberships_card_variant";
  DROP TYPE "public"."enum_memberships_mesh_tone";
  DROP TYPE "public"."enum_memberships_action_mode";
  DROP TYPE "public"."enum_memberships_status";
  DROP TYPE "public"."enum__memberships_v_version_badge_tone";
  DROP TYPE "public"."enum__memberships_v_version_card_variant";
  DROP TYPE "public"."enum__memberships_v_version_mesh_tone";
  DROP TYPE "public"."enum__memberships_v_version_action_mode";
  DROP TYPE "public"."enum__memberships_v_version_status";
  DROP TYPE "public"."enum_tournaments_category_key";
  DROP TYPE "public"."enum_tournaments_lifecycle";
  DROP TYPE "public"."enum_tournaments_format_key";
  DROP TYPE "public"."enum_tournaments_action_mode";
  DROP TYPE "public"."enum_tournaments_visual_style";
  DROP TYPE "public"."enum_tournaments_image_overlay";
  DROP TYPE "public"."enum_tournaments_mesh_style";
  DROP TYPE "public"."enum_tournaments_icon";
  DROP TYPE "public"."enum_tournaments_seo_robots";
  DROP TYPE "public"."enum_tournaments_status";
  DROP TYPE "public"."enum__tournaments_v_version_category_key";
  DROP TYPE "public"."enum__tournaments_v_version_lifecycle";
  DROP TYPE "public"."enum__tournaments_v_version_format_key";
  DROP TYPE "public"."enum__tournaments_v_version_action_mode";
  DROP TYPE "public"."enum__tournaments_v_version_visual_style";
  DROP TYPE "public"."enum__tournaments_v_version_image_overlay";
  DROP TYPE "public"."enum__tournaments_v_version_mesh_style";
  DROP TYPE "public"."enum__tournaments_v_version_icon";
  DROP TYPE "public"."enum__tournaments_v_version_seo_robots";
  DROP TYPE "public"."enum__tournaments_v_version_status";
  DROP TYPE "public"."enum_gallery_items_status";
  DROP TYPE "public"."enum__gallery_items_v_version_status";
  DROP TYPE "public"."enum_reviews_source";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum__reviews_v_version_source";
  DROP TYPE "public"."enum__reviews_v_version_status";
  DROP TYPE "public"."enum_faqs_status";
  DROP TYPE "public"."enum__faqs_v_version_status";
  DROP TYPE "public"."enum_partners_status";
  DROP TYPE "public"."enum__partners_v_version_status";
  DROP TYPE "public"."enum_leads_type";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_homepage_sections_section";
  DROP TYPE "public"."enum_homepage_benefits_section_cards_variant";
  DROP TYPE "public"."enum_homepage_benefits_section_cards_overlay";
  DROP TYPE "public"."enum_homepage_benefits_section_cards_mesh_tone";
  DROP TYPE "public"."enum_homepage_benefits_section_cards_action_mode";
  DROP TYPE "public"."enum_homepage_offers_section_cards_variant";
  DROP TYPE "public"."enum_homepage_offers_section_cards_overlay";
  DROP TYPE "public"."enum_homepage_offers_section_cards_icon";
  DROP TYPE "public"."enum_homepage_offers_section_cards_action_mode";
  DROP TYPE "public"."enum_homepage_hero_primary_action_mode";
  DROP TYPE "public"."enum_homepage_hero_secondary_action_mode";
  DROP TYPE "public"."enum_homepage_pricing_section_default_tab";
  DROP TYPE "public"."enum_homepage_methodist_banner_mesh_tone";
  DROP TYPE "public"."enum_homepage_methodist_banner_action_mode";
  DROP TYPE "public"."enum_homepage_gallery_section_action_mode";
  DROP TYPE "public"."enum_homepage_blog_section_action_mode";
  DROP TYPE "public"."enum_homepage_seo_robots";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_sections_section";
  DROP TYPE "public"."enum__homepage_v_version_benefits_section_cards_variant";
  DROP TYPE "public"."enum__homepage_v_version_benefits_section_cards_overlay";
  DROP TYPE "public"."enum__homepage_v_version_benefits_section_cards_mesh_tone";
  DROP TYPE "public"."enum__homepage_v_version_benefits_section_cards_action_mode";
  DROP TYPE "public"."enum__homepage_v_version_offers_section_cards_variant";
  DROP TYPE "public"."enum__homepage_v_version_offers_section_cards_overlay";
  DROP TYPE "public"."enum__homepage_v_version_offers_section_cards_icon";
  DROP TYPE "public"."enum__homepage_v_version_offers_section_cards_action_mode";
  DROP TYPE "public"."enum__homepage_v_version_hero_primary_action_mode";
  DROP TYPE "public"."enum__homepage_v_version_hero_secondary_action_mode";
  DROP TYPE "public"."enum__homepage_v_version_pricing_section_default_tab";
  DROP TYPE "public"."enum__homepage_v_version_methodist_banner_mesh_tone";
  DROP TYPE "public"."enum__homepage_v_version_methodist_banner_action_mode";
  DROP TYPE "public"."enum__homepage_v_version_gallery_section_action_mode";
  DROP TYPE "public"."enum__homepage_v_version_blog_section_action_mode";
  DROP TYPE "public"."enum__homepage_v_version_seo_robots";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum_blog_page_seo_robots";
  DROP TYPE "public"."enum_blog_page_status";
  DROP TYPE "public"."enum__blog_page_v_version_seo_robots";
  DROP TYPE "public"."enum__blog_page_v_version_status";
  DROP TYPE "public"."enum_coaches_page_seo_robots";
  DROP TYPE "public"."enum_coaches_page_status";
  DROP TYPE "public"."enum__coaches_page_v_version_seo_robots";
  DROP TYPE "public"."enum__coaches_page_v_version_status";
  DROP TYPE "public"."enum_tournaments_page_seo_robots";
  DROP TYPE "public"."enum_tournaments_page_status";
  DROP TYPE "public"."enum__tournaments_page_v_version_seo_robots";
  DROP TYPE "public"."enum__tournaments_page_v_version_status";
  DROP TYPE "public"."enum_prices_page_seo_robots";
  DROP TYPE "public"."enum_prices_page_status";
  DROP TYPE "public"."enum__prices_page_v_version_seo_robots";
  DROP TYPE "public"."enum__prices_page_v_version_status";
  DROP TYPE "public"."enum_training_page_blocks_icon";
  DROP TYPE "public"."enum_training_page_action_mode";
  DROP TYPE "public"."enum_training_page_seo_robots";
  DROP TYPE "public"."enum_training_page_status";
  DROP TYPE "public"."enum__training_page_v_version_blocks_icon";
  DROP TYPE "public"."enum__training_page_v_version_action_mode";
  DROP TYPE "public"."enum__training_page_v_version_seo_robots";
  DROP TYPE "public"."enum__training_page_v_version_status";
  DROP TYPE "public"."enum_courts_page_metrics_icon";
  DROP TYPE "public"."enum_courts_page_seo_robots";
  DROP TYPE "public"."enum_courts_page_status";
  DROP TYPE "public"."enum__courts_page_v_version_metrics_icon";
  DROP TYPE "public"."enum__courts_page_v_version_seo_robots";
  DROP TYPE "public"."enum__courts_page_v_version_status";
  DROP TYPE "public"."enum_gallery_page_seo_robots";
  DROP TYPE "public"."enum_gallery_page_status";
  DROP TYPE "public"."enum__gallery_page_v_version_seo_robots";
  DROP TYPE "public"."enum__gallery_page_v_version_status";
  DROP TYPE "public"."enum_about_page_seo_robots";
  DROP TYPE "public"."enum_about_page_status";
  DROP TYPE "public"."enum__about_page_v_version_seo_robots";
  DROP TYPE "public"."enum__about_page_v_version_status";
  DROP TYPE "public"."enum_contacts_page_arrival_notes_icon";
  DROP TYPE "public"."enum_contacts_page_seo_robots";
  DROP TYPE "public"."enum_contacts_page_status";
  DROP TYPE "public"."enum__contacts_page_v_version_arrival_notes_icon";
  DROP TYPE "public"."enum__contacts_page_v_version_seo_robots";
  DROP TYPE "public"."enum__contacts_page_v_version_status";
  DROP TYPE "public"."enum_policy_page_seo_robots";
  DROP TYPE "public"."enum_policy_page_status";
  DROP TYPE "public"."enum__policy_page_v_version_seo_robots";
  DROP TYPE "public"."enum__policy_page_v_version_status";
  DROP TYPE "public"."enum_oferta_page_seo_robots";
  DROP TYPE "public"."enum_oferta_page_status";
  DROP TYPE "public"."enum__oferta_page_v_version_seo_robots";
  DROP TYPE "public"."enum__oferta_page_v_version_status";
  DROP TYPE "public"."enum_site_settings_mobile_navigation_icon";
  DROP TYPE "public"."enum_site_settings_footer_navigation_column";
  DROP TYPE "public"."enum_site_settings_social_links_provider";
  DROP TYPE "public"."enum_site_settings_analytics_mode";
  DROP TYPE "public"."enum_site_settings_booking_mode";
  DROP TYPE "public"."enum_site_settings_booking_provider_adapter";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_mobile_navigation_icon";
  DROP TYPE "public"."enum__site_settings_v_version_footer_navigation_column";
  DROP TYPE "public"."enum__site_settings_v_version_social_links_provider";
  DROP TYPE "public"."enum__site_settings_v_version_analytics_mode";
  DROP TYPE "public"."enum__site_settings_v_version_booking_mode";
  DROP TYPE "public"."enum__site_settings_v_version_booking_provider_adapter";
  DROP TYPE "public"."enum__site_settings_v_version_status";`)
}

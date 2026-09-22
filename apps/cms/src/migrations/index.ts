import * as migration_20260922_120000_seo_content_truth from './20260922_120000_seo_content_truth'
import * as migration_20260922_020000_responsive_media from './20260922_020000_responsive_media'
import * as migration_20260922_160100_hero_tint from './20260922_160100_hero_tint'
import * as migration_20260914_230951_analytics_mvp from './20260914_230951_analytics_mvp';
import * as migration_20260914_232431_analytics_late_event_marker from './20260914_232431_analytics_late_event_marker';
import * as migration_20260914_234029_page_map_redirects from './20260914_234029_page_map_redirects';
import * as migration_20260915_000622_external_integrations_notifications from './20260915_000622_external_integrations_notifications';
import * as migration_20260915_092628_cms_admin_pages from './20260915_092628_cms_admin_pages';
import * as migration_20260915_124056_add_page_hero_logo from './20260915_124056_add_page_hero_logo';
import * as migration_20260915_142020_tournament_regulation from './20260915_142020_tournament_regulation';
import * as migration_20260915_202623_training_gift_pages from './20260915_202623_training_gift_pages';
import * as migration_20260915_203042_editable_section_headings from './20260915_203042_editable_section_headings';
import * as migration_20260915_234500_add_lead_vk from './20260915_234500_add_lead_vk';
import * as migration_20260916_065756_desktop_navigation_icon from './20260916_065756_desktop_navigation_icon';
import * as migration_20260916_111209_mega_menu_navigation from './20260916_111209_mega_menu_navigation';
import * as migration_20260917_201823_add_padel_court_zakaz_page from './20260917_201823_add_padel_court_zakaz_page';
import * as migration_20260920_181150_add_admin_username from './20260920_181150_add_admin_username';
import * as migration_20260920_184128_tournament_cms from './20260920_184128_tournament_cms';
import * as migration_20260921_011600_gift_page_fields from './20260921_011600_gift_page_fields';
import * as migration_20260921_134500_training_page_content from './20260921_134500_training_page_content';

export const migrations = [
  {
    up: migration_20260914_230951_analytics_mvp.up,
    down: migration_20260914_230951_analytics_mvp.down,
    name: '20260914_230951_analytics_mvp',
  },
  {
    up: migration_20260914_232431_analytics_late_event_marker.up,
    down: migration_20260914_232431_analytics_late_event_marker.down,
    name: '20260914_232431_analytics_late_event_marker',
  },
  {
    up: migration_20260914_234029_page_map_redirects.up,
    down: migration_20260914_234029_page_map_redirects.down,
    name: '20260914_234029_page_map_redirects',
  },
  {
    up: migration_20260915_000622_external_integrations_notifications.up,
    down: migration_20260915_000622_external_integrations_notifications.down,
    name: '20260915_000622_external_integrations_notifications',
  },
  {
    up: migration_20260915_092628_cms_admin_pages.up,
    down: migration_20260915_092628_cms_admin_pages.down,
    name: '20260915_092628_cms_admin_pages',
  },
  {
    up: migration_20260915_124056_add_page_hero_logo.up,
    down: migration_20260915_124056_add_page_hero_logo.down,
    name: '20260915_124056_add_page_hero_logo',
  },
  {
    up: migration_20260915_142020_tournament_regulation.up,
    down: migration_20260915_142020_tournament_regulation.down,
    name: '20260915_142020_tournament_regulation',
  },
  {
    up: migration_20260915_202623_training_gift_pages.up,
    down: migration_20260915_202623_training_gift_pages.down,
    name: '20260915_202623_training_gift_pages',
  },
  {
    up: migration_20260915_203042_editable_section_headings.up,
    down: migration_20260915_203042_editable_section_headings.down,
    name: '20260915_203042_editable_section_headings',
  },
  {
    up: migration_20260915_234500_add_lead_vk.up,
    down: migration_20260915_234500_add_lead_vk.down,
    name: '20260915_234500_add_lead_vk',
  },
  {
    up: migration_20260916_065756_desktop_navigation_icon.up,
    down: migration_20260916_065756_desktop_navigation_icon.down,
    name: '20260916_065756_desktop_navigation_icon',
  },
  {
    up: migration_20260916_111209_mega_menu_navigation.up,
    down: migration_20260916_111209_mega_menu_navigation.down,
    name: '20260916_111209_mega_menu_navigation',
  },
  {
    up: migration_20260917_201823_add_padel_court_zakaz_page.up,
    down: migration_20260917_201823_add_padel_court_zakaz_page.down,
    name: '20260917_201823_add_padel_court_zakaz_page',
  },
  {
    up: migration_20260920_181150_add_admin_username.up,
    down: migration_20260920_181150_add_admin_username.down,
    name: '20260920_181150_add_admin_username',
  },
  {
    up: migration_20260920_184128_tournament_cms.up,
    down: migration_20260920_184128_tournament_cms.down,
    name: '20260920_184128_tournament_cms'
  },
  {
    up: migration_20260921_011600_gift_page_fields.up,
    down: migration_20260921_011600_gift_page_fields.down,
    name: '20260921_011600_gift_page_fields'
  },
  {
    up: migration_20260921_134500_training_page_content.up,
    down: migration_20260921_134500_training_page_content.down,
    name: '20260921_134500_training_page_content'
  },
  { up: migration_20260922_020000_responsive_media.up, down: migration_20260922_020000_responsive_media.down, name: '20260922_020000_responsive_media' },
  { up: migration_20260922_120000_seo_content_truth.up, down: migration_20260922_120000_seo_content_truth.down, name: '20260922_120000_seo_content_truth' },
  { up: migration_20260922_160100_hero_tint.up, down: migration_20260922_160100_hero_tint.down, name: '20260922_160100_hero_tint' },
];

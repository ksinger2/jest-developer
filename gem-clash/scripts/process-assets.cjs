#!/usr/bin/env node
/**
 * Asset Processing Script for Gem Link
 *
 * - Reads source PNGs from the AssetCreator approved directory
 * - Removes black backgrounds (makes transparent)
 * - Resizes to target dimensions
 * - Saves to public/assets/ with the correct game filenames
 *
 * Usage: node scripts/process-assets.cjs
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ============================================================
// PATHS
// ============================================================

const ASSET_SRC = '/mnt/c/Users/karen/Desktop/Github Projects/AssetCreator/assisty/production/outputs/approved';
const ASSET_DST = path.join(__dirname, '..', 'public', 'assets');
const REVIEW_DST = path.join(__dirname, '..', 'review-only');  // extras that don't ship in build

// ============================================================
// ASSET MAPPING — source file → destination file + target size
// ============================================================

const ASSET_MAP = [
  // ── Primary Board Gems (6) → public/assets/gems/ ──
  // Swapped: ruby-briolette replaces ruby-round, sapphire-marquise replaces sapphire-diamond, aqua-shield replaces orange-starcut
  { src: 'board/gem-ruby-briolette_board_01.png',     dst: 'gems/gem_heart.png',      size: 128 },
  { src: 'board/gem-sapphire-marquise_board_02.png',  dst: 'gems/gem_diamond.png',    size: 128 },
  { src: 'board/gem-emerald-square_board_03.png',     dst: 'gems/gem_square.png',     size: 128 },
  { src: 'board/gem-yellow-wide-radiant_board_25.png', dst: 'gems/gem_triangle.png',   size: 128 },  // was citrine-triangle → yellow-wide-radiant
  { src: 'board/gem-amethyst-hex_board_04.png',       dst: 'gems/gem_circle.png',     size: 128 },
  { src: 'board/gem-orange-wide-chevron_board_28.png', dst: 'gems/gem_star.png',      size: 128 },   // was aqua-shield → orange-wide-chevron

  // ── UI Sprites → public/assets/ui/ ──
  { src: 'booster/bomb-icon_booster_01.png',          dst: 'ui/ui_bomb.png',          size: 128 },
  { src: 'booster/rainbow-icon_booster_02.png',       dst: 'ui/ui_rainbow.png',       size: 128 },
  { src: 'menu/coin-icon_menu_07.png',                dst: 'ui/ui_coin.png',          size: 128 },
  { src: 'menu/star-menu-icon_menu_11.png',           dst: 'ui/ui_star.png',          size: 128 },   // was amber-hexstar
  { src: 'booster/reverse-icon_booster_03.png',       dst: 'ui/ui_hammer.png',        size: 128 },
  { src: 'menu/heart-life-icon_menu_06.png',          dst: 'ui/ui_heart.png',         size: 128 },
  { src: 'menu/blue-gem-currency-icon_menu_08.png',   dst: 'ui/ui_gem.png',           size: 128 },
  { src: 'logo/gem-link-logo_logo_01.png',            dst: 'ui/ui_logo.png',          size: null, maxWidth: 300 },
  { src: 'booster/rainbow-icon_booster_02.png',       dst: 'ui/circle_rainbow.png',   size: 128 },

  // ── Chests → public/assets/ui/ (fills previously missing assets!) ──
  { src: 'reward/open-chest-gold_reward_02.png',      dst: 'ui/ui_chest_open.png',    size: 128 },
  { src: 'reward/open-chest-blue_reward_04.png',      dst: 'ui/ui_chest_closed.png',  size: 128 },

  // ── Frames → public/assets/frames/ (ornate-gold is now primary) ──
  { src: 'frame/board-frame-v2-ornate-gold_frame_03.png', dst: 'frames/frame_board.png',       size: null, maxWidth: 400 },  // was level-frame → ornate-gold
  { src: 'frame/level-frame_frame_01.png',                dst: 'frames/frame_level_old.png',   size: null, maxWidth: 400, reviewOnly: true },
  { src: 'frame/board-frame_frame_02.png',                dst: 'frames/frame_board_v2.png',    size: null, maxWidth: 400, reviewOnly: true },
  { src: 'frame/board-frame-v3-wood-gold_frame_04.png',  dst: 'frames/frame_wood_gold.png',   size: null, maxWidth: 400, reviewOnly: true },
  { src: 'frame/board-frame-v4-crystal_frame_05.png',    dst: 'frames/frame_crystal.png',     size: null, maxWidth: 400, reviewOnly: true },

  // ── Backgrounds → public/assets/backgrounds/ ──
  // Primary (used in game scenes) — swapped per user request
  { src: 'background/background-highland-valley-day_background_18.png',    dst: 'backgrounds/bg_gameplay.png',       size: null, maxWidth: 400 },  // was forest-day → highland-valley
  { src: 'background/background-rainbow-falls-evening_background_20.png',  dst: 'backgrounds/bg_menu.png',           size: null, maxWidth: 400 },  // was forest-main → rainbow-falls
  { src: 'background/background-meadow_background_05.png',                 dst: 'backgrounds/bg_shop.png',           size: null, maxWidth: 400 },
  { src: 'background/background-crystal-canyon-sunset_background_15.png',  dst: 'backgrounds/bg_level_select.png',   size: null, maxWidth: 400 },  // was mountain → crystal-canyon
  // Extra backgrounds → review-only (NOT shipped in build)
  { src: 'background/board-background-forest-day_background_01.png',       dst: 'backgrounds/bg_forest_day_old.png', size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-forest-main_background_04.png',            dst: 'backgrounds/bg_forest_main_old.png',size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-mountain_background_07.png',               dst: 'backgrounds/bg_mountain_old.png',   size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/board-background-waterfall_background_02.png',        dst: 'backgrounds/bg_waterfall.png',      size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/board-background-sunset_background_03.png',           dst: 'backgrounds/bg_sunset.png',         size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-river_background_06.png',                  dst: 'backgrounds/bg_river.png',          size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-night-glow_background_08.png',             dst: 'backgrounds/bg_night_glow.png',     size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/board-background-forest-path-dawn_background_09.png', dst: 'backgrounds/bg_forest_dawn.png',    size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/board-background-forest-path-day_background_10.png',  dst: 'backgrounds/bg_forest_day.png',     size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/board-background-forest-path-sunset_background_11.png', dst: 'backgrounds/bg_forest_sunset.png', size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/board-background-forest-path-night_background_12.png', dst: 'backgrounds/bg_forest_night.png',  size: null, maxWidth: 400, reviewOnly: true },
  // NEW backgrounds
  { src: 'background/background-misty-waterfall-dawn_background_13.png',   dst: 'backgrounds/bg_misty_waterfall.png',  size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-emerald-forest-sunbeams_background_14.png', dst: 'backgrounds/bg_emerald_forest.png',  size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-crystal-canyon-sunset_background_15.png',  dst: 'backgrounds/bg_crystal_canyon.png',   size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-enchanted-river-morning_background_16.png', dst: 'backgrounds/bg_enchanted_river.png', size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-moonlit-grove-glow_background_17.png',    dst: 'backgrounds/bg_moonlit_grove.png',    size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-highland-valley-day_background_18.png',   dst: 'backgrounds/bg_highland_valley.png',  size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-ancient-ruins-jungle_background_19.png',  dst: 'backgrounds/bg_ancient_ruins.png',    size: null, maxWidth: 400, reviewOnly: true },
  { src: 'background/background-rainbow-falls-evening_background_20.png', dst: 'backgrounds/bg_rainbow_falls.png',    size: null, maxWidth: 400, reviewOnly: true },

  // ── Banners → green promoted to build for button backgrounds ──
  { src: 'banner/banner-green-pill_banner_04.png',    dst: 'ui/banner_green.png',        size: null, maxWidth: 256 },   // promoted: fallback button bg
  { src: 'banner/banner-gold-wide_banner_01.png',     dst: 'ui/extra/banner_gold.png',   size: null, maxWidth: 256, reviewOnly: true },
  { src: 'banner/banner-blue-ribbon_banner_02.png',   dst: 'ui/extra/banner_blue.png',   size: null, maxWidth: 256, reviewOnly: true },
  { src: 'banner/banner-red-badge_banner_03.png',     dst: 'ui/extra/banner_red.png',    size: null, maxWidth: 256, reviewOnly: true },

  // ── Scene Map Segments (4) → review-only ──
  { src: 'scene/scene-map-path-segment-01_scene_01.png', dst: 'ui/extra/map_segment_01.png', size: null, maxWidth: 256, reviewOnly: true },
  { src: 'scene/scene-map-path-segment-02_scene_02.png', dst: 'ui/extra/map_segment_02.png', size: null, maxWidth: 256, reviewOnly: true },
  { src: 'scene/scene-map-path-segment-03_scene_03.png', dst: 'ui/extra/map_segment_03.png', size: null, maxWidth: 256, reviewOnly: true },
  { src: 'scene/scene-map-path-segment-04_scene_04.png', dst: 'ui/extra/map_segment_04.png', size: null, maxWidth: 256, reviewOnly: true },
  // NEW scene elements
  { src: 'scene/scene-map-level-node-wood_scene_05.png',    dst: 'ui/extra/map_node_wood.png',     size: 128, reviewOnly: true },
  { src: 'scene/scene-map-level-node-stone_scene_06.png',   dst: 'ui/extra/map_node_stone.png',    size: 128, reviewOnly: true },
  { src: 'scene/scene-map-level-node-gold_scene_07.png',    dst: 'ui/extra/map_node_gold.png',     size: 128, reviewOnly: true },
  { src: 'scene/scene-map-bridge-over-stream_scene_08.png', dst: 'ui/extra/map_bridge.png',        size: null, maxWidth: 256, reviewOnly: true },
  { src: 'scene/scene-map-gate-next-world_scene_09.png',    dst: 'ui/extra/map_gate.png',          size: null, maxWidth: 256, reviewOnly: true },
  { src: 'scene/scene-map-decoration-lantern_scene_10.png', dst: 'ui/extra/map_lantern.png',       size: 128, reviewOnly: true },
  { src: 'scene/scene-map-decoration-signpost_scene_11.png', dst: 'ui/extra/map_signpost.png',     size: 128, reviewOnly: true },

  // ── Extra Board Gems → review-only ──
  // Also keep old primaries as extras for potential swap-back
  { src: 'board/gem-citrine-triangle_board_05.png',   dst: 'gems/extra/gem_citrine_triangle.png',   size: 128, reviewOnly: true },
  { src: 'board/gem-aqua-shield_board_06.png',        dst: 'gems/extra/gem_aqua_shield_old.png',    size: 128, reviewOnly: true },
  { src: 'board/gem-ruby-round_board_01.png',         dst: 'gems/extra/gem_ruby_round.png',         size: 128, reviewOnly: true },
  { src: 'board/gem-sapphire-diamond_board_02.png',   dst: 'gems/extra/gem_sapphire_diamond.png',   size: 128, reviewOnly: true },
  { src: 'board/gem-orange-starcut_board_08.png',     dst: 'gems/extra/gem_orange_starcut.png',     size: 128, reviewOnly: true },
  { src: 'board/gem-ruby-briolette_board_01.png',     dst: 'gems/extra/gem_ruby_briolette.png',     size: 128, reviewOnly: true },
  { src: 'board/gem-sapphire-marquise_board_02.png',  dst: 'gems/extra/gem_sapphire_marquise.png',  size: 128, reviewOnly: true },
  { src: 'board/gem-emerald-pear_board_03.png',       dst: 'gems/extra/gem_emerald_pear.png',       size: 128, reviewOnly: true },
  { src: 'board/gem-amethyst-kite_board_04.png',      dst: 'gems/extra/gem_amethyst_kite.png',      size: 128, reviewOnly: true },
  { src: 'board/gem-citrine-navette_board_05.png',    dst: 'gems/extra/gem_citrine_navette.png',    size: 128, reviewOnly: true },
  { src: 'board/gem-aqua-shield_board_06.png',        dst: 'gems/extra/gem_aqua_shield.png',        size: 128, reviewOnly: true },
  { src: 'board/gem-pink-lozenge_board_07.png',       dst: 'gems/extra/gem_pink_lozenge.png',       size: 128, reviewOnly: true },
  { src: 'board/gem-lime-pentagon_board_09.png',      dst: 'gems/extra/gem_lime_pentagon.png',       size: 128, reviewOnly: true },
  { src: 'board/gem-violet-chevron_board_10.png',     dst: 'gems/extra/gem_violet_chevron.png',      size: 128, reviewOnly: true },
  { src: 'board/gem-crimson-radiant_board_11.png',    dst: 'gems/extra/gem_crimson_radiant.png',     size: 128, reviewOnly: true },
  { src: 'board/gem-cyan-arrowhead_board_12.png',     dst: 'gems/extra/gem_cyan_arrowhead.png',      size: 128, reviewOnly: true },
  { src: 'board/gem-amber-hexstar_board_13.png',      dst: 'gems/extra/gem_amber_hexstar.png',       size: 128, reviewOnly: true },
  { src: 'board/gem-magenta-baguette_board_14.png',   dst: 'gems/extra/gem_magenta_baguette.png',    size: 128, reviewOnly: true },
  { src: 'board/gem-iceblue-trapezoid_board_15.png',  dst: 'gems/extra/gem_iceblue_trapezoid.png',   size: 128, reviewOnly: true },
  // NEW: Yellow gem candidates
  { src: 'board/gem-yellow-wide-navette_board_21.png',          dst: 'gems/extra/gem_yellow_wide_navette.png',         size: 128, reviewOnly: true },
  { src: 'board/gem-yellow-wide-shield_board_22.png',           dst: 'gems/extra/gem_yellow_wide_shield.png',          size: 128, reviewOnly: true },
  { src: 'board/gem-yellow-wide-lozenge_board_23.png',           dst: 'gems/extra/gem_yellow_wide_lozenge.png',         size: 128, reviewOnly: true },
  { src: 'board/gem-yellow-wide-kite_board_24.png',             dst: 'gems/extra/gem_yellow_wide_kite.png',            size: 128, reviewOnly: true },
  { src: 'board/gem-yellow-wide-radiant_board_25.png',          dst: 'gems/extra/gem_yellow_wide_radiant.png',         size: 128, reviewOnly: true },
  // NEW: Orange/star gem candidates
  { src: 'board/gem-orange-wide-baguette_board_26.png',         dst: 'gems/extra/gem_orange_wide_baguette.png',        size: 128, reviewOnly: true },
  { src: 'board/gem-orange-wide-hexcut_board_27.png',           dst: 'gems/extra/gem_orange_wide_hexcut.png',          size: 128, reviewOnly: true },
  { src: 'board/gem-orange-wide-chevron_board_28.png',          dst: 'gems/extra/gem_orange_wide_chevron.png',         size: 128, reviewOnly: true },
  { src: 'board/gem-orange-wide-pear-horizontal_board_29.png',  dst: 'gems/extra/gem_orange_wide_pear.png',            size: 128, reviewOnly: true },
  { src: 'board/gem-orange-wide-trillion-elongated_board_30.png', dst: 'gems/extra/gem_orange_wide_trillion.png',      size: 128, reviewOnly: true },
  // NEW: Wide-style gem variants (board_32-42)
  { src: 'board/gem-midnightblue-wide-shield_board_32.png',     dst: 'gems/extra/gem_midnightblue_wide_shield.png',  size: 128, reviewOnly: true },
  { src: 'board/gem-cobaltblue-wide-radiant_board_33.png',      dst: 'gems/extra/gem_cobaltblue_wide_radiant.png',   size: 128, reviewOnly: true },
  { src: 'board/gem-teal-wide-kite_board_35.png',               dst: 'gems/extra/gem_teal_wide_kite.png',            size: 128, reviewOnly: true },
  { src: 'board/gem-aquamarine-wide-chevron_board_36.png',      dst: 'gems/extra/gem_aquamarine_wide_chevron.png',   size: 128, reviewOnly: true },
  { src: 'board/gem-magenta-wide-baguette_board_37.png',        dst: 'gems/extra/gem_magenta_wide_baguette.png',     size: 128, reviewOnly: true },
  { src: 'board/gem-fuchsia-wide-rhombus_board_38.png',         dst: 'gems/extra/gem_fuchsia_wide_rhombus.png',      size: 128, reviewOnly: true },
  { src: 'board/gem-rosepink-wide-shield_board_40.png',         dst: 'gems/extra/gem_rosepink_wide_shield.png',      size: 128, reviewOnly: true },
  { src: 'board/gem-indigo-wide-emeraldcut_board_41.png',       dst: 'gems/extra/gem_indigo_wide_emeraldcut.png',    size: 128, reviewOnly: true },
  { src: 'board/gem-lilac-wide-hexcut_board_42.png',            dst: 'gems/extra/gem_lilac_wide_hexcut.png',         size: 128, reviewOnly: true },

  // ── UI Sprites — promoted to build for game integration ──
  { src: 'menu/play-button-green-primary_menu_12.png',      dst: 'ui/btn_play_green.png',      size: null, maxWidth: 200 },   // promoted: Play button
  { src: 'menu/progress-bar-empty_menu_04.png',             dst: 'ui/progress_bar_empty.png',  size: null, maxWidth: 300 },   // promoted: progress bar bg
  { src: 'menu/progress-bar-full_menu_05.png',              dst: 'ui/progress_bar_full.png',   size: null, maxWidth: 300 },   // promoted: progress bar fill
  { src: 'header/level-header_header_02.png',               dst: 'ui/header_level.png',        size: null, maxWidth: 256 },   // promoted: level select header
  { src: 'header/shop-header_header_01.png',                dst: 'ui/header_shop.png',         size: null, maxWidth: 256 },   // promoted: shop header
  { src: 'reward/level-complete-celebration_reward_01.png',  dst: 'ui/level_complete.png',      size: null, maxWidth: 256 },   // promoted: level complete screen
  // Extra UI → review-only
  { src: 'menu/next-button-home-primary_menu_01.png', dst: 'ui/extra/btn_play.png',             size: null, maxWidth: 200, reviewOnly: true },
  { src: 'menu/play-button-secondary_menu_02.png',    dst: 'ui/extra/btn_play_alt.png',         size: null, maxWidth: 200, reviewOnly: true },
  { src: 'menu/shop-button-home_menu_03.png',         dst: 'ui/extra/btn_shop.png',             size: null, maxWidth: 200, reviewOnly: true },
  { src: 'menu/collect-button_menu_09.png',           dst: 'ui/extra/btn_collect.png',          size: null, maxWidth: 200, reviewOnly: true },
  { src: 'menu/next-button_menu_10.png',              dst: 'ui/extra/btn_next.png',             size: null, maxWidth: 200, reviewOnly: true },
  { src: 'reward/open-chest-red_reward_03.png',       dst: 'ui/extra/chest_red.png',            size: 128, reviewOnly: true },

  // ── Symbols → arrows & settings promoted to build ──
  { src: 'symbol/arrow-right-icon_symbol_02.png',     dst: 'ui/icon_arrow_right.png',           size: 64 },   // promoted: next buttons
  { src: 'symbol/arrow-left-icon_symbol_03.png',      dst: 'ui/icon_arrow_left.png',            size: 64 },   // promoted: back buttons
  { src: 'symbol/settings-gear-icon_symbol_05.png',   dst: 'ui/icon_settings.png',              size: 64 },   // promoted: settings gear
  { src: 'symbol/plus-icon_symbol_01.png',            dst: 'ui/extra/icon_plus.png',             size: 64, reviewOnly: true },
  { src: 'symbol/arrow-curved-icon_symbol_04.png',    dst: 'ui/extra/icon_arrow_curved.png',     size: 64, reviewOnly: true },

  // ── Typography — digits promoted to build for score/counter rendering ──
  // Digits 0-9 → public/assets/typography/
  { src: 'typography/digit-0_typography_01.png',       dst: 'typography/digit_0.png',   size: 64 },
  { src: 'typography/digit-1_typography_02.png',       dst: 'typography/digit_1.png',   size: 64 },
  { src: 'typography/digit-2_typography_03.png',       dst: 'typography/digit_2.png',   size: 64 },
  { src: 'typography/digit-3_typography_04.png',       dst: 'typography/digit_3.png',   size: 64 },
  { src: 'typography/digit-4_typography_05.png',       dst: 'typography/digit_4.png',   size: 64 },
  { src: 'typography/digit-5_typography_06.png',       dst: 'typography/digit_5.png',   size: 64 },
  { src: 'typography/digit-6_typography_07.png',       dst: 'typography/digit_6.png',   size: 64 },
  { src: 'typography/digit-7_typography_08.png',       dst: 'typography/digit_7.png',   size: 64 },
  { src: 'typography/digit-8_typography_09.png',       dst: 'typography/digit_8.png',   size: 64 },
  { src: 'typography/digit-9_typography_10.png',       dst: 'typography/digit_9.png',   size: 64 },
  // Letters a-z (missing x)
  { src: 'typography/letter-a_typography_11.png',      dst: 'typography/letter_a.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-b_typography_12.png',      dst: 'typography/letter_b.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-c_typography_13.png',      dst: 'typography/letter_c.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-d_typography_14.png',      dst: 'typography/letter_d.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-e_typography_15.png',      dst: 'typography/letter_e.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-f_typography_16.png',      dst: 'typography/letter_f.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-g_typography_17.png',      dst: 'typography/letter_g.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-h_typography_18.png',      dst: 'typography/letter_h.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-i_typography_19.png',      dst: 'typography/letter_i.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-j_typography_20.png',      dst: 'typography/letter_j.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-k_typography_21.png',      dst: 'typography/letter_k.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-l_typography_22.png',      dst: 'typography/letter_l.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-m_typography_23.png',      dst: 'typography/letter_m.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-n_typography_24.png',      dst: 'typography/letter_n.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-o_typography_25.png',      dst: 'typography/letter_o.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-p_typography_26.png',      dst: 'typography/letter_p.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-q_typography_27.png',      dst: 'typography/letter_q.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-r_typography_28.png',      dst: 'typography/letter_r.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-s_typography_29.png',      dst: 'typography/letter_s.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-t_typography_30.png',      dst: 'typography/letter_t.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-u_typography_31.png',      dst: 'typography/letter_u.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-v_typography_32.png',      dst: 'typography/letter_v.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-w_typography_33.png',      dst: 'typography/letter_w.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-x_typography_34.png',      dst: 'typography/letter_x.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-y_typography_35.png',      dst: 'typography/letter_y.png',  size: 64, reviewOnly: true },
  { src: 'typography/letter-z_typography_36.png',      dst: 'typography/letter_z.png',  size: 64, reviewOnly: true },
];

// ============================================================
// BLACK BACKGROUND REMOVAL
// Ported from design-editor.html removeBlackBackground()
// ============================================================

const BG_TOLERANCE = 25;
const DARK_THRESHOLD = 40;

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function removeBlackBackground(pixels, width, height) {
  // Sample corner pixels to detect background color
  const corners = [
    getPixel(pixels, width, 0, 0),
    getPixel(pixels, width, width - 1, 0),
    getPixel(pixels, width, 0, height - 1),
    getPixel(pixels, width, width - 1, height - 1),
  ];

  // Average corner colors as the background color
  const bgR = Math.round(corners.reduce((s, c) => s + c.r, 0) / 4);
  const bgG = Math.round(corners.reduce((s, c) => s + c.g, 0) / 4);
  const bgB = Math.round(corners.reduce((s, c) => s + c.b, 0) / 4);

  const tolerance = BG_TOLERANCE;
  const smoothTolerance = tolerance * 1.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      const dist = colorDistance(r, g, b, bgR, bgG, bgB);
      const avg = (r + g + b) / 3;

      if (dist < tolerance) {
        // Within tolerance → fully transparent
        pixels[idx + 3] = 0;
      } else if (dist < smoothTolerance) {
        // Edge smoothing — partial alpha for smooth borders
        const alpha = Math.round(((dist - tolerance) / (smoothTolerance - tolerance)) * 255);
        pixels[idx + 3] = Math.min(pixels[idx + 3], alpha);
      } else if (avg < DARK_THRESHOLD && dist < smoothTolerance) {
        // Catch remaining dark pixels near background color
        const alpha = Math.round(((dist - tolerance) / (smoothTolerance - tolerance)) * 255);
        pixels[idx + 3] = Math.min(pixels[idx + 3], alpha);
      }
    }
  }

  return pixels;
}

function getPixel(pixels, width, x, y) {
  const idx = (y * width + x) * 4;
  return { r: pixels[idx], g: pixels[idx + 1], b: pixels[idx + 2], a: pixels[idx + 3] };
}

// ============================================================
// CROP TRANSPARENT PADDING — trim empty space around the subject
// ============================================================

function findBoundingBox(pixels, width, height) {
  let top = height, bottom = 0, left = width, right = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (pixels[idx + 3] > 10) { // non-transparent pixel
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  // Add 2px padding
  top = Math.max(0, top - 2);
  bottom = Math.min(height - 1, bottom + 2);
  left = Math.max(0, left - 2);
  right = Math.min(width - 1, right + 2);
  return { top, bottom, left, right, cropW: right - left + 1, cropH: bottom - top + 1 };
}

// ============================================================
// PROCESS SINGLE ASSET
// ============================================================

async function processAsset(entry) {
  const srcPath = path.join(ASSET_SRC, entry.src);
  const baseDir = entry.reviewOnly ? REVIEW_DST : ASSET_DST;
  const dstPath = path.join(baseDir, entry.dst);

  // Check source exists
  if (!fs.existsSync(srcPath)) {
    console.log(`  SKIP: ${entry.src} (source not found)`);
    return false;
  }

  // Create destination directory
  const dstDir = path.dirname(dstPath);
  fs.mkdirSync(dstDir, { recursive: true });

  // Read source image as raw RGBA
  const image = sharp(srcPath);
  const metadata = await image.metadata();
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data.buffer, data.byteOffset, data.length);

  // Remove black background
  removeBlackBackground(pixels, info.width, info.height);

  // Find bounding box of non-transparent content
  const bbox = findBoundingBox(pixels, info.width, info.height);

  // Create cropped image from processed pixels
  let processed = sharp(Buffer.from(pixels.buffer), {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .extract({ left: bbox.left, top: bbox.top, width: bbox.cropW, height: bbox.cropH });

  // Resize to target size if specified
  if (entry.size) {
    processed = processed.resize(entry.size, entry.size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  } else if (entry.maxWidth) {
    // Cap width while preserving aspect ratio
    processed = processed.resize(entry.maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  await processed.png({ compressionLevel: 9 }).toFile(dstPath);

  const stat = fs.statSync(dstPath);
  const sizeKB = (stat.size / 1024).toFixed(1);
  console.log(`  OK: ${entry.dst} (${sizeKB} KB)`);
  return true;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('=== Gem Link Asset Processor ===\n');
  console.log(`Source: ${ASSET_SRC}`);
  console.log(`Destination: ${ASSET_DST}\n`);
  console.log(`Total entries: ${ASSET_MAP.length}\n`);

  let processed = 0;
  let skipped = 0;

  // Process primary game assets first (not in extra/ or typography/)
  console.log('--- Primary Game Assets ---');
  for (const entry of ASSET_MAP) {
    if (!entry.dst.includes('extra/') && !entry.dst.startsWith('typography/')) {
      const ok = await processAsset(entry);
      ok ? processed++ : skipped++;
    }
  }

  // Process extra assets
  console.log('\n--- Extra Assets (bonus) ---');
  for (const entry of ASSET_MAP) {
    if (entry.dst.includes('extra/') || entry.dst.startsWith('typography/')) {
      const ok = await processAsset(entry);
      ok ? processed++ : skipped++;
    }
  }

  console.log(`\n=== Done: ${processed} processed, ${skipped} skipped ===`);

  // Report missing critical assets
  const missing = [];
  const criticalKeys = [
    'gems/gem_heart.png', 'gems/gem_diamond.png', 'gems/gem_square.png',
    'gems/gem_triangle.png', 'gems/gem_circle.png', 'gems/gem_star.png',
    'ui/ui_bomb.png', 'ui/ui_rainbow.png', 'ui/ui_coin.png', 'ui/ui_star.png',
    'ui/ui_hammer.png', 'ui/ui_heart.png', 'ui/ui_gem.png', 'ui/ui_logo.png',
    'ui/circle_rainbow.png', 'ui/ui_chest_open.png', 'ui/ui_chest_closed.png',
    'backgrounds/bg_gameplay.png', 'backgrounds/bg_menu.png',
    'backgrounds/bg_shop.png', 'backgrounds/bg_level_select.png',
    // Newly promoted UI assets
    'ui/btn_play_green.png', 'ui/icon_arrow_right.png', 'ui/icon_arrow_left.png',
    'ui/icon_settings.png', 'ui/header_level.png', 'ui/header_shop.png',
    'ui/progress_bar_empty.png', 'ui/progress_bar_full.png',
    'ui/banner_green.png', 'ui/level_complete.png',
    // Digits
    'typography/digit_0.png', 'typography/digit_1.png', 'typography/digit_2.png',
    'typography/digit_3.png', 'typography/digit_4.png', 'typography/digit_5.png',
    'typography/digit_6.png', 'typography/digit_7.png', 'typography/digit_8.png',
    'typography/digit_9.png',
  ];
  for (const key of criticalKeys) {
    if (!fs.existsSync(path.join(ASSET_DST, key))) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.log('\n⚠ MISSING ASSETS (game will use fallbacks):');
    missing.forEach(m => console.log(`  - ${m}`));
  } else {
    console.log('\n✓ All critical assets present!');
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});

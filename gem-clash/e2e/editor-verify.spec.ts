import { test, expect } from '@playwright/test';

/**
 * Design Editor Verification
 * Confirms the editor loads and key interactive features work correctly.
 * Validates that sprite assets are properly integrated.
 */

// Editor needs a wide viewport (controls 340px + preview ~410px + properties 280px)
test.use({ viewport: { width: 1200, height: 800 } });

test.describe('Design Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design-editor.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('loads with all panels and core UI', async ({ page }) => {
    // Controls panel loads
    await expect(page.locator('.controls-panel h1')).toContainText('Gem Link Designer');

    // All 4 screen tabs present
    const tabs = page.locator('.controls-panel .screen-tab');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toHaveText('Menu');
    await expect(tabs.nth(1)).toHaveText('Game');
    await expect(tabs.nth(2)).toHaveText('Shop');
    await expect(tabs.nth(3)).toHaveText('Levels');

    // Menu screen is active by default
    await expect(page.locator('#screen-menu')).toHaveClass(/active/);

    // Phone frame renders
    await expect(page.locator('.phone-frame')).toBeVisible();
    await expect(page.locator('.phone-screen')).toBeVisible();

    // Properties panel present
    await expect(page.locator('.properties-panel')).toBeVisible();

    // Asset upload zone present
    await expect(page.locator('#upload-zone')).toBeVisible();

    // Export button present
    await expect(page.locator('.btn-export')).toBeVisible();
  });

  test('menu screen has editable elements with sprites', async ({ page }) => {
    // Logo renders as image
    const logo = page.locator('[data-name="Logo"] img');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /ui_logo/);

    // Play button
    await expect(page.locator('[data-name="Play Button"]')).toContainText('PLAY');

    // Shop button
    await expect(page.locator('[data-name="Shop Button"]')).toContainText('SHOP');

    // Gem preview with 15 gem images
    const previewGems = page.locator('img.preview-gem');
    await expect(previewGems).toHaveCount(15);

    // First gem is a sprite with valid src
    await expect(previewGems.first()).toHaveAttribute('src', /assets\/gems\/gem_/);
  });

  test('screen tabs switch correctly with sprites', async ({ page }) => {
    // Switch to Game screen
    await page.locator('.controls-panel .screen-tab[data-screen="gameplay"]').click();
    await expect(page.locator('#screen-gameplay')).toHaveClass(/active/);
    await expect(page.locator('#screen-menu')).not.toHaveClass(/active/);

    // Board with 64 gem images
    const boardGems = page.locator('img.board-gem');
    await expect(boardGems).toHaveCount(64);
    await expect(boardGems.first()).toHaveAttribute('src', /assets\/gems\/gem_/);

    // Booster buttons with sprite images
    const boosterImgs = page.locator('.booster-btn img');
    await expect(boosterImgs).toHaveCount(3);
    await expect(boosterImgs.nth(0)).toHaveAttribute('src', /ui_hammer/);
    await expect(boosterImgs.nth(1)).toHaveAttribute('src', /ui_bomb/);
    await expect(boosterImgs.nth(2)).toHaveAttribute('src', /ui_rainbow/);

    // HUD icons are sprite images
    const hudIcons = page.locator('img.hud-icon');
    await expect(hudIcons).toHaveCount(3);

    // Switch to Shop screen
    await page.locator('.controls-panel .screen-tab[data-screen="shop"]').click();
    await expect(page.locator('#screen-shop')).toHaveClass(/active/);

    // Shop cards present with sprite icons
    await expect(page.locator('.el-shop-card')).toHaveCount(3);
    const shopIcons = page.locator('.shop-card-icon img');
    await expect(shopIcons).toHaveCount(3);

    // Switch to Levels screen
    await page.locator('.controls-panel .screen-tab[data-screen="levels"]').click();
    await expect(page.locator('#screen-levels')).toHaveClass(/active/);

    // Level nodes: 30 total
    await expect(page.locator('.level-node')).toHaveCount(30);
  });

  test('element selection shows properties panel', async ({ page }) => {
    // Click on the Play button element in the phone preview
    await page.locator('[data-name="Play Button"]').click();

    // Properties panel shows editor
    await expect(page.locator('#prop-editor')).toBeVisible();

    // Size fields populated
    await expect(page.locator('#prop-width')).toHaveValue('200');
    await expect(page.locator('#prop-height')).toHaveValue('50');

    // Resize handles appear on selected element
    await expect(page.locator('[data-name="Play Button"] .resize-handle')).toHaveCount(8);
  });

  test('component size sliders update values', async ({ page }) => {
    // Board columns slider
    const colsSlider = page.locator('#board-cols');
    await expect(colsSlider).toBeVisible();

    // Change columns from 8 to 6
    await colsSlider.fill('6');
    await colsSlider.dispatchEvent('input');

    // Value display updates
    await expect(page.locator('#board-cols-val')).toHaveText('6');
  });

  test('gem and booster mapping sections present', async ({ page }) => {
    // 6 gem color mapping slots
    await expect(page.locator('.gem-map-slot')).toHaveCount(6);

    // 3 booster mapping slots with sprite images
    const boosterSlots = page.locator('.booster-map-slot');
    await expect(boosterSlots).toHaveCount(3);
    await expect(boosterSlots.nth(0).locator('img')).toHaveAttribute('src', /ui_hammer/);
    await expect(boosterSlots.nth(1).locator('img')).toHaveAttribute('src', /ui_bomb/);
    await expect(boosterSlots.nth(2).locator('img')).toHaveAttribute('src', /ui_rainbow/);
  });

  test('export button does not throw errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    // Click export
    await page.locator('.btn-export').click();
    await page.waitForTimeout(500);

    // No uncaught JS errors
    expect(errors.length).toBe(0);
  });
});

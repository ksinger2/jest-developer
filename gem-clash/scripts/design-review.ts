/**
 * Design Review Screenshot Script
 *
 * Takes screenshots of each game screen for design QA comparison.
 * Run with: npx tsx scripts/design-review.ts
 *
 * Prerequisites:
 * - npm install -D playwright @playwright/test
 * - Game running on localhost:3000 (npm run dev)
 */

import { chromium, Page, Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '../design-review-screenshots');
const GAME_URL = 'http://localhost:3000';
const VIEWPORT = { width: 390, height: 844 }; // iPhone 14

interface ScreenConfig {
  name: string;
  description: string;
  waitFor?: string;
  actions?: ((page: Page) => Promise<void>)[];
}

const SCREENS: ScreenConfig[] = [
  {
    name: '01-boot-loading',
    description: 'Boot/Loading screen with logo and loading bar',
    waitFor: 'canvas',
  },
  {
    name: '02-main-menu',
    description: 'Main menu with Play, Shop, Settings buttons',
    waitFor: 'canvas',
    actions: [
      async (page) => {
        // Wait for boot to complete and menu to appear
        await page.waitForTimeout(2000);
      }
    ],
  },
  {
    name: '03-level-select',
    description: 'Level selection map with stars and progress',
    actions: [
      async (page) => {
        // Click Play button area (center of screen, lower half)
        await page.click('canvas', { position: { x: 195, y: 500 } });
        await page.waitForTimeout(1000);
      }
    ],
  },
  {
    name: '04-gameplay',
    description: 'Active gameplay with board, gems, and HUD',
    actions: [
      async (page) => {
        // Click on first level
        await page.click('canvas', { position: { x: 100, y: 300 } });
        await page.waitForTimeout(1500);
      }
    ],
  },
  {
    name: '05-shop',
    description: 'Shop screen with product cards and prices',
    actions: [
      async (page) => {
        // Navigate back to menu and click Shop
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await page.click('canvas', { position: { x: 195, y: 600 } });
        await page.waitForTimeout(1000);
      }
    ],
  },
  {
    name: '06-settings',
    description: 'Settings screen with toggles and options',
    actions: [
      async (page) => {
        // Navigate to settings
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await page.click('canvas', { position: { x: 350, y: 100 } });
        await page.waitForTimeout(1000);
      }
    ],
  },
];

async function ensureDirectoryExists() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    console.log(`Created directory: ${SCREENSHOT_DIR}`);
  }
}

async function captureScreen(
  page: Page,
  config: ScreenConfig
): Promise<string> {
  const filepath = path.join(SCREENSHOT_DIR, `${config.name}.png`);

  // Execute any setup actions
  if (config.actions) {
    for (const action of config.actions) {
      await action(page);
    }
  }

  // Wait for specific element if specified
  if (config.waitFor) {
    try {
      await page.waitForSelector(config.waitFor, { timeout: 5000 });
    } catch {
      console.warn(`Warning: Could not find ${config.waitFor} for ${config.name}`);
    }
  }

  // Let animations settle
  await page.waitForTimeout(500);

  // Capture screenshot
  await page.screenshot({
    path: filepath,
    fullPage: false,
  });

  console.log(`✓ Captured: ${config.name} - ${config.description}`);
  return filepath;
}

async function captureAllScreens(): Promise<void> {
  console.log('\n🎨 Gem Link Design Review - Screenshot Capture\n');
  console.log('=' .repeat(50));

  ensureDirectoryExists();

  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: 100, // Slow down for visibility
  });

  const page: Page = await browser.newPage({ viewport: VIEWPORT });

  try {
    // Navigate to game
    console.log(`\nNavigating to ${GAME_URL}...`);
    await page.goto(GAME_URL);
    await page.waitForLoadState('networkidle');

    // Capture each screen
    console.log('\nCapturing screens:\n');

    for (const screen of SCREENS) {
      try {
        await captureScreen(page, screen);
      } catch (error) {
        console.error(`✗ Failed to capture ${screen.name}:`, error);
      }
    }

    console.log('\n' + '=' .repeat(50));
    console.log(`\n✅ Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Compare each screenshot to gem-clash-design-system.md');
    console.log('2. Document any visual issues found');
    console.log('3. Create fix requests for engineering');
    console.log('4. Re-run this script after fixes to verify\n');

  } finally {
    await browser.close();
  }
}

async function captureSingleScreen(screenName: string): Promise<void> {
  const screen = SCREENS.find(s => s.name.includes(screenName));

  if (!screen) {
    console.error(`Screen not found: ${screenName}`);
    console.log('Available screens:', SCREENS.map(s => s.name).join(', '));
    return;
  }

  ensureDirectoryExists();

  const browser: Browser = await chromium.launch({ headless: false });
  const page: Page = await browser.newPage({ viewport: VIEWPORT });

  try {
    await page.goto(GAME_URL);
    await page.waitForLoadState('networkidle');
    await captureScreen(page, screen);
  } finally {
    await browser.close();
  }
}

async function deleteScreenshot(screenName: string): Promise<void> {
  const filepath = path.join(SCREENSHOT_DIR, `${screenName}.png`);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    console.log(`✓ Deleted: ${filepath}`);
  } else {
    console.log(`File not found: ${filepath}`);
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'all':
    captureAllScreens();
    break;
  case 'single':
    if (args[1]) {
      captureSingleScreen(args[1]);
    } else {
      console.log('Usage: npx tsx scripts/design-review.ts single <screen-name>');
    }
    break;
  case 'delete':
    if (args[1]) {
      deleteScreenshot(args[1]);
    } else {
      console.log('Usage: npx tsx scripts/design-review.ts delete <screen-name>');
    }
    break;
  case 'list':
    console.log('Available screens:');
    SCREENS.forEach(s => console.log(`  - ${s.name}: ${s.description}`));
    break;
  default:
    console.log(`
Gem Link Design Review Screenshot Tool

Usage:
  npx tsx scripts/design-review.ts all              Capture all screens
  npx tsx scripts/design-review.ts single <name>    Capture single screen
  npx tsx scripts/design-review.ts delete <name>    Delete screenshot after pass
  npx tsx scripts/design-review.ts list             List all screens

Examples:
  npx tsx scripts/design-review.ts all
  npx tsx scripts/design-review.ts single main-menu
  npx tsx scripts/design-review.ts delete 02-main-menu
    `);
}

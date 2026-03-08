import { test } from '@playwright/test';

const BASE = 'http://localhost:5174';

test('capture all screens after fixes', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(4000);

  // 1. Main Menu
  await page.screenshot({ path: 'test-results/fixed-01-main-menu.png' });

  // 2. Click Play button (y=480) → should go to Level Select now
  await page.click('canvas', { position: { x: 195, y: 480 } });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/fixed-02-level-select.png' });

  // 3. Click PLAY button on Level Select (center, y=565)
  await page.click('canvas', { position: { x: 195, y: 565 } });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/fixed-03-gameplay.png' });

  // 4. Make a swap move
  await page.mouse.move(150, 200);
  await page.mouse.down();
  await page.mouse.move(198, 200, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/fixed-04-gameplay-after-move.png' });

  // 5. Navigate to Shop — go back to main menu first
  await page.goto(BASE);
  await page.waitForTimeout(4000);

  // Click Free Gift banner (y=558) to go to Shop
  await page.click('canvas', { position: { x: 195, y: 558 } });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/fixed-05-shop.png' });
});

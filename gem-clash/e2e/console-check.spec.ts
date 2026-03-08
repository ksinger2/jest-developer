import { test } from '@playwright/test';

test('capture console errors and screenshot', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });

  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'test-results/debug-main-menu.png' });

  console.log('=== ERRORS ===');
  errors.forEach(e => console.log(e));
  console.log('=== WARNINGS ===');
  warnings.forEach(w => console.log(w));
  console.log(`Total errors: ${errors.length}, warnings: ${warnings.length}`);
});

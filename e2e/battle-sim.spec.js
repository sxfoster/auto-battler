import { test, expect } from '@playwright/test';

test('battle replay ends with matching log', async ({ page }) => {
  await page.goto('/battle-sim');
  await page.waitForSelector('.overlay');
  const overlayText = await page.locator('.overlay').innerText();
  const logEntries = page.locator('.battle-log div');
  const lastLog = await logEntries.last().innerText();
  expect(lastLog.toLowerCase()).toContain(overlayText.toLowerCase());
});

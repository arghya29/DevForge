import { test, expect } from '@playwright/test';

test.describe('DevForge E2E Core Loop', () => {
  test('should type code in editor and render in preview pane', async ({ page }) => {
    await page.goto('/');

    const editor = page.locator('#codeInput');
    await editor.fill('<h1>Hello from GitHub Actions E2E</h1>');
    await page.locator('#runBtn').click();

    const previewFrame = page.frameLocator('#previewFrame');
    await expect(previewFrame.locator('h1')).toHaveText('Hello from GitHub Actions E2E');
  });
});

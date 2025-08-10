import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 page
    await expect(page.getByText(/404/i)).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test('should display hamburger menu on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    const currentUrl = page.url();
    if (currentUrl.includes('/landing')) {
      test.skip('Skipping test - user not authenticated');
    }

    // Check for hamburger menu button
    await expect(page.getByRole('button').locator('svg')).toBeVisible();
  });
});
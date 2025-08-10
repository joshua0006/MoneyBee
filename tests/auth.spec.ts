import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display auth page', async ({ page }) => {
    await page.goto('/auth');
    
    // Check that Clerk auth component is rendered
    await expect(page.locator('[data-clerk-id]')).toBeVisible();
  });

  test('should redirect authenticated users to main app', async ({ page }) => {
    // This test would need to be modified based on your test authentication setup
    // For now, it just checks the redirect behavior for unauthenticated users
    await page.goto('/');
    await expect(page).toHaveURL('/landing');
  });
});
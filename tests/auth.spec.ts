import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display auth page', async ({ page }) => {
    await page.goto('/auth');
    
    // Check that auth page loads with sign in form
    await expect(page.locator('.cl-rootBox, .cl-signIn-root, form')).toBeVisible({ timeout: 10000 });
  });

  test('should redirect authenticated users to main app', async ({ page }) => {
    // This test would need to be modified based on your test authentication setup
    // For now, it just checks the redirect behavior for unauthenticated users
    await page.goto('/');
    await expect(page).toHaveURL('/landing');
  });
});
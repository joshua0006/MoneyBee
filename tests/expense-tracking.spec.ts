import { test, expect } from '@playwright/test';

// Mock authentication for testing the main app functionality
test.describe('Expense Tracking (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state - you'll need to implement this based on your auth setup
    // For now, this is a placeholder that assumes you have a way to mock auth
    await page.goto('/');
  });

  test('should display main expense tracking interface', async ({ page }) => {
    // Skip this test if not authenticated (would redirect to /landing)
    const currentUrl = page.url();
    if (currentUrl.includes('/landing')) {
      test.skip('Skipping test - user not authenticated');
    }

    // Check for main app components
    await expect(page.getByText('Quick Add')).toBeVisible();
    await expect(page.getByRole('button', { name: /add expense/i })).toBeVisible();
  });

  test('should open quick add expense form', async ({ page }) => {
    const currentUrl = page.url();
    if (currentUrl.includes('/landing')) {
      test.skip('Skipping test - user not authenticated');
    }

    // Test quick add functionality
    await page.getByRole('button', { name: /add expense/i }).click();
    
    // Check that expense form is visible
    await expect(page.getByPlaceholder(/amount/i)).toBeVisible();
    await expect(page.getByPlaceholder(/description/i)).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    const currentUrl = page.url();
    if (currentUrl.includes('/landing')) {
      test.skip('Skipping test - user not authenticated');
    }

    // Test navigation tabs
    await page.getByRole('tab', { name: /analytics/i }).click();
    await expect(page.getByText(/expense overview/i)).toBeVisible();

    await page.getByRole('tab', { name: /gamification/i }).click();
    await expect(page.getByText(/achievements/i)).toBeVisible();
  });
});
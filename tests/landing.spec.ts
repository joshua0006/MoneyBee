import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display landing page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to landing page when not authenticated
    await expect(page).toHaveURL('/landing');
    
    // Check for key landing page elements with timeout
    await expect(page.getByText('MoneyBee')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /get started|start free demo/i })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to auth page when clicking get started', async ({ page }) => {
    await page.goto('/landing');
    
    await page.getByRole('button', { name: /get started|start free demo/i }).first().click();
    
    // Should navigate to auth page
    await expect(page).toHaveURL('/auth');
  });
});
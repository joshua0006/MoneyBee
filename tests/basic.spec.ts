import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test('app loads successfully', async ({ page }) => {
    // Navigate to the root and ensure it redirects properly
    await page.goto('/');
    
    // Should redirect to landing page for unauthenticated users
    await expect(page).toHaveURL('/landing');
    
    // Check that the page loaded successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('landing page renders core elements', async ({ page }) => {
    await page.goto('/landing');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for MoneyBee branding
    await expect(page.getByText('MoneyBee')).toBeVisible({ timeout: 15000 });
    
    // Check for call-to-action button
    const ctaButton = page.getByRole('button', { name: /get started|start/i });
    await expect(ctaButton).toBeVisible({ timeout: 10000 });
  });

  test('navigation to auth page works', async ({ page }) => {
    await page.goto('/landing');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click get started button
    const getStartedButton = page.getByRole('button', { name: /get started|start/i }).first();
    await getStartedButton.click();
    
    // Should navigate to auth page
    await expect(page).toHaveURL('/auth');
  });

  test('404 page handles unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-123');
    
    // Should show 404 content
    await expect(page.getByText('404')).toBeVisible({ timeout: 10000 });
  });
});
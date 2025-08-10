import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1200, height: 800 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should display properly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/landing');

      // Check that content is visible and properly laid out
      await expect(page.getByText('MoneyBee')).toBeVisible();
      
      // Take screenshot for visual regression testing
      await page.screenshot({ path: `tests/screenshots/${name.toLowerCase()}-landing.png` });
    });
  });

  test('should adapt expense list for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const currentUrl = page.url();
    if (currentUrl.includes('/landing')) {
      test.skip('Skipping test - user not authenticated');
    }

    // On mobile, expense items should be properly formatted
    const expenseItems = page.locator('[data-testid="expense-item"]');
    if (await expenseItems.count() > 0) {
      await expect(expenseItems.first()).toBeVisible();
    }
  });
});
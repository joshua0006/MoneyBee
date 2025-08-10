import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Check if the dev server is running
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Wait for the app to be available
    await page.goto('http://localhost:5173/landing', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ App is running and accessible');
  } catch (error) {
    console.error('❌ App is not accessible:', error);
    throw new Error('Make sure the dev server is running with "npm run dev"');
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
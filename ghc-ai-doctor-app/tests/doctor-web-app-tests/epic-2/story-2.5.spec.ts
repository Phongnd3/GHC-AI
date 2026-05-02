import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = process.env.E2E_USERNAME ?? '';
const VALID_PASSWORD = process.env.E2E_PASSWORD ?? '';

// Story 2.5 is implemented using native screen capture prevention in authenticated layout.
// On web, browser-level screenshot blocking is not fully controllable from Playwright.
// These tests capture the expected auth flow and leave platform-specific screenshot
// validation as a complement to native test coverage.

test.describe('Story 2.5 - Prevent Screenshots on Clinical Screens', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.clearAuthStorage();
    await loginPage.goto();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: testInfo.outputPath(`screenshots/${testInfo.title.replace(/\s+/g, '_')}.png`) });
    }
  });

  test('Screenshots are allowed on the login screen', async ({ page }, testInfo) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await page.screenshot({ path: testInfo.outputPath('screenshots/login-screen.png') });
    await expect(loginPage.usernameInput).toBeVisible();
  });

  test('Screenshot prevention should activate on authenticated screens', async ({ page }) => {
    test.skip(true, 'Browser-level screenshot prevention is platform-dependent and requires native verification.');
  });

  test('Screenshot prevention deactivates on logout', async ({ page }) => {
    test.skip(true, 'Browser-level screenshot prevention is platform-dependent and requires native verification.');
  });
});

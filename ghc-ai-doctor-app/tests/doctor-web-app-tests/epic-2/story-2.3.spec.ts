import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = process.env.E2E_USERNAME ?? '';
const VALID_PASSWORD = process.env.E2E_PASSWORD ?? '';

const networkIssues = [
  { label: 'no internet connection', setup: async (page: any) => page.context().setOffline(true) },
  { label: 'network timeout', setup: async (page: any) => page.route('**/session', (route: any) => route.abort()) },
  { label: 'connection lost', setup: async (page: any) => page.context().setOffline(true) },
];

test.describe('Story 2.3 - Handle Network Errors During Login', () => {
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
    await loginPage.clearOfflineMode();
  });

  test('Display network error message when offline', async ({ page }) => {
    await loginPage.setOfflineMode(true);
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(loginPage.errorMessage).toHaveText('No internet connection. Please check your WiFi.');
  });

  test('Retry login after connection is restored', async ({ page }) => {
    await loginPage.setOfflineMode(true);
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(loginPage.errorMessage).toHaveText('No internet connection. Please check your WiFi.');
    await loginPage.clearOfflineMode();
    await loginPage.clickRetry();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Network error persists after retry', async ({ page }) => {
    await loginPage.setOfflineMode(true);
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(loginPage.errorMessage).toHaveText('No internet connection. Please check your WiFi.');
    await loginPage.clickRetry();
    await expect(loginPage.errorMessage).toHaveText('No internet connection. Please check your WiFi.');
  });

  for (const scenario of networkIssues) {
    test(`Handle different network failure types: ${scenario.label}`, async ({ page }) => {
      await scenario.setup(page);
      await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
      await expect(loginPage.errorMessage).toHaveText('No internet connection. Please check your WiFi.');
    });
  }
});

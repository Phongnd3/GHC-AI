import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = process.env.E2E_USERNAME ?? '';
const VALID_PASSWORD = process.env.E2E_PASSWORD ?? '';

test.describe('Story 2.6 - Doctor Logout with Confirmation', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.clearAuthStorage();
    await loginPage.goto();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: testInfo.outputPath(`screenshots/${testInfo.title.replace(/\s+/g, '_')}.png`) });
    }
  });

  test('Logout confirmation dialog appears', async () => {
    await dashboardPage.clickLogout();
    await expect(dashboardPage.logoutDialog).toBeVisible();
  });

  test('Confirm logout clears session and returns to login', async () => {
    await dashboardPage.clickLogout();
    await dashboardPage.confirmLogout();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  test('Cancel logout keeps session active', async () => {
    await dashboardPage.clickLogout();
    await dashboardPage.cancelLogout();
    await dashboardPage.waitForDashboard();
  });

  const triggers = ['Logout menu'];

  for (const trigger of triggers) {
    test(`Different logout trigger: ${trigger}`, async () => {
      if (trigger === 'Logout menu') {
        await dashboardPage.clickLogout();
      }
      await expect(dashboardPage.logoutDialog).toBeVisible();
    });
  }
});

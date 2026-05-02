import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = process.env.E2E_USERNAME ?? '';
const VALID_PASSWORD = process.env.E2E_PASSWORD ?? '';

test.describe('Story 2.7 - Session Persistence Across App Restarts', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.clearAuthStorage();
    await loginPage.goto();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: testInfo.outputPath(`screenshots/${testInfo.title.replace(/\s+/g, '_')}.png`) });
    }
  });

  test('Session persists within 30 minutes', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
    await loginPage.simulateSessionTimestamp(25);
    await page.reload();
    await dashboardPage.waitForDashboard();
  });

  test('Session expires after 30 minutes of inactivity', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
    await loginPage.simulateSessionTimestamp(35);
    await page.reload();
    await expect(loginPage.getSessionExpiredText()).toContain('Session expired. Please log in again.');
  });

  test('Session expires exactly at 30 minutes', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
    await loginPage.simulateSessionTimestamp(30);
    await page.reload();
    await expect(loginPage.getSessionExpiredText()).toContain('Session expired. Please log in again.');
  });

  const closureScenarios = ['close completely', 'background the app', 'force quit'];

  for (const scenario of closureScenarios) {
    test(`Different app closure scenario: ${scenario}`, async ({ page }) => {
      await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
      await dashboardPage.waitForDashboard();
      await loginPage.simulateSessionTimestamp(25);
      if (scenario === 'background the app') {
        await page.waitForTimeout(500);
      } else {
        await page.reload();
      }
      await dashboardPage.waitForDashboard();
    });
  }
});

import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = process.env.E2E_USERNAME ?? '';
const VALID_PASSWORD = process.env.E2E_PASSWORD ?? '';

const launchScenarios = ['launch the app fresh', 'restart the app', 'return after backgrounding'];

test.describe('Story 2.8 - [BUG] Login Fails on First Attempt with "An error occurred"', () => {
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

  test('Login succeeds on first attempt after a fresh app launch', async () => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
  });

  test('Login no longer fails on first attempt', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
    await loginPage.clearAuthStorage();
    await loginPage.goto();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
  });

  test('Subsequent logins work normally after logout', async () => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
    await dashboardPage.clickLogout();
    await dashboardPage.confirmLogout();
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
  });

  for (const scenario of launchScenarios) {
    test(`Different app launch scenario: ${scenario}`, async ({ page }) => {
      if (scenario === 'launch the app fresh') {
        await loginPage.clearAuthStorage();
        await loginPage.goto();
      }
      if (scenario === 'restart the app') {
        await page.reload();
      }
      if (scenario === 'return after backgrounding') {
        await page.waitForTimeout(500);
      }
      await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
      await dashboardPage.waitForDashboard();
    });
  }
});

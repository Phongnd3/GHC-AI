import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = process.env.E2E_USERNAME ?? '';
const VALID_PASSWORD = process.env.E2E_PASSWORD ?? '';
const INVALID_USERNAME = process.env.E2E_INVALID_USERNAME ?? 'invalid.user@example.com';
const INVALID_PASSWORD = process.env.E2E_INVALID_PASSWORD ?? 'WrongPass123';

test.describe('Story 2.1 - Doctor Login with OpenMRS Credentials', () => {
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

  test('Successful login with valid credentials', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await dashboardPage.waitForDashboard();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Login fails with invalid credentials', async () => {
    await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
    await expect(loginPage.errorMessage).toHaveText('Invalid username or password. Please try again.');
  });

  test('Login fails with network error', async () => {
    await loginPage.setOfflineMode(true);
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(loginPage.errorMessage).toHaveText('No internet connection. Please check your WiFi.');
    await loginPage.clearOfflineMode();
  });

  const invalidCredentials = [
    { description: 'invalid username', username: INVALID_USERNAME, password: VALID_PASSWORD },
    { description: 'invalid password', username: VALID_USERNAME, password: INVALID_PASSWORD },
    { description: 'empty username', username: '', password: VALID_PASSWORD },
    { description: 'empty password', username: VALID_USERNAME, password: '' },
  ];

  for (const scenario of invalidCredentials) {
    test(`Handle different credential formats: ${scenario.description}`, async () => {
      await loginPage.fillCredentials(scenario.username, scenario.password);
      if (!scenario.username || !scenario.password) {
        await expect(loginPage.loginButton).toBeDisabled();
      } else {
        await loginPage.clickLogin();
        await expect(loginPage.errorMessage).toHaveText('Invalid username or password. Please try again.');
      }
    });
  }
});

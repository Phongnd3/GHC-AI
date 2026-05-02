import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = process.env.E2E_USERNAME ?? '';
const VALID_PASSWORD = process.env.E2E_PASSWORD ?? '';
const INVALID_USERNAME = process.env.E2E_INVALID_USERNAME ?? 'invalid.user@example.com';
const INVALID_PASSWORD = process.env.E2E_INVALID_PASSWORD ?? 'WrongPass123';

test.describe('Story 2.2 - Handle Invalid Login Credentials', () => {
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

  test('Display error message for invalid credentials', async () => {
    await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
    await expect(loginPage.errorMessage).toHaveText('Invalid username or password. Please try again.');
  });

  test('Clear error message on user interaction', async () => {
    await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.usernameInput.fill('');
    await loginPage.usernameInput.type('x');
    await expect(loginPage.errorMessage).not.toBeVisible();
  });

  test('Multiple failed login attempts show same error', async () => {
    await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
    await expect(loginPage.errorMessage).toHaveText('Invalid username or password. Please try again.');
    await loginPage.fillCredentials(INVALID_USERNAME, INVALID_PASSWORD);
    await loginPage.clickLogin();
    await expect(loginPage.errorMessage).toHaveText('Invalid username or password. Please try again.');
  });

  const invalidScenarios = [
    { label: 'wrong username', username: INVALID_USERNAME, password: VALID_PASSWORD },
    { label: 'wrong password', username: VALID_USERNAME, password: INVALID_PASSWORD },
    { label: 'blank username', username: '', password: VALID_PASSWORD },
    { label: 'blank password', username: VALID_USERNAME, password: '' },
  ];

  for (const scenario of invalidScenarios) {
    test(`Handle different invalid credential scenario: ${scenario.label}`, async () => {
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

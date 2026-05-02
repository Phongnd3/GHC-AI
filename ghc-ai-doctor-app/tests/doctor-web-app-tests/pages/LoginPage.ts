import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput = this.page.locator('[data-testid="username-input"]');
  readonly passwordInput = this.page.locator('[data-testid="password-input"]');
  readonly loginButton = this.page.locator('[data-testid="login-button"]');
  readonly retryButton = this.page.locator('[data-testid="retry-button"]');
  readonly errorMessage = this.page.locator('[data-testid="error-message"]');
  readonly sessionExpiredMessage = this.page.locator('[data-testid="session-expired-message"]');

  async goto() {
    await super.goto('/');
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickRetry() {
    await this.retryButton.click();
  }

  async login(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.clickLogin();
  }

  async setOfflineMode(enabled: boolean) {
    await this.page.context().setOffline(enabled);
  }

  async clearOfflineMode() {
    await this.page.context().setOffline(false);
  }

  async getErrorText() {
    return this.errorMessage.textContent();
  }

  async getSessionExpiredText() {
    return this.sessionExpiredMessage.textContent();
  }

  async simulateSessionTimestamp(minutesAgo: number) {
    await this.page.evaluate(({ timestampKey, value }) => {
      window.localStorage.setItem(timestampKey, value);
    }, {
      timestampKey: 'sessionTimestamp',
      value: String(Date.now() - minutesAgo * 60 * 1000),
    });
  }

  async clearAuthStorage() {
    await this.page.evaluate(() => {
      window.localStorage.removeItem('sessionToken');
      window.localStorage.removeItem('sessionUser');
      window.localStorage.removeItem('sessionTimestamp');
    });
  }
}

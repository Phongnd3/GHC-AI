import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly logoutButton = this.page.locator('[aria-label="Logout"]');
  readonly refreshButton = this.page.locator('[aria-label="Refresh"]');
  readonly logoutDialog = this.page.locator('role=dialog >> text=Confirm Logout');
  readonly logoutYesButton = this.page.locator('role=button[name="Yes"]');
  readonly logoutNoButton = this.page.locator('role=button[name="No"]');
  readonly lastUpdatedText = this.page.locator('text=Last updated:');
  readonly patientCard = (patientName: string) => this.page.locator(`text=${patientName}`);
  readonly errorStateMessage = this.page.locator('text=Unable to load patients');

  async waitForDashboard() {
    await expect(this.page).toHaveURL(/.*dashboard/);
    await expect(this.logoutButton).toBeVisible();
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async confirmLogout() {
    await expect(this.logoutDialog).toBeVisible();
    await this.logoutYesButton.click();
  }

  async cancelLogout() {
    await expect(this.logoutDialog).toBeVisible();
    await this.logoutNoButton.click();
  }

  async clickRefresh() {
    await this.refreshButton.click();
  }

  async isPatientVisible(patientName: string) {
    return this.patientCard(patientName).isVisible();
  }

  async waitForLastUpdated() {
    await expect(this.lastUpdatedText).toBeVisible();
  }

  async waitForErrorState() {
    await expect(this.errorStateMessage).toBeVisible();
  }
}

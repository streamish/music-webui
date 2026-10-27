import { ADMIN_PASSWORD, ADMIN_USERNAME, AdminApi } from '../test-helper';
import { Pom } from '../playwright.pom';
import { UserRoleEnum } from '@/types/api-schema';
import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

test.describe('account preferences', () => {
  const deleteUsers: number[] = [];
  let jwtToken: string | undefined;

  test.afterEach(async () => {
    if (!jwtToken) {
      return;
    }
    const api = new AdminApi(jwtToken);
    for (let i = 0; i < deleteUsers.length; i += 1) {
      const userId = deleteUsers[i];
      // eslint-disable-next-line no-await-in-loop
      await api.deleteUser(userId);
    }
    deleteUsers.length = 0;
  });

  test.describe('authorized access', () => {
    test('should not allow guest access', async ({ page }, testInfo) => {
      await page.goto('/account');
      await page.waitForSelector('input[name="username"]');
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/signin?returnUrl=${encodeURIComponent('/account')}`);
    });
  });

  test.describe('success', () => {
    test('can open page', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await pom.navigateToAccount();
      await expect(page.getByRole('heading', { name: 'General preferences' })).toBeVisible();
    });
  });

  test.describe('features', () => {
    test.describe('change password', () => {
      test.describe('errors', () => {
        test('should show error if password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          await pom.navigateToAccount();
          await page.getByRole('list', { name: 'User accounts' });
          await page.locator('button', { hasText: 'Change password' }).click();
          await page.locator('button', { hasText: 'Set new password' }).click();
          await expect(page.getByRole('main').filter({ hasText: 'Password is required' })).toBeVisible();
        });

        test('should show error if confirmation password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          await pom.navigateToAccount();
          await page.getByRole('list', { name: 'User accounts' });
          await page.locator('button', { hasText: 'Change password' }).click();
          await page.locator('input[name="newPassword"]').fill('testpassword');
          await page.locator('button', { hasText: 'Set new password' }).click();
          await expect(page.getByRole('main').filter({ hasText: 'Confirmation password is required' })).toBeVisible();
        });

        test('should show error if confirmation password does not match', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          await pom.navigateToAccount();
          await page.locator('button', { hasText: 'Change password' }).click();
          await page.locator('input[name="newPassword"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('differentpassword');
          await page.locator('button', { hasText: 'Set new password' }).click();
          await expect(page.getByRole('main').filter({ hasText: 'Passwords do not match' })).toBeVisible();
        });
      });

      test.describe('success', () => {
        test('should change password', async ({ page, browser }) => {
          const testUserName = `test-reset-password-${Date.now()}`;
          const adminPom = new Pom(page, jwtToken);
          await adminPom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          const adminToken = adminPom.jwtToken || '';
          const user = await new AdminApi(adminToken).createUser({
            adminPassword: ADMIN_USERNAME,
            username: testUserName,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(user.id);
          const newContext = await browser.newContext();
          const page2 = await newContext.newPage();
          const pom = new Pom(page2);
          await pom.signIn({ username: testUserName, password: 'testpassword' });
          await pom.navigateToAccount();
          await page2.locator('button', { hasText: 'Change password' }).click();
          await page2.locator('input[name="newPassword"]').fill('newpassword');
          await page2.locator('input[name="confirmPassword"]').fill('newpassword');
          await page2.locator('button', { hasText: 'Set new password' }).last().click();
          await expect(page2.getByRole('main').filter({ hasText: 'Password reset successfully' })).toBeVisible();
        });
      });
    });

    test.describe('add root path', () => {
      test.describe('errors', () => {
        test('should show error if root path does not exist', async ({ page, browser }) => {
          const newPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          const testUserName = `test-reset-password-${Date.now()}`;
          const adminPom = new Pom(page, jwtToken);
          await adminPom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          const adminToken = adminPom.jwtToken || '';
          const user = await new AdminApi(adminToken).createUser({
            adminPassword: ADMIN_USERNAME,
            username: testUserName,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(user.id);
          const newContext = await browser.newContext();
          const page2 = await newContext.newPage();
          const pom = new Pom(page2);
          await pom.signIn({ username: testUserName, password: 'testpassword' });
          await pom.navigateToAccount();
          await page2.locator('button', { hasText: 'Add root path' }).click();
          await page2.locator('input[name="rootPath"]').fill(newPath);
          await page2.locator('button', { hasText: 'Save new path' }).click();
          await expect(
            page2.getByRole('main').filter({ hasText: 'The specified root path does not exist' }),
          ).toBeVisible();
        });

        test('should show error if root path already exists for account', async ({ page, browser }) => {
          const newPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          mkdirSync(newPath, { recursive: true });
          const testUserName = `test-reset-password-${Date.now()}`;
          const adminPom = new Pom(page, jwtToken);
          await adminPom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          const adminToken = adminPom.jwtToken || '';
          const user = await new AdminApi(adminToken).createUser({
            adminPassword: ADMIN_USERNAME,
            username: testUserName,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(user.id);
          const newContext = await browser.newContext();
          const page2 = await newContext.newPage();
          const pom = new Pom(page2);
          await pom.signIn({ username: testUserName, password: 'testpassword' });
          await pom.navigateToAccount();
          await page2.locator('button', { hasText: 'Add root path' }).click();
          await page2.locator('input[name="rootPath"]').fill(newPath);
          await page2.locator('button', { hasText: 'Save new path' }).click();
          await expect(
            page2
              .getByRole('main')
              .filter({ hasText: 'The specified root path has already been added to this account' }),
          ).toBeVisible();
        });
      });

      test.describe('success', () => {
        test('should add root path', async ({ page, browser }) => {
          const newPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          mkdirSync(newPath, { recursive: true });
          const testUserName = `test-reset-password-${Date.now()}`;
          const adminPom = new Pom(page, jwtToken);
          await adminPom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          const adminToken = adminPom.jwtToken || '';
          const user = await new AdminApi(adminToken).createUser({
            adminPassword: ADMIN_USERNAME,
            username: testUserName,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(user.id);
          const newContext = await browser.newContext();
          const page2 = await newContext.newPage();
          const pom = new Pom(page2);
          await pom.signIn({ username: testUserName, password: 'testpassword' });
          await pom.navigateToAccount();
          await page2.locator('button', { hasText: 'Add root path' }).click();
          await page2.locator('input[name="rootPath"]').fill(newPath);
          await page2.locator('button', { hasText: 'Save new path' }).click();
          await expect(page2.getByRole('main').filter({ hasText: 'Root path added successfully' })).toBeVisible();
        });
      });
    });

    test.describe('regenerate user session key', () => {
      test.describe('success', () => {
        test('should regenerate user session key', async ({ page, browser }) => {
          const testUserName = `test-reset-password-${Date.now()}`;
          const adminPom = new Pom(page, jwtToken);
          await adminPom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          const adminToken = adminPom.jwtToken || '';
          const user = await new AdminApi(adminToken).createUser({
            adminPassword: ADMIN_USERNAME,
            username: testUserName,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(user.id);
          const newContext = await browser.newContext();
          const page2 = await newContext.newPage();
          const pom = new Pom(page2);
          await pom.signIn({ username: testUserName, password: 'testpassword' });
          await pom.navigateToAccount();
          await page2.getByRole('list', { name: 'User accounts' });
          await page2.locator('button', { hasText: 'Terminate sessions' }).click();
          await page2.locator('button', { hasText: 'End sessions' }).click();
          await expect(
            page2.getByRole('main').filter({ hasText: 'Session key regenerated successfully' }),
          ).toBeVisible();
        });
      });
    });

    test.describe('download logs', () => {
      test.describe('success', () => {
        const downloadPath = join(tmpdir(), `log-downloads-${Date.now()}`);
        mkdirSync(downloadPath, { recursive: true });

        test('should open raw logs in new tab', async ({ page, context }) => {
          const pom = new Pom(page, jwtToken);
          jwtToken = jwtToken || pom.jwtToken;
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          await pom.navigateToAccount();
          type WindowWithCapturedBlob = Window & { capturedBlob: Blob | null };
          await page.addInitScript(() => {
            const w = window as unknown as WindowWithCapturedBlob;
            w.capturedBlob = null;
            const originalCreateObjectURL = URL.createObjectURL;
            function captureBlob(blob: Blob) {
              w.capturedBlob = blob as Blob;
              return originalCreateObjectURL(blob);
            }
            URL.createObjectURL = captureBlob;
          });

          const newPagePromise = context.waitForEvent('page');
          await page.getByRole('button', { name: 'View raw logs' }).click();
          // Get the new page
          const newPage = await newPagePromise;
          await newPage.waitForLoadState('domcontentloaded');

          // Get the captured blob content from the original page
          const blobText = await page.evaluate(async () => {
            const w = window as unknown as WindowWithCapturedBlob;
            if (w.capturedBlob) {
              return w.capturedBlob.text();
            }
            return null;
          });
          expect(blobText).toBeDefined();
          await newPage.close();
        });

        test('should download logs as JSON', async ({ page, context }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAccount();
          const downloadPromise = context.waitForEvent('download');
          await page.getByRole('button', { name: 'Download logs as JSON' }).click();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toContain('.json'); // Save the file to verify it exists
          await download.saveAs(join(downloadPath, download.suggestedFilename()));
          const filePath = join(downloadPath, download.suggestedFilename());
          const jsonData = JSON.parse(readFileSync(filePath, 'utf-8'));
          expect(Array.isArray(jsonData)).toBe(true);
        });

        test('should download logs as CSV', async ({ page, context }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAccount();
          const downloadPromise = context.waitForEvent('download');
          await page.getByRole('button', { name: 'Download logs as CSV' }).click();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toContain('.csv'); // Save the file to verify it exists
          await download.saveAs(join(downloadPath, download.suggestedFilename()));
          const filePath = join(downloadPath, download.suggestedFilename());
          const csvData = readFileSync(filePath, 'utf-8');
          expect(csvData).toContain(',');
        });
      });
    });
  });
});

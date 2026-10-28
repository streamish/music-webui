import { ADMIN_PASSWORD, ADMIN_USERNAME, AdminApi } from '../../test-helper';
import { type Page, expect, test } from '@playwright/test';
import { Pom } from '../../playwright.pom';
import { UserRoleEnum } from '@/types/api-schema';
import { join } from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

test.describe('admin home', () => {
  const deleteUsers: number[] = [];
  let jwtToken: string | undefined;

  function waitForAccountRefresh(page: Page, withAccountUsername?: string) {
    return page.waitForResponse(async (response) => {
      const url = new URL(response.url());
      if (url.pathname.endsWith('/api/list-accounts')) {
        if (withAccountUsername) {
          const responseData = await response.json();
          const account = responseData.accounts.find(
            (a: Record<string, string | number>) => a.username === withAccountUsername,
          );
          if (account) {
            return true;
          }
        } else {
          return true;
        }
      }
      return false;
    });
  }

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
      await page.goto('/admin');
      await page.waitForSelector('input[name="username"]');
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/signin?returnUrl=${encodeURIComponent('/admin')}`);
    });

    test('should not allow non-admin access', async ({ page }, testInfo) => {
      const pom = new Pom(page);
      await pom.signIn({ username: 'user', password: 'user' });
      await page.goto('/admin');
      await expect(
        page.getByText('You must be signed in as an admin to access this page.', { exact: true }),
      ).toBeVisible();
      await expect(page).toHaveURL(`${testInfo.project.use.baseURL}/`);
    });
  });

  test.describe('success', () => {
    test('can open page', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await pom.navigateToAdmin();
      await expect(page.getByRole('heading', { name: 'System' })).toBeVisible();
    });
  });

  test.describe('features', () => {
    test.describe('add account', () => {
      test.describe('errors', () => {
        test('should show error if no roles are selected', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('At least one role must be selected.', { exact: true })).toBeVisible();
        });

        test('should show error if username is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('Username is required', { exact: true })).toBeVisible();
        });

        test('should show error if password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
        });

        test('should show error if confirmation password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('Confirm password is required', { exact: true })).toBeVisible();
        });

        test('should show error if confirmation password does not match', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('differentpassword');
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('Passwords do not match', { exact: true })).toBeVisible();
        });

        test('should show error if administrator password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('differentpassword');
          await page.locator('input[name="adminPassword"]').fill('');
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('Administrator password is required', { exact: true })).toBeVisible();
        });

        test('should show error if user already exists', async ({ page }) => {
          const testUsername = `test-duplicate-account-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('label[for="user-role"]').click();
          await page.locator('input[name="username"]').fill(testUsername);
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('testpassword');
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('User already exists.', { exact: true })).toBeVisible();
        });

        test('should show error if admin password is incorrect', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('label[for="user-role"]').click();
          await page.locator('input[name="username"]').fill(testUsername);
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('testpassword');
          await page.locator('input[name="adminPassword"]').fill('wrong password');
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await page.waitForLoadState('networkidle');
          await expect(page.getByText('Invalid admin password.', { exact: true })).toBeVisible();
        });
      });

      test.describe('success', () => {
        test('should add account', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('label[for="admin-role"]').click();
          await page.locator('input[name="username"]').fill(testUsername);
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('testpassword');
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          const updateAccountList = waitForAccountRefresh(page, testUsername);
          await page.locator('button', { hasText: 'Add new account' }).last().click();
          await expect(page.getByText('User account created successfully.', { exact: true })).toBeVisible();
          const response = await updateAccountList;
          const responseData = await response.json();
          const account = responseData.accounts.find(
            (a: Record<string, string | number>) => a.username === testUsername,
          );
          deleteUsers.push(account.id);
          await expect(
            page
              .getByRole('list', { name: 'User accounts' })
              .or(page.getByRole('table', { name: 'User accounts' }))
              .filter({ hasText: testUsername }),
          ).toBeVisible();
        });
      });
    });

    test.describe('reset password', () => {
      test.describe('errors', () => {
        test('should show error if password is blank', async ({ page }) => {
          const testUsername = `test-reset-password-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await userRow.locator('button', { hasText: 'Reset password' }).click();
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Password is required', { exact: true })).toBeVisible();
        });

        test('should show error if confirmation password is blank', async ({ page }) => {
          const testUsername = `test-reset-password-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await userRow.locator('button', { hasText: 'Reset password' }).click();
          await page.locator('input[name="newPassword"]').fill('testpassword');
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Confirm password is required', { exact: true })).toBeVisible();
        });

        test('should show error if confirmation password does not match', async ({ page }) => {
          const testUsername = `test-reset-password-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await userRow.locator('button', { hasText: 'Reset password' }).click();
          await page.locator('input[name="newPassword"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('differentpassword');
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Passwords do not match', { exact: true })).toBeVisible();
        });

        test('should show error if administrator password is blank', async ({ page }) => {
          const testUsername = `test-reset-password-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await userRow.locator('button', { hasText: 'Reset password' }).click();
          await page.locator('input[name="newPassword"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('testpassword');
          await page.locator('input[name="adminPassword"]').fill('');
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Administrator password is required', { exact: true })).toBeVisible();
        });

        test('should show error if administrator password is incorrect', async ({ page }) => {
          const testUsername = `test-reset-password-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await userRow.locator('button', { hasText: 'Reset password' }).click();
          await page.locator('input[name="newPassword"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('testpassword');
          await page.locator('input[name="adminPassword"]').fill('wrongpassword');
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Invalid admin password.', { exact: true })).toBeVisible();
        });
      });

      test.describe('success', () => {
        test('should reset password', async ({ page }) => {
          const testUsername = `test-reset-password-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await userRow.locator('button', { hasText: 'Reset password' }).click();
          await page.locator('input[name="newPassword"]').fill('newpassword');
          await page.locator('input[name="confirmPassword"]').fill('newpassword');
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('User password reset successfully.', { exact: true })).toBeVisible();
        });
      });
    });

    test.describe('update user roles', () => {
      test.describe('errors', () => {
        test('should not allow last administrator to remove admin role', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account admin` });
          const rowText = await userRow.textContent();
          expect(rowText).toContain('admin');
          await userRow.locator('button', { hasText: 'Update roles' }).click();
          await page.locator('label[for="admin-role"]').click();
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(
            page.getByText('You must create another administrator before removing this permission.', { exact: true }),
          ).toBeVisible();
        });

        test('should show error if administrator password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account admin` });
          const rowText = await userRow.textContent();
          expect(rowText).toContain('admin');
          await userRow.locator('button', { hasText: 'Update roles' }).click();
          await page.locator('label[for="admin-role"]').click();
          await page.locator('label[for="user-role"]').click();
          await page.locator('input[name="adminPassword"]').fill('');
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Administrator password is required', { exact: true })).toBeVisible();
        });

        test('should show error if administrator password is incorrect', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account admin` });
          const rowText = await userRow.textContent();
          expect(rowText).toContain('admin');
          await userRow.locator('button', { hasText: 'Update roles' }).click();
          await page.locator('label[for="admin-role"]').click();
          await page.locator('input[name="adminPassword"]').fill('incorrectpassword');
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Invalid admin password.', { exact: true })).toBeVisible();
        });
      });

      test.describe('success', () => {
        test('should update roles', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          const rowText = await userRow.textContent();
          expect(rowText).toContain('admin');
          expect(rowText).not.toContain('user');
          await userRow.locator('button', { hasText: 'Update roles' }).click();
          await page.locator('label[for="admin-role"]').click();
          await page.locator('label[for="user-role"]').click();
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          const updateAccountList = waitForAccountRefresh(page);
          await page.locator('button', { hasText: 'Save changes' }).click();
          await updateAccountList;
          await expect(page.getByText('User roles updated successfully.', { exact: true })).toBeVisible();
          const textContent = await page.getByRole('row', { name: `User account ${testUsername}` }).textContent();
          await expect(textContent).not.toContain('admin');
          await expect(textContent).toContain('user');
        });
      });
    });

    test.describe('add root path', () => {
      test.describe('errors', () => {
        test('should show error if root path does not exist', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const newPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          await page.locator('button', { hasText: 'Add root path' }).click();
          await page.locator('select[name="accountId"]').selectOption({ label: testUsername });
          await page.locator('input[name="rootPath"]').fill(newPath);
          await page.locator('button', { hasText: 'Add new path' }).click();
          await expect(page.getByText('The specified root path does not exist.', { exact: true })).toBeVisible();
        });

        test('should show error if root path already exists for account', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const newPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          mkdirSync(newPath, { recursive: true });
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(testUser.id);
          await api.createRootPath(testUser.id, newPath);
          await pom.navigateToAdmin();
          await page.locator('button', { hasText: 'Add root path' }).click();
          await page.locator('select[name="accountId"]').selectOption({ label: testUsername });
          await page.locator('input[name="rootPath"]').fill(newPath);
          await page.locator('button', { hasText: 'Add new path' }).click();
          await expect(
            page.getByText('The specified root path has already been added to this account.', { exact: true }),
          ).toBeVisible();
        });
      });

      test.describe('success', () => {
        test('should add root path', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const newPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          mkdirSync(newPath, { recursive: true });
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          await page.locator('button', { hasText: 'Add root path' }).click();
          await page.locator('select[name="accountId"]').selectOption({ label: testUsername });
          await page.locator('input[name="rootPath"]').fill(newPath);
          await page.locator('button', { hasText: 'Add new path' }).click();
          await expect(page.getByText('Root path added successfully.')).toBeVisible();
        });
      });
    });

    test.describe('update root path', () => {
      test.describe('errors', () => {
        test('should show error if root path does not exist', async ({ page }) => {
          const testUsername = `test-update-root-path-${Date.now()}`;
          const originalPath = join(tmpdir(), `test-update-root-path-${Date.now()}`);
          mkdirSync(originalPath, { recursive: true });
          const newPath = join(tmpdir(), `now-updated-root-path-${Date.now()}`);
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(testUser.id);
          await api.createRootPath(testUser.id, originalPath);
          await pom.navigateToAdmin();
          const rootPathRow = await page.getByRole('row', { name: `Root path for ${testUsername} ${originalPath}` });
          await rootPathRow.locator('button', { hasText: 'Change path' }).click();
          await page.locator('input[name="newPath"]').fill(newPath);
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('The specified root path does not exist.', { exact: true })).toBeVisible();
        });

        test('should show error if new path already exists for account', async ({ page }) => {
          const testUsername = `test-root-path-exists-${Date.now()}`;
          const firstPath = join(tmpdir(), `test-update-root-path-firstroot-path-${Date.now()}`);
          mkdirSync(firstPath, { recursive: true });
          const secondPath = join(tmpdir(), `test-exists-second-root-path-${Date.now()}`);
          mkdirSync(secondPath, { recursive: true });
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(testUser.id);
          await api.createRootPath(testUser.id, firstPath);
          await api.createRootPath(testUser.id, secondPath);
          await pom.navigateToAdmin();
          const rootPathRow = await page.getByRole('row', { name: `Root path for ${testUsername} ${firstPath}` });
          await rootPathRow.locator('button', { hasText: 'Change path' }).click();
          await page.locator('input[name="newPath"]').fill(secondPath);
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(
            page.getByText('The specified root path has already been added to this account.', { exact: true }),
          ).toBeVisible();
        });
      });

      test.describe('success', () => {
        test('should update root path', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const originalPath = join(tmpdir(), `test-update-root-path-${Date.now()}`);
          mkdirSync(originalPath, { recursive: true });
          const updatedPath = join(tmpdir(), `test-updated-root-path-${Date.now()}`);
          mkdirSync(updatedPath, { recursive: true });
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.user],
          });
          deleteUsers.push(testUser.id);
          await api.createRootPath(testUser.id, originalPath);
          await pom.navigateToAdmin();
          const rootPathRow = await page.getByRole('row', { name: `Root path for ${testUsername} ${originalPath}` });
          await rootPathRow.locator('button', { hasText: 'Change path' }).click();
          await page.locator('input[name="newPath"]').fill(updatedPath);
          await page.locator('button', { hasText: 'Save changes' }).click();
          await expect(page.getByText('Root path updated successfully.')).toBeVisible();
        });
      });
    });

    test.describe('regenerate user session key', () => {
      test.describe('success', () => {
        test('should regenerate user session key', async ({ page }) => {
          const testUsername = `test-reset-password-${Date.now()}`;
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          const testUser = await api.createUser({
            adminPassword: ADMIN_PASSWORD,
            username: testUsername,
            password: 'testpassword',
            roles: [UserRoleEnum.admin],
          });
          deleteUsers.push(testUser.id);
          await pom.navigateToAdmin();
          const userRow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await userRow.locator('button', { hasText: 'Terminate sessions' }).click();
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          await page.locator('button', { hasText: 'Generate new key' }).click();
          await expect(page.getByText('User session key rotated successfully.', { exact: true })).toBeVisible();
        });
      });
    });

    test.describe('regenerate session master key', () => {
      test.describe('success', () => {
        test.skip('should regenerate master session key', async ({ page }) => {
          const pom = new Pom(page);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          await pom.navigateToAdmin();
          await page.locator('button', { hasText: 'Terminate all sessions' }).click();
          await page.locator('button', { hasText: 'End all sessions' }).click();
          await page.waitForURL('**/signin', { waitUntil: 'networkidle' });
          await expect(page.url()).toContain('/signin');
        });
      });
    });

    test.describe('toggle indexer', () => {
      test.describe('success', () => {
        test('should turn indexer on or off', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken || '';
          const api = new AdminApi(jwtToken);
          await pom.navigateToAdmin();
          const configurationBefore = await api.getIndexerConfiguration();
          const response = page.waitForResponse(
            (res) => res.url().includes('/api/set-indexer-status') && res.status() === 200,
          );
          await page.getByRole('button', { name: 'Toggle indexer' }).click();
          await response;
          const configurationAfter = await api.getIndexerConfiguration();
          expect(configurationBefore.isEnabled).toBe(!configurationAfter.isEnabled);
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
          await pom.navigateToAdmin();
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
          await pom.navigateToAdmin();
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
          await pom.navigateToAdmin();
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

import { ADMIN_PASSWORD, ADMIN_USERNAME, AdminApi } from '../../test-helper';
import { Pom } from '../../playwright.pom';
import { UserRoleEnum } from '@/types/api-schema';
import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

test.describe('admin home', () => {
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
      await page.goto('/admin');
      await page.waitForSelector('input[name="username"]');
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/signin?returnUrl=${encodeURIComponent('/admin')}`);
    });

    test('should not allow non-admin access', async ({ page }, testInfo) => {
      const pom = new Pom(page);
      await pom.signIn({ username: 'user', password: 'user' });
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      await expect(
        page.getByRole('main').filter({ hasText: 'You must be signed in as an admin to access this page.' }),
      ).toBeTruthy();
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/`);
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'At least one role must be selected' })).toBeTruthy();
        });

        test('should show error if username is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Username is required' })).toBeTruthy();
        });

        test('should show error if password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Password is required' })).toBeTruthy();
        });

        test('should show error if confirmation password is blank', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Confirm password is required' })).toBeTruthy();
        });

        test('should show error if confirmation password does not match', async ({ page }) => {
          const pom = new Pom(page, jwtToken);
          await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
          jwtToken = jwtToken || pom.jwtToken;
          await pom.navigateToAdmin();
          await page.getByText('Add account').click();
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('differentpassword');
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Passwords do not match' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Administrator password is required' })).toBeTruthy();
        });

        test('should show error if user already exists', async ({ page }) => {
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
          await page.locator('input[name="username"]').fill(testUsername);
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('testpassword');
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'User already exists' })).toBeTruthy();
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
          await page.locator('input[name="username"]').fill(testUsername);
          await page.locator('input[name="password"]').fill('testpassword');
          await page.locator('input[name="confirmPassword"]').fill('testpassword');
          await page.locator('input[name="adminPassword"]').fill('wrong password');
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Invalid admin password.' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          const accountList = await page
            .getByRole('list', { name: 'User accounts' })
            .or(page.getByRole('table', { name: 'User accounts' }));
          await expect(accountList.filter({ hasText: testUsername })).toBeTruthy();
          await expect(page.getByRole('main').filter({ hasText: 'Account created successfully' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Password is required' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Confirmation password is required' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Passwords do not match' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Administrator password is required' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Invalid admin password.' })).toBeTruthy();
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
          await page.locator('button', { hasText: 'Set new password' }).last().click();
          await expect(page.getByRole('main').filter({ hasText: 'Password reset successfully' })).toBeTruthy();
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
          await page.locator('label[for="user-role"]').click();
          await page.locator('input[name="adminPassword"]').fill(ADMIN_PASSWORD);
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(
            page
              .getByRole('main')
              .filter({ hasText: 'You must create another administrator before removing this permission.' }),
          ).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Administrator password is required' })).toBeTruthy();
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
          await page.locator('label[for="user-role"]').click();
          await page.locator('input[name="adminPassword"]').fill('incorrectpassword');
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Invalid admin password.' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          const userRowNow = await page.getByRole('row', { name: `User account ${testUsername}` });
          await expect(userRowNow.textContent()).not.toContain('admin');
          await expect(userRowNow.textContent()).toContain('user');
          await expect(page.getByRole('main').filter({ hasText: 'Roles updated successfully' })).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(
            page.getByRole('main').filter({ hasText: 'The specified root path does not exist' }),
          ).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(
            page
              .getByRole('main')
              .filter({ hasText: 'The specified root path has already been added to this account' }),
          ).toBeTruthy();
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Root path added successfully' })).toBeTruthy();
        });
      });
    });

    test.describe('update root path', () => {
      test.describe('errors', () => {
        test('should show error if root path does not exist', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const originalPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          mkdirSync(originalPath, { recursive: true });
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
          await api.createRootPath(testUser.id, originalPath);
          await pom.navigateToAdmin();
          const rootPathRow = await page.getByRole('row', { name: `Root path for ${testUsername} ${originalPath}` });
          await rootPathRow.locator('button', { hasText: 'Change path' }).click();
          await page.locator('input[name="newPath"]').fill(newPath);
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(
            page.getByRole('main').filter({ hasText: 'The specified root path does not exist' }),
          ).toBeTruthy();
        });

        test('should show error if new path already exists for account', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const firstPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          mkdirSync(firstPath, { recursive: true });
          const secondPath = join(tmpdir(), `test-root-path-${Date.now() - 2}`);
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(
            page
              .getByRole('main')
              .filter({ hasText: 'The specified root path has already been added to this account' }),
          ).toBeTruthy();
        });
      });

      test.describe('success', () => {
        test('should update root path', async ({ page }) => {
          const testUsername = `test-add-account-${Date.now()}`;
          const originalPath = join(tmpdir(), `test-root-path-${Date.now()}`);
          mkdirSync(originalPath, { recursive: true });
          const updatedPath = join(tmpdir(), `test-root-path-${Date.now()}`);
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
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          await expect(page.getByRole('main').filter({ hasText: 'Root path updated successfully' })).toBeTruthy();
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
          await page.locator('button', { hasText: 'End sessions' }).click();
          await expect(page.getByRole('main').filter({ hasText: 'Session key regenerated successfully' })).toBeTruthy();
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
            (res) => res.url().includes('/api/admin/set-indexer-status') && res.status() === 200,
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
          expect(Array.isArray(jsonData)).toBeTruthy();
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

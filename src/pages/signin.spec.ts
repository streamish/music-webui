import { Pom } from '@/playwright.pom';
import { expect, test } from '@playwright/test';

test.describe('signin', () => {
  test.describe('errors', () => {
    test('rejects invalid username', async ({ page }) => {
      const pom = new Pom(page);
      await pom.signIn({ username: 'invalid', password: 'admin' }, false);
      await expect(page.getByText('Your username is not valid')).toBeVisible();
    });

    test('rejects invalid password', async ({ page }) => {
      const pom = new Pom(page);
      await pom.signIn({ username: 'admin', password: 'invalid' }, false);
      await expect(page.getByText('Your password is not valid')).toBeVisible();
    });
  });

  test.describe('edge cases', () => {
    test('session persists on refresh', async ({ page }, testInfo) => {
      const pom = new Pom(page);
      await pom.signIn({ username: 'admin', password: 'admin' });
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/`);
      await page.reload();
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/`);
      const jwtToken = await page.evaluate(() => {
        return sessionStorage.getItem('jwt-token') || localStorage.getItem('jwt-token');
      });
      expect(jwtToken).not.toBeNull();
    });

    test('temporary signin persists in sessionStorage', async ({ page }, testInfo) => {
      const pom = new Pom(page);
      await pom.signIn({ username: 'admin', password: 'admin' });
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/`);
      const jwtToken = await page.evaluate(() => {
        return sessionStorage.getItem('jwt-token');
      });
      expect(jwtToken).not.toBeNull();
    });

    test('remembered signin persists in localStorage', async ({ page }, testInfo) => {
      const pom = new Pom(page);
      const sessionRequest = page.waitForRequest(
        (request) => request.url().includes('/api/create-session') && request.method() === 'POST',
      );
      await pom.signIn({ username: 'admin', password: 'admin', expiresDays: 3650 });
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/`);
      const jwtToken = await page.evaluate(() => {
        return localStorage.getItem('jwt-token');
      });
      expect(jwtToken).not.toBeNull();
      expect((await sessionRequest).postDataJSON().expiresDays).toBe(3650);
    });
  });

  test.describe('success', () => {
    test('can sign in', async ({ page }, testInfo) => {
      const pom = new Pom(page);
      await pom.signIn({ username: 'admin', password: 'admin' });
      expect(page.url()).toBe(`${testInfo.project.use.baseURL}/`);
      const jwtToken = await page.evaluate(() => {
        return sessionStorage.getItem('jwt-token') || localStorage.getItem('jwt-token');
      });
      expect(jwtToken).not.toBeNull();
    });
  });
});

import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../test-helper';
import { Pom } from '../playwright.pom';
import { expect, test } from '@playwright/test';

test.describe('user home', () => {
  let jwtToken: string | undefined;
  test.describe('toggle dark mode', () => {
    test.describe('success', () => {
      test('should turn dark mode on or off', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        const isDark = await page.evaluate(() => document.body.classList.contains('dark'));
        expect(isDark).toBeDefined();
        await pom.toggleDarkMode();
        const isDarkNow = await page.evaluate(() => document.body.classList.contains('dark'));
        expect(isDarkNow).toBeDefined();
        expect(isDark).toBe(!isDarkNow);
      });
    });
  });
});

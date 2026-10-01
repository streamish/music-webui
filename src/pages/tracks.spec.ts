import { ADMIN_PASSWORD, ADMIN_USERNAME, TestApi, USER_PASSWORD, USER_USERNAME } from '../test-helper';
import { Pom } from '../playwright.pom';
import { expect, test } from '@playwright/test';

test.describe('tracks', () => {
  let jwtToken: string | undefined;

  test.describe('sidebar', () => {
    test('should turn dark mode on or off', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.getByText('Tracks').click();
      const isDark = await page.evaluate(() => document.body.classList.contains('dark'));
      expect(isDark).toBeDefined();
      await pom.toggleDarkMode();
      const isDarkNow = await page.evaluate(() => document.body.classList.contains('dark'));
      expect(isDarkNow).toBeDefined();
      expect(isDark).toBe(!isDarkNow);
    });

    test('should toggle sidebar visibility', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.getByText('Tracks').click();
      const firstState =
        (await page.evaluate(() => document.querySelector('div[data-slot="sidebar"]')?.getAttribute('data-state'))) ||
        'closed';
      await pom.toggleSideBar();
      const secondState =
        (await page.evaluate(() => document.querySelector('div[data-slot="sidebar"]')?.getAttribute('data-state'))) ||
        'closed';
      expect(firstState).not.toBe(secondState);
      await pom.toggleSideBar();
      const thirdState =
        (await page.evaluate(() => document.querySelector('div[data-slot="sidebar"]')?.getAttribute('data-state'))) ||
        'closed';
      expect(secondState).not.toBe(thirdState);
      expect(thirdState).toBe(firstState);
    });
  });

  test.describe('browsing tracks', () => {
    test('should play track', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.locator('a[aria-label="Tracks"]').click();
      await page.getByLabel('Play now').first().click();
      await page.click('button[aria-label="Show or hide playback queue"]');
      await page.waitForSelector(`li[aria-label="Queue item 1"]`);
      const queueItem1 = await page.getByLabel('Queue item 1');
      expect(queueItem1).toBeDefined();
      expect(queueItem1).toBeVisible();
      const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
      expect(textContent).toContain('01 First Track');
      expect(textContent).toContain('Album 1');
    });

    test('should replace queue and play track', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.locator('a[aria-label="Tracks"]').click();
      await page.getByLabel('Play now').first().click();
      await page.getByLabel('Play now').last().click();
      await page.click('button[aria-label="Show or hide playback queue"]');
      await page.waitForSelector(`li[aria-label="Queue item 1"]`);
      const queueItem1 = await page.getByLabel('Queue item 1');
      expect(queueItem1).toBeDefined();
      expect(queueItem1).toBeVisible();
      const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
      expect(textContent).toContain('06 Sixth Track');
      expect(textContent).toContain('Album 4');
    });

    test('should queue track at start', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.locator('a[aria-label="Tracks"]').click();
      await page.getByLabel('Play now').first().click();
      await page.getByLabel('Add to start of queue').last().click();
      await page.click('button[aria-label="Show or hide playback queue"]');
      await page.waitForSelector(`li[aria-label="Queue item 1"]`);
      const queueItem1 = await page.getByLabel('Queue item 1');
      expect(queueItem1).toBeDefined();
      expect(queueItem1).toBeVisible();
      const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
      expect(textContent).toContain('06 Sixth Track');
      expect(textContent).toContain('Album 4');
      const queueItem2 = await page.getByLabel('Queue item 2');
      expect(queueItem2).toBeDefined();
      expect(queueItem2).toBeVisible();
      const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
      expect(textContent2).toContain('01 First Track');
      expect(textContent2).toContain('Album 1');
    });

    test('should queue track at end', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.locator('a[aria-label="Tracks"]').click();
      await page.getByLabel('Play now').first().click();
      await page.getByLabel('Add to end of queue').last().click();
      await page.click('button[aria-label="Show or hide playback queue"]');
      await page.waitForSelector(`li[aria-label="Queue item 1"]`);
      const queueItem1 = await page.getByLabel('Queue item 1');
      expect(queueItem1).toBeDefined();
      expect(queueItem1).toBeVisible();
      const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
      expect(textContent).toContain('01 First Track');
      expect(textContent).toContain('Album 1');
      const queueItem2 = await page.getByLabel('Queue item 2');
      expect(queueItem2).toBeDefined();
      expect(queueItem2).toBeVisible();
      const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
      expect(textContent2).toContain('06 Sixth Track');
      expect(textContent2).toContain('Album 4');
    });
  });

  test.describe('editing tracks', () => {
    test('should update track details', async ({ page }) => {
      const newUsername = `tracks-edit-track-${Date.now()}`;
      const testApi = new TestApi();
      const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
        newUsername,
      });
      expect(newAccountId).toBeGreaterThan(0);
      const pom = new Pom(page);
      await pom.signIn({ username: newUsername, password: USER_PASSWORD });
      await page.locator('a[aria-label="Tracks"]').click();
      await page.getByLabel('Edit track').first().click();
      await page.fill('input[name="title"]', 'Playwright-associations Track 1');
      await page.fill('input[name="artists"]', 'Playwright-associations Artist 1');
      await page.fill('input[name="genres"]', 'Playwright-associations Acoustic');
      await page.fill('input[name="composers"]', 'Playwright-associations Composer 1');
      await page.fill('input[name="comment"]', 'x'.repeat(100));
      await page.fill('input[name="year"]', '2000');
      await page.fill('input[name="trackNumber"]', '123');
      await page.fill('input[name="discNumber"]', '45');
      await page.click('button[type="submit"]');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      await expect(
        page.getByLabel(`Track details:  Playwright-associations Track 1 by Playwright-associations Artist 1`),
      ).toBeDefined();
      await testApi.deleteUser(newAccountId);
    });
  });
});

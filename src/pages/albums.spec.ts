import { ADMIN_PASSWORD, ADMIN_USERNAME, TestApi, USER_PASSWORD, USER_USERNAME } from '../test-helper';
import { Pom } from '../playwright.pom';
import { expect, test } from '@playwright/test';

test.describe('albums', () => {
  let jwtToken: string | undefined;

  test.describe('sidebar', () => {
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

    test('should toggle sidebar visibility', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
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

  test.describe('browsing albums', () => {
    test('should expand clicked albums', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      const albums = [
        'Album 1 by Artist 1',
        'Album 2 by Artist 1',
        'Album 3 by Artist 2',
        'Album 4 by Artist 3',
        'Album 5 by Artist 3',
      ];
      const isResponsive = await pom.isResponsive();
      for (const album of albums) {
        await page.getByLabel(album).click();
        await page.waitForSelector(`div[aria-label="Album details:  ${album}"]`);
        await expect(page.getByLabel(`Album details:  ${album}`)).toBeDefined();
        await expect(page.getByLabel(`Album details:  ${album}`)).toBeVisible();
        if (isResponsive) {
          await page.getByLabel('Back button').click();
        }
      }
    });

    test('should play album', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.getByLabel('Album 1 by Artist 1').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
      await page.click('button[aria-label="Play now"]');
      await pom.openPlaybackQueue();
      await page.waitForSelector(`li[aria-label="Queue item 1"]`);
      await expect(page.getByLabel('Queue item 1')).toBeDefined();
      await expect(page.getByLabel('Queue item 1')).toBeVisible();
      const queueItem1 = await page.getByLabel('Queue item 1');
      const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
      expect(textContent).toContain('01 First Track');
      expect(textContent).toContain('Album 1');
    });

    test('should replace queue and play album', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      const isResponsive = await pom.isResponsive();
      await page.getByLabel('Album 1 by Artist 1').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
      await page.click('button[aria-label="Play now"]');
      if (isResponsive) {
        await page.getByLabel('Back button').click();
      }
      await page.getByLabel('Album 5 by Artist 3').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 5 by Artist 3"]`);
      await page.click('button[aria-label="Play now"]');
      await pom.openPlaybackQueue();
      const tracks = ['01 First Track', '02 Second Track', '03 Third Track', '04 Fourth Track'];
      for (let i = 1; i < 5; i += 1) {
        await page.waitForSelector(`li[aria-label="Queue item ${i}"]`);
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
        const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
        const textContent: string[] = (await queueItem.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain(tracks[i - 1]);
        expect(textContent).toContain('Album 5');
      }
      await expect(page.getByLabel('Queue item 5')).toHaveCount(0);
    });

    test('should queue album at start', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      const isResponsive = await pom.isResponsive();
      await page.getByLabel('Album 1 by Artist 1').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
      await page.click('button[aria-label="Play now"]');
      if (isResponsive) {
        await page.getByLabel('Back button').click();
      }
      await page.getByLabel('Album 5 by Artist 3').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 5 by Artist 3"]`);
      await page.click('button[aria-label="Add to start of queue"]');
      await pom.openPlaybackQueue();
      const tracks = ['01 First Track', '02 Second Track', '03 Third Track', '04 Fourth Track'];
      for (let i = 1; i < 5; i += 1) {
        await page.waitForSelector(`li[aria-label="Queue item ${i}"]`);
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
        const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
        const textContent: string[] = (await queueItem.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain(tracks[i - 1]);
        expect(textContent).toContain('Album 5');
      }
      const tracks2 = ['01 First Track', '02 Second Track', '03 Third Track', '04 Fourth Track', '05 Fifth Track'];
      for (let i = 5; i < 10; i += 1) {
        await page.waitForSelector(`li[aria-label="Queue item ${i}"]`);
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
        const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
        const textContent: string[] = (await queueItem.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain(tracks2[i - 5]);
        expect(textContent).toContain('Album 1');
      }
    });

    test('should queue album at end', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      const isResponsive = await pom.isResponsive();
      await page.getByLabel('Album 1 by Artist 1').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
      await page.click('button[aria-label="Play now"]');
      if (isResponsive) {
        await page.getByLabel('Back button').click();
      }
      await page.getByLabel('Album 5 by Artist 3').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 5 by Artist 3"]`);
      await page.click('button[aria-label="Add to end of queue"]');
      await pom.openPlaybackQueue();
      const tracks = ['01 First Track', '02 Second Track', '03 Third Track', '04 Fourth Track', '05 Fifth Track'];
      for (let i = 1; i < 6; i += 1) {
        await page.waitForSelector(`li[aria-label="Queue item ${i}"]`);
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
        const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
        const textContent: string[] = (await queueItem.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain(tracks[i - 1]);
        expect(textContent).toContain('Album 1');
      }
      const tracks2 = ['01 First Track', '02 Second Track', '03 Third Track', '04 Fourth Track'];
      for (let i = 6; i < 10; i += 1) {
        await page.waitForSelector(`li[aria-label="Queue item ${i}"]`);
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
        await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
        const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
        const textContent: string[] = (await queueItem.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain(tracks2[i - 6]);
        expect(textContent).toContain('Album 5');
      }
    });
  });

  test.describe('editing albums', () => {
    test('should update album details', async ({ page }) => {
      const newUsername = `albums-edit-album-${Date.now()}`;
      const testApi = new TestApi();
      const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
        newUsername,
      });
      expect(newAccountId).toBeGreaterThan(0);
      const pom = new Pom(page);
      await pom.signIn({ username: newUsername, password: USER_PASSWORD });
      await page.getByLabel('Album 1 by Artist 1').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
      await page.click('button[aria-label="Edit album"]');
      await page.fill('input[name="title"]', 'Playwright-albums Album 1');
      await page.fill('input[name="artists"]', 'Playwright-albums Artist 1');
      await page.fill('input[name="year"]', '2000');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      await expect(
        page.getByLabel(`Album details:  Playwright-albums Album 1 by Playwright-albums Artist 1`),
      ).toBeDefined();
      await testApi.deleteUser(newAccountId);
    });
  });

  test.describe('rating albums', () => {
    test('should rate album', async ({ page }) => {
      const newUsername = `albums-rating-album-${Date.now()}`;
      const testApi = new TestApi();
      const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
        newUsername,
      });
      expect(newAccountId).toBeGreaterThan(0);
      const pom = new Pom(page);
      await pom.signIn({ username: newUsername, password: USER_PASSWORD });
      await page.getByLabel('Album 1 by Artist 1').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
      await page.click('button[aria-label="Rate this album with 5 stars"]');
      await page.waitForLoadState('networkidle');
      await expect(page.getByLabel('Rate this album with 5 stars')).toBeDefined();
      await testApi.deleteUser(newAccountId);
    });
  });
});

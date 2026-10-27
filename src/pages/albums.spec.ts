/* eslint-disable no-await-in-loop */
import { ADMIN_PASSWORD, ADMIN_USERNAME, USER_PASSWORD, USER_USERNAME } from '../test-helper';
import { Pom } from '../playwright.pom';
import { expect, test } from '../test-fixtures';
import type { Page } from '@playwright/test';

function waitForAlbumRequest(page: Page, limit: number, offset: number) {
  return page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname.endsWith('/api/list-albums') &&
      url.searchParams.get('limit') === String(limit) &&
      url.searchParams.get('offset') === String(offset)
    );
  });
}

test.describe('albums', () => {
  let jwtToken: string | undefined;

  test.describe('query states', () => {
    test('shows an error when albums cannot be loaded', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.route('**/api/list-albums**', (route) =>
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Album service unavailable', success: false, message: [] }),
        }),
      );

      await page.goto('/albums');

      await expect(page.getByRole('alert')).toContainText('Unable to load albums: Album service unavailable', {
        timeout: 15000,
      });
    });

    test('shows an empty state when no albums are available', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await page.route('**/api/list-albums**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, albums: [], limit: 100, offset: 0, total: 0 }),
        }),
      );

      await page.goto('/albums');

      await expect(page.getByText('No albums found.')).toBeVisible();
    });
  });

  test.describe('pagination', () => {
    test('uses the URL page for initial load and refresh', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      test.skip(await pom.isResponsive(), 'Pagination controls are hidden on mobile layouts');
      await page.addInitScript(() => {
        localStorage.setItem('preferences', JSON.stringify({ pageSize: 2 }));
      });
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;

      const initialRequest = waitForAlbumRequest(page, 2, 2);
      await page.goto('/albums?page=2');
      expect((await initialRequest).ok()).toBe(true);
      await expect(page).toHaveURL(/\/albums\?page=2$/);
      await expect(
        page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: '2' }),
      ).toHaveAttribute('aria-current', 'page');

      const refreshRequest = waitForAlbumRequest(page, 2, 2);
      await page.reload();
      expect((await refreshRequest).ok()).toBe(true);
      await expect(page).toHaveURL(/\/albums\?page=2$/);
      await expect(
        page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: '2' }),
      ).toHaveAttribute('aria-current', 'page');
    });

    test('preserves the page when opening an album', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      test.skip(await pom.isResponsive(), 'Pagination controls are hidden on mobile layouts');
      await page.addInitScript(() => {
        localStorage.setItem('preferences', JSON.stringify({ pageSize: 2 }));
      });
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;

      const pageRequest = waitForAlbumRequest(page, 2, 2);
      await page.goto('/albums?page=2');
      expect((await pageRequest).ok()).toBe(true);

      await page.getByLabel('Album 3 by Artist 2').click();
      await expect(page).toHaveURL(/\/albums\/\d+\/[^?]+\?page=2$/);
      await expect(page.getByLabel('Album details:  Album 3 by Artist 2')).toBeVisible();
    });

    test('keeps the query in sync with browser back and forward', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      test.skip(await pom.isResponsive(), 'Pagination controls are hidden on mobile layouts');
      await page.addInitScript(() => {
        localStorage.setItem('preferences', JSON.stringify({ pageSize: 2 }));
      });
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;

      const firstPageRequest = waitForAlbumRequest(page, 2, 0);
      await page.goto('/albums');
      expect((await firstPageRequest).ok()).toBe(true);

      const secondPageRequest = waitForAlbumRequest(page, 2, 2);
      await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: '2' }).click();
      expect((await secondPageRequest).ok()).toBe(true);
      await expect(page).toHaveURL(/\/albums\?page=2$/);

      const thirdPageRequest = waitForAlbumRequest(page, 2, 4);
      await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: '3' }).click();
      expect((await thirdPageRequest).ok()).toBe(true);
      await expect(page).toHaveURL(/\/albums\?page=3$/);

      const backRequest = waitForAlbumRequest(page, 2, 2);
      await page.goBack();
      expect((await backRequest).ok()).toBe(true);
      await expect(page).toHaveURL(/\/albums\?page=2$/);

      const forwardRequest = waitForAlbumRequest(page, 2, 4);
      await page.goForward();
      expect((await forwardRequest).ok()).toBe(true);
      await expect(page).toHaveURL(/\/albums\?page=3$/);
    });

    test('uses the current page-size preference when loading a URL page', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      test.skip(await pom.isResponsive(), 'Pagination controls are hidden on mobile layouts');
      await page.addInitScript(() => {
        if (!localStorage.getItem('preferences')) {
          localStorage.setItem('preferences', JSON.stringify({ pageSize: 2 }));
        }
      });
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await pom.navigateToAccount();
      await page.getByRole('radio', { name: '100', exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('preferences') ?? '{}').pageSize))
        .toBe(100);

      const pageRequest = waitForAlbumRequest(page, 100, 100);
      await page.goto('/albums?page=2');
      expect((await pageRequest).ok()).toBe(true);
    });
  });

  test.describe('sidebar', () => {
    test('should turn dark mode on or off', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await pom.navigateToAlbums();
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
      await pom.navigateToAlbums();
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
      await pom.navigateToAlbums();
      const albums = [
        'Album 1 by Artist 1',
        'Album 2 by Artist 1',
        'Album 3 by Artist 2',
        'Album 4 by Artist 3',
        'Album 5 by Artist 3',
      ];
      const isResponsive = await pom.isResponsive();
      for (let i = 0, len = albums.length; i < len; i += 1) {
        const album = albums[i];
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
      await pom.navigateToAlbums();
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
      await pom.navigateToAlbums();
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
      await pom.navigateToAlbums();
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
      await pom.navigateToAlbums();
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
    test('should update album details', async ({ page, testApi }) => {
      const newUsername = `albums-edit-album-${Date.now()}`;
      const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
        newUsername,
      });
      expect(newAccountId).toBeGreaterThan(0);
      const pom = new Pom(page);
      await pom.signIn({ username: newUsername, password: USER_PASSWORD });
      await pom.navigateToAlbums();
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
    });
  });

  test.describe('rating albums', () => {
    test('should rate album', async ({ page, testApi }) => {
      const newUsername = `albums-rating-album-${Date.now()}`;
      const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
        newUsername,
      });
      expect(newAccountId).toBeGreaterThan(0);
      const pom = new Pom(page);
      await pom.signIn({ username: newUsername, password: USER_PASSWORD });
      await pom.navigateToAlbums();
      await page.getByLabel('Album 1 by Artist 1').click();
      await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
      await page.click('button[aria-label="Rate this album with 5 stars"]');
      await page.waitForLoadState('networkidle');
      await expect(page.getByLabel('Rate this album with 5 stars')).toBeDefined();
    });
  });
});

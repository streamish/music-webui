import { ADMIN_PASSWORD, ADMIN_USERNAME, TestApi, USER_PASSWORD, USER_USERNAME } from '../test-helper';
import { Pom } from '../playwright.pom';
import { expect, test } from '@playwright/test';

test.describe('associations', () => {
  let jwtToken: string | undefined;

  test.describe('sidebar', () => {
    test('should turn dark mode on or off', async ({ page }) => {
      const pom = new Pom(page, jwtToken);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      jwtToken = jwtToken || pom.jwtToken;
      await pom.navigateToAlbumArtists();
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
      await pom.navigateToAlbumArtists();
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

  test.describe('album artists', () => {
    test.describe('browsing albums', () => {
      test('should expand clicked albums', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        const albums = ['Album 1 by Artist 1', 'Album 2 by Artist 1'];
        const isResponsive = await pom.isResponsive();
        await pom.navigateToAlbumArtists();
        await page.getByLabel('Browse Artist 1').click();
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
        await pom.navigateToAlbumArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Album 1 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
        await page.click('button[aria-label="Play now"]');
        await pom.openPlaybackQueue();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
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
        await pom.navigateToAlbumArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Album 1 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
        await page.click('button[aria-label="Play now"]');
        if (isResponsive) {
          await page.getByLabel('Back button').click();
        }
        await page.getByLabel('Album 2 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 2 by Artist 1"]`);
        await page.click('button[aria-label="Play now"]');
        await pom.openPlaybackQueue();
        const tracks = [
          '01 First Track',
          '02 Second Track',
          '03 Third Track',
          '04 Fourth Track',
          '01 First Track',
          '02 Second Track',
          '03 Third Track',
        ];
        for (let i = 1; i < tracks.length; i += 1) {
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
          const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
          const textContent: string[] = (await queueItem.allInnerTexts()).map((text) => text.trim().split('\n')).flat();
          expect(textContent).toContain(tracks[i - 1]);
          expect(textContent).toContain('Album 2');
        }
        await expect(page.getByLabel(`Queue item ${tracks.length + 1}`)).toHaveCount(0);
      });

      test('should queue album at start', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        const isResponsive = await pom.isResponsive();
        await pom.navigateToAlbumArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Album 1 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
        await page.click('button[aria-label="Play now"]');
        if (isResponsive) {
          await page.getByLabel('Back button').click();
        }
        await page.getByLabel('Album 2 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 2 by Artist 1"]`);
        await page.click('button[aria-label="Add to start of queue"]');
        await pom.openPlaybackQueue();
        const tracks = [
          '01 First Track',
          '02 Second Track',
          '03 Third Track',
          '04 Fourth Track',
          '01 First Track',
          '02 Second Track',
          '03 Third Track',
        ];
        for (let i = 1; i < tracks.length; i += 1) {
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
          const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
          const textContent: string[] = (await queueItem.allInnerTexts()).map((text) => text.trim().split('\n')).flat();
          expect(textContent).toContain(tracks[i - 1]);
          expect(textContent).toContain('Album 2');
        }
        const tracks2 = ['01 First Track', '02 Second Track', '03 Third Track', '04 Fourth Track', '05 Fifth Track'];
        for (let i = tracks.length + 1; i < tracks.length + tracks2.length; i += 1) {
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
          const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
          const textContent: string[] = (await queueItem.allInnerTexts()).map((text) => text.trim().split('\n')).flat();
          expect(textContent).toContain(tracks2[i - tracks.length - 1]);
          expect(textContent).toContain('Album 1');
        }
      });

      test('should queue album at end', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        const isResponsive = await pom.isResponsive();
        await pom.navigateToAlbumArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Album 1 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
        await page.click('button[aria-label="Play now"]');
        if (isResponsive) {
          await page.getByLabel('Back button').click();
        }
        await page.getByLabel('Album 2 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 2 by Artist 1"]`);
        await page.click('button[aria-label="Add to end of queue"]');
        await pom.openPlaybackQueue();
        const tracks = ['01 First Track', '02 Second Track', '03 Third Track', '04 Fourth Track', '05 Fifth Track'];
        for (let i = 1; i < tracks.length; i += 1) {
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
          const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
          const textContent: string[] = (await queueItem.allInnerTexts()).map((text) => text.trim().split('\n')).flat();
          expect(textContent).toContain(tracks[i - 1]);
          expect(textContent).toContain('Album 1');
        }
        const tracks2 = [
          '01 First Track',
          '02 Second Track',
          '03 Third Track',
          '04 Fourth Track',
          '01 First Track',
          '02 Second Track',
          '03 Third Track',
        ];
        for (let i = tracks.length + 1; i < tracks.length + tracks2.length; i += 1) {
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeDefined();
          await expect(page.getByLabel(`Queue item ${i}`, { exact: true })).toBeVisible();
          const queueItem = await page.getByLabel(`Queue item ${i}`, { exact: true });
          const textContent: string[] = (await queueItem.allInnerTexts()).map((text) => text.trim().split('\n')).flat();
          expect(textContent).toContain(tracks2[i - tracks.length - 1]);
          expect(textContent).toContain('Album 2');
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
        await pom.navigateToAlbumArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Album 1 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
        await page.click('button[aria-label="Edit album"]');
        await page.fill('input[name="title"]', 'Playwright-associations Album 1');
        await page.fill('input[name="artists"]', 'Playwright-associations Artist 1');
        await page.fill('input[name="year"]', '2000');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        await expect(
          page.getByLabel(`Album details:  Playwright-associations Album 1 by Playwright-associations Artist 1`),
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
        await pom.navigateToAlbumArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Album 1 by Artist 1').click();
        await page.waitForSelector(`div[aria-label="Album details:  Album 1 by Artist 1"]`);
        await page.click('button[aria-label="Rate this album with 5 stars"]');
        await page.waitForLoadState('networkidle');
        await expect(page.getByLabel('Rate this album with 5 stars')).toBeDefined();
        await testApi.deleteUser(newAccountId);
      });
    });
  });

  test.describe('track artists', () => {
    test.describe('browsing tracks', () => {
      test('should play track', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Play now').first().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('01 First Track');
        expect(textContent).toContain('Album 1');
      });

      test('should replace queue and play track', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Play now').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('03 Third Track');
        expect(textContent).toContain('Album 2');
      });

      test('should queue track at start', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Add to start of queue').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('03 Third Track');
        expect(textContent).toContain('Album 2');
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeVisible();
        const queueItem2 = await page.getByLabel('Queue item 2', { exact: true });
        const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
        expect(textContent2).toContain('01 First Track');
        expect(textContent2).toContain('Album 1');
      });

      test('should queue track at end', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Add to end of queue').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('01 First Track');
        expect(textContent).toContain('Album 1');
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeVisible();
        const queueItem2 = await page.getByLabel('Queue item 2', { exact: true });
        const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
        expect(textContent2).toContain('03 Third Track');
        expect(textContent2).toContain('Album 2');
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
        await pom.navigateToArtists();
        await page.getByLabel('Browse Artist 1').click();
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
        await page.waitForLoadState('networkidle');
        await pom.navigateToTracks();
        await expect(
          page.getByLabel(`Track details:  Playwright-associations Track 1 by Playwright-associations Artist 1`),
        ).toBeDefined();
        await testApi.deleteUser(newAccountId);
      });
    });

    test.describe('rating tracks', () => {
      test('should rate track', async ({ page }) => {
        const newUsername = `tracks-rating-track-${Date.now()}`;
        const testApi = new TestApi();
        const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
          newUsername,
        });
        expect(newAccountId).toBeGreaterThan(0);
        const pom = new Pom(page);
        await pom.signIn({ username: newUsername, password: USER_PASSWORD });
        await pom.navigateToArtists();
        await page.getByLabel('Browse Artist 1').click();
        await page.getByRole('button', { name: 'Rate this track with 5 stars' }).first().click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByLabel('Rate this track with 5 stars')).toBeDefined();
        await testApi.deleteUser(newAccountId);
      });
    });
  });

  test.describe('track composers', () => {
    test.describe('browsing composers', () => {
      test('should play track', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToComposers();
        await page.getByLabel('Browse Composer 1').click();
        await page.getByLabel('Play now').first().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('01 First Track');
        expect(textContent).toContain('Album 1');
      });

      test('should replace queue and play track', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToComposers();
        await page.getByLabel('Browse Composer 1').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Play now').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('02 Second Track');
        expect(textContent).toContain('Album 2');
      });

      test('should queue track at start', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToComposers();
        await page.getByLabel('Browse Composer 1').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Add to start of queue').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('02 Second Track');
        expect(textContent).toContain('Album 2');
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeVisible();
        const queueItem2 = await page.getByLabel('Queue item 2', { exact: true });
        const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
        expect(textContent2).toContain('01 First Track');
        expect(textContent2).toContain('Album 1');
      });

      test('should queue track at end', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToComposers();
        await page.getByLabel('Browse Composer 1').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Add to end of queue').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('01 First Track');
        expect(textContent).toContain('Album 1');
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeVisible();
        const queueItem2 = await page.getByLabel('Queue item 2', { exact: true });
        const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
        expect(textContent2).toContain('02 Second Track');
        expect(textContent2).toContain('Album 2');
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
        await pom.navigateToComposers();
        await page.getByLabel('Browse Composer 1').click();
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
        await page.waitForLoadState('networkidle');
        await pom.navigateToTracks();
        await expect(
          page.getByLabel(`Track details:  Playwright-associations Track 1 by Playwright-associations Artist 1`),
        ).toBeDefined();
        await testApi.deleteUser(newAccountId);
      });
    });

    test.describe('rating tracks', () => {
      test('should rate track', async ({ page }) => {
        const newUsername = `tracks-rating-track-${Date.now()}`;
        const testApi = new TestApi();
        const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
          newUsername,
        });
        expect(newAccountId).toBeGreaterThan(0);
        const pom = new Pom(page);
        await pom.signIn({ username: newUsername, password: USER_PASSWORD });
        await pom.navigateToComposers();
        await page.getByLabel('Browse Composer 1').click();
        await page.getByRole('button', { name: 'Rate this track with 5 stars' }).first().click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByLabel('Rate this track with 5 stars')).toBeDefined();
        await testApi.deleteUser(newAccountId);
      });
    });
  });

  test.describe('track genres', () => {
    test.describe('browsing genres', () => {
      test('should play track', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToGenres();
        await page.getByLabel('Browse Acoustic').click();
        await page.getByLabel('Play now').first().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('01 First Track');
        expect(textContent).toContain('Album 3');
      });

      test('should replace queue and play track', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToGenres();
        await page.getByLabel('Browse Acoustic').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Play now').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('04 Fourth Track');
        expect(textContent).toContain('Album 3');
      });

      test('should queue track at start', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToGenres();
        await page.getByLabel('Browse Acoustic').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Add to start of queue').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('04 Fourth Track');
        expect(textContent).toContain('Album 3');
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeVisible();
        const queueItem2 = await page.getByLabel('Queue item 2', { exact: true });
        const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
        expect(textContent2).toContain('01 First Track');
        expect(textContent2).toContain('Album 3');
      });

      test('should queue track at end', async ({ page }) => {
        const pom = new Pom(page, jwtToken);
        await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        jwtToken = jwtToken || pom.jwtToken;
        await pom.navigateToGenres();
        await page.getByLabel('Browse Acoustic').click();
        await page.getByLabel('Play now').first().click();
        await page.getByLabel('Add to end of queue').last().click();
        await pom.openPlaybackQueue();
        await page.waitForSelector(`li[aria-label="Queue item 1"]`);
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 1', { exact: true })).toBeVisible();
        const queueItem1 = await page.getByLabel('Queue item 1');
        const textContent: string[] = (await queueItem1.allInnerTexts()).toString().split('\n');
        expect(textContent).toContain('01 First Track');
        expect(textContent).toContain('Album 3');
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeDefined();
        await expect(page.getByLabel('Queue item 2', { exact: true })).toBeVisible();
        const queueItem2 = await page.getByLabel('Queue item 2', { exact: true });
        const textContent2: string[] = (await queueItem2.allInnerTexts()).toString().split('\n');
        expect(textContent2).toContain('04 Fourth Track');
        expect(textContent2).toContain('Album 3');
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
        await pom.navigateToGenres();
        await page.getByLabel('Browse Acoustic').click();
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
        await page.waitForLoadState('networkidle');
        await pom.navigateToTracks();
        await expect(
          page.getByLabel(`Track details:  Playwright-associations Track 1 by Playwright-associations Artist 1`),
        ).toBeDefined();
        await testApi.deleteUser(newAccountId);
      });
    });

    test.describe('rating tracks', () => {
      test('should rate track', async ({ page }) => {
        const newUsername = `tracks-rating-track-${Date.now()}`;
        const testApi = new TestApi();
        const newAccountId = await testApi.duplicateUser(USER_USERNAME, {
          newUsername,
        });
        expect(newAccountId).toBeGreaterThan(0);
        const pom = new Pom(page);
        await pom.signIn({ username: newUsername, password: USER_PASSWORD });
        await pom.navigateToGenres();
        await page.getByLabel('Browse Acoustic').click();
        await page.getByRole('button', { name: 'Rate this track with 5 stars' }).first().click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByLabel('Rate this track with 5 stars')).toBeDefined();
        await testApi.deleteUser(newAccountId);
      });
    });
  });
});

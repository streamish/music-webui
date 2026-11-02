/* eslint-disable no-await-in-loop */
import { ADMIN_PASSWORD, ADMIN_USERNAME, USER_PASSWORD, USER_USERNAME } from '../test-helper';
import { Pom } from '../playwright.pom';
import { SmartPlaylistConjugalEnum, SmartPlaylistFieldEnum, SmartPlaylistOperationEnum } from '../types/api-schema';
import { expect, test } from '../test-fixtures';
import type { Page } from '@playwright/test';

const apiBaseUrl = process.env.VITE_API_BASE_URL?.replace(/\/$/, '');
if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL environment variable is not set');
}

type Track = { id: number; title: string; albumTitle: string };
type PlaylistResponse = { playlistId: number };
type ListTracksResponse = { tracks: Track[] };

async function apiRequest<Response>(
  page: Page,
  jwtToken: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  data?: unknown,
): Promise<Response> {
  const response = await page.request.fetch(`${apiBaseUrl}/api/${path}`, {
    method,
    headers: { Authorization: `Bearer ${jwtToken}` },
    data,
  });
  const body: unknown = await response.json();
  if (!response.ok()) {
    throw new Error(`Request to /api/${path} failed (${response.status()}): ${JSON.stringify(body)}`);
  }
  return body as Response;
}

async function signInAsFreshUser(
  page: Page,
  testApi: { duplicateUser: (username: string, userData: { newUsername: string }) => Promise<number> },
  name: string,
) {
  const username = `playlists-${name}-${Date.now()}`;
  const accountId = await testApi.duplicateUser(USER_USERNAME, { newUsername: username });
  expect(accountId).toBeGreaterThan(0);
  const pom = new Pom(page);
  await pom.signIn({ username, password: USER_PASSWORD });
  if (!pom.jwtToken) {
    throw new Error('Sign-in did not return a JWT');
  }
  return { pom, jwtToken: pom.jwtToken };
}

async function createNormalPlaylist(page: Page, jwtToken: string, name: string) {
  const result = await apiRequest<PlaylistResponse>(page, jwtToken, 'POST', 'create-playlist', { name });
  return result.playlistId;
}

async function createSmartPlaylist(page: Page, jwtToken: string, name: string) {
  const result = await apiRequest<PlaylistResponse>(page, jwtToken, 'POST', 'create-smart-playlist', {
    name,
    rulesConjugal: SmartPlaylistConjugalEnum.and,
    rules: [
      {
        field: SmartPlaylistFieldEnum.genre,
        operation: SmartPlaylistOperationEnum.is,
        value: 'Rock',
      },
    ],
  });
  return result.playlistId;
}

async function getTracks(page: Page, jwtToken: string, limit = 3) {
  const result = await apiRequest<ListTracksResponse>(page, jwtToken, 'GET', `list-tracks?limit=${limit}&offset=0`);
  if (result.tracks.length < limit) {
    throw new Error(`Expected at least ${limit} seeded library tracks`);
  }
  return result.tracks;
}

async function addTracksToPlaylist(page: Page, jwtToken: string, playlistId: number, tracks: Track[]) {
  await apiRequest(page, jwtToken, 'POST', `add-playlist-items?id=${playlistId}`, {
    items: tracks.map(({ id }) => ({ trackId: id })),
  });
}

async function openPlaylist(page: Page, name: string, type: 'normal' | 'smart') {
  await page.getByRole('button', { name: `${name} (${type})`, exact: false }).click();
}

test.describe('playlists', () => {
  test.describe('query states', () => {
    test('shows an error when playlists cannot be loaded', async ({ page }) => {
      const pom = new Pom(page);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      await page.route('**/api/list-playlists**', (route) =>
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Playlist service unavailable', success: false, message: [] }),
        }),
      );

      await page.goto('/playlists');

      await expect(page.getByRole('alert')).toContainText('Unable to load playlists: Playlist service unavailable', {
        timeout: 15000,
      });
    });

    test('shows an empty state when no playlists are available', async ({ page }) => {
      const pom = new Pom(page);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      await page.route('**/api/list-playlists**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, playlists: [], limit: 100000, offset: 0, total: 0 }),
        }),
      );

      await page.goto('/playlists');

      await expect(page.getByText('You have not added any playlists yet.')).toBeVisible();
    });

    test('shows a loading state while playlists are loading', async ({ page }) => {
      const pom = new Pom(page);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      let releaseResponse: (() => void) | undefined;
      const responseGate = new Promise<void>((resolve) => {
        releaseResponse = resolve;
      });
      await page.route('**/api/list-playlists**', async (route) => {
        await responseGate;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, playlists: [], limit: 100000, offset: 0, total: 0 }),
        });
      });

      const navigation = page.goto('/playlists');
      await expect(page.getByRole('status')).toContainText('Loading', { timeout: 10000 });
      releaseResponse?.();
      await navigation;
      await expect(page.getByText('You have not added any playlists yet.')).toBeVisible();
    });
  });

  test.describe('sidebar', () => {
    test('should turn dark mode on or off', async ({ page }) => {
      const pom = new Pom(page);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');
      const isDark = await page.evaluate(() => document.body.classList.contains('dark'));
      await pom.toggleDarkMode();
      const isDarkNow = await page.evaluate(() => document.body.classList.contains('dark'));
      expect(isDark).toBe(!isDarkNow);
    });

    test('should toggle sidebar visibility', async ({ page }) => {
      const pom = new Pom(page);
      await pom.signIn({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');
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
      expect(thirdState).toBe(firstState);
    });
  });

  test.describe('browsing playlists', () => {
    test('shows normal and smart playlists and opens their details', async ({ page, testApi }) => {
      const { pom, jwtToken } = await signInAsFreshUser(page, testApi, 'browse');
      const normalName = `Browse normal ${Date.now()}`;
      const smartName = `Browse smart ${Date.now()}`;
      await createNormalPlaylist(page, jwtToken, normalName);
      await createSmartPlaylist(page, jwtToken, smartName);
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');

      await expect(page.getByRole('button', { name: `${normalName} (normal)`, exact: false })).toBeVisible();
      await expect(page.getByRole('button', { name: `${smartName} (smart)`, exact: false })).toBeVisible();
      await expect(page.getByRole('img', { name: `Cover for playlist ${normalName}` })).toHaveAttribute(
        'src',
        /\/api\/playlist-cover-image\?id=\d+&size=(300|600)$/,
      );

      await openPlaylist(page, normalName, 'normal');
      await expect(page.getByRole('heading', { name: `${normalName} items` })).toBeVisible();
      if (await pom.isResponsive()) {
        await page.getByRole('button', { name: 'Back to playlists' }).click();
      } else {
        await openPlaylist(page, normalName, 'normal');
      }
      await openPlaylist(page, smartName, 'smart');
      await expect(page.getByRole('button', { name: `Edit rules for ${smartName}` })).toBeVisible();
    });
  });

  test.describe('editing playlists', () => {
    test('renames a normal playlist', async ({ page, testApi }) => {
      const { pom, jwtToken } = await signInAsFreshUser(page, testApi, 'rename');
      const playlistName = `Rename normal ${Date.now()}`;
      await createNormalPlaylist(page, jwtToken, playlistName);
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');

      await page.getByRole('button', { name: `Edit playlist ${playlistName}` }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Name').fill(`${playlistName} updated`);
      await dialog.getByRole('button', { name: 'Save changes' }).click();

      await expect(page.getByText('Playlist renamed successfully.')).toBeVisible();
      await expect(page.getByRole('button', { name: `${playlistName} updated (normal)`, exact: false })).toBeVisible();
    });

    test('edits smart playlist rules', async ({ page, testApi }) => {
      const { pom, jwtToken } = await signInAsFreshUser(page, testApi, 'smart-edit');
      const playlistName = `Edit smart ${Date.now()}`;
      await createSmartPlaylist(page, jwtToken, playlistName);
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');

      await page.getByRole('button', { name: `Edit rules for ${playlistName}` }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('combobox', { name: 'Match' }).click();
      await page.getByRole('option', { name: 'Any rule' }).click();
      await dialog.getByRole('textbox', { name: 'Rule 1 value' }).fill('Jazz');
      await dialog.getByRole('button', { name: 'Save rules' }).click();

      await expect(page.getByText('Smart playlist rules updated successfully.')).toBeVisible();
    });
  });

  test.describe('editing normal playlist items', () => {
    test('removes playlist items', async ({ page, testApi }) => {
      const { pom, jwtToken } = await signInAsFreshUser(page, testApi, 'remove-item');
      const playlistName = `Remove items ${Date.now()}`;
      const playlistId = await createNormalPlaylist(page, jwtToken, playlistName);
      const [track] = await getTracks(page, jwtToken, 1);
      if (!track) {
        throw new Error('Seeded track was not returned');
      }
      await addTracksToPlaylist(page, jwtToken, playlistId, [track]);
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');
      await openPlaylist(page, playlistName, 'normal');
      const row = page.locator('tbody tr').filter({ hasText: track.title });
      await expect(row).toBeVisible();
      await row.getByRole('button', { name: `Remove ${track.title} from playlist` }).click();
      await expect(page.getByText('Removed item from playlist.')).toBeVisible();
      await expect(row).toHaveCount(0);
    });

    test('moves playlist items up and down', async ({ page, testApi }) => {
      const { pom, jwtToken } = await signInAsFreshUser(page, testApi, 'move-items');
      const playlistName = `Move items ${Date.now()}`;
      const playlistId = await createNormalPlaylist(page, jwtToken, playlistName);
      const tracks = await getTracks(page, jwtToken, 3);
      await addTracksToPlaylist(page, jwtToken, playlistId, tracks);
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');
      await openPlaylist(page, playlistName, 'normal');

      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(3);
      await rows
        .nth(2)
        .getByRole('button', { name: `Move ${tracks[2]?.title} up` })
        .click();
      await expect(rows.nth(1).locator('td').nth(3)).toHaveText(tracks[2]?.albumTitle ?? '');
      await expect(page.getByText('Playlist order updated.')).toBeVisible();
      const moveDownButton = rows.nth(1).getByRole('button', { name: `Move ${tracks[2]?.title} down` });
      await expect(moveDownButton).toBeEnabled();
      await moveDownButton.click();
      await expect(rows.nth(2).locator('td').nth(3)).toHaveText(tracks[2]?.albumTitle ?? '');
    });

    test('reorders playlist items by dragging rows', async ({ page, testApi }) => {
      const { pom, jwtToken } = await signInAsFreshUser(page, testApi, 'drag-items');
      const playlistName = `Drag items ${Date.now()}`;
      const playlistId = await createNormalPlaylist(page, jwtToken, playlistName);
      const tracks = await getTracks(page, jwtToken, 3);
      await addTracksToPlaylist(page, jwtToken, playlistId, tracks);
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');
      await openPlaylist(page, playlistName, 'normal');

      const rows = page.locator('tbody tr');
      await rows.first().dragTo(rows.nth(2));
      await expect(rows.nth(2)).toContainText(tracks[0]?.title ?? '');
    });
  });

  test.describe('deleting playlists', () => {
    test('deletes the selected playlist after confirmation', async ({ page, testApi }) => {
      const { pom, jwtToken } = await signInAsFreshUser(page, testApi, 'delete');
      const playlistName = `Delete playlist ${Date.now()}`;
      await createNormalPlaylist(page, jwtToken, playlistName);
      await (await pom.findNavigationLink('Playlists')).click();
      await page.waitForURL('/playlists');

      await page.getByRole('button', { name: `Delete ${playlistName}` }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toContainText(`Delete “${playlistName}”?`);
      await dialog.getByRole('button', { name: 'Delete playlist' }).click();

      await expect(page.getByText('Playlist deleted successfully.')).toBeVisible();
      await expect(page.getByRole('button', { name: `${playlistName} (normal)`, exact: false })).toHaveCount(0);
    });
  });
});

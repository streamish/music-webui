import { type Locator, type Page, expect } from '@playwright/test';
import type { components } from './types/api-schema';

type CreateSessionBody = components['schemas']['GuestCreateSessionBodyDto'];

export class Pom {
  private readonly page: Page;

  public jwtToken: string | undefined;

  constructor(page: Page, jwtToken?: string) {
    this.page = page;
    this.jwtToken = jwtToken;
  }

  async findNavigationLink(name: string): Promise<Locator> {
    const responsiveMode = await this.isResponsive();
    if (responsiveMode) {
      await this.page.getByRole('button', { name: 'Toggle Sidebar' }).click();
      await this.page.waitForTimeout(500);
      await this.page.locator(`a[aria-label="${name}"]`).last().waitFor({ state: 'visible' });
    }
    return this.page.locator(`a[aria-label="${name}"]`).first();
  }

  async toggleSideBar(): Promise<void> {
    const currentState = await this.page.evaluate(() =>
      document.querySelector('div[data-slot="sidebar"]')?.getAttribute('data-state'),
    );
    if (currentState === 'open') {
      const trigger = await this.page.getByRole('button', { name: 'Close Sidebar' });
      await trigger.click();
    } else {
      const trigger = await this.page.getByRole('button', { name: 'Toggle Sidebar' });
      await trigger.click();
    }
    await this.page.waitForTimeout(500);
  }

  async toggleDarkMode(): Promise<void> {
    const responsiveMode = await this.isResponsive();
    if (responsiveMode) {
      await this.page.getByRole('button', { name: 'Toggle Sidebar' }).click();
      await this.page.locator('button[aria-label="Toggle dark mode"]').last().waitFor({ state: 'visible' });
      await this.page.getByRole('button', { name: 'Toggle dark mode' }).last().click();
    } else {
      await this.page.locator('button[aria-label="Toggle dark mode"]').first().waitFor({ state: 'visible' });
      await this.page.getByRole('button', { name: 'Toggle dark mode' }).first().click();
    }
  }

  async isResponsive(): Promise<boolean> {
    const isResponsive = await this.page.evaluate(() => {
      return !window.matchMedia('(min-width: 640px)').matches;
    });
    return isResponsive;
  }

  async navigateToAccount(): Promise<void> {
    await (await this.findNavigationLink('Account')).click();
    await this.page.waitForURL('/account');
  }

  async navigateToAdmin(): Promise<void> {
    await (await this.findNavigationLink('Admin')).click();
    await this.page.waitForURL('/admin');
    await this.page.getByRole('list', { name: 'User accounts' });
  }

  async navigateToFolders(): Promise<void> {
    await (await this.findNavigationLink('Folders')).click();
    await this.page.waitForURL('/folders');
    await this.page.getByLabel('Folder list').waitFor();
  }

  async navigateToTracks(): Promise<void> {
    await (await this.findNavigationLink('Tracks')).click();
    await this.page.waitForURL('/tracks');
  }

  async navigateToAlbums(): Promise<void> {
    await (await this.findNavigationLink('Albums')).click();
    await this.page.waitForURL('/albums');
  }

  async navigateToAlbumArtists(): Promise<void> {
    await (await this.findNavigationLink('Album Artists')).click();
    await this.page.waitForURL('/album-artists');
  }

  async navigateToArtists(): Promise<void> {
    await (await this.findNavigationLink('Artists')).click();
    await this.page.waitForURL('/track-artists');
  }

  async navigateToComposers(): Promise<void> {
    await (await this.findNavigationLink('Composers')).click();
    await this.page.waitForURL('/track-composers');
  }

  async navigateToGenres(): Promise<void> {
    await (await this.findNavigationLink('Genres')).click();
    await this.page.waitForURL('/track-genres');
  }

  async signIn(params?: CreateSessionBody, expectSuccess = true): Promise<void> {
    await this.page.goto('/signin');
    if (this.jwtToken) {
      await this.page.waitForLoadState('networkidle');
      try {
        await this.page.evaluate((token) => {
          sessionStorage.setItem('jwt-token', token);
        }, this.jwtToken);
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
        return;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('*** POM SIGN-IN ERROR:', error);
      }
    }
    await this.page.waitForSelector('input[placeholder="Enter your username"]');
    await this.page.getByPlaceholder('Enter your username').click();
    await this.page.getByPlaceholder('Enter your username').fill(params?.username || '');
    await this.page.getByPlaceholder('Enter your password').click();
    await this.page.getByPlaceholder('Enter your password').fill(params?.password || '');
    if (params?.expiresDays) {
      await this.page.getByRole('checkbox', { name: 'Remember me' }).check();
    }
    const response = this.page.waitForResponse((res) => {
      const url = res.url();
      const status = res.status();
      return (
        url.includes('/api/guest/create-session') &&
        ((expectSuccess && status === 201) || (!expectSuccess && (status === 400 || status === 404)))
      );
    });
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    const responseData = await response;
    const responseJSon = await responseData.json();
    this.jwtToken = responseJSon?.jwtToken;
    if (expectSuccess) {
      expect(this.jwtToken).not.toBeNull();
      await this.page.waitForURL('/');
    }
  }
}

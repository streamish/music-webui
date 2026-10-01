import createClient from 'openapi-fetch';
import type { components, paths } from './types/api-schema';

type User = components['schemas']['AdminAccountDto'];

if (!process.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is not set');
}

export const ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
export const USER_USERNAME = process.env.DEFAULT_USER_USERNAME || 'user';
export const USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'user';

const api = createClient<paths>({
  baseUrl: process.env.VITE_API_BASE_URL,
});

export async function createSession(username: string, password: string): Promise<string> {
  const { data, error } = await api.POST('/api/guest/create-session', {
    body: { username, password },
  });
  if (error || !data) {
    throw new Error(`Failed to create session: ${JSON.stringify(error)}`);
  }
  return data.jwtToken;
}

export class AdminApi {
  constructor(private readonly jwtToken: string) {}

  private get authHeader() {
    return {
      Authorization: `Bearer ${this.jwtToken}`,
    };
  }

  async getAccount(username: string): Promise<User> {
    const { data, error } = await api.GET('/api/admin/list-accounts', {
      params: {
        header: this.authHeader,
      },
    });
    if (error) {
      throw new Error(`Failed to list users: ${JSON.stringify(error)}`);
    }
    const account = data?.accounts.find((acc) => acc.username === username);
    if (!account) {
      throw new Error(`User "${username}" not found`);
    }
    return account;
  }

  async createUser(userData: components['schemas']['AdminCreateAccountBodyDto']): Promise<User> {
    const { error } = await api.POST('/api/admin/create-account', {
      body: userData,
      params: {
        header: this.authHeader,
      },
    });
    if (error) {
      throw new Error(`Failed to create user: ${JSON.stringify(error)}`);
    }
    const { data: data2, error: listError } = await api.GET('/api/admin/list-accounts', {
      params: {
        header: this.authHeader,
      },
    });
    if (listError) {
      throw new Error(`Failed to list users: ${JSON.stringify(listError)}`);
    }
    const account = data2?.accounts.find((acc) => acc.username === userData.username);
    if (!account) {
      throw new Error(`Created user "${userData.username}" was not found`);
    }
    return account;
  }

  async deleteUser(accountId: number): Promise<void> {
    const { error } = await api.PATCH('/api/admin/delete-account', {
      params: {
        header: this.authHeader,
        query: { id: accountId },
      },
      body: {
        adminPassword: ADMIN_PASSWORD,
      },
    });
    if (error) {
      throw new Error(`Failed to delete user: ${JSON.stringify(error)}`);
    }
  }

  async createRootPath(accountId: number, rootPath: string): Promise<void> {
    const { error } = await api.POST('/api/admin/create-root-path', {
      body: { rootPath },
      params: {
        header: this.authHeader,
        query: { id: accountId },
      },
    });
    if (error) {
      throw new Error(`Failed to create root path: ${JSON.stringify(error)}`);
    }
  }

  async getIndexerConfiguration(): Promise<components['schemas']['AdminIndexerConfigurationDto']> {
    const { data, error } = await api.GET('/api/admin/indexer-configuration', {
      params: {
        header: this.authHeader,
      },
    });
    if (error || !data) {
      throw new Error(`Failed to load indexer configuration: ${JSON.stringify(error)}`);
    }
    return data.configuration;
  }
}

export class TestApi {
  async deleteUser(accountId: number): Promise<void> {
    const { error } = await api.DELETE('/api/test/delete-account', {
      params: {
        query: { id: accountId },
      },
    });
    if (error) {
      throw new Error(`Failed to delete user: ${JSON.stringify(error)}`);
    }
  }
  async duplicateUser(
    username: string,
    userData: components['schemas']['TestDuplicateAccountBodyDto'],
  ): Promise<number> {
    const { data, error } = await api.POST('/api/test/duplicate-account', {
      body: userData,
      params: {
        query: {
          username,
        },
      },
    });
    if (error) {
      throw new Error(`Failed to create user: ${JSON.stringify(error)}`);
    }
    return data.accountId;
  }
}

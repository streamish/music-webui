import { TestApi } from './test-helper';
import { test as base } from '@playwright/test';
import type { components } from './types/api-schema';

type TestFixtures = {
  testApi: Pick<TestApi, 'duplicateUser'>;
};

export const test = base.extend<TestFixtures>({
  // Playwright requires fixture arguments to use object destructuring, even when none are needed.
  // eslint-disable-next-line no-empty-pattern
  testApi: async ({}, use) => {
    const api = new TestApi();
    const createdAccountIds: number[] = [];
    const testApi: TestFixtures['testApi'] = {
      duplicateUser: async (username: string, userData: components['schemas']['DuplicateTestAccountBodyDto']) => {
        const accountId = await api.duplicateUser(username, userData);
        createdAccountIds.push(accountId);
        return accountId;
      },
    };

    await use(testApi);

    const cleanupResults = await Promise.allSettled(createdAccountIds.map((accountId) => api.deleteUser(accountId)));
    const cleanupErrors = cleanupResults.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []));
    if (cleanupErrors.length > 0) {
      throw new AggregateError(cleanupErrors, 'Failed to delete test accounts');
    }
  },
});

export { expect } from '@playwright/test';

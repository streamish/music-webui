import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const adminKeys = {
  all: ['admin'] as const,
  accounts: () => [...adminKeys.all, 'accounts'] as const,
  userRootPaths: () => [...adminKeys.all, 'user-root-paths'] as const,
  userIndexerLogs: () => [...adminKeys.all, 'user-indexer-logs'] as const,
};

export const accountsQuery = () =>
  queryOptions({
    queryKey: adminKeys.accounts(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-accounts');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No user accounts returned');
      }
      return data.accounts;
    },
  });

export const userRootPathsQuery = () =>
  queryOptions({
    queryKey: adminKeys.userRootPaths(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-user-root-paths');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No root paths returned');
      }
      return data.rootPaths;
    },
  });

export const userIndexerLogsQuery = () =>
  queryOptions({
    queryKey: adminKeys.userIndexerLogs(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-user-indexer-logs');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No indexer logs returned');
      }
      return data.logs;
    },
  });

export const useAccounts = () => useQuery(accountsQuery());
export const useUserRootPaths = () => useQuery(userRootPathsQuery());
export const useUserIndexerLogs = () => useQuery(userIndexerLogsQuery());

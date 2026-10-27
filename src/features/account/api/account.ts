import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const accountKeys = {
  all: ['account'] as const,
  rootPaths: () => [...accountKeys.all, 'root-paths'] as const,
  indexerLogs: () => [...accountKeys.all, 'indexer-logs'] as const,
};

export const rootPathsQuery = () =>
  queryOptions({
    queryKey: accountKeys.rootPaths(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-root-paths');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No root paths returned');
      }
      return data.rootPaths;
    },
  });

export const indexerLogsQuery = () =>
  queryOptions({
    queryKey: accountKeys.indexerLogs(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-indexer-logs');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No indexer logs returned');
      }
      return data.logs;
    },
  });

export const useRootPaths = () => useQuery(rootPathsQuery());
export const useIndexerLogs = () => useQuery(indexerLogsQuery());

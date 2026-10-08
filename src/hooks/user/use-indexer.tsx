import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/user/list-indexer-logs']['get'];

export type IndexerLogDto = ListEndpoint['responses']['200']['content']['application/json']['logs'][number];

const INDEXER_QUERY_KEY = ['user-indexer-logs'] as const;

function indexerQueryKey(query?: ListEndpoint['parameters']['query']) {
  return [...INDEXER_QUERY_KEY, query] as const;
}

async function fetchIndexerLogs(query?: ListEndpoint['parameters']['query']): Promise<IndexerLogDto[]> {
  const { data, error } = await api.get('/api/user/list-indexer-logs', {
    params: {
      query,
    },
  });

  if (error) {
    throw new TypedApiError<
      | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.logs) {
    throw new Error('No data received');
  }
  return data.logs;
}

function fetchIndexerLogsWithClient(queryClient: QueryClient, query?: ListEndpoint['parameters']['query']) {
  return queryClient.fetchQuery<
    IndexerLogDto[],
    TypedApiError<
      | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
    >
  >({
    queryKey: indexerQueryKey(query),
    queryFn: () => fetchIndexerLogs(query),
  });
}

export function useIndexer() {
  const queryClient = useQueryClient();
  const [indexerLogs, setIndexerLogs] = useState<IndexerLogDto[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logsLoadingError, setLogsLoadingError] = useState<Error | null>(null);

  const listIndexerLogs = useCallback(
    async (query?: ListEndpoint['parameters']['query']) => {
      setIsLogsLoading(true);
      setLogsLoadingError(null);
      try {
        const result = await fetchIndexerLogsWithClient(queryClient, query);
        setIndexerLogs(result);
      } catch (error) {
        setLogsLoadingError(error instanceof Error ? error : new Error('Failed to fetch indexer logs'));
      } finally {
        setIsLogsLoading(false);
      }
    },
    [queryClient],
  );

  return {
    listIndexerLogs,
    indexerLogs,
    indexerLogsLoading: isLogsLoading,
    indexerLogsError: logsLoadingError,
  };
}

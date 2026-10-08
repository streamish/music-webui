import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from '@/types/api-schema';

type ListEndpoint = paths['/api/admin/list-indexer-logs']['get'];
type SetStatusEndpoint = paths['/api/admin/set-indexer-status']['patch'];

export type LogEntryDto = ListEndpoint['responses']['200']['content']['application/json']['logs'][number];
interface IndexerContextType {
  indexerLogs: LogEntryDto[];
  isEnabled: boolean;
  isLoadingLogs: boolean;
  isLoadingStatus: boolean;
  isUpdatingStatus: boolean;
  listIndexerLogs: (query?: ListEndpoint['parameters']['query']) => Promise<void>;
  toggleStatus: (body: SetStatusEndpoint['requestBody']['content']['application/json']) => Promise<void>;
}

const IndexerContext = createContext<IndexerContextType>({
  indexerLogs: [],
  isEnabled: true,
  isLoadingLogs: true,
  isLoadingStatus: true,
  isUpdatingStatus: true,
  listIndexerLogs: async () => {},
  toggleStatus: async () => {},
});

export function IndexerProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setEnabled] = useState(true);
  const [isLoadingStatus, setLoadingStatus] = useState(true);
  const [isLoadingLogs, setLoadingLogs] = useState(true);
  const [isUpdatingStatus, setUpdatingStatus] = useState(true);
  const [indexerLogs, setIndexerLogs] = useState<LogEntryDto[]>([]);

  useEffect(() => {
    const fetchIndexerStatus = async () => {
      try {
        const { data, error } = await api.get('/api/admin/indexer-configuration');
        if (error) {
          throw new TypedApiError<
            | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
            | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
            | ListEndpoint['responses']['500']['content']['application/json']['message'][number]
          >(error.message, error.error);
        }
        if (!data?.success) {
          throw new Error('Failed to fetch indexer configuration');
        }
        setEnabled(data.configuration.isEnabled);
        setLoadingStatus(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch indexer configuration:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchIndexerStatus();
  }, []);

  const toggleStatus = async (body: SetStatusEndpoint['requestBody']['content']['application/json']) => {
    try {
      const newStatus = body.enabled;
      setEnabled(newStatus);
      setUpdatingStatus(true);
      const { data, error } = await api.patch('/api/admin/set-indexer-status', {
        body,
      });
      if (error) {
        throw new TypedApiError<
          | SetStatusEndpoint['responses']['400']['content']['application/json']['message'][number]
          | SetStatusEndpoint['responses']['403']['content']['application/json']['message'][number]
          | SetStatusEndpoint['responses']['500']['content']['application/json']['message'][number]
        >(error.message, error.error);
      }
      if (!data?.success) {
        throw new Error('Failed to set indexer status');
      }
      setEnabled(newStatus);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle indexer configuration:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const listIndexerLogs = async (query?: ListEndpoint['parameters']['query']) => {
    try {
      setLoadingLogs(true);
      const { data, error } = await api.get('/api/admin/list-indexer-logs', {
        params: {
          query,
        },
      });
      if (error) {
        throw new TypedApiError<
          | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
          | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
          | ListEndpoint['responses']['500']['content']['application/json']['message'][number]
        >(error.message, error.error);
      }
      if (!data?.success) {
        throw new Error('No log data received');
      }
      setIndexerLogs(data.logs);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to retrieve indexer logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    listIndexerLogs();
  }, []);

  return (
    <IndexerContext.Provider
      value={{
        indexerLogs,
        isEnabled,
        isLoadingStatus,
        isLoadingLogs,
        isUpdatingStatus,
        listIndexerLogs,
        toggleStatus,
      }}
    >
      {children}
    </IndexerContext.Provider>
  );
}

export function useIndexer() {
  const context = useContext(IndexerContext);
  if (!context) {
    throw new Error('useIndexer must be used within IndexerProvider');
  }
  return context;
}

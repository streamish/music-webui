import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface IndexerContextType {
  isEnabled: boolean;
  isLoadingStatus: boolean;
  isUpdatingStatus: boolean;
  toggleStatus: (enabled: boolean) => Promise<void>;
}

const IndexerContext = createContext<IndexerContextType>({
  isEnabled: true,
  isLoadingStatus: true,
  isUpdatingStatus: true,
  toggleStatus: async () => {},
});

export function IndexerProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setEnabled] = useState(true);
  const [isLoadingStatus, setLoadingStatus] = useState(true);
  const [isUpdatingStatus, setUpdatingStatus] = useState(true);

  useEffect(() => {
    const fetchIndexerStatus = async () => {
      try {
        const { data, error } = await api.get('/api/admin/indexer-configuration');
        if (error) {
          throw new Error(error.error, {
            cause: error.message,
          });
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

  const toggleStatus = async (enabled: boolean) => {
    try {
      const newStatus = enabled;
      setEnabled(newStatus);
      setUpdatingStatus(true);
      const { data, error } = await api.patch('/api/admin/set-indexer-status', {
        body: { enabled },
      });
      if (error) {
        throw new Error(error.error, {
          cause: error.message,
        });
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

  return (
    <IndexerContext.Provider
      value={{
        isEnabled,
        isLoadingStatus,
        isUpdatingStatus,
        toggleStatus,
      }}
    >
      {children}
    </IndexerContext.Provider>
  );
}

export function useIndexerStatus() {
  const context = useContext(IndexerContext);
  if (!context) {
    throw new Error('useIndexerStatus must be used within IndexerProvider');
  }
  return context;
}

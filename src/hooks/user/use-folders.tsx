import { useQuery } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/user/folder-structure']['get'];
type ListEndpointResponse = ListEndpoint['responses']['200']['content']['application/json'];
export type TreeItemDto = ListEndpointResponse['items'][number];

async function fetchFolders(): Promise<ListEndpointResponse> {
  const { data, error } = await api.get('/api/user/folder-structure');
  if (error) {
    throw new TypedApiError<
      | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.items?.length) {
    throw new Error('No folders received');
  }
  return data;
}

export function useFolders() {
  const foldersQuery = useQuery({
    queryKey: ['folders'],
    queryFn: () => {
      return fetchFolders();
    },
  });

  return {
    refetchFolders: foldersQuery.refetch,
    folders: foldersQuery.data?.items ?? [],
    isListing: foldersQuery.isLoading,
  };
}

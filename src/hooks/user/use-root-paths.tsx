import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/user/list-root-paths']['get'];
type CreateEndpoint = paths['/api/user/create-root-path']['post'];
type DeleteEndpoint = paths['/api/user/delete-root-path']['delete'];

export type RootPathDto = ListEndpoint['responses']['200']['content']['application/json']['rootPaths'][number];

const ROOT_PATHS_QUERY_KEY = ['rootPaths'];

async function fetchRootPaths(): Promise<RootPathDto[]> {
  const { data, error } = await api.get('/api/user/list-root-paths');
  if (error) {
    throw new TypedApiError<
      | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.rootPaths) {
    throw new Error('No data received');
  }
  return data.rootPaths;
}

async function createRootPath(body: CreateEndpoint['requestBody']['content']['application/json']) {
  const { data, error } = await api.post('/api/user/create-root-path', {
    body,
  });
  if (error) {
    throw new TypedApiError<
      | CreateEndpoint['responses']['400']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['403']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to create root path');
  }
  if (!data.success) {
    throw new Error('Failed to create root path');
  }
  return data;
}

async function deleteRootPath(query: DeleteEndpoint['parameters']['query']) {
  const { data, error } = await api.delete('/api/user/delete-root-path', {
    params: {
      query,
    },
  });
  if (error) {
    throw new TypedApiError<
      | DeleteEndpoint['responses']['400']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['403']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['404']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to delete root path');
  }
  if (!data.success) {
    throw new Error('Failed to delete root path');
  }
  return data;
}

export function useRootPaths() {
  const queryClient = useQueryClient();

  const rootPathsQuery = useQuery({
    queryKey: ROOT_PATHS_QUERY_KEY,
    queryFn: fetchRootPaths,
  });

  const createRootPathMutation = useMutation<
    CreateEndpoint['responses']['201']['content']['application/json'],
    TypedApiError<CreateEndpoint['responses']['400']['content']['application/json']['message'][number]>,
    CreateEndpoint['requestBody']['content']['application/json']
  >({
    mutationFn: createRootPath,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROOT_PATHS_QUERY_KEY });
    },
  });

  const deleteRootPathMutation = useMutation<
    DeleteEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<DeleteEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    DeleteEndpoint['parameters']['query']
  >({
    mutationFn: deleteRootPath,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROOT_PATHS_QUERY_KEY });
    },
  });

  return {
    createRootPath: createRootPathMutation.mutateAsync,
    deleteRootPath: deleteRootPathMutation.mutateAsync,
    refetchRootPaths: rootPathsQuery.refetch,
    isDeleting: deleteRootPathMutation.isPending,
    isLoading: rootPathsQuery.isLoading,
    rootPaths: rootPathsQuery.data ?? [],
  };
}

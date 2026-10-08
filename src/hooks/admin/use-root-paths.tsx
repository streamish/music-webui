import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/admin/list-root-paths']['get'];
type CreateEndpoint = paths['/api/admin/create-root-path']['post'];
type DeleteEndpoint = paths['/api/admin/delete-root-path']['delete'];
type UpdateEndpoint = paths['/api/admin/update-root-path']['patch'];

type CreateRootPathVariables = {
  query: CreateEndpoint['parameters']['query'];
  body: CreateEndpoint['requestBody']['content']['application/json'];
};

type UpdateRootPathVariables = {
  query: UpdateEndpoint['parameters']['query'];
  body: UpdateEndpoint['requestBody']['content']['application/json'];
};

const ROOT_PATHS_QUERY_KEY = ['rootPaths'] as const;

async function fetchRootPathsRequest(): Promise<ListEndpoint['responses']['200']['content']['application/json']> {
  const { data, error } = await api.get('/api/admin/list-root-paths');
  if (error) {
    throw new TypedApiError<
      | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to fetch root paths');
  }
  return data;
}

async function createRootPathRequest({ query, body }: CreateRootPathVariables) {
  const { data, error } = await api.post('/api/admin/create-root-path', {
    params: {
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | CreateEndpoint['responses']['400']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['401']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['403']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['404']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to create root path');
  }
  return data;
}

async function deleteRootPathRequest(query: DeleteEndpoint['parameters']['query']) {
  const { data, error } = await api.delete('/api/admin/delete-root-path', {
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
  if (!data?.success) {
    throw new Error('Failed to delete root path');
  }
  return data;
}

async function updateRootPathRequest({ query, body }: UpdateRootPathVariables) {
  const { data, error } = await api.patch('/api/admin/update-root-path', {
    params: {
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | UpdateEndpoint['responses']['400']['content']['application/json']['message'][number]
      | UpdateEndpoint['responses']['403']['content']['application/json']['message'][number]
      | UpdateEndpoint['responses']['404']['content']['application/json']['message'][number]
      | UpdateEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to update root path');
  }
  return data;
}

export function useRootPaths() {
  const queryClient = useQueryClient();

  const rootPathsQuery = useQuery({
    queryKey: ROOT_PATHS_QUERY_KEY,
    queryFn: fetchRootPathsRequest,
  });

  const createRootPathMutation = useMutation<
    CreateEndpoint['responses']['201']['content']['application/json'],
    TypedApiError<
      | CreateEndpoint['responses']['400']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['403']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['404']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['500']['content']['application/json']['message'][number]
    >,
    CreateRootPathVariables
  >({
    mutationFn: createRootPathRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROOT_PATHS_QUERY_KEY });
    },
  });

  const deleteRootPathMutation = useMutation<
    DeleteEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<
      | DeleteEndpoint['responses']['400']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['403']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['404']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['500']['content']['application/json']['message'][number]
    >,
    DeleteEndpoint['parameters']['query']
  >({
    mutationFn: deleteRootPathRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROOT_PATHS_QUERY_KEY });
    },
  });

  const updateRootPathMutation = useMutation<
    UpdateEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<
      | UpdateEndpoint['responses']['400']['content']['application/json']['message'][number]
      | UpdateEndpoint['responses']['403']['content']['application/json']['message'][number]
      | UpdateEndpoint['responses']['404']['content']['application/json']['message'][number]
      | UpdateEndpoint['responses']['500']['content']['application/json']['message'][number]
    >,
    UpdateRootPathVariables
  >({
    mutationFn: updateRootPathRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROOT_PATHS_QUERY_KEY });
    },
  });

  return {
    createRootPath: createRootPathMutation.mutateAsync,
    deleteRootPath: deleteRootPathMutation.mutateAsync,
    refetchRootPaths: rootPathsQuery.refetch,
    updateRootPath: updateRootPathMutation.mutateAsync,
    isDeleting: deleteRootPathMutation.isPending,
    isUpdating: updateRootPathMutation.isPending,
    isLoading: rootPathsQuery.isLoading,
    rootPaths: rootPathsQuery.data,
  };
}

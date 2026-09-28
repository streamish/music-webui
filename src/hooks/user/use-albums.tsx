import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/user/list-albums']['get'];
type ListEndpointQuery = ListEndpoint['parameters']['query'];
type ListEndpointResponse = ListEndpoint['responses']['200']['content']['application/json'];
type ListEndpointErrorMessage = ListEndpoint['responses']['400']['content']['application/json']['message'][number];

type RetrieveEndpoint = paths['/api/user/retrieve-album']['get'];
type RetrieveEndpointQuery = RetrieveEndpoint['parameters']['query'];
type RetrieveEndpointResponse = RetrieveEndpoint['responses']['200']['content']['application/json'];
type RetrieveEndpointErrorMessage =
  RetrieveEndpoint['responses']['404']['content']['application/json']['message'][number];

type SetNameEndpoint = paths['/api/user/set-album-custom-data']['patch'];
type SetNameEndpointResponse = SetNameEndpoint['responses']['200']['content']['application/json'];
type SetNameEndpointErrorMessage =
  | SetNameEndpoint['responses']['400']['content']['application/json']['message'][number]
  | SetNameEndpoint['responses']['404']['content']['application/json']['message'][number];

export type Album = ListEndpointResponse['albums'][number];
export type AlbumWithTracks = RetrieveEndpointResponse['album'];

type SetNameVariables = {
  body: SetNameEndpoint['requestBody']['content']['application/json'];
  query: SetNameEndpoint['parameters']['query'];
};

async function fetchAlbums(query: ListEndpointQuery): Promise<ListEndpointResponse> {
  const { data, error } = await api.get('/api/user/list-albums', {
    params: { header: api.authHeader(), query },
  });
  if (error) {
    throw new TypedApiError<ListEndpointErrorMessage>(error.message, error.error);
  }
  if (!data?.albums) {
    throw new Error('No albums received');
  }
  return data;
}

async function fetchAlbum(query: RetrieveEndpointQuery): Promise<RetrieveEndpointResponse> {
  const { data, error } = await api.get('/api/user/retrieve-album', {
    params: { header: api.authHeader(), query },
  });
  if (error) {
    throw new TypedApiError<RetrieveEndpointErrorMessage>(error.message, error.error);
  }
  if (!data?.album) {
    throw new Error('No album received');
  }
  return data;
}

async function setAlbumCustomData({ body, query }: SetNameVariables): Promise<SetNameEndpointResponse> {
  const { data, error } = await api.patch('/api/user/set-album-custom-data', {
    params: {
      header: api.authHeader(),
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<SetNameEndpointErrorMessage>(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set album custom data');
  }
  if (!data.success) {
    throw new Error('Failed to set album custom data');
  }
  return data;
}

export function useAlbums(params: ListEndpointQuery) {
  const queryClient = useQueryClient();

  const albumsQuery = useQuery({
    queryKey: ['albums', params],
    queryFn: ({ queryKey }) => {
      const [, queryParams] = queryKey as ['albums', ListEndpointQuery];
      return fetchAlbums(queryParams);
    },
  });

  const setAlbumCustomDataMutation = useMutation<
    SetNameEndpointResponse,
    TypedApiError<SetNameEndpointErrorMessage>,
    SetNameVariables
  >({
    mutationFn: setAlbumCustomData,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['albums'],
      });
    },
  });

  return {
    setAlbumCustomData: setAlbumCustomDataMutation.mutateAsync,
    refetchAlbums: albumsQuery.refetch,
    albums: albumsQuery.data?.albums ?? [],
    isListing: albumsQuery.isLoading,
    total: albumsQuery.data?.total ?? 0,
  };
}

export function useAlbum(params: RetrieveEndpointQuery) {
  const albumQuery = useQuery({
    queryKey: ['album', params],
    queryFn: ({ queryKey }) => {
      const [, queryParams] = queryKey as ['album', RetrieveEndpointQuery];
      return fetchAlbum(queryParams);
    },
  });

  return {
    album: albumQuery.data?.album ?? null,
    isLoading: albumQuery.isLoading,
  };
}

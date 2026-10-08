import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/user/list-albums']['get'];
type ListEndpointQuery = ListEndpoint['parameters']['query'];
type ListEndpointResponse = ListEndpoint['responses']['200']['content']['application/json'];
type ListEndpointErrorMessage =
  | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
  | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
  | ListEndpoint['responses']['500']['content']['application/json']['message'][number];

type RetrieveEndpoint = paths['/api/user/retrieve-album']['get'];
type RetrieveEndpointQuery = RetrieveEndpoint['parameters']['query'];
type RetrieveEndpointResponse = RetrieveEndpoint['responses']['200']['content']['application/json'];
type RetrieveEndpointErrorMessage =
  | RetrieveEndpoint['responses']['400']['content']['application/json']['message'][number]
  | RetrieveEndpoint['responses']['403']['content']['application/json']['message'][number]
  | RetrieveEndpoint['responses']['404']['content']['application/json']['message'][number]
  | RetrieveEndpoint['responses']['500']['content']['application/json']['message'][number];

type SetAlbumRatingEndpoint = paths['/api/user/set-album-rating']['put'];
type SetAlbumRatingQuery = SetAlbumRatingEndpoint['parameters']['query'];
type SetAlbumRatingBody = SetAlbumRatingEndpoint['requestBody']['content']['application/json'];
type SetAlbumRatingEndpointResponse = SetAlbumRatingEndpoint['responses']['200']['content']['application/json'];
type SetAlbumRatingEndpointErrorMessage =
  | SetAlbumRatingEndpoint['responses']['400']['content']['application/json']['message'][number]
  | SetAlbumRatingEndpoint['responses']['403']['content']['application/json']['message'][number]
  | SetAlbumRatingEndpoint['responses']['404']['content']['application/json']['message'][number]
  | SetAlbumRatingEndpoint['responses']['500']['content']['application/json']['message'][number];

type SetAlbumRatingVariables = {
  body: SetAlbumRatingBody;
  query: SetAlbumRatingQuery;
};

export type Album = ListEndpointResponse['albums'][number];
export type AlbumWithTracks = RetrieveEndpointResponse['album'];

async function fetchAlbums(query: ListEndpointQuery): Promise<ListEndpointResponse> {
  const { data, error } = await api.get('/api/user/list-albums', {
    params: { query },
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
    params: { query },
  });
  if (error) {
    throw new TypedApiError<RetrieveEndpointErrorMessage>(error.message, error.error);
  }
  if (!data?.album) {
    throw new Error('No album received');
  }
  return data;
}

async function setAlbumRating({ body, query }: SetAlbumRatingVariables): Promise<SetAlbumRatingEndpointResponse> {
  const { data, error } = await api.put('/api/user/set-album-rating', {
    params: {
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<SetAlbumRatingEndpointErrorMessage>(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set album rating');
  }
  if (!data.success) {
    throw new Error('Failed to set album rating');
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

  const setAlbumRatingMutation = useMutation<
    SetAlbumRatingEndpointResponse,
    TypedApiError<SetAlbumRatingEndpointErrorMessage>,
    SetAlbumRatingVariables
  >({
    mutationFn: setAlbumRating,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['albums'],
      });
    },
  });

  return {
    refetchAlbums: albumsQuery.refetch,
    setAlbumRating: setAlbumRatingMutation.mutateAsync,
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
    refetch: albumQuery.refetch,
    isLoading: albumQuery.isLoading,
  };
}

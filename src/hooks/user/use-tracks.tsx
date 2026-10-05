import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/user/list-tracks']['get'];
type ListEndpointQuery = ListEndpoint['parameters']['query'];
type ListEndpointResponse = ListEndpoint['responses']['200']['content']['application/json'];
type ListEndpointErrorMessage = ListEndpoint['responses']['400']['content']['application/json']['message'][number];

type SetTrackRatingEndpoint = paths['/api/user/set-track-rating']['put'];
type SetTrackRatingQuery = SetTrackRatingEndpoint['parameters']['query'];
type SetTrackRatingBody = SetTrackRatingEndpoint['requestBody']['content']['application/json'];
type SetTrackRatingEndpointResponse = SetTrackRatingEndpoint['responses']['200']['content']['application/json'];
type SetTrackRatingEndpointErrorMessage =
  | SetTrackRatingEndpoint['responses']['400']['content']['application/json']['message'][number]
  | SetTrackRatingEndpoint['responses']['404']['content']['application/json']['message'][number];

type SetTrackRatingVariables = {
  body: SetTrackRatingBody;
  query: SetTrackRatingQuery;
};

export type Track = ListEndpointResponse['tracks'][number];

async function fetchTracks(query: ListEndpointQuery): Promise<ListEndpointResponse> {
  const { data, error } = await api.get('/api/user/list-tracks', {
    params: { header: api.authHeader(), query },
  });
  if (error) {
    throw new TypedApiError<ListEndpointErrorMessage>(error.message, error.error);
  }
  if (!data?.tracks) {
    throw new Error('No tracks received');
  }
  return data;
}

async function setTrackRating({ body, query }: SetTrackRatingVariables): Promise<SetTrackRatingEndpointResponse> {
  const { data, error } = await api.put('/api/user/set-track-rating', {
    params: {
      header: api.authHeader(),
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<SetTrackRatingEndpointErrorMessage>(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set track rating');
  }
  if (!data.success) {
    throw new Error('Failed to set track rating');
  }
  return data;
}

export function useTracks(params: ListEndpointQuery) {
  const queryClient = useQueryClient();

  const tracksQuery = useQuery({
    queryKey: ['tracks', params],
    queryFn: ({ queryKey }) => {
      const [, queryParams] = queryKey as ['tracks', ListEndpointQuery];
      return fetchTracks(queryParams);
    },
  });

  const setTrackRatingMutation = useMutation<
    SetTrackRatingEndpointResponse,
    TypedApiError<SetTrackRatingEndpointErrorMessage>,
    SetTrackRatingVariables
  >({
    mutationFn: setTrackRating,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tracks'],
      });
    },
  });

  return {
    refetchTracks: tracksQuery.refetch,
    setTrackRating: setTrackRatingMutation.mutateAsync,
    isListing: tracksQuery.isLoading,
    totalTracks: tracksQuery.data?.total ?? 0,
    tracks: tracksQuery.data?.tracks ?? [],
  };
}

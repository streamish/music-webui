import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListEndpoint = paths['/api/user/list-tracks']['get'];
type ListEndpointQuery = ListEndpoint['parameters']['query'];
type ListEndpointResponse = ListEndpoint['responses']['200']['content']['application/json'];
type ListEndpointErrorMessage = ListEndpoint['responses']['400']['content']['application/json']['message'][number];

type SetTrackCustomDataEndpoint = paths['/api/user/set-track-custom-data']['patch'];
type SetTrackCustomDataEndpointResponse = SetTrackCustomDataEndpoint['responses']['200']['content']['application/json'];
type SetTrackCustomDataEndpointErrorMessage =
  | SetTrackCustomDataEndpoint['responses']['400']['content']['application/json']['message'][number]
  | SetTrackCustomDataEndpoint['responses']['404']['content']['application/json']['message'][number];

type SetTrackCustomDataVariables = {
  body: SetTrackCustomDataEndpoint['requestBody']['content']['application/json'];
  query: SetTrackCustomDataEndpoint['parameters']['query'];
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

async function setTrackName({ body, query }: SetTrackCustomDataVariables): Promise<SetTrackCustomDataEndpointResponse> {
  const { data, error } = await api.patch('/api/user/set-track-custom-data', {
    params: {
      header: api.authHeader(),
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<SetTrackCustomDataEndpointErrorMessage>(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set track custom data');
  }
  if (!data.success) {
    throw new Error('Failed to set track custom data');
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

  const setTrackNameMutation = useMutation<
    SetTrackCustomDataEndpointResponse,
    TypedApiError<SetTrackCustomDataEndpointErrorMessage>,
    SetTrackCustomDataVariables
  >({
    mutationFn: setTrackName,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tracks'],
      });
    },
  });

  return {
    setTrackName: setTrackNameMutation.mutateAsync,
    refetchTracks: tracksQuery.refetch,
    tracks: tracksQuery.data?.tracks ?? [],
    totalTracks: tracksQuery.data?.total ?? 0,
    isListing: tracksQuery.isLoading,
  };
}

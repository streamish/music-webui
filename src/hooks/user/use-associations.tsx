import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type ListAlbumAssociationsEndpoint = paths['/api/user/list-album-associations']['get'];
type ListAlbumAssociationsEndpointQuery = ListAlbumAssociationsEndpoint['parameters']['query'];
type ListAlbumAssociationsEndpointResponse =
  ListAlbumAssociationsEndpoint['responses']['200']['content']['application/json'];
type ListAlbumAssociationsEndpointErrorMessage =
  ListAlbumAssociationsEndpoint['responses']['400']['content']['application/json']['message'][number];

type ListTrackAssociationsEndpoint = paths['/api/user/list-track-associations']['get'];
type ListTrackAssociationsEndpointQuery = ListTrackAssociationsEndpoint['parameters']['query'];
type ListTrackAssociationsEndpointResponse =
  ListTrackAssociationsEndpoint['responses']['200']['content']['application/json'];
type ListTrackAssociationsEndpointErrorMessage =
  ListTrackAssociationsEndpoint['responses']['400']['content']['application/json']['message'][number];

type RetrieveEndpoint = paths['/api/user/retrieve-association']['get'];
type RetrieveEndpointQuery = RetrieveEndpoint['parameters']['query'];
type RetrieveEndpointResponse = RetrieveEndpoint['responses']['200']['content']['application/json'];
type RetrieveEndpointErrorMessage =
  RetrieveEndpoint['responses']['404']['content']['application/json']['message'][number];

type SetArtistNameEndpoint = paths['/api/user/set-artist-name']['patch'];
type SetArtistNameEndpointResponse = SetArtistNameEndpoint['responses']['200']['content']['application/json'];
type SetArtistNameEndpointErrorMessage =
  | SetArtistNameEndpoint['responses']['400']['content']['application/json']['message'][number]
  | SetArtistNameEndpoint['responses']['404']['content']['application/json']['message'][number];

type SetComposerNameEndpoint = paths['/api/user/set-composer-name']['patch'];
type SetComposerNameEndpointResponse = SetComposerNameEndpoint['responses']['200']['content']['application/json'];
type SetComposerNameEndpointErrorMessage =
  | SetComposerNameEndpoint['responses']['400']['content']['application/json']['message'][number]
  | SetComposerNameEndpoint['responses']['404']['content']['application/json']['message'][number];

type SetGenreNameEndpoint = paths['/api/user/set-genre-name']['patch'];
type SetGenreNameEndpointResponse = SetGenreNameEndpoint['responses']['200']['content']['application/json'];
type SetGenreNameEndpointErrorMessage =
  | SetGenreNameEndpoint['responses']['400']['content']['application/json']['message'][number]
  | SetGenreNameEndpoint['responses']['404']['content']['application/json']['message'][number];

type SetArtistNameVariables = {
  body: SetArtistNameEndpoint['requestBody']['content']['application/json'];
  query: SetArtistNameEndpoint['parameters']['query'];
};

type SetComposerNameVariables = {
  body: SetComposerNameEndpoint['requestBody']['content']['application/json'];
  query: SetComposerNameEndpoint['parameters']['query'];
};

type SetGenreNameVariables = {
  body: SetGenreNameEndpoint['requestBody']['content']['application/json'];
  query: SetGenreNameEndpoint['parameters']['query'];
};

export type AssociationStub = ListAlbumAssociationsEndpointResponse['associations'][number];
export type Association = RetrieveEndpointResponse['association'];

async function fetchAlbumAssociations(
  query: ListAlbumAssociationsEndpointQuery,
): Promise<ListAlbumAssociationsEndpointResponse> {
  const { data, error } = await api.get('/api/user/list-album-associations', {
    params: { header: api.authHeader(), query },
  });
  if (error) {
    throw new TypedApiError<ListAlbumAssociationsEndpointErrorMessage>(error.message, error.error);
  }
  if (!data?.associations) {
    throw new Error('No associations received');
  }
  return data;
}

async function fetchTrackAssociations(
  query: ListTrackAssociationsEndpointQuery,
): Promise<ListTrackAssociationsEndpointResponse> {
  const { data, error } = await api.get('/api/user/list-track-associations', {
    params: { header: api.authHeader(), query },
  });
  if (error) {
    throw new TypedApiError<ListTrackAssociationsEndpointErrorMessage>(error.message, error.error);
  }
  if (!data?.associations) {
    throw new Error('No associations received');
  }
  return data;
}

async function fetchAssociation(query: RetrieveEndpointQuery): Promise<RetrieveEndpointResponse> {
  const { data, error } = await api.get('/api/user/retrieve-association', {
    params: { header: api.authHeader(), query },
  });
  if (error) {
    throw new TypedApiError<RetrieveEndpointErrorMessage>(error.message, error.error);
  }
  if (!data?.association) {
    throw new Error('No association received');
  }
  return data;
}

async function setArtistName({ body, query }: SetArtistNameVariables): Promise<SetArtistNameEndpointResponse> {
  const { data, error } = await api.patch('/api/user/set-artist-name', {
    params: {
      header: api.authHeader(),
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<SetArtistNameEndpointErrorMessage>(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set artist name');
  }
  if (!data.success) {
    throw new Error('Failed to set artist name');
  }
  return data;
}

async function setComposerName({ body, query }: SetComposerNameVariables): Promise<SetComposerNameEndpointResponse> {
  const { data, error } = await api.patch('/api/user/set-composer-name', {
    params: {
      header: api.authHeader(),
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<SetComposerNameEndpointErrorMessage>(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set composer name');
  }
  if (!data.success) {
    throw new Error('Failed to set composer name');
  }
  return data;
}

async function setGenreName({ body, query }: SetGenreNameVariables): Promise<SetGenreNameEndpointResponse> {
  const { data, error } = await api.patch('/api/user/set-genre-name', {
    params: {
      header: api.authHeader(),
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<SetGenreNameEndpointErrorMessage>(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set genre name');
  }
  if (!data.success) {
    throw new Error('Failed to set genre name');
  }
  return data;
}

export function useAlbumAssociations(params: ListAlbumAssociationsEndpointQuery & { enabled: boolean }) {
  const queryClient = useQueryClient();

  const albumAssociationsQuery = useQuery({
    queryKey: ['album-associations', params],
    queryFn: ({ queryKey }) => {
      const [, queryParams] = queryKey as ['album-associations', ListAlbumAssociationsEndpointQuery];
      return fetchAlbumAssociations(queryParams);
    },
    enabled: params.enabled,
  });

  const setArtistNameMutation = useMutation<
    SetArtistNameEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<SetArtistNameEndpointErrorMessage>,
    SetArtistNameVariables
  >({
    mutationFn: setArtistName,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['album-associations'],
      });
    },
  });

  return {
    refetch: albumAssociationsQuery.refetch,
    setAssociationName: setArtistNameMutation.mutateAsync,
    associations: albumAssociationsQuery.data?.associations ?? [],
    isListing: albumAssociationsQuery.isLoading,
    total: albumAssociationsQuery.data?.total ?? 0,
  };
}

export function useTrackAssociations(params: ListTrackAssociationsEndpointQuery & { enabled: boolean }) {
  const queryClient = useQueryClient();

  const trackArtistsQuery = useQuery({
    queryKey: ['track-associations', params],
    queryFn: ({ queryKey }) => {
      const [, queryParams] = queryKey as ['track-associations', ListTrackAssociationsEndpointQuery];
      return fetchTrackAssociations(queryParams);
    },
    enabled: params.enabled,
  });

  const setArtistNameMutation = useMutation<
    SetArtistNameEndpointResponse,
    TypedApiError<SetArtistNameEndpointErrorMessage>,
    SetArtistNameVariables
  >({
    mutationFn: setArtistName,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['track-associations'],
      });
    },
  });

  const setComposerNameMutation = useMutation<
    SetArtistNameEndpointResponse,
    TypedApiError<SetArtistNameEndpointErrorMessage>,
    SetArtistNameVariables
  >({
    mutationFn: setComposerName,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['track-associations'],
      });
    },
  });

  const setGenreNameMutation = useMutation<
    SetArtistNameEndpointResponse,
    TypedApiError<SetArtistNameEndpointErrorMessage>,
    SetArtistNameVariables
  >({
    mutationFn: setGenreName,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['track-associations'],
      });
    },
  });

  return {
    invalidate: async () => {
      await trackArtistsQuery.refetch();
    },
    refetch: trackArtistsQuery.refetch,
    setArtistName: setArtistNameMutation.mutateAsync,
    setComposerName: setComposerNameMutation.mutateAsync,
    setGenreName: setGenreNameMutation.mutateAsync,
    associations: trackArtistsQuery.data?.associations ?? [],
    isListing: trackArtistsQuery.isLoading,
    total: trackArtistsQuery.data?.total ?? 0,
  };
}

export function useAssociation(params: RetrieveEndpointQuery) {
  const associationQuery = useQuery({
    queryKey: ['association', params],
    queryFn: ({ queryKey }) => {
      const [, queryParams] = queryKey as ['association', RetrieveEndpointQuery];
      return fetchAssociation(queryParams);
    },
    enabled: params.id != null,
  });

  return {
    association: associationQuery.data?.association ?? null,
    refetch: async () => {
      await associationQuery.refetch();
    },
    isLoading: associationQuery.isLoading,
  };
}

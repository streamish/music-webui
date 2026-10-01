import { useMutation } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from 'src/types/api-schema';

type SetCustomFileDataEndpoint = paths['/api/user/set-custom-data']['put'];
type DeleteCustomDataEndpoint = paths['/api/user/delete-custom-data']['delete'];
type SetArtistNameEndpoint = paths['/api/user/set-artist-name']['patch'];
type SetComposerNameEndpoint = paths['/api/user/set-composer-name']['patch'];
type SetGenreNameEndpoint = paths['/api/user/set-genre-name']['patch'];
type SetAlbumCustomDataEndpoint = paths['/api/user/set-album-custom-data']['patch'];
type SetTrackCustomDataEndpoint = paths['/api/user/set-track-custom-data']['patch'];

type SetCustomFileDataVariables = {
  query: SetCustomFileDataEndpoint['parameters']['query'];
  body: SetCustomFileDataEndpoint['requestBody']['content']['application/json'];
};

type SetArtistNameVariables = {
  query: SetArtistNameEndpoint['parameters']['query'];
  body: SetArtistNameEndpoint['requestBody']['content']['application/json'];
};

type SetComposerNameVariables = {
  query: SetComposerNameEndpoint['parameters']['query'];
  body: SetComposerNameEndpoint['requestBody']['content']['application/json'];
};

type SetGenreNameVariables = {
  query: SetGenreNameEndpoint['parameters']['query'];
  body: SetGenreNameEndpoint['requestBody']['content']['application/json'];
};

type SetAlbumCustomDataVariables = {
  query: SetAlbumCustomDataEndpoint['parameters']['query'];
  body: SetAlbumCustomDataEndpoint['requestBody']['content']['application/json'];
};

type SetTrackCustomDataVariables = {
  query: SetTrackCustomDataEndpoint['parameters']['query'];
  body: SetTrackCustomDataEndpoint['requestBody']['content']['application/json'];
};

async function setArtistName({ query, body }: SetArtistNameVariables) {
  const { data, error } = await api.patch('/api/user/set-artist-name', {
    params: {
      query,
      header: api.authHeader(),
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | SetArtistNameEndpoint['responses']['400']['content']['application/json']['message'][number]
      | SetArtistNameEndpoint['responses']['404']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set artist name');
  }
  if (!data.success) {
    throw new Error('Failed to set artist name');
  }
  return data;
}

async function setComposerName({ query, body }: SetComposerNameVariables) {
  const { data, error } = await api.patch('/api/user/set-composer-name', {
    params: {
      query,
      header: api.authHeader(),
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | SetComposerNameEndpoint['responses']['400']['content']['application/json']['message'][number]
      | SetComposerNameEndpoint['responses']['404']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set composer name');
  }
  if (!data.success) {
    throw new Error('Failed to set composer name');
  }
  return data;
}

async function setGenreName({ query, body }: SetGenreNameVariables) {
  const { data, error } = await api.patch('/api/user/set-genre-name', {
    params: {
      query,
      header: api.authHeader(),
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | SetGenreNameEndpoint['responses']['400']['content']['application/json']['message'][number]
      | SetGenreNameEndpoint['responses']['404']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set genre name');
  }
  if (!data.success) {
    throw new Error('Failed to set genre name');
  }
  return data;
}

async function setAlbumCustomData({ query, body }: SetAlbumCustomDataVariables) {
  const { data, error } = await api.patch('/api/user/set-album-custom-data', {
    params: {
      query,
      header: api.authHeader(),
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | SetAlbumCustomDataEndpoint['responses']['400']['content']['application/json']['message'][number]
      | SetAlbumCustomDataEndpoint['responses']['404']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set album custom data');
  }
  if (!data.success) {
    throw new Error('Failed to set album custom data');
  }
  return data;
}

async function setTrackCustomData({ query, body }: SetTrackCustomDataVariables) {
  const { data, error } = await api.patch('/api/user/set-track-custom-data', {
    params: {
      query,
      header: api.authHeader(),
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | SetTrackCustomDataEndpoint['responses']['400']['content']['application/json']['message'][number]
      | SetTrackCustomDataEndpoint['responses']['404']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set track custom data');
  }
  if (!data.success) {
    throw new Error('Failed to set track custom data');
  }
  return data;
}

async function setCustomData({ query, body }: SetCustomFileDataVariables) {
  const { data, error } = await api.put('/api/user/set-custom-data', {
    params: {
      query,
      header: api.authHeader(),
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | SetCustomFileDataEndpoint['responses']['400']['content']['application/json']['message'][number]
      | SetCustomFileDataEndpoint['responses']['404']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to set custom file data');
  }
  if (!data.success) {
    throw new Error('Failed to set custom file data');
  }
  return data;
}

async function deleteCustomFileData(query: DeleteCustomDataEndpoint['parameters']['query']) {
  const { data, error } = await api.delete('/api/user/delete-custom-data', {
    params: {
      header: api.authHeader(),
      query,
    },
  });
  if (error) {
    throw new TypedApiError<
      DeleteCustomDataEndpoint['responses']['404']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data) {
    throw new Error('Failed to delete custom file data');
  }
  if (!data.success) {
    throw new Error('Failed to delete custom file data');
  }
  return data;
}

export function useCustomData() {
  const setCustomDataMutation = useMutation<
    SetCustomFileDataEndpoint['responses']['200']['content']['application/json'],
    | TypedApiError<SetCustomFileDataEndpoint['responses']['400']['content']['application/json']['message'][number]>
    | TypedApiError<SetCustomFileDataEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    SetCustomFileDataVariables
  >({
    mutationFn: setCustomData,
  });

  const setAlbumCustomDataMutation = useMutation<
    SetAlbumCustomDataEndpoint['responses']['200']['content']['application/json'],
    | TypedApiError<SetAlbumCustomDataEndpoint['responses']['400']['content']['application/json']['message'][number]>
    | TypedApiError<SetAlbumCustomDataEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    SetAlbumCustomDataVariables
  >({
    mutationFn: setAlbumCustomData,
  });

  const setTrackCustomDataMutation = useMutation<
    SetTrackCustomDataEndpoint['responses']['200']['content']['application/json'],
    | TypedApiError<SetTrackCustomDataEndpoint['responses']['400']['content']['application/json']['message'][number]>
    | TypedApiError<SetTrackCustomDataEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    SetTrackCustomDataVariables
  >({
    mutationFn: setTrackCustomData,
  });

  const setArtistNameMutation = useMutation<
    SetArtistNameEndpoint['responses']['200']['content']['application/json'],
    | TypedApiError<SetArtistNameEndpoint['responses']['400']['content']['application/json']['message'][number]>
    | TypedApiError<SetArtistNameEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    SetArtistNameVariables
  >({
    mutationFn: setArtistName,
  });

  const setComposerNameMutation = useMutation<
    SetComposerNameEndpoint['responses']['200']['content']['application/json'],
    | TypedApiError<SetComposerNameEndpoint['responses']['400']['content']['application/json']['message'][number]>
    | TypedApiError<SetComposerNameEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    SetComposerNameVariables
  >({
    mutationFn: setComposerName,
  });

  const setGenreNameMutation = useMutation<
    SetGenreNameEndpoint['responses']['200']['content']['application/json'],
    | TypedApiError<SetGenreNameEndpoint['responses']['400']['content']['application/json']['message'][number]>
    | TypedApiError<SetGenreNameEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    SetGenreNameVariables
  >({
    mutationFn: setGenreName,
  });

  const deleteCustomFileDataMutation = useMutation<
    DeleteCustomDataEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<DeleteCustomDataEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    DeleteCustomDataEndpoint['parameters']['query']
  >({
    mutationFn: deleteCustomFileData,
  });

  return {
    deleteCustomFileData: deleteCustomFileDataMutation.mutateAsync,
    setAlbumCustomData: setAlbumCustomDataMutation.mutateAsync,
    setArtistName: setArtistNameMutation.mutateAsync,
    setComposerName: setComposerNameMutation.mutateAsync,
    setCustomData: setCustomDataMutation.mutateAsync,
    setGenreName: setGenreNameMutation.mutateAsync,
    setTrackCustomData: setTrackCustomDataMutation.mutateAsync,
    isDeletingCustomFileData: deleteCustomFileDataMutation.isPending,
    isSettingAlbumData: setAlbumCustomDataMutation.isPending,
    isSettingArtistName: setArtistNameMutation.isPending,
    isSettingComposerName: setComposerNameMutation.isPending,
    isSettingCustomFileData: setCustomDataMutation.isPending,
    isSettingGenreName: setGenreNameMutation.isPending,
    isSettingTrackData: setTrackCustomDataMutation.isPending,
  };
}

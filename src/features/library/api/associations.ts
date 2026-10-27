import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { paths } from '@/types/api-schema';

type Enableable<Query> = Query & { enabled: boolean };
type AlbumAssociationsQuery = Enableable<paths['/api/list-album-associations']['get']['parameters']['query']>;
type TrackAssociationsQuery = Enableable<paths['/api/list-track-associations']['get']['parameters']['query']>;
type AssociationQuery = Enableable<paths['/api/retrieve-association']['get']['parameters']['query']>;

export const associationKeys = {
  all: ['associations'] as const,
  albumList: (params: AlbumAssociationsQuery) => [...associationKeys.all, 'album-list', params] as const,
  trackList: (params: TrackAssociationsQuery) => [...associationKeys.all, 'track-list', params] as const,
  detail: (params: AssociationQuery) => [...associationKeys.all, 'detail', params] as const,
};

export const albumAssociationsQuery = (params: AlbumAssociationsQuery) =>
  queryOptions({
    enabled: params.enabled,
    queryKey: associationKeys.albumList(params),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-album-associations', {
        params: { query: params },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data?.associations) {
        throw new Error('No associations received');
      }
      return {
        associations: data.associations,
        total: data.total,
      };
    },
  });

export const trackAssociationsQuery = (params: TrackAssociationsQuery) =>
  queryOptions({
    enabled: params.enabled,
    queryKey: associationKeys.trackList(params),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-track-associations', {
        params: { query: params },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data?.associations) {
        throw new Error('No associations received');
      }
      return {
        associations: data.associations,
        total: data.total,
      };
    },
  });

export const associationQuery = (params: AssociationQuery) =>
  queryOptions({
    enabled: params.enabled,
    queryKey: associationKeys.detail(params),
    queryFn: async () => {
      const { data, error } = await api.get('/api/retrieve-association', {
        params: { query: params },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data?.association) {
        throw new Error('No association received');
      }
      return {
        association: data.association,
      };
    },
  });

export const useAlbumAssociations = (params: AlbumAssociationsQuery) => useQuery(albumAssociationsQuery(params));
export const useTrackAssociations = (params: TrackAssociationsQuery) => useQuery(trackAssociationsQuery(params));
export const useAssociation = (params: AssociationQuery) => useQuery(associationQuery(params));

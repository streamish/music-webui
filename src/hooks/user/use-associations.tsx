import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { paths } from 'src/types/api-schema';

export function useAlbumAssociations(
  query: paths['/api/user/list-album-associations']['get']['parameters']['query'] & { enabled: boolean },
) {
  return useQuery({
    enabled: query.enabled,
    queryKey: ['albums', query],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/list-album-associations', {
        params: { query },
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
}

export function useTrackAssociations(
  query: paths['/api/user/list-track-associations']['get']['parameters']['query'] & { enabled: boolean },
) {
  return useQuery({
    enabled: query.enabled,
    queryKey: ['tracks', query],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/list-track-associations', {
        params: { query },
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
}

export function useAssociation(
  query: paths['/api/user/retrieve-association']['get']['parameters']['query'] & { enabled: boolean },
) {
  return useQuery({
    enabled: query.enabled,
    queryKey: ['association', query],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/retrieve-association', {
        params: { query },
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
}

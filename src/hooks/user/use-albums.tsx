import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { paths } from 'src/types/api-schema';

export function useAlbums(params: paths['/api/user/list-albums']['get']['parameters']['query']) {
  return useQuery({
    queryKey: ['albums', params],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/list-albums', {
        params: { query: params },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No root paths returned');
      }
      return {
        albums: data.albums,
        total: data.total,
      };
    },
  });
}

export function useAlbum(id: number) {
  return useQuery({
    queryKey: ['album', id],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/retrieve-album', {
        params: { query: { id } },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No root paths returned');
      }
      return data.album;
    },
  });
}

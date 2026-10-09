import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { paths } from 'src/types/api-schema';

export function useTracks(query: paths['/api/user/list-tracks']['get']['parameters']['query']) {
  return useQuery({
    queryKey: ['tracks', query],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/list-tracks', {
        params: { query },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data?.tracks) {
        throw new Error('No tracks received');
      }
      return {
        tracks: data.tracks,
        total: data.total,
      };
    },
  });
}

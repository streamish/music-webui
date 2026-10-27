import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { paths } from '@/types/api-schema';

type ListTracksQuery = paths['/api/list-tracks']['get']['parameters']['query'];

export const trackKeys = {
  all: ['tracks'] as const,
  list: (params: ListTracksQuery) => [...trackKeys.all, 'list', params] as const,
};

export const tracksQuery = (params: ListTracksQuery) =>
  queryOptions({
    queryKey: trackKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-tracks', {
        params: { query: params },
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

export const useTracks = (params: ListTracksQuery) => useQuery(tracksQuery(params));

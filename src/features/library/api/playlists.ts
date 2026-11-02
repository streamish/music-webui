import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { paths } from '@/types/api-schema';

type ListPlaylistsQuery = paths['/api/list-playlists']['get']['parameters']['query'];

export const playlistKeys = {
  all: ['playlists'] as const,
  list: (params: ListPlaylistsQuery) => [...playlistKeys.all, 'list', params] as const,
  detail: (id: number) => [...playlistKeys.all, 'detail', id] as const,
};

export const playlistsQuery = (params: ListPlaylistsQuery) =>
  queryOptions({
    queryKey: playlistKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-playlists', {
        params: { query: params },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No playlists returned');
      }
      return {
        playlists: data.playlists,
        total: data.total,
      };
    },
  });

export const playlistItemsQuery = (id: number) =>
  queryOptions({
    queryKey: playlistKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-playlist-items', {
        params: { query: { id } },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No playlist returned');
      }
      return data.playlistItems;
    },
  });

export const usePlaylists = (params: ListPlaylistsQuery) => useQuery(playlistsQuery(params));
export const usePlaylist = (id: number, enabled = true) => useQuery({ ...playlistItemsQuery(id), enabled });

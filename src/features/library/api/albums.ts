import { AlbumSortFieldEnum, SortDirectionEnum } from '@/types/api-schema';
import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { paths } from '@/types/api-schema';

type ListAlbumsQuery = paths['/api/list-albums']['get']['parameters']['query'];

export const albumKeys = {
  all: ['albums'] as const,
  list: (params: ListAlbumsQuery) => [...albumKeys.all, 'list', params] as const,
  recentlyAdded: () => [...albumKeys.all, 'recently-added'] as const,
  detail: (id: number) => [...albumKeys.all, 'detail', id] as const,
};

export const albumsQuery = (params: ListAlbumsQuery) =>
  queryOptions({
    queryKey: albumKeys.list(params),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-albums', {
        params: { query: params },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No albums returned');
      }
      return {
        albums: data.albums,
        total: data.total,
      };
    },
  });

export const recentlyAddedAlbumsQuery = () =>
  queryOptions({
    queryKey: albumKeys.recentlyAdded(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-albums', {
        params: {
          query: {
            sortField: AlbumSortFieldEnum.date_added,
            sortOrder: SortDirectionEnum.desc,
            limit: 100,
          },
        },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No albums returned');
      }
      return {
        albums: data.albums,
        total: data.total,
      };
    },
  });

export const albumQuery = (id: number) =>
  queryOptions({
    queryKey: albumKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await api.get('/api/retrieve-album', {
        params: { query: { id } },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No album returned');
      }
      return data.album;
    },
  });

export const useAlbums = (params: ListAlbumsQuery) => useQuery(albumsQuery(params));
export const useRecentlyAddedAlbums = () => useQuery(recentlyAddedAlbumsQuery());
export const useAlbum = (id: number) => useQuery(albumQuery(id));

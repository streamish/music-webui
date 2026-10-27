import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const folderKeys = {
  all: ['folders'] as const,
  contents: (path: string) => [...folderKeys.all, 'contents', path] as const,
};

export const folderContentsQuery = (path: string) =>
  queryOptions({
    queryKey: folderKeys.contents(path),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-folder-contents', {
        params: {
          query: {
            path,
          },
        },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data?.folder?.children?.length) {
        throw new Error('No folders received');
      }
      return data.folder.children;
    },
  });

export const useFolders = (path: string) => useQuery(folderContentsQuery(path));

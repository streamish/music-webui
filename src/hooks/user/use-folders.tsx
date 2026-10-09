import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/folder-structure');
      if (error) {
        throw new Error(error.error);
      }
      if (!data?.items?.length) {
        throw new Error('No folders received');
      }
      return data.items;
    },
  });
}

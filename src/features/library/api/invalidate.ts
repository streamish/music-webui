import { albumKeys } from './albums';
import { associationKeys } from './associations';
import { folderKeys } from './folders';
import { shoutcastKeys } from './shoutcast';
import { trackKeys } from './tracks';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const libraryKeys = [albumKeys.all, trackKeys.all, associationKeys.all, folderKeys.all, shoutcastKeys.all];

// Library metadata is denormalized across lists, so a successful edit invalidates every library query.
export function useInvalidateLibrary() {
  const queryClient = useQueryClient();
  return useCallback(
    () => Promise.all(libraryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
    [queryClient],
  );
}

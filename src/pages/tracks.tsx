import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { TrackListItem } from '@/features/library/track-list-item';
import { TrackTable } from '@/features/library/track-table';
import { useCallback, useState } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { usePreferences } from '@/hooks/use-preferences';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import api from '@/lib/api';
import type { paths } from '@/types/api-schema';

function useTracks(query: paths['/api/user/list-tracks']['get']['parameters']['query']) {
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

export default function TracksPage() {
  const { isMobile } = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const [query, setQuery] = useState({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  });
  const { data: { tracks = [], total: totalTracks } = {}, refetch: refetchTracks } = useTracks(query);

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('page', String(nextPage));
        return next;
      });
      setQuery(() => {
        return {
          limit: pageSize,
          offset: (nextPage - 1) * pageSize,
        };
      });
    },
    [setSearchParams, pageSize],
  );

  return (
    <>
      <title>Tracks</title>
      {totalTracks == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <>
          <PageHeader>
            <PaginationControls page={pageNumber} setPage={setPage} items={totalTracks} />
          </PageHeader>
          <div className="overflow-y-auto h-[calc(100vh-9rem)]">
            {isMobile && (
              <ul className="flex grow flex-col">
                {tracks.map((item) => (
                  <li className="w-full p-2" key={item.filePath}>
                    <TrackListItem track={item} albumTitle={item.albumTitle} onEdit={refetchTracks} />
                  </li>
                ))}
              </ul>
            )}
            {!isMobile && (
              <div className="p-4">
                <div className="flex flex-row max-w-full">
                  <TrackTable tracks={tracks} onEdit={refetchTracks} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

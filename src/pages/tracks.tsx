import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { TrackListItem } from '@/features/library/track-list-item';
import { TrackTable } from '@/features/library/track-table';
import { useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { usePreferences } from '@/hooks/use-preferences';
import { useSearchParams } from 'react-router';
import { useTracks } from '@/features/library/api/tracks';

export default function TracksPage() {
  const { isMobile } = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const query = {
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  };
  const tracksQuery = useTracks(query);

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('page', String(nextPage));
        return next;
      });
    },
    [setSearchParams],
  );

  return (
    <>
      <title>Tracks</title>
      {tracksQuery.isPending && (
        <p className="text-white-500" role="status">
          Loading…
        </p>
      )}
      {tracksQuery.isError && (
        <p className="text-destructive" role="alert">
          Unable to load tracks: {tracksQuery.error.message}
        </p>
      )}
      {tracksQuery.isSuccess && (
        <>
          <PageHeader>
            <PaginationControls page={pageNumber} setPage={setPage} items={tracksQuery.data.total} />
          </PageHeader>
          <div className="overflow-y-auto h-[calc(100vh-9rem)]">
            {isMobile && (
              <ul className="flex grow flex-col">
                {tracksQuery.data.tracks.map((item) => (
                  <li className="w-full p-2" key={item.filePath}>
                    <TrackListItem track={item} albumTitle={item.albumTitle} />
                  </li>
                ))}
              </ul>
            )}
            {!isMobile && (
              <div className="p-4">
                <div className="flex flex-row max-w-full">
                  <TrackTable tracks={tracksQuery.data.tracks} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

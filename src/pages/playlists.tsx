import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fragment, useState } from 'react';
import { PlaylistAddForm } from '@/features/library/playlist-add-form';
import { PlaylistCard } from '@/features/library/playlist-card';
import { PlaylistDeleteForm } from '@/features/library/playlist-delete-form';
import { PlaylistItemsForm } from '@/features/library/playlist-items-form';
import { PlaylistListItem } from '@/features/library/playlist-list-item';
import { PlaylistUpdateForm } from '@/features/library/playlist-update-form';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { usePlaylists } from '@/features/library/api/playlists';

export default function PlaylistsPage() {
  const { isMobile } = useIsMobile();
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<number | null>(null);
  const playlistQuery = usePlaylists({});

  const togglePlaylist = (id: number) => {
    setExpandedPlaylistId((currentId) => (id === currentId ? null : id));
  };
  return (
    <div className="relative">
      <title>Playlists</title>
      <div className="p-4">
        <PlaylistAddForm />
      </div>
      {playlistQuery.isPending && (
        <p className="text-white-500" role="status">
          Loading…
        </p>
      )}
      {playlistQuery.isError && (
        <p className="text-destructive p-4" role="alert">
          Unable to load playlists: {playlistQuery.error.message}
        </p>
      )}
      {playlistQuery.isSuccess && playlistQuery.data.playlists.length === 0 && (
        <p className="text-muted-foreground p-4">You have not added any playlists yet.</p>
      )}
      {playlistQuery.isSuccess && playlistQuery.data.playlists.length > 0 && (
        <>
          {isMobile && (
            <ul className="flex flex-col grow overflow-y-scroll h-[calc(100vh-4rem)] md:h-[calc(100vh-9rem)]">
              {expandedPlaylistId !== null && (
                <li className="album-details col-span-full flex flex-col grow">
                  <Button
                    type="button"
                    variant="ghost"
                    className="mb-3 w-fit"
                    onClick={() => setExpandedPlaylistId(null)}
                  >
                    <ArrowLeft /> Back to playlists
                  </Button>
                  {playlistQuery.data.playlists
                    .filter((playlist) => playlist.id === expandedPlaylistId)
                    .map((playlist) => (
                      <div key={playlist.id} className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <PlaylistUpdateForm playlist={playlist} />
                          <PlaylistDeleteForm playlist={playlist} />
                        </div>
                        <PlaylistItemsForm playlist={playlist} />
                      </div>
                    ))}
                </li>
              )}
              {expandedPlaylistId === null &&
                playlistQuery.data.playlists.map((playlist) => (
                  <li className="w-full p-2" key={playlist.id}>
                    <div className="flex flex-col gap-2">
                      <PlaylistListItem
                        playlist={playlist}
                        isExpanded={false}
                        onToggle={() => togglePlaylist(playlist.id)}
                      />
                      <PlaylistUpdateForm playlist={playlist} className="w-full" />
                      <PlaylistDeleteForm playlist={playlist} className="w-full" />
                    </div>
                  </li>
                ))}
            </ul>
          )}
          {!isMobile && (
            <>
              <PlaylistAddForm className="mb-4" />
              <ul
                className={[
                  'grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]',
                  'md:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]',
                  'lg:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] ',
                  'gap-4',
                  'overflow-y-scroll h-[calc(100vh-9rem)]',
                ].join(' ')}
              >
                {playlistQuery.data.playlists.map((playlist) => {
                  const isExpanded = expandedPlaylistId === playlist.id;
                  // const shouldInsertDetails =
                  //   expandedPlaylistId !== null &&
                  //   (detailsInsertIndex === index ||
                  //     (index === albums.length - 1 && detailsInsertIndex === albums.length));

                  return (
                    <Fragment key={playlist.id}>
                      <li className="w-full h-full inline-flex align-middle justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <PlaylistCard
                            playlist={playlist}
                            isExpanded={isExpanded}
                            onToggle={() => togglePlaylist(playlist.id)}
                          />
                          <PlaylistUpdateForm playlist={playlist} />
                          <PlaylistDeleteForm playlist={playlist} />
                        </div>
                      </li>
                      {isExpanded && (
                        <li className="col-span-full w-full rounded-lg border p-4">
                          <PlaylistItemsForm playlist={playlist} />
                        </li>
                      )}
                    </Fragment>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

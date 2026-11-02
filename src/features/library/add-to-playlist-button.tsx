import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ListPlus, Plus, Trash2 } from 'lucide-react';
import { PlaylistTypeEnum, type components } from '@/types/api-schema';
import {
  playlistItemsQuery,
  playlistKeys,
  playlistsQuery as playlistsQueryOptions,
} from '@/features/library/api/playlists';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

type Track = components['schemas']['LibraryTrackDto'];
type Album = components['schemas']['LibraryAlbumWithTracksDto'];
type Association = components['schemas']['AssociationWithCreditsDto'];

type Target = {
  name: string;
  trackIds: number[];
};

function getTarget({ track, album, association }: { track?: Track; album?: Album; association?: Association }): Target {
  if (track) {
    return { name: track.title, trackIds: [track.id] };
  }
  if (album) {
    return { name: album.title, trackIds: [...new Set(album.tracks.map(({ id }) => id))] };
  }
  if (association) {
    const credits = [
      ...association.albumArtistCredits,
      ...association.artistCredits,
      ...association.composerCredits,
      ...association.genreCredits,
    ];
    return {
      name: association.name,
      trackIds: [...new Set(credits.flatMap(({ tracks }) => tracks.map(({ id }) => id)))],
    };
  }
  throw new Error('Add to playlist button rendered without a track, album, or association');
}

function getPlaylistItemIds(items: components['schemas']['PlaylistItemDto'][], trackIds: Set<number>) {
  return items.flatMap((item) => (item.id !== undefined && item.track && trackIds.has(item.track.id) ? [item.id] : []));
}

function getErrorMessage(error: { error: string; message: string[] }) {
  return new Error(`${error.error}: ${error.message.join(', ')}`);
}

export function AddToPlaylistButton({
  track,
  album,
  association,
  className,
}: {
  track?: Track;
  album?: Album;
  association?: Association;
  className?: string;
}) {
  const target = useMemo(() => getTarget({ track, album, association }), [track, album, association]);
  const trackIds = useMemo(() => new Set(target.trackIds), [target.trackIds]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busyPlaylistId, setBusyPlaylistId] = useState<number | null>(null);
  const playlistsQuery = useQuery({ ...playlistsQueryOptions({}), enabled: open });
  const normalPlaylists = (playlistsQuery.data?.playlists ?? []).filter(
    (playlist) => playlist.type === PlaylistTypeEnum.normal,
  );
  const playlistItemQueries = useQueries({
    queries: normalPlaylists.map((playlist) => ({
      ...playlistItemsQuery(playlist.id),
      enabled: open,
    })),
  });

  const updatePlaylistItems = async (playlistId: number, itemIds: number[], action: 'add' | 'remove') => {
    if (!itemIds.length) {
      return;
    }

    setBusyPlaylistId(playlistId);
    try {
      for (let offset = 0; offset < itemIds.length; offset += 1000) {
        const batch = itemIds.slice(offset, offset + 1000);
        // Sequential batches preserve playlist append order and avoid concurrent position updates.
        let result;
        if (action === 'add') {
          // eslint-disable-next-line no-await-in-loop
          result = await api.post('/api/add-playlist-items', {
            params: { query: { id: playlistId } },
            body: { items: batch.map((trackId) => ({ trackId })) },
          });
        } else {
          // eslint-disable-next-line no-await-in-loop
          result = await api.delete('/api/remove-playlist-items', {
            params: { query: { id: playlistId } },
            body: { playlistItemIds: batch },
          });
        }
        if (result.error) {
          throw getErrorMessage(result.error);
        }
        if (!result.data?.success) {
          throw new Error(`The API did not confirm the playlist ${action} operation`);
        }
      }

      toast.success(action === 'add' ? 'Added to playlist.' : 'Removed from playlist.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Unexpected error occurred while ${action === 'add' ? 'adding to' : 'removing from'} playlist:`,
        error,
      );
      toast.error(`Unable to ${action === 'add' ? 'add to' : 'remove from'} playlist. Please try again.`);
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: playlistKeys.list({}) }),
        queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) }),
      ]);
      setBusyPlaylistId(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        className={[
          'px-2 mb-4 py-1 rounded text-xs uppercase text-foreground/50 hover:text-foreground/80',
          className ?? '',
        ].join(' ')}
        onClick={() => setOpen(true)}
        variant="ghost"
        aria-label={`Add ${target.name} to a playlist`}
        title="Add to playlist"
      >
        <ListPlus className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Playlists for {target.name}</DialogTitle>
            <DialogDescription>
              Add {target.trackIds.length === 1 ? 'this track' : `these ${target.trackIds.length} tracks`} to a normal
              playlist, or remove them from playlists that already contain them.
            </DialogDescription>
          </DialogHeader>
          {playlistsQuery.isPending && (
            <p role="status" className="text-muted-foreground">
              Loading playlists…
            </p>
          )}
          {playlistsQuery.isError && (
            <p role="alert" className="text-destructive">
              Unable to load playlists: {playlistsQuery.error.message}
            </p>
          )}
          {playlistsQuery.isSuccess && normalPlaylists.length === 0 && (
            <p className="text-muted-foreground">You do not have any normal playlists yet.</p>
          )}
          {playlistsQuery.isSuccess && target.trackIds.length === 0 && (
            <p className="text-muted-foreground">There are no library tracks to add from this item.</p>
          )}
          {normalPlaylists.length > 0 && target.trackIds.length > 0 && (
            <ul className="space-y-2">
              {normalPlaylists.map((playlist, index) => {
                const itemsQuery = playlistItemQueries[index];
                const items = itemsQuery?.data ?? [];
                const matchedItems = items.filter((item) => item.track && trackIds.has(item.track.id));
                const playlistItemIds = getPlaylistItemIds(items, trackIds);
                const presentTrackIds = new Set(matchedItems.flatMap((item) => (item.track ? [item.track.id] : [])));
                const missingTrackIds = target.trackIds.filter((id) => !presentTrackIds.has(id));
                const isBusy = busyPlaylistId !== null;
                const isLoading = !itemsQuery || itemsQuery.isPending;
                const hasError = itemsQuery?.isError ?? false;

                return (
                  <li
                    key={playlist.id}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{playlist.name}</p>
                      {isLoading && <p className="text-xs text-muted-foreground">Checking playlist…</p>}
                      {hasError && (
                        <div>
                          <p role="alert" className="text-xs text-destructive">
                            Unable to check playlist contents.
                          </p>
                          <Button type="button" size="sm" variant="link" onClick={() => itemsQuery?.refetch()}>
                            Retry
                          </Button>
                        </div>
                      )}
                      {!isLoading && !hasError && playlistItemIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {presentTrackIds.size} of {target.trackIds.length} tracks already added
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {missingTrackIds.length > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isLoading || hasError || isBusy || target.trackIds.length === 0}
                          onClick={() => updatePlaylistItems(playlist.id, missingTrackIds, 'add')}
                        >
                          <Plus />
                          {playlistItemIds.length > 0 ? 'Add remaining' : 'Add'}
                        </Button>
                      )}
                      {playlistItemIds.length > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={isLoading || hasError || isBusy}
                          onClick={() => updatePlaylistItems(playlist.id, playlistItemIds, 'remove')}
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

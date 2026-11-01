import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, GripVertical, LoaderCircle, Trash2 } from 'lucide-react';
import { PlaylistTypeEnum, type components } from '@/types/api-schema';
import { playlistKeys, usePlaylist } from '@/features/library/api/playlists';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';

type Playlist = components['schemas']['PlaylistDto'];

export function PlaylistItemsForm({ playlist }: { playlist: Playlist }) {
  const queryClient = useQueryClient();
  const {
    data: items,
    error,
    isError,
    isPending,
    refetch,
  } = usePlaylist(playlist.id, playlist.type === PlaylistTypeEnum.normal);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

  if (playlist.type !== PlaylistTypeEnum.normal) {
    return null;
  }

  const refreshItems = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlist.id) }),
      queryClient.invalidateQueries({ queryKey: playlistKeys.list({}) }),
    ]);
  };

  const moveItem = async (itemId: number, offset: number) => {
    if (busyItemId !== null) {
      return;
    }

    setBusyItemId(itemId);
    try {
      const { data, error: apiError } = await api.patch('/api/move-playlist-item', {
        params: { query: { id: playlist.id } },
        body: { playlistItemId: itemId, offset },
      });
      if (apiError) {
        throw new Error(`${apiError.error}: ${apiError.message.join(', ')}`);
      }
      if (!data?.success) {
        throw new Error('The API did not confirm the playlist item move');
      }
      toast.success('Playlist order updated.');
      await refreshItems();
    } catch (moveError) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while moving playlist item:', moveError);
      toast.error('Unable to move playlist item. Please try again.');
    } finally {
      setBusyItemId(null);
      setDraggedItemId(null);
    }
  };

  const removeItem = async (itemId: number) => {
    if (busyItemId !== null) {
      return;
    }

    setBusyItemId(itemId);
    try {
      const { data, error: apiError } = await api.delete('/api/remove-playlist-items', {
        params: { query: { id: playlist.id } },
        body: { playlistItemIds: [itemId] },
      });
      if (apiError) {
        throw new Error(`${apiError.error}: ${apiError.message.join(', ')}`);
      }
      if (!data?.success) {
        throw new Error('The API did not confirm the playlist item removal');
      }
      toast.success('Removed item from playlist.');
      await refreshItems();
    } catch (removeError) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while removing playlist item:', removeError);
      toast.error('Unable to remove playlist item. Please try again.');
    } finally {
      setBusyItemId(null);
    }
  };

  const handleDrop = async (targetOffset: number) => {
    if (draggedItemId === null || !items) {
      return;
    }
    const sourceIndex = items.findIndex((item) => item.id === draggedItemId);
    if (sourceIndex < 0 || sourceIndex === targetOffset) {
      setDraggedItemId(null);
      return;
    }
    await moveItem(draggedItemId, targetOffset);
  };

  return (
    <section className="space-y-3" aria-labelledby={`playlist-items-${playlist.id}`}>
      <h2 id={`playlist-items-${playlist.id}`} className="text-lg font-semibold">
        {playlist.name} items
      </h2>
      {isPending && (
        <p role="status" className="flex items-center gap-2 text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading playlist items…
        </p>
      )}
      {isError && (
        <div role="alert" className="space-y-2 text-destructive">
          <p>Unable to load playlist items: {error.message}</p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}
      {items && items.length === 0 && <p className="text-muted-foreground">This playlist is empty.</p>}
      {items && items.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th scope="col" className="w-10 p-2">
                  <span className="sr-only">Reorder</span>
                </th>
                <th scope="col" className="w-12 p-2">
                  #
                </th>
                <th scope="col" className="p-2">
                  Track
                </th>
                <th scope="col" className="p-2">
                  Album
                </th>
                <th scope="col" className="w-32 p-2 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const title = item.track?.title ?? item.radioStationTitle ?? 'Unknown playlist item';
                const itemId = item.id;
                const busy = itemId !== undefined && busyItemId === itemId;

                return (
                  <tr
                    key={itemId ?? `playlist-position-${item.position}`}
                    draggable={itemId !== undefined && busyItemId === null}
                    onDragStart={(event) => {
                      if (itemId === undefined) {
                        event.preventDefault();
                        return;
                      }
                      event.dataTransfer.setData('text/plain', String(itemId));
                      setDraggedItemId(itemId);
                    }}
                    onDragOver={(event) => {
                      if (draggedItemId !== null) {
                        event.preventDefault();
                      }
                    }}
                    onDrop={async (event) => {
                      event.preventDefault();
                      await handleDrop(index);
                    }}
                    onDragEnd={() => setDraggedItemId(null)}
                    className={[
                      'border-b last:border-b-0 hover:bg-muted/30',
                      draggedItemId === itemId ? 'opacity-50' : '',
                    ].join(' ')}
                  >
                    <td className="p-1">
                      <span className="flex justify-center text-muted-foreground" aria-label="Drag to reorder">
                        <GripVertical className="size-4" />
                      </span>
                    </td>
                    <td className="p-2 text-muted-foreground">{index + 1}</td>
                    <td className="p-2">
                      {item.track ? (
                        <>
                          <span className="font-medium">{item.track.title}</span>
                          <span className="ml-2 text-muted-foreground">
                            {item.track.artists.map((artist) => artist.name).join(', ')}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium">{title}</span>
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {item.track?.albumTitle ?? item.radioStationUrl ?? '—'}
                    </td>
                    <td className="p-1">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Move ${title} up`}
                          disabled={index === 0 || itemId === undefined || busyItemId !== null}
                          onClick={async () => {
                            if (itemId !== undefined) {
                              await moveItem(itemId, index - 1);
                            }
                          }}
                        >
                          <ChevronUp />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Move ${title} down`}
                          disabled={index === items.length - 1 || itemId === undefined || busyItemId !== null}
                          onClick={async () => {
                            if (itemId !== undefined) {
                              await moveItem(itemId, index + 1);
                            }
                          }}
                        >
                          <ChevronDown />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          aria-label={`Remove ${title} from playlist`}
                          disabled={itemId === undefined || busyItemId !== null}
                          onClick={async () => {
                            if (itemId !== undefined) {
                              await removeItem(itemId);
                            }
                          }}
                        >
                          {busy ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

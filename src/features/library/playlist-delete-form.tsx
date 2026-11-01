import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlaylistTypeEnum, type components } from '@/types/api-schema';
import { Trash2 } from 'lucide-react';
import { playlistKeys } from '@/features/library/api/playlists';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';

type Playlist = components['schemas']['PlaylistDto'];

export function PlaylistDeleteForm({ playlist, className }: { playlist: Playlist; className?: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!deleting) {
      setOpen(nextOpen);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data, error } = await api.delete('/api/delete-playlist', {
        params: { query: { id: playlist.id } },
      });
      if (data?.success) {
        toast.success('Playlist deleted successfully.');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: playlistKeys.all }),
          queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlist.id) }),
        ]);
        setOpen(false);
        return;
      }
      if (!error) {
        toast.error('Failed to delete playlist. Please try again.');
        return;
      }

      let hasUnexpectedError = false;
      error.message.forEach((errorCode) => {
        const code: string = errorCode;
        switch (code) {
          case 'invalid-playlist-id-error':
            toast.error('This playlist has an invalid ID. Refresh the page and try again.');
            break;
          case 'playlist-not-found-error':
            toast.error('This playlist could not be found. Refresh the page and try again.');
            break;
          default:
            hasUnexpectedError = true;
            break;
        }
      });
      if (hasUnexpectedError || error.message.length === 0) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while deleting playlist:', error.error);
        toast.error('An internal server error occurred. Please try again later.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while deleting playlist:', error);
      toast.error('An internal server error occurred. Please try again later.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        variant="destructive"
        aria-label={`Delete ${playlist.name}`}
      >
        <Trash2 /> Delete
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete playlist</DialogTitle>
            <DialogDescription>
              Delete “{playlist.name}”? This will remove the playlist and its{' '}
              {playlist.type === PlaylistTypeEnum.smart ? 'rules' : 'items'}, but will not delete tracks from your
              library. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete playlist'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

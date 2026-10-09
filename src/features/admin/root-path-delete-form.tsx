import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '@/lib/api';

type RootPathDto = {
  id: number;
  rootPath: string;
};

export function RootPathDeleteForm({ rootPath }: { rootPath: RootPathDto }) {
  const [open, setOpen] = useState(false);
  const { handleSubmit } = useForm();

  const onSubmit = handleSubmit(async () => {
    try {
      const result = await api.delete('/api/admin/delete-root-path', {
        params: {
          query: {
            id: rootPath.id,
          },
        },
      });
      if (result.data?.success) {
        toast.success('Root path deleted successfully.');
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case 'root-path-not-found-error':
              toast.error('The specified root path ID is invalid.');
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while deleting root path:', error);
              toast.error('An internal server error occurred. Please try again later.');
              break;
          }
        }
      } else {
        toast.error('Failed to delete root path');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while deleting root path:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button className="px-2 py-1 rounded mr-4 text-xs uppercase" onClick={() => setOpen(true)} variant="destructive">
        Delete path
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Delete root path</DialogTitle>
            <DialogDescription>
              Deleting the path will not delete the files from your disk, but it will remove all references to the files
              in the database. These files can be reindexed any time by adding the path again, but custom metadata will
              be permanently lost by this action.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Delete root path
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

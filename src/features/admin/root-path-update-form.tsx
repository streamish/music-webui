import { AdminUpdateRootPathBadRequestErrors, AdminUpdateRootPathNotFoundErrors, type paths } from '@/types/api-schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormValidationError } from '@/components/form-validation-error';
import { IndexerToggle } from './indexer-toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useRootPaths } from '@/hooks/admin/use-root-paths';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RootPathDto } from '@/hooks/user/use-root-paths';

type UpdateEndpoint = paths['/api/admin/update-root-path']['patch'];
type FormData = UpdateEndpoint['requestBody']['content']['application/json'];

const schema = z.object({
  newPath: z
    .string()
    .refine((value) => value.length > 0, {
      message: 'Root path is required',
    })
    .refine((value) => value.length >= 1, {
      message: 'Root path is too short',
    })
    .refine((value) => value.length <= 1024, {
      message: 'Root path is too long',
    }),
});

export function RootPathUpdateForm({ rootPath }: { rootPath: RootPathDto }) {
  const [open, setOpen] = useState(false);
  const { updateRootPath } = useRootPaths();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    await updateRootPath(
      {
        query: {
          id: rootPath.id,
        },
        body: formData,
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success('Root path updated successfully.  It will begin indexing shortly if the indexer is enabled.');
        },
        onError: (error) => {
          for (let i = 0; i < error.messages.length; i += 1) {
            const message = error.messages[i];
            switch (message) {
              case AdminUpdateRootPathNotFoundErrors.root_path_not_found_error:
                setError('newPath', { type: 'manual', message: 'The new root path does not exist.' });
                break;
              case AdminUpdateRootPathBadRequestErrors.duplicate_root_path_error:
                setError('newPath', {
                  type: 'manual',
                  message: 'The new root path has already been added to this account.',
                });
                break;
              default:
                // eslint-disable-next-line no-console
                console.error('Unexpected error occurred while updating root path:', error);
                toast.error('An internal server error occurred. Please try again later.');
                break;
            }
          }
        },
      },
    );
  });

  return (
    <>
      <Button className="px-2 py-1 rounded mr-4 text-xs uppercase" onClick={() => setOpen(true)} variant="outline">
        Change path
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Update root path</DialogTitle>
            <div className="space-y-4">
              <DialogDescription>
                When the path changes the indexer will automatically purge old file references from the database because
                the files no longer exist, then it will find them in their new location and add them to the database.
              </DialogDescription>
              <p className="block mb-4 text-muted-foreground">
                If you wish to preserve custom metadata or avoid fully scanning the path again:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground">
                <li className="mb-2">Disable the indexer</li>
                <li className="mb-2">Make the changes to your filesystem or docker volume mapping</li>
                <li className="mb-2">Save the new root path below</li>
                <li>Re-enable indexer</li>
              </ol>
            </div>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <IndexerToggle />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPath">New path</Label>
              <Input id="newPath" {...register('newPath', { required: true })} placeholder="Enter new path" />
              <FormValidationError text={errors.newPath?.message} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save new path</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

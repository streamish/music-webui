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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';

const schema = z.object({
  rootPath: z
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

type FormData = z.infer<typeof schema>;

export function RootPathAddForm({ onSave }: { onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.post('/api/user/create-root-path', {
        body: {
          rootPath: formData.rootPath,
        },
      });
      if (result.data?.success) {
        toast.success('Root path added successfully. It will begin indexing shortly if the indexer is enabled.');
        onSave();
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case 'root-path-does-not-exist-error':
              setError('rootPath', { type: 'manual', message: 'The specified root path does not exist.' });
              break;
            case 'duplicate-root-path-error':
              setError('rootPath', {
                type: 'manual',
                message: 'The specified root path has already been added to this account.',
              });
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while adding root path:', error);
              toast.error('An internal server error occurred. Please try again later.');
              break;
          }
        }
      } else {
        setError('rootPath', {
          type: 'server',
          message: 'Failed to add root path',
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while adding root path:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button className="px-2 mb-4 py-1 rounded text-xs uppercase" onClick={() => setOpen(true)} variant="outline">
        <Plus /> Add root path
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Add root path</DialogTitle>
            <DialogDescription>
              <span className="block mb-4">
                Add a path containing some or all of your music library. The indexer will scan this path for music files
                and add them to your library. You can have multiple paths.
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rootPath">New path</Label>
              <Input id="rootPath" {...register('rootPath', { required: true })} placeholder="Enter new path" />
              <FormValidationError text={errors.rootPath?.message} />
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

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormValidationError } from '@/components/form-validation-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';
import type { components } from '@/types/api-schema';

const schema = z.object({
  name: z
    .string()
    .refine((value) => value.length > 0, {
      message: 'Name is required',
    })
    .refine((value) => value.length >= 1, {
      message: 'Name is too short',
    })
    .refine((value) => value.length <= 1024, {
      message: 'Name is too long',
    }),
});

type FormData = z.infer<typeof schema>;
type Genre = components['schemas']['ShoutcastGenreDto'];

export function ShoutcastGenreEditForm({ genre, onSave }: { genre: Genre; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    reset({
      name: genre.name,
    });
  }, [genre, reset]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.patch('/api/update-shoutcast-genre', {
        params: {
          query: {
            id: genre.id,
          },
        },
        body: {
          name: formData.name,
        },
      });
      if (result.data?.success) {
        toast.success('Genre updated successfully.');
        setOpen(false);
        onSave();
        return;
      }
      if (result.error) {
        const { error } = result.error;
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while updating the genre:', error);
        toast.error('An internal server error occurred. Please try again later.');
      } else {
        toast.error('Failed to update genre');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while updating the genre:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button
        className="px-2 py-1 m-0 rounded text-xs uppercase text-foreground/50 hover:text-foreground/80"
        onClick={() => setOpen(true)}
        variant="ghost"
        aria-label="Edit genre"
        title="Edit genre"
      >
        <SquarePen />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[calc(100%-11rem)] flex-col gap-0 overflow-hidden p-4 sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Genre</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name', { required: true })} placeholder="Rock" />
                <FormValidationError text={errors.name?.message} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

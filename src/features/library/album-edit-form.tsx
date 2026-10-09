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
  title: z
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
  artists: z
    .string()
    .refine((value) => value.length > 0, {
      message: 'At least one artist is required',
    })
    .refine((value) => value.length >= 1, {
      message: 'Artist is too short',
    })
    .refine((value) => value.length <= 1024, {
      message: 'Artist is too long',
    }),
  year: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;
type Album = components['schemas']['LibraryAlbumDto'];

export function AlbumEditForm({ album, onSave, className }: { album: Album; onSave: () => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      artists: '',
      year: 1999,
    },
  });

  useEffect(() => {
    reset({
      title: album.title,
      artists: album.artists.map((artist) => artist.name).join(', '),
      year: album.year,
    });
  }, [album, reset]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.patch('/api/user/set-album-custom-data', {
        params: {
          query: {
            id: album.id,
          },
        },
        body: {
          title: formData.title,
          artists: formData.artists,
          year: formData.year || 0,
        },
      });
      if (result.data?.success) {
        toast.success('Album updated successfully.');
        setOpen(false);
        onSave();
        return;
      }
      if (result.error) {
        const { error } = result.error;
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while updating the album:', error);
        toast.error('An internal server error occurred. Please try again later.');
      } else {
        toast.error('Failed to update album');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while updating the album:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });
  return (
    <>
      <Button
        className={[
          `px-2 mb-4 py-1 rounded text-xs uppercase text-foreground/50 hover:text-foreground/80 ${className || ''}`,
        ].join(' ')}
        onClick={() => setOpen(true)}
        variant="ghost"
        aria-label="Edit album"
        title="Edit album"
      >
        <SquarePen />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Title</Label>
              <Input id="title" {...register('title', { required: true })} placeholder="Album Title" />
              <FormValidationError text={errors.title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" {...register('year', { required: true })} placeholder="1999" />
              <FormValidationError text={errors.year?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artists">Artists (comma-delimited)</Label>
              <Input id="artists" {...register('artists', { required: true })} placeholder="Person 1, Person 2" />
              <FormValidationError text={errors.artists?.message} />
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

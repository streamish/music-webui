import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormValidationError } from '@/components/form-validation-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomData } from '@/hooks/user/use-custom-data';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod/v3';
import type { Track } from '@/hooks/user/use-tracks';

type FormData = {
  title: string;
  genres?: string;
  artists: string;
  comment?: string;
  composers?: string;
  trackNumber?: number;
  discNumber?: number;
  year?: number;
};

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
  genres: z.string().optional(),
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
  composers: z.string().optional(),
  trackNumber: z.coerce.number().optional(),
  discNumber: z.coerce.number().optional(),
  comment: z.string().optional(),
  year: z.coerce.number().optional(),
});

export function TrackEditForm({ track, onSave }: { track: Track; onSave: () => void }) {
  const { setTrackCustomData } = useCustomData();
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
      genres: '',
      artists: '',
      comment: '',
      composers: '',
      trackNumber: 0,
      discNumber: 0,
      year: 0,
    },
  });

  useEffect(() => {
    reset({
      title: track.title,
      genres: track.genres.map((genre) => genre.name).join(', '),
      artists: track.artists.map((artist) => artist.name).join(', '),
      composers: track.composers.map((composer) => composer.name).join(', '),
      comment: track.comment,
      trackNumber: track.trackNumber,
      discNumber: track.discNumber,
      year: track.year,
    });
  }, [track, reset]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    await setTrackCustomData(
      {
        query: { id: track.id },
        body: {
          artists: formData.artists,
          composers: formData.composers,
          comment: formData.comment,
          discNumber: formData.discNumber || 0,
          genres: formData.genres,
          title: formData.title,
          trackNumber: formData.trackNumber || 0,
          year: formData.year || 0,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success('Track updated successfully.');
          onSave();
        },
        onError: (error) => {
          for (let i = 0; i < error.messages.length; i += 1) {
            const message = error.messages[i];
            switch (message) {
              default:
                // eslint-disable-next-line no-console
                console.error('Unexpected error occurred while updating the track:', error);
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
      <Button
        className="px-2 mb-4 py-1 rounded text-xs uppercase text-foreground/50 hover:text-foreground/80"
        onClick={() => setOpen(true)}
        variant="ghost"
        aria-label="Edit track"
        title="Edit track"
      >
        <SquarePen />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[calc(100%-11rem)] flex-col gap-0 overflow-hidden p-4 sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="name">Title</Label>
                <Input id="title" {...register('title', { required: true })} placeholder="Person 1, Person 2" />
                <FormValidationError text={errors.title?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" {...register('year', { required: true })} placeholder="1999" />
                <FormValidationError text={errors.year?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackNumber">Track number</Label>
                <Input id="trackNumber" {...register('trackNumber', { required: true })} placeholder="1" />
                <FormValidationError text={errors.trackNumber?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discNumber">Disc number</Label>
                <Input id="discNumber" {...register('discNumber', { required: true })} placeholder="1" />
                <FormValidationError text={errors.discNumber?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genres">Genres (comma-delimited)</Label>
                <Input id="genres" {...register('genres', { required: true })} placeholder="Rock, Acoustic" />
                <FormValidationError text={errors.genres?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artists">Artists (comma-delimited)</Label>
                <Input id="artists" {...register('artists', { required: true })} placeholder="Person 1, Person 2" />
                <FormValidationError text={errors.artists?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="composers">Composers (comma-delimited)</Label>
                <Input id="composers" {...register('composers', { required: true })} placeholder="Person 1, Person 2" />
                <FormValidationError text={errors.composers?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Input id="comment" {...register('comment')} placeholder="Your comment here" />
                <FormValidationError text={errors.comment?.message} />
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

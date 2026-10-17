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
  url: z.string().url(),
});

type FormData = z.infer<typeof schema>;
type Station = components['schemas']['LibraryShoutcastStationDto'];

export function ShoutcastStationEditForm({ station, onSave }: { station: Station; onSave: () => void }) {
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
      url: '',
    },
  });

  useEffect(() => {
    reset({
      title: station.title,
      url: station.url,
    });
  }, [station, reset]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.patch('/api/update-shoutcast-station', {
        params: {
          query: {
            id: station.id,
          },
        },
        body: {
          title: formData.title,
          url: formData.url,
        },
      });
      if (result.data?.success) {
        toast.success('Station updated successfully.');
        setOpen(false);
        onSave();
        return;
      }
      if (result.error) {
        const { error } = result.error;
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while updating the station:', error);
        toast.error('An internal server error occurred. Please try again later.');
      } else {
        toast.error('Failed to update station');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while updating the station:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button
        className="px-2 mb-4 py-1 rounded text-xs uppercase text-foreground/50 hover:text-foreground/80"
        onClick={() => setOpen(true)}
        variant="ghost"
        aria-label="Edit station"
        title="Edit station"
      >
        <SquarePen />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[calc(100%-11rem)] flex-col gap-0 overflow-hidden p-4 sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Station</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title', { required: true })} placeholder="N-CT FM" />
                <FormValidationError text={errors.title?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" {...register('url', { required: true })} placeholder="http://example.com/stream" />
                <FormValidationError text={errors.url?.message} />
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

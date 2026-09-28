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
import { SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomFileData } from '@/hooks/user/use-custom-file-data';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod/v3';
import type { Association } from '@/hooks/user/use-associations';

type FormData = {
  name: string;
};

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

export function ComposerEditForm({ composer }: { composer: Association }) {
  const [open, setOpen] = useState(false);
  const { setComposerName } = useCustomFileData();
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
      name: composer.name,
    });
  }, [composer, reset]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    await setComposerName(
      {
        query: {
          id: composer.id,
        },
        body: {
          name: formData.name,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success('Composer updated successfully.');
        },
        onError: (error) => {
          for (let i = 0; i < error.messages.length; i += 1) {
            const message = error.messages[i];
            switch (message) {
              default:
                // eslint-disable-next-line no-console
                console.error('Unexpected error occurred while updating the composer:', error);
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
        aria-label="Edit composer"
        title="Edit composer"
      >
        <SquarePen />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Composer</DialogTitle>
            <DialogDescription>Use a comma-delimited string to edit into multiple composers.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input id="name" {...register('name', { required: true })} placeholder="Person 1, Person 2" />
              <FormValidationError text={errors.name?.message} />
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

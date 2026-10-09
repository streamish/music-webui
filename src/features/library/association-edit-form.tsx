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
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';
import type { AssociationTypeEnum, components } from '@/types/api-schema';

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
type Association = components['schemas']['LibraryAssociationDto'];

export function AssociationEditForm({
  association,
  associationType,
  onSave,
}: {
  association: Association;
  associationType: AssociationTypeEnum;
  onSave: () => void;
}) {
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
      name: association.name,
    });
  }, [association, reset]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.patch(`/api/user/set-${associationType}-name`, {
        params: {
          query: {
            id: association.id,
          },
        },
        body: {
          name: formData.name,
        },
      });
      if (result.data?.success) {
        toast.success('Association updated successfully.');
        setOpen(false);
        onSave();
        return;
      }
      if (result.error) {
        const { error } = result.error;
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while updating the association:', error);
        toast.error('An internal server error occurred. Please try again later.');
      } else {
        toast.error('Failed to update association');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while updating the association:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button
        className="px-2 mb-4 py-1 rounded text-xs uppercase text-foreground/50 hover:text-foreground/80"
        onClick={() => setOpen(true)}
        variant="ghost"
        aria-label="Edit association"
        title="Edit association"
      >
        <SquarePen />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Association</DialogTitle>
            <DialogDescription>Use a comma-delimited string to edit into multiple items.</DialogDescription>
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
              <Button type="submit">Save association</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

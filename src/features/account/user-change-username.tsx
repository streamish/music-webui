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
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';

const schema = z.object({
  newUsername: z
    .string()
    .refine((value) => value.length > 0, {
      message: 'Username is required',
    })
    .refine((value) => value.length >= 1, {
      message: 'Username is too short',
    })
    .refine((value) => value.length <= 255, {
      message: 'Username is too long',
    }),
  userPassword: z
    .string()
    .refine((value) => value.length > 0, {
      message: 'Current password is required',
    })
    .refine((value) => value.length >= 1, {
      message: 'Current password is too short',
    })
    .refine((value) => value.length <= 255, {
      message: 'Current password is too long',
    }),
});

type FormData = z.infer<typeof schema>;

export function UserChangeUsernameForm() {
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
      const result = await api.post('/api/update-username', {
        body: {
          userPassword: formData.userPassword,
          newUsername: formData.newUsername,
        },
      });
      if (result.data?.success) {
        toast.success('Username updated successfully');
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case 'invalid-user-password-error':
              setError('userPassword', { type: 'manual', message: 'The specified current password is invalid.' });
              break;
            case 'invalid-user-password-length-error':
              setError('userPassword', { type: 'manual', message: 'The current password length is invalid.' });
              break;
            case 'invalid-username-error':
              setError('newUsername', { type: 'manual', message: 'The specified username is invalid.' });
              break;
            case 'invalid-username-length-error':
              setError('newUsername', { type: 'manual', message: 'The new username length is invalid.' });
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while changing username:', error);
              toast.error('An internal server error occurred. Please try again later.');
              break;
          }
        }
      } else {
        setError('root.server', {
          type: 'server',
          message: 'Failed to update username',
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while changing username:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button className="px-2 py-1 rounded mr-4 text-xs uppercase" onClick={() => setOpen(true)} variant="outline">
        Change username
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Change your username</DialogTitle>
            <DialogDescription>
              After changing your username you will need to use the new username to log in.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">New username</Label>
              <Input
                id="newUsername"
                type="text"
                {...register('newUsername', { required: true })}
                placeholder="Enter new username"
              />
              <FormValidationError text={errors.newUsername?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">Current password</Label>
              <Input
                id="userPassword"
                type="password"
                {...register('userPassword', { required: true })}
                placeholder="Enter current password"
              />
              <FormValidationError text={errors.userPassword?.message} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Set new username
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

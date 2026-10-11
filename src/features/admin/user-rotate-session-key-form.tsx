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

type AccountDto = {
  id: number;
};

const schema = z.object({
  adminPassword: z
    .string()
    .refine((value) => value.length > 0, {
      message: 'Administrator password is required',
    })
    .refine((value) => value.length >= 1, {
      message: 'Administrator password is too short',
    })
    .refine((value) => value.length <= 255, {
      message: 'Administrator password is too long',
    }),
});

type FormData = z.infer<typeof schema>;

export function UserRotateSessionKeyForm({ user, className }: { user: AccountDto; className?: string }) {
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
      const result = await api.post('/api/regenerate-user-session-key', {
        params: {
          query: {
            id: user.id,
          },
        },
        body: {
          adminPassword: formData.adminPassword,
        },
      });
      if (result.data?.success) {
        toast.success('User session key rotated successfully.');
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case 'account-not-found-error':
              toast.error('The specified account does not exist.');
              break;
            case 'invalid-admin-password-length-error':
              setError('adminPassword', { type: 'manual', message: 'The admin password length is invalid.' });
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while rotating user session key:', error);
              toast.error('An internal server error occurred. Please try again later.');
          }
        }
      } else {
        toast.error('Failed to rotate user session key');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while rotating user session key:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button
        className={`px-2 py-1 rounded mr-4 text-xs uppercase ${className ?? ''}`}
        onClick={() => setOpen(true)}
        variant="outline"
      >
        Terminate sessions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Terminate sessions</DialogTitle>
            <DialogDescription>
              Terminating sessions will invalidate all existing sessions for the user by generating a new secret session
              key. The user will need to log in again from any devices.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Administrator password</Label>
              <Input
                id="adminPassword"
                type="password"
                {...register('adminPassword', { required: true })}
                placeholder="Enter admin password"
              />
              <FormValidationError text={errors.adminPassword?.message} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                End sessions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

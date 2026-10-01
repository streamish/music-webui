import { type AccountDto, useAccounts } from '@/hooks/admin/use-accounts';
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
import z from 'zod/v3';
import type { paths } from '@/types/api-schema';

type ResetPasswordEndpoint = paths['/api/admin/reset-user-password']['post'];
type ResetPasswordBodyDto = ResetPasswordEndpoint['requestBody']['content']['application/json'];

type FormData = ResetPasswordBodyDto & {
  confirmPassword: string;
};

const schema = z
  .object({
    newPassword: z
      .string()
      .refine((value) => value.length > 0, {
        message: 'Password is required',
      })
      .refine((value) => value.length >= 1, {
        message: 'Password is too short',
      })
      .refine((value) => value.length <= 255, {
        message: 'Password is too long',
      }),
    confirmPassword: z
      .string()
      .refine((value) => value.length > 0, {
        message: 'Confirm password is required',
      })
      .refine((value) => value.length >= 1, {
        message: 'Confirm password is too short',
      })
      .refine((value) => value.length <= 255, {
        message: 'Confirm password is too long',
      }),
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
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
  });

export function UserResetPasswordForm({ user, className }: { user: AccountDto; className?: string }) {
  const [open, setOpen] = useState(false);
  const { resetPassword } = useAccounts();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    await resetPassword(
      {
        query: {
          id: user.id,
        },
        body: {
          adminPassword: formData.adminPassword,
          newPassword: formData.newPassword,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success('Password reset successfully. The user will need to log in again with the new password.');
        },
        onError: (error) => {
          for (let i = 0; i < error.messages.length; i += 1) {
            const message = error.messages[i];
            switch (message) {
              case 'account-not-found-error':
                toast.error('The specified account does not exist.');
                break;
              case 'invalid-new-password-error':
                setError('newPassword', { type: 'manual', message: 'The new account password is invalid.' });
                break;
              case 'invalid-new-password-length-error':
                setError('newPassword', { type: 'manual', message: 'The new account password length is invalid.' });
                break;
              case 'invalid-admin-password-error':
                setError('adminPassword', { type: 'manual', message: 'Invalid admin password.' });
                break;
              case 'invalid-admin-password-length-error':
                setError('adminPassword', { type: 'manual', message: 'The admin password length is invalid.' });
                break;
              default:
                // eslint-disable-next-line no-console
                console.error('Unexpected error occurred while resetting password:', error);
                toast.error('An internal server error occurred. Please try again later.');
                break;
            }
          }
        },
      },
    );
    setOpen(false);
  });

  return (
    <>
      <Button
        className={`px-2 py-1 rounded mr-4 text-xs uppercase ${className ?? ''}`}
        onClick={() => setOpen(true)}
        variant="outline"
      >
        Reset password
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Reset user password</DialogTitle>
            <DialogDescription>
              After resetting the password, the user will be required to log in again with the new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword', { required: true })}
                placeholder="Enter new password"
              />
              <FormValidationError text={errors.newPassword?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                {...register('confirmPassword', { required: true })}
                type="password"
                placeholder="Enter new password"
              />
              <FormValidationError text={errors.confirmPassword?.message} />
            </div>
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
              <Button type="submit" variant="destructive">
                Set new password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

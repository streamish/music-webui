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

type DeleteEndpoint = paths['/api/admin/delete-account']['patch'];
type DeleteAccountBodyDto = DeleteEndpoint['requestBody']['content']['application/json'];

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

export function UserDeleteForm({ user, className }: { user: AccountDto; className?: string }) {
  const [open, setOpen] = useState(false);
  const { deleteAccount } = useAccounts();
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<DeleteAccountBodyDto>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await deleteAccount(
      { query: { id: user.id }, body: { adminPassword: data.adminPassword } },
      {
        onSuccess: () => {
          setOpen(false);
        },
        onError: (error) => {
          for (let i = 0; i < error.messages.length; i += 1) {
            const message = error.messages[i];
            switch (message) {
              case 'account-not-found-error':
                toast.error('The specified account does not exist.');
                break;
              case 'invalid-account-id-error':
                toast.error('The specified account ID is invalid.');
                break;
              case 'account-only-admin-error':
                toast.error('You must create a new admin account before deleting this one.');
                break;
              case 'invalid-admin-password-error':
                setError('adminPassword', { type: 'manual', message: 'Invalid admin password.' });
                break;
              case 'invalid-admin-password-length-error':
                setError('adminPassword', { type: 'manual', message: 'Admin password length is invalid.' });
                break;
              default:
                // eslint-disable-next-line no-console
                console.error('Unexpected error occurred while deleting account:', error);
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
        className={`px-2 py-1 rounded mr-4 text-xs uppercase ${className ?? ''}`}
        onClick={() => setOpen(true)}
        variant="destructive"
      >
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              Deleting a user will erase the account and all associated data from the database. This will not delete any
              files from your disk.
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
              <Button type="submit" variant="destructive">
                Delete user
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

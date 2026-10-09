import {
  AdminUpdateUserRolesBadRequestErrors,
  AdminUpdateUserRolesNotFoundErrors,
  UserRoleEnum,
} from '@/types/api-schema';
import { Button } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';

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
  roles: z.array(z.nativeEnum(UserRoleEnum)).min(1, { message: 'At least one role must be selected.' }),
});

type FormData = z.infer<typeof schema>;
type AccountDto = {
  id: number;
  roles: UserRoleEnum[];
};

export function UserUpdateRolesForm({
  user,
  className,
  onSave,
}: {
  user: AccountDto;
  className?: string;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<FormData>({
    defaultValues: {
      roles: user.roles,
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.patch('/api/admin/update-user-roles', {
        params: {
          query: {
            id: user.id,
          },
        },
        body: {
          adminPassword: formData.adminPassword,
          roles: formData.roles,
        },
      });
      if (result.data?.success) {
        toast.success('User roles updated successfully.');
        onSave();
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case AdminUpdateUserRolesBadRequestErrors.account_only_admin_error:
              setError('roles', {
                type: 'manual',
                message: 'You must create another administrator before removing this permission.',
              });
              break;
            case AdminUpdateUserRolesNotFoundErrors.account_not_found_error:
              setError('roles', {
                type: 'manual',
                message: 'The specified account does not exist.',
              });
              break;
            case AdminUpdateUserRolesBadRequestErrors.invalid_user_role_error:
              setError('roles', {
                type: 'manual',
                message: 'An invalid role was specified.',
              });
              break;
            case AdminUpdateUserRolesBadRequestErrors.invalid_admin_password_error:
              setError('adminPassword', { type: 'manual', message: 'Invalid admin password.' });
              break;
            case AdminUpdateUserRolesBadRequestErrors.invalid_admin_password_length_error:
              setError('adminPassword', { type: 'manual', message: 'The admin password length is invalid.' });
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while updating roles:', error);
              toast.error('An internal server error occurred. Please try again later.');
              break;
          }
        }
      } else {
        setError('roles', {
          type: 'server',
          message: 'Failed to update user roles',
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while updating roles:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  const toggleRole = (currentRoles: UserRoleEnum[], role: UserRoleEnum) => {
    return currentRoles.includes(role) ? currentRoles.filter((r: UserRoleEnum) => r !== role) : [...currentRoles, role];
  };
  return (
    <>
      <Button
        className={`px-2 py-1 rounded mr-4 text-xs uppercase ${className ?? ''}`}
        onClick={() => setOpen(true)}
        variant="outline"
      >
        Update roles
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Update user roles</DialogTitle>
            <DialogDescription>Grant or revoke permissions for the user account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <Controller
              name="roles"
              control={control}
              render={({ field }) => (
                <>
                  <div className={`flex flex-row space-x-2`}>
                    <Switch
                      id="admin-role"
                      checked={field.value.includes(UserRoleEnum.admin)}
                      onCheckedChange={() => field.onChange(toggleRole(field.value, UserRoleEnum.admin))}
                    />
                    <Label htmlFor="admin-role">Administrator</Label>
                  </div>
                  <div className={`flex flex-row space-x-2`}>
                    <Switch
                      id="user-role"
                      checked={field.value.includes(UserRoleEnum.user)}
                      onCheckedChange={() => field.onChange(toggleRole(field.value, UserRoleEnum.user))}
                    />
                    <Label htmlFor="user-role">User</Label>
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
                  <FormValidationError text={errors.roles?.message} />
                </>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Save new roles
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

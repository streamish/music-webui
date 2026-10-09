import { Button } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormValidationError } from '@/components/form-validation-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { UserRoleEnum } from '@/types/api-schema';
import { toast } from 'sonner';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';

const schema = z
  .object({
    username: z
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
    password: z
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
    roles: z.array(z.nativeEnum(UserRoleEnum)).min(1, { message: 'At least one role must be selected.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  });

type FormData = z.infer<typeof schema>;

export function UserAddForm({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<FormData>({
    defaultValues: {
      roles: [],
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.post('/api/admin/create-account', {
        body: {
          adminPassword: formData.adminPassword,
          username: formData.username,
          password: formData.password,
          roles: formData.roles,
        },
      });
      if (result.data?.success) {
        toast.success('Root path updated successfully. It will begin indexing shortly if the indexer is enabled.');
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case 'invalid-username-not-unique-error':
              setError('username', { type: 'manual', message: 'User already exists.' });
              break;
            case 'invalid-role-error':
              setError('roles', { type: 'manual', message: 'Invalid role specified.' });
              break;
            case 'invalid-user-role-error':
              setError('roles', { type: 'manual', message: 'At least one role must be selected.' });
              break;
            case 'invalid-password-error':
              setError('password', { type: 'manual', message: 'Invalid user password specified.' });
              break;
            case 'invalid-password-length-error':
              setError('password', { type: 'manual', message: 'User password length is invalid.' });
              break;
            case 'invalid-admin-password-error':
              setError('adminPassword', { type: 'manual', message: 'Invalid admin password.' });
              break;
            case 'invalid-admin-password-length-error':
              setError('adminPassword', { type: 'manual', message: 'Admin password length is invalid.' });
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while creating account:', error);
              toast.error('An internal server error occurred. Please try again later.');
              break;
          }
        }
      } else {
        setError('username', {
          type: 'server',
          message: 'Failed to create user account',
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while creating user account:', error);
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
        <Plus /> Add account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Add user account</DialogTitle>
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
                  <FormValidationError text={errors.roles?.message} />
                </>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="password">Username</Label>
              <Input
                id="username"
                type="text"
                {...register('username', { required: true })}
                placeholder="Enter username"
              />
              <FormValidationError text={errors.username?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { required: true })}
                placeholder="Enter new password"
              />
              <FormValidationError text={errors.password?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { required: true })}
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
              <Button type="submit" variant="default">
                Create new account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

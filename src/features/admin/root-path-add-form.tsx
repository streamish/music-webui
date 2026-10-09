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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';

const schema = z.object({
  id: z.coerce.number().refine((value) => value > 0, {
    message: 'Account is required',
  }),
  rootPath: z
    .string()
    .refine((value) => value.length > 0, {
      message: 'Root path is required',
    })
    .refine((value) => value.length >= 1, {
      message: 'Root path is too short',
    })
    .refine((value) => value.length <= 1024, {
      message: 'Root path is too long',
    }),
});

type FormData = z.infer<typeof schema>;

function useListAccounts() {
  return useQuery({
    queryKey: ['admin', 'user-accounts'],
    queryFn: async () => {
      const { data, error } = await api.get('/api/admin/list-accounts');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No user accounts returned');
      }
      return data.accounts;
    },
  });
}

export function RootPathAddForm() {
  const [open, setOpen] = useState(false);
  const { data: accounts = [] } = useListAccounts();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result = await api.post('/api/admin/create-root-path', {
        params: {
          query: {
            id: formData.id,
          },
        },
        body: {
          rootPath: formData.rootPath,
        },
      });
      if (result.data?.success) {
        toast.success('Root path added successfully. It will begin indexing shortly if the indexer is enabled.');
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case 'root-path-does-not-exist-error':
              setError('rootPath', { type: 'manual', message: 'The specified root path does not exist.' });
              break;
            case 'duplicate-root-path-error':
              setError('rootPath', {
                type: 'manual',
                message: 'The specified root path has already been added to this account.',
              });
              break;
            case 'account-not-found-error':
              setError('id', { type: 'manual', message: 'The specified account does not exist.' });
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while creating root path:', error);
              toast.error('An internal server error occurred. Please try again later.');
              break;
          }
        }
      } else {
        setError('rootPath', {
          type: 'server',
          message: 'Failed to add root path',
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while adding root path:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });
  if (!accounts.length) {
    return null;
  }

  return (
    <>
      <Button className="px-2 mb-4 py-1 rounded text-xs uppercase" onClick={() => setOpen(true)} variant="outline">
        <Plus /> Add root path
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Add root path</DialogTitle>
            <DialogDescription>
              <span className="block mb-4">
                Users can configure their own root paths or you can do it on their behalf.
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <Controller
              name="id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account</Label>
                  <NativeSelect
                    id="accountId"
                    name="accountId"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                    className="w-full"
                  >
                    <NativeSelectOption value={0}>Select an account</NativeSelectOption>
                    {accounts.map((account) => (
                      <NativeSelectOption key={account.id} value={account.id}>
                        {account.username}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FormValidationError text={errors.id?.message} />
                </div>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="rootPath">New path</Label>
              <Input id="rootPath" {...register('rootPath', { required: true })} placeholder="Enter new path" />
              <FormValidationError text={errors.rootPath?.message} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save new path</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

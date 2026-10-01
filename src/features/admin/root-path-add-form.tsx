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
import { useAccounts } from '@/hooks/admin/use-accounts';
import { useRootPaths } from '@/hooks/admin/use-root-paths';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod/v3';
import type { paths } from '@/types/api-schema';

type CreateEndpoint = paths['/api/admin/create-root-path']['post'];
type CreateQueryDto = CreateEndpoint['parameters']['query'];
type CreateBodyDto = CreateEndpoint['requestBody']['content']['application/json'];
type FormData = CreateQueryDto & CreateBodyDto;

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

export function RootPathAddForm() {
  const [open, setOpen] = useState(false);
  const { accounts: data } = useAccounts();
  const { createRootPath } = useRootPaths();
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
    await createRootPath(
      {
        query: {
          id: formData.id,
        },
        body: {
          rootPath: formData.rootPath,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success('Root path added successfully.  It will begin indexing shortly if the indexer is enabled.');
        },
        onError: (error) => {
          for (let i = 0; i < error.messages.length; i += 1) {
            const message = error.messages[i];
            switch (message) {
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
                console.error('Unexpected error occurred while adding root path:', error);
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
                    {data?.accounts?.map((account) => (
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

import { Button } from '@/components/ui/button';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import { Pencil, XIcon } from 'lucide-react';
import {
  PlaylistTypeEnum,
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistOperationEnum,
  type components,
} from '@/types/api-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getPlaylistRuleOperations,
  getPlaylistRuleValueInputType,
  isRelativePlaylistRuleOperation,
  playlistRuleFieldLabels,
  playlistRuleFields,
  playlistRuleIntervals,
  playlistRuleOperationLabels,
  playlistRulesSchema,
} from '@/features/library/playlist-rules';
import { playlistKeys } from '@/features/library/api/playlists';
import { toast } from 'sonner';
import { useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';

type Playlist = components['schemas']['PlaylistDto'];

const schema = z.object({
  rulesConjugal: z.nativeEnum(SmartPlaylistConjugalEnum),
  rules: playlistRulesSchema,
});

type FormData = z.infer<typeof schema>;

const renameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
});

type RenameFormData = z.infer<typeof renameSchema>;

function PlaylistRenameForm({ playlist, className }: { playlist: Playlist; className?: string }) {
  const queryClient = useQueryClient();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<RenameFormData>({
    defaultValues: { name: playlist.name },
    resolver: zodResolver(renameSchema),
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    try {
      const { data, error } = await api.patch('/api/update-playlist', {
        params: { query: { id: playlist.id } },
        body: { name },
      });
      if (data?.success) {
        toast.success('Playlist renamed successfully.');
        await queryClient.invalidateQueries({ queryKey: playlistKeys.all });
        setOpen(false);
        return;
      }
      if (!error) {
        toast.error('Failed to rename playlist. Please try again.');
        return;
      }
      let hasUnexpectedError = false;
      error.message.forEach((code) => {
        switch (code as string) {
          case 'invalid-name-error':
            setError('name', { type: 'server', message: 'Name is required' });
            break;
          case 'invalid-name-length-error':
            setError('name', { type: 'server', message: 'Name must be 255 characters or fewer' });
            break;
          case 'invalid-playlist-id-error':
            toast.error('This playlist has an invalid ID. Refresh the page and try again.');
            break;
          case 'playlist-not-found-error':
            toast.error('This playlist could not be found. Refresh the page and try again.');
            break;
          default:
            hasUnexpectedError = true;
            break;
        }
      });
      if (hasUnexpectedError || error.message.length === 0) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while renaming playlist:', error.error);
        toast.error('An internal server error occurred. Please try again later.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while renaming playlist:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => {
          reset({ name: playlist.name });
          setOpen(true);
        }}
        variant="ghost"
        aria-label={`Edit playlist ${playlist.name}`}
      >
        <Pencil />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit playlist</DialogTitle>
            <DialogDescription>Change the name of “{playlist.name}”.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-name`}>Name</Label>
              <Input id={`${formId}-name`} {...register('name')} />
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

function SmartPlaylistUpdateForm({ playlist, className }: { playlist: Playlist; className?: string }) {
  const queryClient = useQueryClient();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    setError,
  } = useForm<FormData>({
    defaultValues: {
      rulesConjugal: SmartPlaylistConjugalEnum.and,
      rules: [],
    },
    resolver: zodResolver(schema),
  });

  const { fields: ruleRows, append, remove } = useFieldArray({ control, name: 'rules' });
  const rules = useWatch({ control, name: 'rules' });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      reset({
        rulesConjugal: playlist.rulesConjugal ?? SmartPlaylistConjugalEnum.and,
        rules: (playlist.rules ?? []).map(({ field, operation, value, interval }) => ({
          field,
          operation,
          value,
          ...(interval ? { interval } : {}),
        })),
      });
    }
    setOpen(nextOpen);
  };

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const { data, error } = await api.patch('/api/update-smart-playlist-rules', {
        params: { query: { id: playlist.id } },
        body: formData,
      });
      if (data?.success) {
        toast.success('Smart playlist rules updated successfully.');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: playlistKeys.all }),
          queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlist.id) }),
        ]);
        setOpen(false);
        return;
      }
      if (!error) {
        toast.error('Failed to update smart playlist rules. Please try again.');
        return;
      }

      let hasUnexpectedError = false;
      error.message.forEach((errorCode) => {
        const code: string = errorCode;
        switch (code) {
          case 'invalid-playlist-rules-conjugal-error':
            setError('rulesConjugal', { type: 'server', message: 'Choose how playlist rules are combined' });
            break;
          case 'invalid-playlist-rules-error':
          case 'invalid-playlist-rule-field-error':
          case 'invalid-playlist-rule-interval-error':
          case 'invalid-playlist-rule-operation-error':
          case 'invalid-playlist-rule-value-error':
          case 'invalid-playlist-rule-value-length-error':
          case 'each value in nested property $property must be either object or array':
            setError('rules', { type: 'server', message: 'One or more playlist rules are invalid' });
            break;
          case 'invalid-playlist-type-error':
            toast.error('Only smart playlists can have their rules edited.');
            break;
          case 'invalid-playlist-id-error':
            toast.error('This playlist has an invalid ID. Refresh the page and try again.');
            break;
          case 'playlist-not-found-error':
            toast.error('This playlist could not be found. Refresh the page and try again.');
            break;
          default:
            hasUnexpectedError = true;
            break;
        }
      });
      if (hasUnexpectedError || error.message.length === 0) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while updating smart playlist rules:', error.error);
        toast.error('An internal server error occurred. Please try again later.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while updating smart playlist rules:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => handleOpenChange(true)}
        variant="outline"
        aria-label={`Edit rules for ${playlist.name}`}
      >
        <Pencil /> Edit rules
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-126.25 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit rules for {playlist.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-rules-conjugal`}>Match</Label>
              <Controller
                control={control}
                name="rulesConjugal"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={`${formId}-rules-conjugal`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SmartPlaylistConjugalEnum.and}>All rules</SelectItem>
                      <SelectItem value={SmartPlaylistConjugalEnum.or}>Any rule</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormValidationError text={errors.rulesConjugal?.message} />
            </div>
            {ruleRows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-2 items-end gap-2">
                <Controller
                  control={control}
                  name={`rules.${index}.field`}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const nextField = playlistRuleFields.find((option) => option === value);
                        if (!nextField) {
                          return;
                        }
                        field.onChange(nextField);
                        setValue(`rules.${index}.operation`, getPlaylistRuleOperations(nextField)[0]);
                        setValue(`rules.${index}.interval`, undefined);
                      }}
                    >
                      <SelectTrigger aria-label={`Rule ${index + 1} field`}>
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {playlistRuleFields.map((option) => (
                          <SelectItem key={option} value={option}>
                            {playlistRuleFieldLabels[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  control={control}
                  name={`rules.${index}.operation`}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const operation = getPlaylistRuleOperations(
                          rules?.[index]?.field ?? SmartPlaylistFieldEnum.album,
                        ).find((option) => option === value);
                        if (!operation) {
                          return;
                        }
                        field.onChange(operation);
                        if (!isRelativePlaylistRuleOperation(operation)) {
                          setValue(`rules.${index}.interval`, undefined);
                        }
                      }}
                    >
                      <SelectTrigger aria-label={`Rule ${index + 1} operation`}>
                        <SelectValue placeholder="Operation" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPlaylistRuleOperations(rules?.[index]?.field ?? SmartPlaylistFieldEnum.album).map(
                          (option) => (
                            <SelectItem key={option} value={option}>
                              {playlistRuleOperationLabels[option]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <div>
                  <Controller
                    control={control}
                    name={`rules.${index}.value`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={getPlaylistRuleValueInputType(rules?.[index]?.field, rules?.[index]?.operation)}
                        min={
                          isRelativePlaylistRuleOperation(rules?.[index]?.operation ?? SmartPlaylistOperationEnum.is)
                            ? '1'
                            : undefined
                        }
                        placeholder={
                          isRelativePlaylistRuleOperation(rules?.[index]?.operation ?? SmartPlaylistOperationEnum.is)
                            ? 'Amount'
                            : 'Value'
                        }
                        aria-label={`Rule ${index + 1} value`}
                      />
                    )}
                  />
                  <FormValidationError text={errors.rules?.[index]?.value?.message} />
                </div>
                {isRelativePlaylistRuleOperation(rules?.[index]?.operation ?? SmartPlaylistOperationEnum.is) ? (
                  <div>
                    <Controller
                      control={control}
                      name={`rules.${index}.interval`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-label={`Rule ${index + 1} interval`}>
                            <SelectValue placeholder="Interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {playlistRuleIntervals.map((interval) => (
                              <SelectItem key={interval} value={interval}>
                                {interval}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormValidationError text={errors.rules?.[index]?.interval?.message} />
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  aria-label={`Remove rule ${index + 1}`}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={ruleRows.length >= 100}
              onClick={() =>
                append({
                  field: SmartPlaylistFieldEnum.album,
                  operation: SmartPlaylistOperationEnum.is,
                  value: '',
                })
              }
            >
              Add rule
            </Button>
            <FormValidationError text={errors.rules?.message} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Save rules
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PlaylistUpdateForm({ playlist, className }: { playlist: Playlist; className?: string }) {
  return playlist.type === PlaylistTypeEnum.normal ? (
    <PlaylistRenameForm playlist={playlist} className={className} />
  ) : (
    <SmartPlaylistUpdateForm playlist={playlist} className={className} />
  );
}

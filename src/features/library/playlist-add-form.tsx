import { Button } from '@/components/ui/button';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormValidationError } from '@/components/form-validation-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PlaylistTypeEnum,
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistOperationEnum,
} from '@/types/api-schema';
import { Plus, XIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

const schema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
    type: z.nativeEnum(PlaylistTypeEnum),
    rulesConjugal: z.nativeEnum(SmartPlaylistConjugalEnum),
    rules: playlistRulesSchema,
  })
  .refine((data) => data.type !== PlaylistTypeEnum.smart || data.rules.length > 0, {
    message: 'Add at least one rule',
    path: ['rules'],
  });

type FormData = z.infer<typeof schema>;

export function PlaylistAddForm({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    setError,
  } = useForm<FormData>({
    defaultValues: {
      type: PlaylistTypeEnum.normal,
      rulesConjugal: SmartPlaylistConjugalEnum.and,
      rules: [],
    },
    resolver: zodResolver(schema),
  });

  const type = useWatch({
    control,
    name: 'type',
  });

  const {
    fields: ruleRows,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'rules',
  });

  const rules = useWatch({ control, name: 'rules' });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const result =
        formData.type === PlaylistTypeEnum.normal
          ? await api.post('/api/create-playlist', {
              body: { name: formData.name },
            })
          : await api.post('/api/create-smart-playlist', {
              body: {
                name: formData.name,
                rulesConjugal: formData.rulesConjugal,
                rules: formData.rules,
              },
            });
      if (result.data?.success) {
        toast.success('Playlist created successfully.');
        queryClient.invalidateQueries({ queryKey: playlistKeys.all });
        reset();
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        let hasUnexpectedError = false;
        message.forEach((errorMessage) => {
          const errorCode: string = errorMessage;
          switch (errorCode) {
            case 'invalid-name-error':
              setError('name', { type: 'server', message: 'Name is required' });
              break;
            case 'invalid-name-length-error':
              setError('name', { type: 'server', message: 'Name must be 255 characters or fewer' });
              break;
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
            default:
              hasUnexpectedError = true;
              break;
          }
        });
        if (hasUnexpectedError || message.length === 0) {
          // eslint-disable-next-line no-console
          console.error('Unexpected error occurred while creating playlist:', error);
          toast.error('An internal server error occurred. Please try again later.');
        }
      } else {
        setError('name', {
          type: 'server',
          message: 'Failed to create playlist',
        });
        toast.error('Failed to create playlist. Please try again.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while creating playlist:', error);
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
        <Plus /> Add playlist
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-126.25">
          <DialogHeader>
            <DialogTitle>Add playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-name`}>Name</Label>
              <Input
                id={`${formId}-name`}
                type="text"
                {...register('name', { required: true })}
                placeholder="Enter playlist name"
              />
              <FormValidationError text={errors.name?.message} />
            </div>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <>
                  <div className={`flex flex-row space-x-2`}>
                    <RadioGroup
                      value={field.value}
                      className="w-fit flex flex-row space-x-2"
                      onValueChange={field.onChange}
                    >
                      <RadioGroupItem value="normal" id={`${formId}-normal-type`} />
                      <Label htmlFor={`${formId}-normal-type`} className="cursor-pointer">
                        Normal
                      </Label>
                      <RadioGroupItem value="smart" id={`${formId}-smart-type`} />
                      <Label htmlFor={`${formId}-smart-type`} className="cursor-pointer">
                        Smart
                      </Label>
                    </RadioGroup>
                  </div>
                  <FormValidationError text={errors.type?.message} />
                </>
              )}
            />
            {type === 'smart' && (
              <div className="space-y-3">
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
                              isRelativePlaylistRuleOperation(
                                rules?.[index]?.operation ?? SmartPlaylistOperationEnum.is,
                              )
                                ? '1'
                                : undefined
                            }
                            placeholder={
                              isRelativePlaylistRuleOperation(
                                rules?.[index]?.operation ?? SmartPlaylistOperationEnum.is,
                              )
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
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Add new playlist
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
